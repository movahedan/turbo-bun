import { repoUtils } from "./repo-utils";

export const commitTypes = [
	"feat", // A new feature
	"fix", // A bug fix
	"docs", // Documentation only changes
	"style", // Changes that do not affect the meaning of the code
	"refactor", // A code change that neither fixes a bug nor adds a feature
	"perf", // A code change that improves performance
	"test", // Adding missing tests or correcting existing tests
	"build", // Changes that affect the build system or external dependencies
	"ci", // Changes to our CI configuration files and scripts
	"chore", // Other changes that don't modify src or test files
	"revert", // Reverts a previous commit
	"release", // Release a new version
	"wip", // Work in progress
];

export interface CommitMessage {
	type: string;
	scope?: string;
	description: string;
	body?: string;
	breaking?: string;
}

export interface ParsedCommit {
	readonly type: string;
	readonly scope?: string;
	readonly description: string;
	readonly breaking: boolean;
}

export function parseCommitMessage(commitMsg: string): CommitMessage | null {
	// Parse conventional commit format: type(scope)!: description
	const conventionalRegex = /^(\w+)(\([^)]+\))?(!)?: (.+)$/;
	const match = commitMsg.match(conventionalRegex);

	if (!match) {
		return null;
	}

	const [, type, scopeMatch, breaking, description] = match;
	const scope = scopeMatch ? scopeMatch.slice(1, -1) : undefined;

	return {
		type,
		scope,
		description,
		breaking: breaking ? "Breaking change" : undefined,
	};
}

export function parseCommit(message: string): ParsedCommit {
	const conventionalCommitRegex = /^(\w+!?)(?:\(([^)]+)\))?: (.+)$/;
	const match = message.match(conventionalCommitRegex);

	if (!match) {
		return {
			type: "other",
			description: message,
			breaking: false,
		};
	}

	const [, rawType, scope, description] = match;
	const breaking =
		message.includes("BREAKING CHANGE:") || message.includes("!:") || rawType.endsWith("!");
	const type = rawType.endsWith("!") ? rawType.slice(0, -1) : rawType;

	return {
		type,
		scope,
		description,
		breaking,
	};
}

export function parseCommitType(message: string): string {
	const conventionalCommitRegex = /^(\w+)(?:\([^)]+\))?: (.+)$/;
	const match = message.match(conventionalCommitRegex);
	return match ? match[1] : "other";
}

export function formatCommitMessage(message: CommitMessage): string {
	let commit = message.type;

	if (message.scope) {
		commit = `${commit}(${message.scope})`;
	}

	if (message.breaking) {
		commit = `${commit}!`;
	}

	commit = `${commit}: ${message.description}`;

	if (message.body) {
		commit += `\n\n${message.body}`;
	}

	if (message.breaking) {
		commit += `\n\nBREAKING CHANGE: ${message.breaking}`;
	}

	return commit;
}

export async function validateCommitMessage(message: CommitMessage): Promise<string[]> {
	const errors: string[] = [];

	if (!commitTypes.includes(message.type)) {
		errors.push(`Invalid commit type "${message.type}". Valid types: ${commitTypes.join(", ")}`);
	}

	if (!message.description || message.description.trim() === "") {
		errors.push("Description cannot be empty");
	}

	if (message.description?.length > 100) {
		errors.push("Description should be 100 characters or less");
	}

	if (message.description?.endsWith(".")) {
		errors.push("Description should not end with a period");
	}

	if (message.scope) {
		const scopes = message.scope
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		const allowedScopes = await repoUtils.workspace.getAllPackages();

		for (const scope of scopes) {
			if (!allowedScopes.includes(scope)) {
				errors.push(`Invalid scope "${scope}". Valid scopes: ${allowedScopes.join(", ")}`);
			}
		}
	}

	return errors;
}
