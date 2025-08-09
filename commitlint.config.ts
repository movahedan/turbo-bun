import type { UserConfig } from "@commitlint/types";
import { repoUtils } from "./scripts/shell/repo-utils";

const commitTypes = [
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

const allowedScopes = await repoUtils.workspace.getAllPackages();
function scopeRules(parsed: { scope: string }) {
	const scopes =
		parsed.scope
			?.split(",")
			.map((scope) => scope.trim())
			.filter(Boolean) ?? [];

	if (scopes.every((scope) => allowedScopes.includes(scope))) {
		return [true];
	}

	return [
		false,
		`scopes should be either an empty, single scope, or a comma separated list of scopes. Allowed scopes are: \n\n\t${allowedScopes.join("\n\t")}\n\n`,
	];
}

const config: UserConfig = {
	extends: ["@commitlint/config-conventional"],
	plugins: ["commitlint-plugin-function-rules"],
	rules: {
		"type-enum": [2, "always", commitTypes],
		"type-case": [2, "always", "lower-case"],
		"type-empty": [2, "never"],
		"function-rules/scope-enum": [2, "always", scopeRules],
		"subject-empty": [2, "never"],
		"subject-full-stop": [2, "never", "."],
		"header-max-length": [2, "always", 120],
	},
};

export default config;
