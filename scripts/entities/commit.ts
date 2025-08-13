/** biome-ignore-all lint/complexity/noStaticOnlyClass: it's a simple util class */
import { $ } from "bun";
import { EntityPr } from "./commit.pr";
import {
	type CommitMessageData,
	type CommitType,
	commitRules,
	type ParsedCommitData,
} from "./commit.types";

export * from "./commit.types";

export class EntityCommit {
	static parseByMessage(message: string): CommitMessageData {
		const conventionalCommitRegex = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*([^\r\n]+?)\s*$/;
		const match = message.match(conventionalCommitRegex);
		const isMerge = message.startsWith("Merge pull request") || message.startsWith("Merge branch");
		if (!match) {
			return {
				type: "merge",
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

		const depScopes = ["deps", "dependencies", "dep", "renovate", "dependabot"];

		const isDependency =
			scopes.some((s) => depScopes.includes(s)) ||
			(type === "chore" &&
				(message.toLowerCase().includes("update") ||
					message.toLowerCase().includes("upgrade") ||
					message.toLowerCase().includes("bump"))) ||
			description.includes("renovate[bot]") ||
			description.includes("dependabot[bot]");

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

	static validateCommitMessage(message: string): string[] {
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
			const commitResult = await $`git show --format="%H%n%an%n%ad%n%s%n%B" --no-patch ${hash}`
				.quiet()
				.nothrow();
			if (commitResult.exitCode !== 0) throw new Error(`Could not find commit ${hash}`);

			const lines = commitResult.text().trim().split("\n");
			const [commitHash, author, date, subject, ...bodyLines] = lines;
			const isMerge =
				subject.startsWith("Merge pull request") || subject.startsWith("Merge branch");

			if (!subject) throw new Error(`No subject found for commit ${hash}`);
			const parsedMessage = EntityCommit.parseByMessage(subject);
			const prInfo = isMerge
				? await EntityPr.getPRInfo(EntityCommit.parseByHash, hash, subject, bodyLines)
				: undefined;

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
}
