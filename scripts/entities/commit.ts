/** biome-ignore-all lint/complexity/noUselessConstructor: it's a simple util class */
import { $ } from "bun";
import {
	type CommitMessageData,
	type CommitType,
	commitRules,
	type ParsedCommitData,
	type PRCategory,
	type PRStats,
} from "./commit.types";

export * from "./commit.types";

export class EntityCommit {
	constructor() {}

	static parseByMessage(message: string): CommitMessageData {
		const conventionalCommitRegex = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)\s*$/;
		const match = message.match(conventionalCommitRegex);
		const isMerge = message.startsWith("Merge pull request") || message.startsWith("Merge branch");
		if (!match) {
			return {
				type: "other",
				description: message,
				scopes: [],
				bodyLines: [],
				isBreaking: false,
				isMerge,
				isDependency: false,
			};
		}

		const [, type, scope, isBreaking, description] = match || [];
		const scopes = scope?.split(",") || [];
		const isBreakingBoolean = isBreaking === "!";

		const lines = message.split("\n");
		const bodyLines = lines.length > 1 ? lines.slice(1).filter((line) => line.trim()) : [];

		const depScopes = ["deps", "dependencies", "dep", "renovate"];
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

		const isDependency =
			depPatterns.some((pattern) => pattern.test(message.toLowerCase())) ||
			scopes.some((s) => depScopes.includes(s)) ||
			(type === "chore" &&
				(message.toLowerCase().includes("update") ||
					message.toLowerCase().includes("upgrade") ||
					message.toLowerCase().includes("bump")));

		return {
			type: type as CommitType,
			scopes,
			isBreaking: isBreakingBoolean,
			description,
			bodyLines,
			isMerge,
			isDependency,
		};
	}

	static async validateCommitMessage(message: string): Promise<string[]> {
		if (!message.trim()) return ["type | commit message cannot be empty"];
		const match = EntityCommit.parseByMessage(message);
		if (match.isMerge) return [];
		if (match.type === "other")
			return ["type | message does not follow conventional commit format"];

		const errors: string[] = [];
		for (const [key, value] of Object.entries(match)) {
			if (key === "isBreaking") {
				if (value) {
					const breakingValidation = commitRules.isBreaking.validator([
						match.type,
						match.description,
					]);
					if (typeof breakingValidation === "string") {
						errors.push(breakingValidation);
					}
				}
			} else {
				const validation = commitRules[key as keyof CommitMessageData].validator(
					Array.isArray(value) ? value : [value as string],
				);
				if (typeof validation === "string") errors.push(validation);
			}
		}

		return errors;
	}

	static formatCommitMessage(message: CommitMessageData): string {
		let formatted = `${message.type}`;
		if (message.scopes) formatted += `(${message.scopes.join(", ")})`;
		formatted += `: ${message.description}`;
		if (message.bodyLines) formatted += `\n\n${message.bodyLines.join("\n")}`;
		if (message.isBreaking) formatted += `\n\nBREAKING CHANGE: ${message.description}`;

		return formatted;
	}

	static async parseByHash(hash: string): Promise<ParsedCommitData> {
		try {
			const commitResult = await $`git show --format="%H|%an|%ad|%s|%B" --no-patch ${hash}`
				.quiet()
				.nothrow();

			if (commitResult.exitCode !== 0) {
				throw new Error(`Could not find commit ${hash}`);
			}

			const lines = commitResult.text().trim().split("\n");
			const [commitHash, author, date, message, ...bodyLines] = lines;

			const parsedMessage = EntityCommit.parseByMessage(message);
			const isMerge =
				message.startsWith("Merge pull request") || message.startsWith("Merge branch");

			// Get PR information if it's a merge commit
			let prInfo: ParsedCommitData["pr"] | undefined;
			if (isMerge) {
				prInfo = await EntityCommit.getPRInfo(message, hash, bodyLines);
			}

			return {
				message: {
					type: parsedMessage.type,
					scopes: parsedMessage.scopes,
					description: parsedMessage.description,
					bodyLines,
					isMerge,
					isDependency: parsedMessage.isDependency,
					isBreaking: parsedMessage.isBreaking,
				},
				info: {
					hash: commitHash,
					author: author || undefined,
					date: date || undefined,
				},
				pr: prInfo,
			};
		} catch (error) {
			throw new Error(
				`Failed to parse commit ${hash}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	}

	private static async getPRInfo(
		mergeMessage: string,
		commitHash: string,
		bodyLines: string[],
	): Promise<ParsedCommitData["pr"]> {
		try {
			const prNumber = EntityCommit.extractPRNumber(mergeMessage);
			if (!prNumber) return undefined;

			const prCommits = await EntityCommit.getPRCommits(commitHash);
			const prCategory = EntityCommit.categorizePR(prCommits, mergeMessage, bodyLines);
			const prStats = EntityCommit.getPRStats(prCommits);

			return {
				prNumber,
				prCategory,
				prStats,
				prCommits: prCommits.length > 0 ? prCommits : undefined,
			};
		} catch (error) {
			console.warn(`Failed to get PR info for commit ${commitHash}: ${error}`);
			return undefined;
		}
	}

	private static extractPRNumber(mergeMessage: string): string | undefined {
		const prMatch = mergeMessage.match(/Merge pull request #(\d+)/);
		return prMatch ? prMatch[1] : undefined;
	}

	private static async getPRCommits(mergeCommitHash: string): Promise<ParsedCommitData[]> {
		try {
			const result = await $`git log --pretty=format:"%H" ${mergeCommitHash}^..${mergeCommitHash}^2`
				.quiet()
				.nothrow();

			if (result.exitCode !== 0) return [];

			const commitHashes = result.text().trim().split("\n").filter(Boolean);

			// Recursively parse each commit to get full details
			const prCommits = await Promise.all(
				commitHashes.map(async (hash) => {
					try {
						return await EntityCommit.parseByHash(hash);
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

			return prCommits.filter((commit) => commit.info.hash && commit.message.description);
		} catch {
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
