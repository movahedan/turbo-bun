/** biome-ignore-all lint/complexity/noStaticOnlyClass: it's a simple util class */
import { $ } from "bun";
import { EntityPr } from "./pr";
import { commitRules } from "./rules";
import type { CommitMessageData, ParsedCommitData } from "./types";

export * from "./types";

const conventionalCommitRegex = /^([a-z]+)(\([a-zA-Z0-9@\-,\s/]+\))?(!)?:\s(.+)/;
const depScopes = ["deps", "dependencies", "dep", "renovate", "dependabot"];
const getIsMerge = (message: string) =>
	message.startsWith("Merge pull request") || message.startsWith("Merge branch");
const getIsDependency = (message: string) =>
	message.includes("renovate[bot]") || message.includes("dependabot[bot]");

export const EntityCommit = {
	parseByMessage(message: string): CommitMessageData {
		const lines = message.split("\n");
		const subject = lines[0];
		const bodyLines = lines.length > 1 ? lines.slice(1).filter((line) => line.trim()) : [];

		const match = subject.match(conventionalCommitRegex);
		if (!match) {
			const type = getIsMerge(message) ? "merge" : getIsDependency(message) ? "deps" : "other";

			return {
				type,
				description: subject,
				scopes: [],
				bodyLines: bodyLines,
				isBreaking: false,
				isMerge: type === "merge",
				isDependency: type === "deps",
			};
		}

		const [, type, scope, breaking, description] = match || [];
		const scopes = scope ? scope.replace(/[()]/g, "").split(",") : [];
		const isBreaking = breaking === "!";
		const isMerge = getIsMerge(message);
		const isDependency = scopes.some((s) => depScopes.includes(s)) || getIsDependency(message);

		return { type, scopes, description, bodyLines, isMerge, isBreaking, isDependency };
	},

	validateCommitMessage(message: string): string[] {
		if (!message.trim()) return ["type | commit message cannot be empty"];
		const match = EntityCommit.parseByMessage(message);

		const errors: string[] = [];
		for (const rule of commitRules.getRules()) {
			const validation = rule.validator({ message: match });
			if (typeof validation === "string") errors.push(validation);
		}

		return errors;
	},

	formatCommitMessage(message: CommitMessageData): string {
		let formatted = `${message.type}`;
		if (message.scopes) formatted += `(${message.scopes.join(", ")})`;
		formatted += `: ${message.description}`;
		if (message.bodyLines) formatted += `\n\n${message.bodyLines.join("\n")}`;
		if (message.isBreaking) formatted += `\n\nBREAKING CHANGE: ${message.description}`;

		return formatted;
	},

	async parseByHash(hash: string): Promise<ParsedCommitData> {
		try {
			const commitResult = await $`git show --format="%H%n%an%n%ad%n%s%n%B" --no-patch ${hash}`
				.quiet()
				.nothrow();
			if (commitResult.exitCode !== 0) throw new Error(`Could not find commit ${hash}`);

			const lines = commitResult.text().trim().split("\n");
			const [commitHash, author, date, subject, ...bodyLines] = lines;
			if (!subject) throw new Error(`No subject found for commit ${hash}`);

			const message = EntityCommit.parseByMessage(`${subject}\n${bodyLines.join("\n")}`);
			return {
				message,
				info: {
					hash: commitHash,
					author: author || undefined,
					date: date || undefined,
				},
				pr: message.isMerge
					? await EntityPr.getPRInfo(EntityCommit.parseByHash, hash, message)
					: undefined,
			};
		} catch (error) {
			throw new Error(
				`Failed to parse commit ${hash}: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	},
};
