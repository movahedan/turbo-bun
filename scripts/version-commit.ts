#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import { $ } from "bun";
import chalk from "chalk";
import { createScript } from "./utils/create-scripts";
import type { PackageJson } from "./utils/version-utils";

const versionCommitConfig = {
	name: "Version Commit",
	description: "Commit version bump and changelog changes",
	usage: "bun run version-commit",
	examples: ["bun run version-commit"],
	options: [],
} as const;

export const versionCommit = createScript(
	versionCommitConfig,
	async function main(_args, xConsole) {
		xConsole.info(chalk.blue("🏷️ Committing version changes..."));

		// Read current version
		const packageJson = JSON.parse(
			readFileSync("package.json", "utf8"),
		) as PackageJson;
		const currentVersion = packageJson.version;

		// Check if there are any changes to commit
		const status = await $`git status --porcelain`.text();
		if (!status.trim()) {
			throw new Error("No changes to commit. Run 'bun run version:add' first.");
		}

		// Commit changes
		await $`git add .`;
		await $`git commit -m "chore(release): bump version via Changesets"`;

		xConsole.log(chalk.green("✅ Version changes committed successfully"));
		xConsole.log(chalk.cyan("🚀 Ready to push with 'bun run version-push'"));
	},
);

if (import.meta.main) {
	versionCommit();
}
