import { $ } from "bun";
import type { ChangelogData } from "./changelog";
import { EntityChangelog } from "./changelog";
import { EntityCommit, type ParsedCommitData, type PRCategory } from "./commit";
import { EntityPackageJson } from "./package-json";
import { EntityWorkspace } from "./workspace";

export type VersionBumpType = "major" | "minor" | "patch" | "none" | "sync";

export interface VersionData {
	readonly currentVersion: string;
	readonly nextVersion: string;
	readonly bumpType: VersionBumpType;
	readonly shouldBump: boolean;
	readonly targetVersion: string;
	readonly reason: string;
}

export interface ChangelogSnapshot {
	readonly versionData: VersionData;
	readonly changelogData: ChangelogData;
}

export interface VersionAction {
	readonly shouldBump: boolean;
	readonly targetVersion: string;
	readonly bumpType: VersionBumpType;
	readonly reason: string;
}

export class ChangelogManager {
	private packageName: string;
	private fromSha?: string;
	private toSha?: string;

	private changelogData: ChangelogData | undefined;
	private versionData: VersionData | undefined;

	private changelog: EntityChangelog;

	constructor(packageName: string) {
		this.packageName = packageName;
		this.changelog = new EntityChangelog(packageName);
	}

	async setRange(from: string, to?: string): Promise<void> {
		this.fromSha = from;
		this.toSha = to || "HEAD";

		if (!this.fromSha || !this.toSha) {
			throw new Error("Range not set. Call setRange() first.");
		}

		const commits = await this.getCommitsInRange();
		const categorizedCommits = ChangelogManager.categorizeCommits(commits);

		const currentVersion = EntityPackageJson.getVersion(this.packageName);
		const versionAction = await this.determineVersionAction(currentVersion, commits);

		this.versionData = {
			currentVersion,
			nextVersion: versionAction.targetVersion,
			bumpType: versionAction.bumpType,
			shouldBump: versionAction.shouldBump,
			targetVersion: versionAction.targetVersion,
			reason: versionAction.reason,
		};

		this.changelogData = {
			...categorizedCommits,
			displayVersion: versionAction.targetVersion,
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

	/**
	 * Generate and write the changelog for this package
	 */
	async generateChangelog(): Promise<string> {
		if (!this.changelogData) {
			throw new Error("Data not analyzed. Call setRange() first.");
		}

		const newChangelog = this.changelog.generateContent(this.changelogData);
		await EntityPackageJson.writeChangelog(this.packageName, newChangelog);
		return newChangelog;
	}

	/**
	 * Check if this package has any commits in the specified range
	 */
	hasCommits(): boolean {
		if (!this.changelogData) return false;

		const commitCount =
			Object.values(this.changelogData.prCategorizedCommits).flat().length +
			Object.values(this.changelogData.orphanCategorizedCommits).flat().length;

		return commitCount > 0;
	}

	/**
	 * Get the commit count for this package
	 */
	getCommitCount(): number {
		if (!this.changelogData) return 0;

		return (
			Object.values(this.changelogData.prCategorizedCommits).flat().length +
			Object.values(this.changelogData.orphanCategorizedCommits).flat().length
		);
	}

	private async determineVersionAction(
		currentVersion: string,
		commits: ParsedCommitData[],
	): Promise<VersionAction> {
		// If no commits, no version change needed
		if (commits.length === 0) {
			return {
				shouldBump: false,
				targetVersion: currentVersion,
				bumpType: "none",
				reason: "No commits in range",
			};
		}

		const changelog = new EntityChangelog(this.packageName);
		const latestChangelogVersion = changelog.getLatestVersion();

		// First, analyze commits to determine what bump type is needed
		const bumpType = await this.determineBumpType(commits);

		// If no bump type determined, no version change needed
		if (!bumpType) {
			return {
				shouldBump: false,
				targetVersion: currentVersion,
				bumpType: "none",
				reason: "All commits already documented in changelog",
			};
		}

		const nextVersion = this.calculateNextVersion(currentVersion, bumpType);

		// Check if this version already exists in the changelog
		const versionAlreadyExists = changelog.isVersionUpToDate(nextVersion);
		if (versionAlreadyExists) {
			return {
				shouldBump: false,
				targetVersion: currentVersion,
				bumpType: "none",
				reason: `Version ${nextVersion} already exists in changelog`,
			};
		}

		// Check if package.json version already matches the next version we would bump to
		if (currentVersion === nextVersion) {
			return {
				shouldBump: false,
				targetVersion: currentVersion,
				bumpType: "none",
				reason: `Package version ${currentVersion} already matches next version ${nextVersion}`,
			};
		}

		// Check if package.json is behind the changelog version (sync case)
		if (latestChangelogVersion && latestChangelogVersion !== currentVersion) {
			// Only sync if the changelog version is actually newer than what we would bump to
			if (this.isVersionNewer(latestChangelogVersion, nextVersion)) {
				return {
					shouldBump: true,
					targetVersion: latestChangelogVersion,
					bumpType: "sync",
					reason: `Package version ${currentVersion} is behind changelog version ${latestChangelogVersion}`,
				};
			}
		}

		// Normal version bump - if we have commits and the next version doesn't exist, we should bump
		return {
			shouldBump: true,
			targetVersion: nextVersion,
			bumpType,
			reason: `New ${bumpType} version bump to ${nextVersion}`,
		};
	}

	/**
	 * Compare two version strings to determine if the first is newer than the second
	 */
	private isVersionNewer(version1: string, version2: string): boolean {
		const parseVersion = (version: string) => {
			const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)/);
			if (!match) return [0, 0, 0];
			return [Number.parseInt(match[1]), Number.parseInt(match[2]), Number.parseInt(match[3])];
		};

		const [major1, minor1, patch1] = parseVersion(version1);
		const [major2, minor2, patch2] = parseVersion(version2);

		if (major1 !== major2) return major1 > major2;
		if (minor1 !== minor2) return minor1 > minor2;
		return patch1 > patch2;
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
			merge: [],
			other: [],
		};

		const mergeCommits = commits.filter((commit) => commit.message.isMerge);
		const orphanCommits = commits.filter((commit) => !commit.message.isMerge);

		// First, process merge commits and their associated PR commits
		for (const commit of mergeCommits) {
			if (commit.pr?.prCategory && commit.pr.prCommits) {
				// This merge commit has a PR with commits, categorize it by PR category
				const category = commit.pr.prCategory;

				// Add the merge commit itself
				prCategorizedCommits[category].push(commit);

				// Also add all the individual commits from the PR to the same category
				// This ensures they appear in the PR section instead of the orphan section
				for (const prCommit of commit.pr.prCommits) {
					// Skip if this commit is already the merge commit
					if (prCommit.info.hash !== commit.info.hash) {
						prCategorizedCommits[category].push(prCommit);
					}
				}
			} else {
				// This merge commit has no PR or no PR commits, categorize it as an orphan commit
				const category = ChangelogManager.categorizeOrphanCommit(commit);
				orphanCategorizedCommits[category].push(commit);
			}
		}

		// Then process orphan commits (commits not associated with any PR)
		for (const commit of orphanCommits) {
			// Check if this commit is already included in a PR section
			const isIncludedInPR = mergeCommits.some((mergeCommit) =>
				mergeCommit.pr?.prCommits?.some((prCommit) => prCommit.info.hash === commit.info.hash),
			);

			// Only add to orphan commits if it's not already in a PR section
			if (!isIncludedInPR) {
				const category = ChangelogManager.categorizeOrphanCommit(commit);
				orphanCategorizedCommits[category].push(commit);
			}
		}

		return {
			prCategorizedCommits,
			orphanCategorizedCommits,
			displayVersion: "Unreleased",
		};
	}

	private static categorizeOrphanCommit(commit: ParsedCommitData): string {
		if (commit.message.isBreaking) return "breaking";
		if (commit.message.isMerge) return "merge";

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

	private async determineBumpType(
		commits: ParsedCommitData[],
	): Promise<"major" | "minor" | "patch" | undefined> {
		// If we have commits and we're generating a changelog, we need to determine
		// the bump type based on the commit content. The fact that commits might
		// already be in the changelog doesn't matter - we're creating a new version.

		// Determine the bump type based on commit content
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
