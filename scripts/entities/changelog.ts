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
const repoName = repoUrl?.split("/").pop();

export class EntityChangelog {
	constructor() {}

	static async generateContent(changelogData: ChangelogData): Promise<string> {
		// Handle Unreleased vs version format
		const versionHeader =
			changelogData.displayVersion === "Unreleased"
				? "## [Unreleased]"
				: `## ${changelogData.displayVersion}`;

		let changelog = "# Changelog\n\n";
		changelog +=
			"[![Keep a Changelog](https://img.shields.io/badge/changelog-Keep%20a%20Changelog%20v1.0.0-%23E05735)](https://keepachangelog.com)\n";
		changelog +=
			"[![Semantic Versioning](https://img.shields.io/badge/semver-semantic%20versioning%20v2.0.0-%23E05735)](https://semver.org)\n";
		changelog += `[![GitHub](https://img.shields.io/badge/github-${repoName}-%23181717?logo=github)](https://github.com/${repoName})\n\n`;
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
					changelog += EntityChangelog.formatOrphanCommit(commit);
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
		const scope = commit.message.scopes ? `(${commit.message.scopes.join(", ")})` : "";
		const type = commit.message.type;
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

		line += ` [${hash}]\n`;

		// Add dropdown for PR commits if there are multiple commits
		if (commitCount > 1 && commit.pr?.prCommits) {
			line += "  <details>\n";
			line += `  <summary>Show ${commitCount} commits</summary>\n\n`;
			for (const prCommit of commit.pr.prCommits) {
				const prCommitHash = prCommit.info.hash.substring(0, 7);
				const prCommitMessage = prCommit.message.description;
				line += `  - ${prCommitMessage} [${prCommitHash}]\n`;
			}
			line += "  </details>\n";
		}

		return line;
	}

	private static formatOrphanCommit(commit: ParsedCommitData): string {
		const hash = commit.info.hash.substring(0, 7);
		const author = commit.info.author || "Unknown";
		const description = commit.message.description;
		const scope = commit.message.scopes ? `(${commit.message.scopes.join(", ")})` : "";
		const type = commit.message.type;

		let line = `- **${type}${scope}**: ${description}`;
		if (commit.message.isBreaking) {
			line += " 💥";
		}
		line += ` - ${author} [${hash}]\n`;

		return line;
	}

	static mergeWithExisting(existingChangelog: string, newChangelog: string): string {
		const existingVersions = EntityChangelog.parseChangelogVersions(existingChangelog);
		const newVersions = EntityChangelog.parseChangelogVersions(newChangelog);

		const mergedVersions = new Map(existingVersions);
		for (const [version, content] of newVersions) {
			mergedVersions.set(version, content);
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
}
