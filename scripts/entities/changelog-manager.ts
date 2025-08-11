import { $ } from "bun";
import type { ChangelogData } from "./changelog";
import { EntityCommit, type ParsedCommitData, type PRCategory } from "./commit";
import { EntityPackageJson } from "./package-json";
import { EntityWorkspace } from "./workspace";

export type VersionBumpType = "major" | "minor" | "patch";

export interface VersionData {
	readonly currentVersion: string;
	readonly nextVersion: string;
	readonly bumpType: VersionBumpType;
}

export interface ChangelogSnapshot {
	readonly versionData: VersionData;
	readonly changelogData: ChangelogData;
}

export class ChangelogManager {
	private packageName: string;
	private fromSha?: string;
	private toSha?: string;

	private changelogData: ChangelogData | undefined;
	private versionData: VersionData | undefined;

	constructor(packageName: string) {
		this.packageName = packageName;
	}

	async setRange(from: string, to?: string): Promise<void> {
		this.fromSha = from;
		this.toSha = to || "HEAD";

		if (!this.fromSha || !this.toSha) {
			throw new Error("Range not set. Call setRange() first.");
		}

		const commits = await this.getCommitsInRange();
		const categorizedCommits = ChangelogManager.categorizeCommits(commits);

		const bumpType = this.determineBumpType(commits);
		const currentVersion = await EntityPackageJson.getVersion(this.packageName);
		const nextVersion = this.calculateNextVersion(currentVersion, bumpType);

		this.versionData = {
			currentVersion,
			nextVersion,
			bumpType,
		};

		this.changelogData = {
			...categorizedCommits,
			displayVersion: nextVersion,
		};
	}

	async snapshot(): Promise<ChangelogSnapshot> {
		if (!this.changelogData || !this.versionData) {
			throw new Error("Data not analyzed. Call setRange() first.");
		}

		return {
			versionData: this.versionData,
			changelogData: this.changelogData,
		};
	}

	static categorizeCommits(commits: ParsedCommitData[]): ChangelogData {
		const prCategorizedCommits: Record<PRCategory, ParsedCommitData[]> = {
			features: [],
			bugfixes: [],
			dependencies: [],
			infrastructure: [],
			documentation: [],
			refactoring: [],
			other: [],
		};

		const orphanCategorizedCommits: Record<string, ParsedCommitData[]> = {
			breaking: [],
			features: [],
			bugfixes: [],
			dependencies: [],
			infrastructure: [],
			documentation: [],
			refactoring: [],
			other: [],
		};

		const mergeCommits = commits.filter((commit) => commit.message.isMerge);
		const orphanCommits = commits.filter((commit) => !commit.message.isMerge);

		for (const commit of mergeCommits) {
			const category = commit.pr?.prCategory || "other";
			prCategorizedCommits[category].push(commit);
		}

		for (const commit of orphanCommits) {
			const category = ChangelogManager.categorizeOrphanCommit(commit);
			orphanCategorizedCommits[category].push(commit);
		}

		return {
			prCategorizedCommits,
			orphanCategorizedCommits,
			displayVersion: "Unreleased",
		};
	}

	private static categorizeOrphanCommit(commit: ParsedCommitData): string {
		if (commit.message.isBreaking) return "breaking";

		switch (commit.message.type) {
			case "feat":
				return "features";
			case "fix":
				return "bugfixes";
			case "deps":
			case "chore":
				if (
					commit.message.description.toLowerCase().includes("dep") ||
					commit.message.description.toLowerCase().includes("update") ||
					commit.message.description.toLowerCase().includes("upgrade")
				) {
					return "dependencies";
				}
				if (
					commit.message.description.toLowerCase().includes("ci") ||
					commit.message.description.toLowerCase().includes("build") ||
					commit.message.description.toLowerCase().includes("workflow")
				) {
					return "infrastructure";
				}
				return "other";
			case "docs":
				return "documentation";
			case "refactor":
			case "style":
				return "refactoring";
			case "test":
				return "infrastructure";
			default:
				return "other";
		}
	}

	private calculateNextVersion(currentVersion: string, bumpType: VersionBumpType): string {
		const [major, minor, patch] = currentVersion.split(".").map(Number);
		if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) {
			throw new Error(`Invalid version: ${currentVersion}`);
		}

		switch (bumpType) {
			case "major":
				return `${major + 1}.0.0`;
			case "minor":
				return `${major}.${minor + 1}.0`;
			case "patch":
				return `${major}.${minor}.${patch + 1}`;
			default:
				throw new Error(`Invalid bump type: ${bumpType}`);
		}
	}

	private determineBumpType(commits: ParsedCommitData[]): "major" | "minor" | "patch" {
		let hasBreaking = false;
		let hasFeature = false;
		for (const commit of commits) {
			if (commit.message.isBreaking) hasBreaking = true;
			if (commit.message.type === "feat") hasFeature = true;
		}

		if (hasBreaking) return "major";
		if (hasFeature) return "minor";
		return "patch";
	}

	private async getCommitsInRange(): Promise<ParsedCommitData[]> {
		const gitRange =
			this.fromSha === "0.0.0" ? this.toSha || "HEAD" : `${this.fromSha}..${this.toSha}`;

		try {
			let commitHashes: string[];

			if (this.packageName === "root") {
				// For root package, get commits excluding apps/* and packages/*
				const rootHashes = await this.getGitLogLines(gitRange, {
					exclude: ["apps/*", "packages/*"],
					path: ".",
				});

				const mergeHashes = await this.getGitLogLines(gitRange, {
					merges: true,
				});

				commitHashes = [...new Set([...rootHashes, ...mergeHashes])];
			} else {
				// For package, get commits specific to that package
				const packagePath = EntityWorkspace.getPackagePath(this.packageName);

				const packageHashes = await this.getGitLogLines(gitRange, {
					path: packagePath,
				});

				const mergeHashes = await this.getGitLogLines(gitRange, {
					merges: true,
				});

				// Check which merge commits are relevant to this package
				const relevantMergeHashes: string[] = [];
				for (const hash of mergeHashes) {
					const prCommitsResult = await this.getGitLogLines(`${hash}^..${hash}^2`, {
						path: packagePath,
					});

					if (prCommitsResult.length > 0) {
						relevantMergeHashes.push(hash);
					}
				}

				commitHashes = [...new Set([...packageHashes, ...relevantMergeHashes])];
			}

			const commits: ParsedCommitData[] = [];
			for (const hash of commitHashes) {
				const commit = await EntityCommit.parseByHash(hash);
				commits.push(commit);
			}

			return commits;
		} catch (error) {
			console.warn("Failed to get commits in range:", error);
			return [];
		}
	}

	private async getGitLogLines(
		range: string,
		options: {
			merges?: boolean;
			path?: string;
			exclude?: string[];
		} = {},
	): Promise<string[]> {
		const args: string[] = [range, "--oneline", "--format=%H"];

		if (options.merges) args.push("--merges");

		// Handle exclude paths first (before path specification)
		if (options.exclude && options.exclude.length > 0) {
			for (const exclude of options.exclude) {
				args.push("--not", "--", exclude);
			}
		}

		// Add path specification last
		if (options.path) {
			args.push("--", options.path);
		}

		try {
			const result = await $`git log ${args}`.quiet();
			const hashes = result.text().trim().split("\n").filter(Boolean);
			return hashes;
		} catch (error) {
			console.warn("Git log failed:", error);
			return [];
		}
	}
}
