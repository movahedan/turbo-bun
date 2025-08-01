import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { UserConfig } from "@commitlint/types";
import { getAllDirectories } from "./scripts/utils/get-all-directories";

// Get valid scopes from monorepo structure
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname);
const directories = getAllDirectories(projectRoot);
const validScopes = directories.map((dir) => dir.name);

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
		"subject-case": [2, "always", "lower-case"],
		"subject-empty": [2, "never"],
		"subject-full-stop": [2, "never", "."],
		"header-max-length": [2, "always", 72],
	},
};

export default config;
