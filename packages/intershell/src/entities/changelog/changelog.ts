import { $ } from "bun";
import type { ParsedCommitData } from "../commit";
import { EntityCommit } from "../commit";
import { EntityPackages } from "../packages";
import { EntityTag } from "../tag";
import type { TemplateEngine } from "./template";
import type { ChangelogData, VersionAction, VersionBumpType, VersionData } from "./types";

export class EntityChangelog {
	private packageName: string;
	private packagePath: string;
	private fromSha?: string;
	private toSha?: string;

	private changelogData: ChangelogData | undefined;
	private versionData: VersionData | undefined;
	private templateEngine: TemplateEngine;
	private versionMode: boolean;

	constructor(packageName: string, templateEngine: TemplateEngine, versionMode = true) {
		this.packageName = packageName;
		this.templateEngine = templateEngine;
		this.versionMode = versionMode;
		this.packagePath = new EntityPackages(this.packageName).getPath();
	}

	async setRange(from: string, to?: string): Promise<void> {
		this.fromSha = from;
		this.toSha = to || "HEAD";
		if (!this.fromSha || !this.toSha) {
			throw new Error("Range not set. Call setRange() first.");
		}

		const unreleasedCommits = await this.getCommitsInRange(
			await EntityTag.getBaseTagSha(),
			this.toSha,
		);

		const { version: currentVersion } = (await EntityTag.getPackageVersionAtTag(
			await EntityTag.getBaseTagSha(),
			this.packageName,
		)) || { version: "0.0.0" };

		if (!currentVersion) {
			throw new Error(
				`Could not get current version for package ${this.packageName} at tag ${await EntityTag.getBaseTagSha()}`,
			);
		}

		const versionAction = await this.determineVersionAction(currentVersion, unreleasedCommits);

		const changelogData: ChangelogData = new Map();

		const tagsInRange = await EntityTag.getTagsInRange(this.fromSha, this.toSha);

		const versionTags = tagsInRange;
		if (versionAction.shouldBump) {
			versionTags.push({
				tag: this.toSha,
				previousTag: await EntityTag.getBaseTagSha(),
			});
		}

		for (const tag of versionTags) {
			const commits = await this.getCommitsInRange(tag.previousTag as string, tag.tag);
			const mergeCommits = commits.filter((commit) => commit.message.isMerge);
			const orphanCommits = commits.filter(
				(commit) =>
					!commit.message.isMerge &&
					!mergeCommits.some((mergeCommit) =>
						mergeCommit.pr?.prCommits?.some(
							(prCommit) => prCommit.info?.hash === commit.info?.hash,
						),
					),
			);
			const sortedCommits = [...mergeCommits, ...orphanCommits].sort(
				(a, b) => new Date(a.info?.date || "0").getTime() - new Date(b.info?.date || "0").getTime(),
			);

			const packageVersion = await EntityTag.getPackageVersionAtTag(tag.tag, this.packageName);
			if (!packageVersion) {
				throw new Error(
					`Could not get version for tag ${tag.tag} in package ${this.packageName} in the range ${this.fromSha}..${this.toSha}`,
				);
			}

			changelogData.set(this.versionMode ? packageVersion.version : "[Unreleased]", sortedCommits);
		}

		const versionOnDisk = await new EntityPackages(this.packageName).readVersion();

		this.changelogData = changelogData;
		this.versionData = {
			currentVersion: versionAction.currentVersion,
			bumpType: versionOnDisk === versionAction.targetVersion ? "synced" : versionAction.bumpType,
			shouldBump: versionOnDisk === versionAction.targetVersion ? false : versionAction.shouldBump,
			targetVersion: versionAction.targetVersion,
			reason: versionAction.reason,
		};
	}

	getVersionData(): VersionData {
		if (!this.versionData) {
			throw new Error("Version data not determined. Call setRange() first.");
		}
		return this.versionData;
	}

	async mergeWithExisting(): Promise<ChangelogData> {
		if (!this.changelogData) {
			throw new Error("Data not analyzed. Call setRange() first.");
		}

		const packageInstance = new EntityPackages(this.packageName);
		const mergedChangelogData: ChangelogData = new Map();

		const existingChangelog = await packageInstance.readChangelog();
		const existingChangelogData = this.templateEngine.parseVersions(existingChangelog);

		for (const [version, content] of existingChangelogData) {
			mergedChangelogData.set(version, content);
		}
		for (const [version, content] of this.changelogData) {
			mergedChangelogData.set(version, content);
		}

		return mergedChangelogData;
	}

	async generateChangelog(): Promise<string> {
		if (!this.changelogData) {
			throw new Error("Data not analyzed. Call setRange() first.");
		}
		if (!this.versionData) {
			throw new Error("Version data not determined. Call setRange() first.");
		}
		if (!this.templateEngine) {
			throw new Error("Template engine not set.");
		}

		const changelog = this.templateEngine.generateContent(this.changelogData);
		return changelog;
	}

	async generateMergedChangelog(): Promise<string> {
		if (!this.changelogData) {
			throw new Error("Data not analyzed. Call setRange() first.");
		}
		if (!this.versionData) {
			throw new Error("Version data not determined. Call setRange() first.");
		}
		if (!this.templateEngine) {
			throw new Error("Template engine not set.");
		}

		const mergedChangelog = await this.mergeWithExisting();
		return this.templateEngine.generateContent(mergedChangelog);
	}

	getCommitCount(): number {
		if (!this.changelogData) {
			throw new Error("Data not analyzed. Call setRange() first.");
		}
		return this.changelogData.values().reduce((acc, curr) => {
			return (
				acc +
				(Array.isArray(curr)
					? curr.reduce((acc, curr) => acc + 1 + (curr.pr?.prCommits?.length ?? 0), 0)
					: 0)
			);
		}, 0);
	}

	private async determineVersionAction(
		currentVersion: string,
		commits: ParsedCommitData[],
	): Promise<VersionAction> {
		// If no commits, no version change needed
		if (commits.length === 0) {
			return {
				currentVersion,
				shouldBump: false,
				targetVersion: currentVersion,
				bumpType: "none",
				reason: "No commits in range",
			};
		}

		const bumpType = await this.determineBumpType(commits);
		if (!bumpType) {
			return {
				currentVersion,
				shouldBump: false,
				targetVersion: currentVersion,
				bumpType: "none",
				reason: "All commits already documented in changelog",
			};
		}

		const nextVersion = this.calculateNextVersion(currentVersion, bumpType);
		const versionAlreadyExists = await EntityTag.packageVersionExistsInHistory(
			this.packageName,
			nextVersion,
		);
		if (versionAlreadyExists) {
			return {
				currentVersion,
				shouldBump: false,
				targetVersion: currentVersion,
				bumpType: "none",
				reason: `Version ${nextVersion} already exists in git tags`,
			};
		}

		if (currentVersion === nextVersion) {
			return {
				currentVersion,
				shouldBump: false,
				targetVersion: currentVersion,
				bumpType: "none",
				reason: `Package version ${currentVersion} already matches next version ${nextVersion}`,
			};
		}

		const latestPackageVersionInHistory = await EntityTag.getLatestPackageVersionInHistory(
			this.packageName,
		);
		if (latestPackageVersionInHistory && latestPackageVersionInHistory !== currentVersion) {
			throw new Error(
				`Package version ${currentVersion} is behind git tag version ${latestPackageVersionInHistory}`,
			);
		}

		// Normal version bump - if we have commits and the next version doesn't exist, we should bump
		return {
			currentVersion,
			shouldBump: true,
			targetVersion: nextVersion,
			bumpType,
			reason: `New ${bumpType} version bump to ${nextVersion}`,
		};
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

	private async getCommitsInRange(from: string, to: string): Promise<ParsedCommitData[]> {
		const gitRange = from === "0.0.0" ? to : `${from}..${to}`;

		try {
			let commitHashes: string[];

			if (this.packageName === "root") {
				// For root package, include ALL commits in the repository
				const allHashes = await this.getGitLogLines(gitRange, {
					path: ".",
				});

				const mergeHashes = await this.getGitLogLines(gitRange, {
					merges: true,
				});

				commitHashes = [...new Set([...allHashes, ...mergeHashes])];
			} else {
				const packageHashes = await this.getGitLogLines(gitRange, {
					path: this.packagePath,
				});
				const mergeHashes = await this.getGitLogLines(gitRange, {
					merges: true,
				});

				const relevantMergeHashes: string[] = [];
				for (const hash of mergeHashes) {
					const prCommitsResult = await this.getGitLogLines(`${hash}^..${hash}^2`, {
						path: this.packagePath,
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
