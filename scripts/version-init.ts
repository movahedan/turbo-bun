#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";
import { createScript } from "./utils/create-scripts";
import { getRootVersion, isUpToDate } from "./utils/version-utils";

const versionInitConfig = {
	name: "Version Init",
	description:
		"Initialize a release branch for version management with Changesets",
	usage: "bun run version:init",
	examples: ["bun run version:init"],
	options: [],
} as const;

export const versionInit = createScript(
	versionInitConfig,
	async function main(_args, xConsole) {
		xConsole.info(chalk.blue("🔍 Checking git status..."));

		// Check if we're on main branch
		const currentBranch = await $`git branch --show-current`.text();
		if (currentBranch.trim() !== "main") {
			throw new Error(
				`Must be on main branch, currently on: ${currentBranch.trim()}`,
			);
		}

		// Check if up to date
		if (!(await isUpToDate())) {
			throw new Error("Local main branch is not up to date with origin/main");
		}

		// Check for uncommitted changes
		const status = await $`git status --porcelain`.text();
		if (status.trim()) {
			throw new Error(
				"Working directory is not clean. Please commit or stash changes.",
			);
		}

		// Get current version
		const currentVersion = getRootVersion();
		xConsole.info(chalk.blue(`📦 Current version: ${currentVersion}`));

		// Create release branch
		const releaseBranch = `release/${currentVersion}`;
		await $`git checkout -b ${releaseBranch}`;

		xConsole.log(chalk.green(`✅ Created release branch: ${releaseBranch}`));
		xConsole.log(chalk.cyan("🚀 Ready to manage versions with Changesets!"));
		xConsole.log(
			chalk.cyan(
				"💡 Use 'bunx @changesets/cli add' to create changesets, then 'bun run version:add' to generate changelog",
			),
		);
	},
);

if (import.meta.main) {
	versionInit();
}
