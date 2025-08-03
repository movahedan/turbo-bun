import type { UserConfig } from "@commitlint/types";
import { getAllDirectoryNames } from "./scripts/scripting-utils/get-all-directories";

const validScopes = await getAllDirectoryNames();

const config: UserConfig = {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"type-enum": [
			2,
			"always",
			[
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
				"wip", // Work in progress
			],
		],
		"type-case": [2, "always", "lower-case"],
		"type-empty": [2, "never"],
		"scope-case": [2, "always", "lower-case"],
		"scope-enum": [2, "always", validScopes],
		"subject-empty": [2, "never"],
		"subject-full-stop": [2, "never", "."],
		"header-max-length": [2, "always", 100],
	},
};

export default config;
