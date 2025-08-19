import { type ParsedCommitData, type PRCategory, prCategories, validTypes } from "../commit";
import { EntityTag } from "../tag";
import { ChangelogTemplate } from "./template";

const DEFAULT_BADGE_COLOR = "6B7280";
const prefix = EntityTag.getPrefix();

export class DefaultChangelogTemplate extends ChangelogTemplate {
	static getChangelogHeader(packageName: string): string {
		return `## Changelog (${packageName})
	
[![Keep a Changelog](https://img.shields.io/badge/changelog-Keep%20a%20Changelog%20v1.0.0-%23E05735)](https://keepachangelog.com)
[![Semantic Versioning](https://img.shields.io/badge/semver-semantic%20versioning%20v2.0.0-%23E05735)](https://semver.org)

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).`;
	}

	static getChangelogVersionHeader(version: string): string {
		return `\n\n## ${version === "[Unreleased]" ? "" : prefix}${version}\n\n`;
	}

	static formatPRSection(
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
		const categoryEmoji = DefaultChangelogTemplate.getCategoryEmoji(prCategory);
		const categoryTitle = DefaultChangelogTemplate.getCategoryTitle(prCategory);

		let section = "";

		// Format: emoji branch-name category-title #PR-number commit-count
		// Example: 🔄 refactor/test-versioning Code Quality & Refactoring #144 9 commits
		section += `### ${categoryEmoji} ${branchName} <img src="https://img.shields.io/badge/${DefaultChangelogTemplate.getCategoryBadge(prCategory)}-495057?style=flat" alt="${categoryTitle}" style="vertical-align: middle;" /> <a href="${repoUrl}/pull/${prNumber}"><img src="https://img.shields.io/badge/%23${prNumber}-blue?style=flat" alt="#${prNumber}" style="vertical-align: middle;" /></a> <img src="https://img.shields.io/badge/${commitCount}%20commits-green?style=flat" alt="${commitCount} commits" style="vertical-align: middle;" />\n\n`;

		// PR description (use main commit message)
		section += `${mainMessage}\n\n`;

		// Use collapsible format for commits
		section += "<details>\n<summary><strong>�� Commits</strong> (Click to expand)</summary>\n\n";

		// List all commits in the PR with badges
		for (const commit of allCommits) {
			const type = commit.message.type;
			const scopes =
				commit.message.scopes && commit.message.scopes.length > 0
					? commit.message.scopes.map((s: string) => s.toLowerCase().replace("-", "_")).join(",")
					: "";
			const badgeText = `${type}-${scopes || "noscope"}`;
			const badgeColor = DefaultChangelogTemplate.getCommitTypeBadgeColor(
				type,
				DEFAULT_BADGE_COLOR,
			);
			const badge = `<a href="${repoUrl}/commit/${commit.info?.hash}"><img src="https://img.shields.io/badge/${badgeText}-${badgeColor}?style=flat" alt="${type}" style="vertical-align: middle;" /></a>`;

			// Use the same commit format as orphan commits
			const commitLine = DefaultChangelogTemplate.formatOrphanCommitSummary(commit, repoUrl);
			section += `- ${badge} ${commitLine.trim()}\n`;
		}

		section += "\n</details>\n\n";

		return section;
	}

	static formatOrphanCommits(commits: ParsedCommitData[], repoUrl: string): string {
		if (commits.length === 0) return "";

		let section = DefaultChangelogTemplate.getOrphanHeader();

		// Use the commitTypeOrder to ensure proper ordering
		const commitTypeOrder = validTypes
			.map((type) => type.type)
			.sort((a: string, b: string) => {
				if (a === "deps") return 1;
				if (b === "deps") return -1;
				return 0;
			});

		for (const type of commitTypeOrder) {
			const commitsByType = commits.filter((commit) => commit.message.type === type);
			if (commitsByType.length > 0) {
				const typeTitle = DefaultChangelogTemplate.getTypeTitle(type);
				section += `<details>\n<summary><strong>${typeTitle}</strong> (Click to expand)</summary>\n\n`;

				// Show each badge followed by its commit details
				for (const commit of commits) {
					const badgeColor = DefaultChangelogTemplate.getCommitTypeBadgeColor(
						type,
						DEFAULT_BADGE_COLOR,
					);
					const scopes =
						commit.message.scopes && commit.message.scopes.length > 0
							? commit.message.scopes
									.map((s: string) => s.toLowerCase().replace("-", "%20"))
									.join(",")
							: "";
					const badgeText = `${type}-(${scopes || "noscope"})`;
					const badge = `<a href="${repoUrl}/commit/${commit.info?.hash}"><img src="https://img.shields.io/badge/${badgeText}-${badgeColor}?style=flat" alt="${type}" style="vertical-align: middle;" /></a>`;

					// Format the commit line without the type prefix since we have the badge
					const commitLine = DefaultChangelogTemplate.formatOrphanCommitSummary(commit, repoUrl);
					section += `- ${badge} ${commitLine.trim()}\n`;
				}

				section += "\n</details>\n\n";
			}
		}

		return section;
	}

	static getOrphanHeader() {
		return `### 📝 Direct Commits

*The following changes were committed directly:*
`;
	}

	static getCategoryEmoji(category?: PRCategory): string {
		if (!category) return "🔀";
		const categoryInfo = prCategories[category];
		return categoryInfo?.emoji || "🔀";
	}

	static getCategoryTitle(category?: PRCategory): string {
		if (!category) return "Other Changes";
		const categoryInfo = prCategories[category];
		return categoryInfo?.label || category;
	}

	static getCategoryBadge(category?: PRCategory): string {
		return encodeURIComponent(DefaultChangelogTemplate.getCategoryTitle(category));
	}

	static getTypeTitle(type: string): string {
		const commitType = validTypes.find((t) => t.type === type);
		return commitType?.label || `📝 ${type.charAt(0).toUpperCase() + type.slice(1)}`;
	}

	static getCommitTypeBadgeColor(type: string, defaultBadgeColor: string): string {
		return validTypes.find((t) => t.type === type)?.badgeColor || defaultBadgeColor;
	}

	static formatOrphanCommitSummary(commit: ParsedCommitData, repoUrl: string): string {
		const hash = commit.info?.hash?.substring(0, 7) || "unknown";
		const author = commit.info?.author || "Unknown";
		const description = commit.message.description;

		let line = `${description}`;

		// Make SHA a clickable link to the commit
		if (commit.info?.hash) {
			const commitUrl = `${repoUrl}/commit/${commit.info.hash}`;
			line += ` ([${hash}](${commitUrl}))  by **${author}**`;
		} else {
			line += ` by **${author}**`;
		}

		// Add email if available
		if (commit.info?.author?.includes("@")) {
			line += ` [${commit.info.author}](mailto:${commit.info.author})`;
		}

		line += "\n";
		return line;
	}
}
