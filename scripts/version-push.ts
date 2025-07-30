#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";
import { createScript } from "./utils/create-scripts";

const versionPushConfig = {
	name: "Version Push",
	description: "Push release branch to origin with Changesets",
	usage: "bun run version-push",
	examples: ["bun run version-push"],
	options: [],
} as const;

export const versionPush = createScript(
	versionPushConfig,
	async function main(_args, xConsole) {
		xConsole.info(chalk.blue("🚀 Pushing release branch..."));

		// Get current branch
		const currentBranch = await $`git branch --show-current`.text();
		if (!currentBranch.trim().startsWith("release/")) {
			throw new Error("Must be on a release branch to push");
		}

		// Push the branch
		await $`git push origin ${currentBranch}`;

		xConsole.log(
			chalk.green(`✅ Pushed release branch: ${currentBranch.trim()}`),
		);
		xConsole.log(chalk.cyan("📋 Create a pull request to merge this release"));
	},
);

if (import.meta.main) {
	versionPush();
}
