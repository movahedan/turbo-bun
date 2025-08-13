/** biome-ignore-all lint/complexity/noStaticOnlyClass: it's a simple util class */

import { $ } from "bun";
import type { CommitType, ParsedCommitData, PRCategory, PRStats } from "./commit.types";

export class EntityPr {
	static async getPRInfo(
		parseByHash: (hash: string) => Promise<ParsedCommitData>,
		hash: string,
		message: string,
		bodyLines: string[],
	): Promise<ParsedCommitData["pr"]> {
		try {
			const prNumber = EntityPr.extractPRNumber(message);

			if (!prNumber) {
				return undefined;
			}

			const prCommits = await EntityPr.getPRCommits(hash, parseByHash);

			return {
				prNumber: EntityPr.extractPRNumber(message),
				prCategory: EntityPr.categorizePR(prCommits, message, bodyLines),
				prStats: EntityPr.getPRStats(prCommits),
				prCommits: prCommits.length > 0 ? prCommits : undefined,
			};
		} catch (error) {
			console.warn(`Failed to get PR info for commit ${hash}: ${error}`);
			return undefined;
		}
	}

	private static extractPRNumber(mergeMessage: string): string | undefined {
		// Try different merge commit patterns
		const patterns = [
			/Merge pull request #(\d+)/, // "Merge pull request #123"
			/Merge PR #(\d+)/, // "Merge PR #123"
			/Merge.*#(\d+)/, // "Merge branch 'feature' into main #123"
			/.*#(\d+).*/, // Any message containing #123
		];

		for (const pattern of patterns) {
			const match = mergeMessage.match(pattern);
			if (match) {
				return match[1];
			}
		}

		return undefined;
	}

	private static async getPRCommits(
		mergeCommitHash: string,
		parseByHash: (hash: string) => Promise<ParsedCommitData>,
	): Promise<ParsedCommitData[]> {
		try {
			const result = await $`git log --pretty=format:"%H" ${mergeCommitHash}^..${mergeCommitHash}^2`
				.quiet()
				.nothrow();

			if (result.exitCode !== 0) {
				return [];
			}

			const commitHashes = result.text().trim().split("\n").filter(Boolean);

			// Recursively parse each commit to get full details
			const prCommits = await Promise.all(
				commitHashes.map(async (hash) => {
					try {
						return await parseByHash(hash);
					} catch (error) {
						console.warn(`Failed to parse PR commit ${hash}: ${error}`);
						// Fallback to basic info if parsing fails
						return {
							message: {
								type: "other" as CommitType,
								description: "Failed to parse commit",
								isMerge: false,
								isDependency: false,
								isBreaking: false,
							},
							info: {
								hash: hash.trim(),
							},
						} as ParsedCommitData;
					}
				}),
			);

			const validCommits = prCommits.filter(
				(commit) => commit.info.hash && commit.message.description,
			);
			return validCommits;
		} catch (error) {
			return [];
		}
	}

	private static categorizePR(
		prCommits: ParsedCommitData[],
		mergeMessage: string,
		prBodyLines: string[],
	): PRCategory {
		if (
			mergeMessage.includes("renovate") ||
			mergeMessage.includes("dependabot") ||
			prBodyLines.some((line) => line.toLowerCase().includes("dependency"))
		) {
			return "dependencies";
		}

		const scores = {
			features: 0,
			bugfixes: 0,
			dependencies: 0,
			infrastructure: 0,
			documentation: 0,
			refactoring: 0,
		};

		for (const commit of prCommits) {
			const commitType = commit.message.type;

			switch (commitType) {
				case "feat":
					scores.features += 3;
					break;
				case "fix":
					scores.bugfixes += 2;
					break;
				case "deps":
				case "chore":
					if (
						commit.message.description.includes("dep") ||
						commit.message.description.includes("update") ||
						commit.message.description.includes("upgrade")
					) {
						scores.dependencies += 5;
					} else if (
						commit.message.description.includes("ci") ||
						commit.message.description.includes("build") ||
						commit.message.description.includes("workflow")
					) {
						scores.infrastructure += 2;
					}
					break;
				case "docs":
					scores.documentation += 2;
					break;
				case "refactor":
				case "style":
				case "perf":
					scores.refactoring += 2;
					break;
				case "ci":
				case "build":
					scores.infrastructure += 3;
					break;
			}
		}

		const maxScore = Math.max(...Object.values(scores));
		if (maxScore === 0) return "other";

		const winner = Object.entries(scores).find(([_, score]) => score === maxScore);
		return winner ? (winner[0] as PRCategory) : "other";
	}

	private static getPRStats(prCommits: ParsedCommitData[]): PRStats {
		return {
			commitCount: prCommits.length,
		};
	}
}
