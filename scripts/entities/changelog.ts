/** biome-ignore-all lint/complexity/noUselessConstructor: it's a simple util class */
import type { ParsedCommitData, PRCategory } from "./commit";
import { prCategories, validTypes } from "./commit.types";
import { EntityPackageJson } from "./package-json";
import { EntityTag } from "./tag";

const DEFAULT_BADGE_COLOR = "6B7280";

export interface ChangelogData {
	readonly prCategorizedCommits: Record<PRCategory, ParsedCommitData[]>;
	readonly orphanCategorizedCommits: Record<string, ParsedCommitData[]>;
	readonly displayVersion: string;
}

export class EntityChangelog {
	readonly packageName: string;
	readonly existingChangelog: string;
	readonly repoUrl: string | undefined;

	constructor(packageName: string) {
		this.packageName = packageName;
		this.existingChangelog = EntityPackageJson.getChangelog(packageName);

		const rootPackageJson = EntityPackageJson.getPackageJson("root");
		this.repoUrl =
			typeof rootPackageJson.repository === "string"
				? rootPackageJson.repository
				: rootPackageJson.repository?.url;
	}

	generateContent(changelogData: ChangelogData): string {
		const { prCommits, orphanCommitsByType } = EntityChangelog.preprocessData(changelogData);

		let changelog = `${EntityChangelog.getChangelogHeader(this.packageName)}${EntityChangelog.getChangelogVersionHeader(changelogData.displayVersion)}`;
		for (const [_, commits] of prCommits.entries()) {
			const mainCommit = commits[0];
			if (mainCommit.pr?.prNumber) {
				changelog += EntityChangelog.formatPRSection(mainCommit, commits, this.repoUrl || "");
			}
		}
		changelog += EntityChangelog.formatOrphanCommits(orphanCommitsByType, this.repoUrl || "");

		return this.mergeWithExisting(changelog);
	}

	mergeWithExisting(newChangelog: string): string {
		const existingVersions = EntityChangelog.parseChangelogVersions(this.existingChangelog);
		const newVersions = EntityChangelog.parseChangelogVersions(newChangelog);

		const mergedVersions = new Map(existingVersions);
		for (const [version, content] of newVersions) mergedVersions.set(version, content);

		return EntityChangelog.reconstructChangelog(this.packageName, mergedVersions);
	}

	/**
	 * Get the latest version from a changelog
	 */
	getLatestVersion(): string | null {
		const versions = EntityChangelog.parseChangelogVersions(this.existingChangelog);
		if (versions.size === 0) return null;

		// Get the first version (newest, since we sort in descending order)
		const latestVersionHeader = Array.from(versions.keys())[0];

		// Extract version number from header
		const match = latestVersionHeader.match(/## (?:\[)?(v?\d+\.\d+\.\d+)(?:\])?/);
		if (!match) return null;

		// Return version without tag prefix for comparison
		return match[1].replace(EntityTag.getPrefix(), "");
	}

	isVersionUpToDate(packageVersion: string): boolean {
		const latestChangelogVersion = this.getLatestVersion();
		if (!latestChangelogVersion) return false;

		// Remove tag prefix from package version for comparison
		const cleanPackageVersion = packageVersion.replace(EntityTag.getPrefix(), "");

		return cleanPackageVersion === latestChangelogVersion;
	}

	private static preprocessData(changelogData: ChangelogData): {
		prCommits: Map<string, ParsedCommitData[]>;
		orphanCommitsByType: Map<string, ParsedCommitData[]>;
	} {
		const { prCategorizedCommits, orphanCategorizedCommits } = changelogData;

		// Process PR commits, ensuring dependencies appear last
		const allPRCommits = Object.values(prCategorizedCommits).flat();
		const dependencyPRs: ParsedCommitData[] = [];
		const otherPRs: ParsedCommitData[] = [];

		// Separate dependency PRs from others
		for (const commit of allPRCommits) {
			if (commit.pr?.prCategory === "dependencies") {
				dependencyPRs.push(commit);
			} else {
				otherPRs.push(commit);
			}
		}

		// Group by PR key, keeping dependencies last
		const prCommits = new Map<string, ParsedCommitData[]>();

		// Add non-dependency PRs first
		for (const commit of otherPRs) {
			const prKey = commit.pr?.prNumber || commit.info.hash;
			if (!prCommits.has(prKey)) prCommits.set(prKey, []);

			// Add the commit itself
			prCommits.get(prKey)?.push(commit);

			// If this is a merge commit with PR commits, also add all the individual commits
			if (commit.message.isMerge && commit.pr?.prCommits) {
				for (const prCommit of commit.pr.prCommits) {
					// Skip if this commit is already the merge commit
					if (prCommit.info.hash !== commit.info.hash) {
						prCommits.get(prKey)?.push(prCommit);
					}
				}
			}
		}

		// Add dependency PRs last
		for (const commit of dependencyPRs) {
			const prKey = commit.pr?.prNumber || commit.info.hash;
			if (!prCommits.has(prKey)) prCommits.set(prKey, []);

			// Add the commit itself
			prCommits.get(prKey)?.push(commit);

			// If this is a merge commit with PR commits, also add all the individual commits
			if (commit.message.isMerge && commit.pr?.prCommits) {
				for (const prCommit of commit.pr.prCommits) {
					// Skip if this commit is already the merge commit
					if (prCommit.info.hash !== commit.info.hash) {
						prCommits.get(prKey)?.push(prCommit);
					}
				}
			}
		}

		// Process orphan commits, ensuring dependencies appear last
		const orphanCommitsByType = new Map<string, ParsedCommitData[]>();
		const seenHashes = new Set<string>();

		// First, collect all commits by type
		const commitsByType = new Map<string, ParsedCommitData[]>();
		Object.values(orphanCategorizedCommits).forEach((commits) => {
			for (const commit of commits) {
				const hash = commit.info.hash;
				const type = commit.message.type;

				// Skip if we've already seen this commit hash
				if (seenHashes.has(hash)) continue;
				seenHashes.add(hash);

				// Use "deps" type for dependency-related commits, otherwise use original type
				const effectiveType = commit.message.isDependency ? "deps" : type;

				if (!commitsByType.has(effectiveType)) {
					commitsByType.set(effectiveType, []);
				}
				const typeArray = commitsByType.get(effectiveType);
				if (typeArray) {
					typeArray.push(commit);
				}
			}
		});

		// Add all commits to orphanCommitsByType (order will be handled in formatOrphanCommits)
		for (const [type, commits] of commitsByType.entries()) {
			orphanCommitsByType.set(type, commits);
		}

		return {
			prCommits,
			orphanCommitsByType,
		};
	}

	private static reconstructChangelog(packageName: string, versions: Map<string, string>): string {
		const sortedVersions = Array.from(versions.entries())
			.sort(([a], [b]) => EntityChangelog.compareVersionHeaders(a, b))
			.map(([_, content]) => content.trimEnd());
		const versionContent = sortedVersions.join("\n\n");

		return `${EntityChangelog.getChangelogHeader(packageName)}\n\n${versionContent}`;
	}

	private static formatPRSection(
		mainCommit: ParsedCommitData,
		allCommits: ParsedCommitData[],
		repoUrl: string,
	): string {
		const prNumber = mainCommit.pr?.prNumber;
		const prCategory = mainCommit.pr?.prCategory;
		const commitCount = allCommits.length;

		// For merge commits, we need the full message to extract branch names
		// For regular commits, use the description
		const mainMessage = mainCommit.message.isMerge
			? (mainCommit.message.bodyLines || []).join("\n")
			: mainCommit.message.description;

		// Extract branch name from merge commit message
		let branchName = "";
		if (mainCommit.message.isMerge && mainMessage.includes("from")) {
			// Handle "Merge pull request #X from user:branch-name" format
			// Use simple string manipulation instead of regex
			const fromIndex = mainMessage.indexOf("from ");
			if (fromIndex !== -1) {
				// Get everything after "from "
				const afterFrom = mainMessage.substring(fromIndex + 5);
				// Take only the first line (before any newlines)
				const firstLine = afterFrom.split("\n")[0].trim();

				// Handle both "user:branch-name" and "user/branch-name" formats
				if (firstLine.includes(":")) {
					// Format: "user:branch-name"
					const parts = firstLine.split(":");
					if (parts.length > 1) {
						// Take everything after the first colon (username)
						branchName = parts.slice(1).join(":");
					}
				} else if (firstLine.includes("/")) {
					// Format: "user/branch-name" (no colon)
					const parts = firstLine.split("/");
					if (parts.length > 1) {
						// Remove username part, keep the branch name
						branchName = parts.slice(1).join("/");
					}
				} else {
					// Fallback: use the full branch name
					branchName = firstLine;
				}
			}
		}

		// Final fallback if we still don't have a branch name
		if (!branchName) {
			branchName = "main";
		}

		// Get the emoji for the category
		const categoryEmoji = EntityChangelog.getCategoryEmoji(prCategory);
		const categoryTitle = EntityChangelog.getCategoryTitle(prCategory);

		let section = "";

		// Format: emoji branch-name category-title #PR-number commit-count
		// Example: 🔄 refactor/test-versioning Code Quality & Refactoring #144 9 commits
		section += `### ${categoryEmoji} ${branchName} <img src="https://img.shields.io/badge/${EntityChangelog.getCategoryBadge(prCategory)}-495057?style=flat" alt="${categoryTitle}" style="vertical-align: middle;" /> <a href="${repoUrl}/pull/${prNumber}"><img src="https://img.shields.io/badge/%23${prNumber}-blue?style=flat" alt="#${prNumber}" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/${commitCount}%20commits-green?style=flat" alt="${commitCount} commits" style="vertical-align: middle;" />\n\n`;

		// PR description (use main commit message)
		section += `${mainMessage}\n\n`;

		// Use collapsible format for commits
		section += "<details>\n<summary><strong>📝 Commits</strong> (Click to expand)</summary>\n\n";

		// List all commits in the PR with badges
		for (const commit of allCommits) {
			const type = commit.message.type;
			const scopes =
				commit.message.scopes && commit.message.scopes.length > 0
					? commit.message.scopes.map((s) => s.toLowerCase().replace("-", "_")).join(",")
					: "";
			const badgeText = `${type}-${scopes || "noscope"}`;
			const badgeColor = EntityChangelog.getCommitTypeBadgeColor(type, DEFAULT_BADGE_COLOR);
			const badge = `<a href="${repoUrl}/commit/${commit.info.hash}"><img src="https://img.shields.io/badge/${badgeText}-${badgeColor}?style=flat" alt="${type}" style="vertical-align: middle;" /></a>`;

			// Use the same commit format as orphan commits
			const commitLine = EntityChangelog.formatOrphanCommitSummary(commit, repoUrl);
			section += `- ${badge} ${commitLine.trim()}\n`;
		}

		section += "\n</details>\n\n";

		return section;
	}

	private static formatOrphanCommits(
		commitsByType: Map<string, ParsedCommitData[]>,
		repoUrl: string,
	): string {
		if (commitsByType.size === 0) return "";

		let section = EntityChangelog.getOrphanHeader();

		// Use the commitTypeOrder to ensure proper ordering
		const commitTypeOrder = validTypes
			.map((type) => type.type)
			.sort((a, b) => {
				if (a === "deps") return 1;
				if (b === "deps") return -1;
				return 0;
			});

		for (const type of commitTypeOrder) {
			const commits = commitsByType.get(type);
			if (commits) {
				const typeTitle = EntityChangelog.getTypeTitle(type);
				section += `<details>\n<summary><strong>${typeTitle}</strong> (Click to expand)</summary>\n\n`;

				// Show each badge followed by its commit details
				for (const commit of commits) {
					const badgeColor = EntityChangelog.getCommitTypeBadgeColor(type, DEFAULT_BADGE_COLOR);
					const scopes =
						commit.message.scopes && commit.message.scopes.length > 0
							? commit.message.scopes.map((s) => s.toLowerCase().replace("-", "%20")).join(",")
							: "";
					const badgeText = `${type}-(${scopes || "noscope"})`;
					const badge = `<a href="${repoUrl}/commit/${commit.info.hash}"><img src="https://img.shields.io/badge/${badgeText}-${badgeColor}?style=flat" alt="${type}" style="vertical-align: middle;" /></a>`;

					// Format the commit line without the type prefix since we have the badge
					const commitLine = EntityChangelog.formatOrphanCommitSummary(commit, repoUrl);
					section += `- ${badge} ${commitLine.trim()}\n`;
				}

				section += "\n</details>\n\n";
			}
		}

		return section;
	}
	private static formatOrphanCommitSummary(commit: ParsedCommitData, repoUrl: string): string {
		const hash = commit.info.hash.substring(0, 7);
		const author = commit.info.author || "Unknown";
		const description = commit.message.description;

		let line = `${description}`;

		// Make SHA a clickable link to the commit
		const commitUrl = `${repoUrl}/commit/${commit.info.hash}`;
		line += ` ([${hash}](${commitUrl}))  by **${author}**`;

		// Add email if available
		if (commit.info.author?.includes("@")) {
			line += ` [${commit.info.author}](mailto:${commit.info.author})`;
		}

		line += "\n";
		return line;
	}

	private static parseChangelogVersions(changelog: string): Map<string, string> {
		const versions = new Map<string, string>();
		const lines = changelog.split("\n");
		const headerEnd = lines.findIndex((line, i) => i > 0 && line.startsWith("## "));

		if (headerEnd === -1) return versions;

		let currentVersion = "";
		let currentContent: string[] = [];

		for (let i = headerEnd; i < lines.length; i++) {
			const line = lines[i];

			// Handle both [Unreleased] and version formats
			if (
				line.startsWith("## ") &&
				(line.match(/## \[Unreleased\]/) ||
					line.match(/## v?\d+\.\d+\.\d+/) ||
					line.match(/## \d+\.\d+\.\d+/))
			) {
				if (currentVersion) {
					versions.set(currentVersion, currentContent.join("\n"));
				}
				currentVersion = line;
				currentContent = [line];
			} else {
				currentContent.push(line);
			}
		}

		if (currentVersion) {
			versions.set(currentVersion, currentContent.join("\n"));
		}

		return versions;
	}

	private static compareVersionHeaders(a: string, b: string): number {
		const extractVersion = (header: string) => {
			// Handle [Unreleased] format
			if (header.includes("[Unreleased]")) return "Unreleased";
			// Handle various version formats
			const match = header.match(/## (?:\[)?(v?\d+\.\d+\.\d+)(?:\])?/);
			if (!match) return "";
			return match[1];
		};

		const versionA = extractVersion(a);
		const versionB = extractVersion(b);

		// Unreleased always comes first
		if (versionA === "Unreleased") return -1;
		if (versionB === "Unreleased") return 1;

		const parseVersion = (version: string) => {
			const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)/);
			if (!match) return [0, 0, 0];
			return [Number.parseInt(match[1]), Number.parseInt(match[2]), Number.parseInt(match[3])];
		};

		const [majorA, minorA, patchA] = parseVersion(versionA);
		const [majorB, minorB, patchB] = parseVersion(versionB);

		// Sort in descending order (newest first)
		if (majorA !== majorB) return majorB - majorA;
		if (minorA !== minorB) return minorB - minorA;
		return patchB - patchA;
	}

	private static getOrphanHeader() {
		return `### 📝 Direct Commits

*The following changes were committed directly:*
`;
	}
	private static getChangelogHeader(packageName: string) {
		return `## Changelog (${packageName})
	
[![Keep a Changelog](https://img.shields.io/badge/changelog-Keep%20a%20Changelog%20v1.0.0-%23E05735)](https://keepachangelog.com)
[![Semantic Versioning](https://img.shields.io/badge/semver-semantic%20versioning%20v2.0.0-%23E05735)](https://semver.org)

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).`;
	}
	private static getChangelogVersionHeader(version: string) {
		return `\n\n## v${version}\n\n`;
	}
	private static getCategoryEmoji(category?: PRCategory): string {
		if (!category) return "🔀";
		return prCategories[category].emoji || "🔀";
	}
	private static getCategoryTitle(category?: PRCategory): string {
		if (!category) return "Other Changes";
		return prCategories[category].label || category;
	}
	private static getCategoryBadge(category?: PRCategory): string {
		return encodeURIComponent(EntityChangelog.getCategoryTitle(category));
	}
	private static getTypeTitle(type: string): string {
		const commitType = validTypes.find((t) => t.type === type);
		return commitType?.label || `📝 ${type.charAt(0).toUpperCase() + type.slice(1)}`;
	}
	private static getCommitTypeBadgeColor(type: string, defaultBadgeColor: string): string {
		return validTypes.find((t) => t.type === type)?.badgeColor || defaultBadgeColor;
	}
}
