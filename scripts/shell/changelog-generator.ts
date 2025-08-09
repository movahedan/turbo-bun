import { $ } from "bun";
import type { ChangelogEntry, CommitInfo, PRCategory } from "./version-utils";

export interface ChangelogConfig {
	repositoryUrl?: string;
	packageName?: string;
	displayVersion: string;
}

export interface CategoryInfo {
	emoji: string;
	label: string;
}

export class ChangelogGenerator {
	private readonly categoryInfo: Record<PRCategory, CategoryInfo> = {
		features: { emoji: "🚀", label: "Feature Releases" },
		infrastructure: { emoji: "🏗️", label: "Infrastructure & Tooling" },
		refactoring: { emoji: "🔄", label: "Code Quality & Refactoring" },
		bugfixes: { emoji: "🔧", label: "Bug Fixes & Improvements" },
		documentation: { emoji: "📚", label: "Documentation Updates" },
		dependencies: { emoji: "📦", label: "Dependency Updates" },
		other: { emoji: "🔀", label: "Other Pull Requests" },
	};

	private readonly orphanSectionConfig = [
		{ key: "breaking", title: "💥 Breaking Changes", types: ["breaking"] },
		{ key: "features", title: "✨ Features", types: ["feat"] },
		{ key: "bugfixes", title: "🐛 Bug Fixes", types: ["fix"] },
		{ key: "improvements", title: "🔧 Improvements", types: ["refactor", "style"] },
		{ key: "documentation", title: "📚 Documentation", types: ["docs"] },
		{ key: "testing", title: "🧪 Testing", types: ["test"] },
		{ key: "other", title: "📦 Other Changes", types: ["other"] },
	];

	private readonly typeColors = {
		feat: "00D4AA",
		fix: "EF4444",
		docs: "646CFF",
		style: "8B5CF6",
		refactor: "007ACC",
		perf: "60a5fa",
		test: "4E9BCD",
		chore: "495057",
		ci: "2496ED",
		build: "000000",
		other: "495057",
	};

	async generateContent(
		entries: readonly ChangelogEntry[],
		config: ChangelogConfig,
	): Promise<string> {
		const { repositoryUrl, packageName, displayVersion } = config;

		const { mergeCommits, orphanCommits } = this.categorizeCommits(entries);
		const prsByCategory = this.categorizePRs(mergeCommits);
		const orphansByType = this.categorizeOrphanCommits(orphanCommits);

		let changelog = this.generateHeader(packageName, displayVersion);
		changelog += await this.generatePRSections(prsByCategory, repositoryUrl);
		changelog += await this.generateOrphanSections(orphansByType, repositoryUrl, false);
		changelog += await this.generateDependencySections(
			prsByCategory.dependencies,
			orphansByType.dependencies,
			repositoryUrl,
		);
		changelog += this.generateFooter();

		return changelog;
	}

	private categorizeCommits(entries: readonly ChangelogEntry[]) {
		const mergeCommits = entries.filter((e) => e.isMerge);
		const prCommitHashes = new Set(
			mergeCommits.flatMap((pr) => pr.prCommits?.map((c) => c.hash.substring(0, 7)) || []),
		);
		const orphanCommits = entries.filter((e) => !e.isMerge && !prCommitHashes.has(e.hash));

		return { mergeCommits, orphanCommits };
	}

	private categorizePRs(mergeCommits: ChangelogEntry[]) {
		return {
			features: mergeCommits.filter((e) => e.prCategory === "features"),
			bugfixes: mergeCommits.filter((e) => e.prCategory === "bugfixes"),
			dependencies: mergeCommits.filter((e) => e.prCategory === "dependencies"),
			infrastructure: mergeCommits.filter((e) => e.prCategory === "infrastructure"),
			documentation: mergeCommits.filter((e) => e.prCategory === "documentation"),
			refactoring: mergeCommits.filter((e) => e.prCategory === "refactoring"),
			other: mergeCommits.filter((e) => e.prCategory === "other"),
		};
	}

	private categorizeOrphanCommits(orphanCommits: ChangelogEntry[]) {
		return {
			breaking: orphanCommits.filter((e) => e.breaking),
			features: orphanCommits.filter((e) => e.type === "feat" && !e.breaking),
			bugfixes: orphanCommits.filter((e) => e.type === "fix" && !this.isDependencyCommit(e)),
			improvements: orphanCommits.filter((e) => ["refactor", "style"].includes(e.type)),
			documentation: orphanCommits.filter((e) => e.type === "docs"),
			testing: orphanCommits.filter((e) => e.type === "test"),
			dependencies: orphanCommits.filter((e) => this.isDependencyCommit(e)),
			other: orphanCommits.filter(
				(e) =>
					!e.breaking &&
					!["feat", "fix", "refactor", "style", "docs", "test"].includes(e.type) &&
					!this.isDependencyCommit(e),
			),
		};
	}

	private generateHeader(packageName?: string, displayVersion = "Unreleased"): string {
		const projectTitle = packageName ? ` - ${packageName}` : "";
		return `# Changelog${projectTitle}

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## ${displayVersion}

`;
	}

	private async generatePRSections(
		prsByCategory: Record<string, ChangelogEntry[]>,
		repositoryUrl?: string,
	): Promise<string> {
		const allPRs = [
			...prsByCategory.features,
			...prsByCategory.infrastructure,
			...prsByCategory.refactoring,
			...prsByCategory.bugfixes,
			...prsByCategory.documentation,
			...prsByCategory.other,
		];

		let content = "";
		for (const entry of allPRs) {
			content += await this.generatePREntry(entry, repositoryUrl);
		}

		return content;
	}

	private async generatePREntry(entry: ChangelogEntry, repositoryUrl?: string): Promise<string> {
		const prBranch = entry.description.replace(/^Merge pull request #\d+ from [^/]+\//, "").trim();

		const category = entry.prCategory || "other";
		const categoryEmoji = this.categoryInfo[category]?.emoji || "🔀";
		const categoryLabel = this.categoryInfo[category]?.label || "Other Pull Requests";

		const prNumber = entry.prNumber || "unknown";
		const commitCount = entry.prStats ? `${entry.prStats.commitCount} commits` : "commits";

		const badges = this.generatePRBadges(categoryLabel, prNumber, commitCount, repositoryUrl);

		let content = `### ${categoryEmoji} ${prBranch} ${badges}\n\n`;

		if (entry.body) {
			const formattedBody = this.formatPRBody(entry.body);
			if (formattedBody.trim()) {
				content += `${formattedBody}\n\n`;
			}
		}

		if (entry.prCommits && entry.prCommits.length > 0) {
			const commitBadges = this.generateCommitBadges(entry.prCommits, repositoryUrl);
			if (commitBadges.length > 0) {
				content += `${commitBadges.join(" ")}\n\n`;
			}
		}

		return content;
	}

	private generatePRBadges(
		categoryLabel: string,
		prNumber: string,
		commitCount: string,
		repositoryUrl?: string,
	): string {
		const categoryBadge = `<img src="https://img.shields.io/badge/${categoryLabel.replace(/ /g, "%20").replace(/&/g, "%26")}-495057?style=flat" alt="${categoryLabel}" style="vertical-align: middle;" />`;

		const prBadge = repositoryUrl
			? `<a href="${repositoryUrl}/pull/${prNumber}"><img src="https://img.shields.io/badge/%23${prNumber}-blue?style=flat" alt="#${prNumber}" style="vertical-align: middle;" /></a>`
			: `<img src="https://img.shields.io/badge/%23${prNumber}-blue?style=flat" alt="#${prNumber}" style="vertical-align: middle;" />`;

		const commitBadge = `<img src="https://img.shields.io/badge/${commitCount.replace(/ /g, "%20")}-green?style=flat" alt="${commitCount}" style="vertical-align: middle;" />`;

		return `${categoryBadge} ${prBadge} ${commitBadge}`;
	}

	private formatPRBody(body: string): string {
		return body
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0)
			.join("\n");
	}

	private generateCommitBadges(prCommits: CommitInfo[], repositoryUrl?: string): string[] {
		const commitsByType = new Map<string, CommitInfo[]>();

		for (const prCommit of prCommits) {
			const type = this.parseCommitType(prCommit.message);
			if (!commitsByType.has(type)) {
				commitsByType.set(type, []);
			}
			commitsByType.get(type)?.push(prCommit);
		}

		const commitBadges: string[] = [];
		for (const [type, commits] of commitsByType.entries()) {
			for (const commit of commits) {
				const commitHash = commit.hash.substring(0, 7);
				const color =
					this.typeColors[type as keyof typeof this.typeColors] || this.typeColors.other;
				const badge = repositoryUrl
					? `<a href="${repositoryUrl}/commit/${commit.hash}"><img src="https://img.shields.io/badge/${type}-${commitHash}-${color}?style=flat&logoColor=white" alt="${type}" style="vertical-align: middle;" /></a>`
					: `<img src="https://img.shields.io/badge/${type}-${commitHash}-${color}?style=flat&logoColor=white" alt="${type}" style="vertical-align: middle;" />`;
				commitBadges.push(badge);
			}
		}

		return commitBadges;
	}

	private async generateOrphanSections(
		orphansByType: Record<string, ChangelogEntry[]>,
		repositoryUrl?: string,
		isDependency = false,
	): Promise<string> {
		let content = "";

		for (const sectionConfig of this.orphanSectionConfig) {
			const entries = orphansByType[sectionConfig.key as keyof typeof orphansByType];
			if (!entries || entries.length === 0) continue;

			// Skip dependency sections if this is not the dependency section
			if (!isDependency && sectionConfig.key === "dependencies") continue;
			// Skip non-dependency sections if this is the dependency section
			if (isDependency && sectionConfig.key !== "dependencies") continue;

			content += `<details>\n<summary><strong>${sectionConfig.title}</strong> (Click to expand)</summary>\n\n`;

			for (const entry of entries) {
				content += await this.generateOrphanEntry(entry, repositoryUrl);
			}

			content += "\n</details>\n\n";
		}

		return content;
	}

	private async generateOrphanEntry(
		entry: ChangelogEntry,
		repositoryUrl?: string,
	): Promise<string> {
		const scopeText = entry.scope ? ` (${entry.scope})` : "";
		const hashText = repositoryUrl
			? `([${entry.hash}](${repositoryUrl}/commit/${entry.hash}))`
			: `(${entry.hash})`;

		let authorText = "";
		if (entry.author) {
			const email = await this.getAuthorEmail(entry.author);
			authorText = ` by ${this.formatAuthorInfo(entry.author, email)}`;
		}

		const text = [scopeText, entry.description, hashText, authorText];
		return `- ${text.filter(Boolean).join(" ")}\n`;
	}

	private async generateDependencySections(
		dependencyPRs: ChangelogEntry[],
		orphanDependencies: ChangelogEntry[],
		repositoryUrl?: string,
	): Promise<string> {
		const hasDependencies = dependencyPRs.length > 0 || orphanDependencies.length > 0;

		if (!hasDependencies) return "";

		let content =
			"<details>\n<summary>📦 <strong>Dependency Updates</strong> (Click to expand)</summary>\n\n";

		// Add orphan dependency commits
		if (orphanDependencies.length > 0) {
			content += "### 📦 Dependencies\n\n";
			for (const entry of orphanDependencies) {
				content += await this.generateOrphanEntry(entry, repositoryUrl);
			}
			content += "\n";
		}

		// Add dependency PRs
		for (const entry of dependencyPRs) {
			content += await this.generatePREntry(entry, repositoryUrl);
		}

		content += "</details>\n\n";
		return content;
	}

	private generateFooter(): string {
		return "\n---\n\n*This changelog was automatically generated using our custom versioning script* ⚡\n";
	}

	private parseCommitType(message: string): string {
		const conventionalCommitRegex = /^(\w+)(?:\([^)]+\))?: (.+)$/;
		const match = message.match(conventionalCommitRegex);
		return match ? match[1] : "other";
	}

	private isDependencyCommit(entry: ChangelogEntry): boolean {
		const message = entry.description.toLowerCase();
		const scope = entry.scope?.toLowerCase() || "";

		const depPatterns = [
			/^deps?:/,
			/^update.*dependencies/,
			/^upgrade.*dependencies/,
			/^bump.*dependencies/,
			/^dependency.*update/,
			/^chore.*dependencies/,
			/^chore.*deps/,
			/^chore.*update/,
			/^renovate/,
			/^auto.*update/,
			/^automated.*update/,
		];

		const depScopes = ["deps", "dependencies", "dep", "renovate"];

		return (
			depPatterns.some((pattern) => pattern.test(message)) ||
			depScopes.includes(scope) ||
			(entry.type === "chore" &&
				(message.includes("update") || message.includes("upgrade") || message.includes("bump")))
		);
	}

	private async getAuthorEmail(authorName: string): Promise<string | undefined> {
		try {
			const result = await $`git log --author="${authorName}" --pretty=format:"%ae" -1`
				.quiet()
				.nothrow();
			if (result.exitCode !== 0) return undefined;

			const email = result.text().trim();
			return email || undefined;
		} catch {
			return undefined;
		}
	}

	private formatAuthorInfo(authorName: string, email?: string): string {
		if (email) {
			return `**${authorName}** [${email}](mailto:${email})`;
		}
		return `**${authorName}**`;
	}
}
