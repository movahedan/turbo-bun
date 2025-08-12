/** biome-ignore-all lint/complexity/noUselessConstructor: it's a simple util class */
import type { ParsedCommitData, PRCategory } from "./commit";
import { EntityPackageJson } from "./package-json";

export interface ChangelogData {
	readonly prCategorizedCommits: Record<PRCategory, ParsedCommitData[]>;
	readonly orphanCategorizedCommits: Record<string, ParsedCommitData[]>;
	readonly displayVersion: string;
}

const packageJson = await EntityPackageJson.getPackageJson("root");
const repoUrl =
	typeof packageJson.repository === "string" ? packageJson.repository : packageJson.repository?.url;

export class EntityChangelog {
	constructor() {}

	static async generateContent(changelogData: ChangelogData): Promise<string> {
		// Handle Unreleased vs version format
		const versionHeader =
			changelogData.displayVersion === "Unreleased"
				? "## [Unreleased]"
				: `## v${changelogData.displayVersion}`;

		let changelog = "# Changelog\n\n";
		changelog +=
			"[![Keep a Changelog](https://img.shields.io/badge/changelog-Keep%20a%20Changelog%20v1.0.0-%23E05735)](https://keepachangelog.com)\n";
		changelog +=
			"[![Semantic Versioning](https://img.shields.io/badge/semver-semantic%20versioning%20v2.0.0-%23E05735)](https://semver.org)\n";
		changelog += "All notable changes to this project will be documented in this file.\n\n";
		changelog +=
			"The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\n";
		changelog +=
			"and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n";
		changelog += `${versionHeader}\n\n`;

		// Generate sections in proper order
		const sectionOrder = [
			"breaking",
			"features",
			"bugfixes",
			"dependencies",
			"infrastructure",
			"documentation",
			"refactoring",
			"other",
		];

		// Generate PR sections first
		for (const category of sectionOrder) {
			const commits = changelogData.prCategorizedCommits[category as PRCategory];
			if (commits && commits.length > 0) {
				changelog += `### ${EntityChangelog.getCategoryTitle(category)}\n\n`;
				for (const commit of commits) {
					changelog += await EntityChangelog.formatPRCommit(commit, repoUrl || "");
				}
				changelog += "\n";
			}
		}

		// Generate orphan sections
		for (const category of sectionOrder) {
			const commits = changelogData.orphanCategorizedCommits[category];
			if (commits && commits.length > 0) {
				changelog += `### ${EntityChangelog.getCategoryTitle(category)}\n\n`;
				for (const commit of commits) {
					changelog += EntityChangelog.formatOrphanCommit(commit, repoUrl || "");
				}
				changelog += "\n";
			}
		}

		return changelog.trimEnd();
	}

	private static getCategoryTitle(category: string): string {
		const titles: Record<string, string> = {
			features: "🚀 Features",
			bugfixes: "🐛 Bug Fixes",
			dependencies: "📦 Dependencies",
			infrastructure: "🏗️ Infrastructure",
			documentation: "📚 Documentation",
			refactoring: "🔄 Refactoring",
			breaking: "💥 Breaking Changes",
			other: "🔀 Other Changes",
		};
		return titles[category] || category;
	}

	private static async formatPRCommit(commit: ParsedCommitData, repoUrl: string): Promise<string> {
		const hash = commit.info.hash.substring(0, 7);
		const author = commit.info.author || "Unknown";
		const description = commit.message.description;
		const prNumber = commit.pr?.prNumber;
		const commitCount = commit.pr?.prCommits?.length || 0;

		// Handle merge commits specially
		let type = commit.message.type;
		let scope = "";

		if (commit.message.isMerge) {
			type = "Merge";
			// Don't show scope for merge commits
		} else {
			// Only show scope if there are actual scopes
			scope =
				commit.message.scopes && commit.message.scopes.length > 0
					? `(${commit.message.scopes.join(", ")})`
					: "";
		}

		const prCategory = commit.pr?.prCategory;

		let line = `- **${type}${scope}**: ${description}`;

		// Add breaking change indicator
		if (commit.message.isBreaking) {
			line += " 💥";
		}

		// Add PR category badge
		if (prCategory) {
			line += ` ![${prCategory}](https://img.shields.io/badge/PR-${prCategory}-blue)`;
		}

		// Add PR link if available
		if (prNumber) {
			line += ` ([#${prNumber}](${repoUrl}/pull/${prNumber}))`;
		}

		line += ` - ${author}`;

		// Add commit count for multi-commit PRs
		if (commitCount > 1) {
			line += ` (${commitCount} commits)`;
		}

		// Make SHA a clickable link to the commit
		const commitUrl = `${repoUrl}/commit/${commit.info.hash}`;
		line += ` [${hash}](${commitUrl})\n`;

		// Add dropdown for PR commits if there are multiple commits
		if (commitCount > 1 && commit.pr?.prCommits) {
			line += "  <details>\n";
			line += `  <summary>Show ${commitCount} commits</summary>\n\n`;
			for (const prCommit of commit.pr.prCommits) {
				const prCommitHash = prCommit.info.hash.substring(0, 7);
				const prCommitMessage = prCommit.message.description;
				const prCommitUrl = `${repoUrl}/commit/${prCommit.info.hash}`;
				line += `  - ${prCommitMessage} [${prCommitHash}](${prCommitUrl})\n`;
			}
			line += "  </details>\n";
		}

		return line;
	}

	private static formatOrphanCommit(commit: ParsedCommitData, repoUrl: string): string {
		const hash = commit.info.hash.substring(0, 7);
		const author = commit.info.author || "Unknown";
		const description = commit.message.description;

		// Handle merge commits specially
		let type = commit.message.type;
		let scope = "";

		if (commit.message.isMerge) {
			type = "Merge";
			// Don't show scope for merge commits
		} else {
			// Only show scope if there are actual scopes
			scope =
				commit.message.scopes && commit.message.scopes.length > 0
					? `(${commit.message.scopes.join(", ")})`
					: "";
		}

		let line = `- **${type}${scope}**: ${description}`;
		if (commit.message.isBreaking) {
			line += " 💥";
		}

		// Make SHA a clickable link to the commit
		const commitUrl = `${repoUrl}/commit/${commit.info.hash}`;
		line += ` - ${author} [${hash}](${commitUrl})\n`;

		return line;
	}

	static mergeWithExisting(existingChangelog: string, newChangelog: string): string {
		const existingVersions = EntityChangelog.parseChangelogVersions(existingChangelog);
		const newVersions = EntityChangelog.parseChangelogVersions(newChangelog);

		const mergedVersions = new Map(existingVersions);

		// Only add new versions that don't already exist
		for (const [version, content] of newVersions) {
			// Check if this version already exists in the existing changelog
			const versionExists = Array.from(existingVersions.keys()).some((existingVersion) => {
				// Extract version numbers for comparison (ignoring "v" prefix)
				const existingMatch = existingVersion.match(/## (?:\[)?(v?\d+\.\d+\.\d+)(?:\])?/);
				const newMatch = version.match(/## (?:\[)?(v?\d+\.\d+\.\d+)(?:\])?/);

				if (!existingMatch || !newMatch) return false;

				// Compare version numbers (remove "v" prefix for comparison)
				const existingVersionNum = existingMatch[1].replace(/^v/, "");
				const newVersionNum = newMatch[1].replace(/^v/, "");

				return existingVersionNum === newVersionNum;
			});

			// Only add if version doesn't exist
			if (!versionExists) {
				mergedVersions.set(version, content);
			}
		}

		const newHeader = EntityChangelog.extractHeader(newChangelog);
		return EntityChangelog.reconstructChangelogWithHeader(newHeader, mergedVersions);
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

	private static extractHeader(changelog: string): string {
		const lines = changelog.split("\n");
		const headerEnd = lines.findIndex((line, i) => i > 0 && line.startsWith("## "));

		const defaultHeader = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).`;

		if (headerEnd === -1) return defaultHeader;

		const headerContent = lines.slice(0, headerEnd).join("\n");
		return headerContent.trimEnd();
	}

	private static reconstructChangelogWithHeader(
		header: string,
		versions: Map<string, string>,
	): string {
		const sortedVersions = Array.from(versions.entries())
			.sort(([a], [b]) => EntityChangelog.compareVersionHeaders(a, b))
			.map(([_, content]) => content.trimEnd());
		const versionContent = sortedVersions.join("\n\n");

		return `${header}\n\n${versionContent}`;
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

	/**
	 * Get the latest version from a changelog
	 */
	static getLatestVersion(changelog: string): string | null {
		const versions = EntityChangelog.parseChangelogVersions(changelog);
		if (versions.size === 0) return null;

		// Get the first version (newest, since we sort in descending order)
		const latestVersionHeader = Array.from(versions.keys())[0];

		// Extract version number from header
		const match = latestVersionHeader.match(/## (?:\[)?(v?\d+\.\d+\.\d+)(?:\])?/);
		if (!match) return null;

		// Return version without "v" prefix for comparison
		return match[1].replace(/^v/, "");
	}

	/**
	 * Check if package.json version matches the latest changelog version
	 */
	static isVersionUpToDate(packageVersion: string, changelog: string): boolean {
		const latestChangelogVersion = EntityChangelog.getLatestVersion(changelog);
		if (!latestChangelogVersion) return false;

		// Remove "v" prefix from package version for comparison
		const cleanPackageVersion = packageVersion.replace(/^v/, "");

		return cleanPackageVersion === latestChangelogVersion;
	}
}
