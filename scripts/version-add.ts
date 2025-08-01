#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";
import { createScript } from "./utils/create-scripts";

const versionAddConfig = {
	name: "Version Add",
	description: "Generate changelog and bump versions using Changesets",
	usage: "bun run version-add",
	examples: ["bun run version-add"],
	options: [],
} as const;

export const versionAdd = createScript(
	versionAddConfig,
	async function main(_args, xConsole) {
		xConsole.info(chalk.blue("📝 Generating changelog with Changesets..."));

		// Check if there are any changeset files
		const changesetFiles =
			await $`find .changeset -name "*.md" -not -name "README.md"`.text();

		if (!changesetFiles.trim()) {
			throw new Error(
				"No changeset files found. Please create changesets first using:\n" +
					"  bunx @changesets/cli add\n" +
					"Or manually create .changeset/*.md files.",
			);
		}

		// Run changesets version to generate changelog and bump versions
		xConsole.info(chalk.blue("🔄 Running changesets version..."));
		await $`bunx @changesets/cli version`;

		xConsole.log(
			chalk.green("✅ Changelog generated and versions bumped successfully!"),
		);
		xConsole.log(
			chalk.cyan(
				"📋 Review CHANGELOG.md and run 'bun run version-commit' to proceed",
			),
		);
	},
);

if (import.meta.main) {
	versionAdd();
}
