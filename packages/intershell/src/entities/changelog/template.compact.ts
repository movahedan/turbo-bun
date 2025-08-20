import { commitRules, type ParsedCommitData } from "../commit";
import { EntityPackages } from "../packages";
import { ChangelogTemplate, type TemplateEngineData } from "./template";

const repoUrl = await EntityPackages.getRepoUrl();
const validTypes = commitRules.getConfig().type?.list ?? [];

export class CompactChangelogTemplate extends ChangelogTemplate {
	static getChangelogHeader(packageName: string): string {
		return `# ${packageName} Changelog\n\n`;
	}

	static getChangelogVersionHeader(version: string): string {
		return `\n## ${version === "[Unreleased]" ? "Unreleased" : version}\n\n`;
	}

	static formatCommit(commit: ParsedCommitData, repoUrl: string): string {
		const hash = commit.info?.hash?.substring(0, 7) || "unknown";
		const author = commit.info?.author || "Unknown";
		const description = commit.message.description;
		const type = commit.message.type;
		const scopes =
			commit.message.scopes && commit.message.scopes.length > 0
				? commit.message.scopes.join(", ")
				: "";

		let line = `${type} ${description}`;

		// Add scopes if available
		if (scopes) {
			line += ` (${scopes})`;
		}

		// Make SHA a clickable link to the commit
		if (commit.info?.hash) {
			const commitUrl = `${repoUrl}/commit/${commit.info.hash}`;
			line += ` ([${hash}](${commitUrl}))`;
		}

		// Add author
		line += ` by **${author}**`;

		// Add email if available
		if (commit.info?.author?.includes("@")) {
			line += ` [${commit.info.author}](mailto:${commit.info.author})`;
		}

		return line;
	}

	static formatCommitsByType(commits: ParsedCommitData[], repoUrl: string): string {
		if (commits.length === 0) return "";

		// Sort commit types in the order we want them displayed
		const commitTypeOrder = validTypes
			.map((type) => type.type)
			.sort((a: string, b: string) => {
				if (a === "deps") return 1;
				if (b === "deps") return -1;
				return 0;
			});

		let section = "";

		for (const type of commitTypeOrder) {
			const commitsByType = commits.filter((commit) => commit.message.type === type);
			if (commitsByType.length > 0) {
				const typeTitle = CompactChangelogTemplate.getTypeTitle(type);
				section += `### ${typeTitle}\n\n`;

				// List all commits of this type
				for (const commit of commitsByType) {
					const formattedCommit = CompactChangelogTemplate.formatCommit(commit, repoUrl);
					section += `- ${formattedCommit}\n`;
				}

				section += "\n";
			}
		}

		return section;
	}

	static getTypeTitle(type: string): string {
		const commitType = validTypes.find((t) => t.type === type);
		return commitType?.label || `📝 ${type.charAt(0).toUpperCase() + type.slice(1)}`;
	}

	// Override the main generateContent method to flatten all commits
	generateContent(changelogData: TemplateEngineData): string {
		let changelog = CompactChangelogTemplate.getChangelogHeader(this.packageName);
		const sortedVersions = Object.keys(changelogData).sort((a, b) => this.sortVersions(b, a));

		for (const version of sortedVersions) {
			const versionData = changelogData.get(version);
			if (typeof versionData === "string") {
				changelog += versionData;
				continue;
			}

			const versionHeader = CompactChangelogTemplate.getChangelogVersionHeader(version);
			changelog += versionHeader;

			// Collect all commits (both merge and orphan) into a single array
			const allCommits: ParsedCommitData[] = [];

			// Add merge commits (flatten PR commits)
			for (const mergeCommit of versionData?.mergeCommits || []) {
				if (mergeCommit.pr?.prCommits) {
					// Add all commits from the PR
					allCommits.push(...mergeCommit.pr.prCommits);
				} else {
					// Add the merge commit itself if no PR commits
					allCommits.push(mergeCommit);
				}
			}

			// Add orphan commits
			allCommits.push(...(versionData?.orphanCommits || []));

			// Remove duplicates based on commit hash
			const uniqueCommits = allCommits.filter(
				(commit, index, self) =>
					index === self.findIndex((c) => c.info?.hash === commit.info?.hash),
			);

			// Format all commits by type
			changelog += CompactChangelogTemplate.formatCommitsByType(uniqueCommits, repoUrl);
		}

		return changelog;
	}
}
