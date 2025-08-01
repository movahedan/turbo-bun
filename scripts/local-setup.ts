#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";
import { createScript, validators } from "./utils/create-scripts";

const setupLocalConfig = {
	name: "Local Development Setup",
	description:
		"Complete local development environment setup with dependency installation, local builds, and VS Code configuration sync",
	usage: "bun run local:setup [options]",
	examples: [
		"bun run local:setup",
		"bun run local:setup --skip-vscode",
		"bun run local:setup --skip-tests",
	],
	options: [
		{
			short: "-v",
			long: "--skip-vscode",
			description: "Skip VS Code configuration sync",
			required: false,
			validator: validators.boolean,
		},
		{
			short: "-t",
			long: "--skip-tests",
			description: "Skip running tests",
			required: false,
			validator: validators.boolean,
		},
	],
} as const;

const setupLocal = createScript(
	setupLocalConfig,
	async function main(args, xConsole) {
		xConsole.log(chalk.blue("🚀 Starting local development setup..."));

		// Step 1: Install dependencies
		xConsole.log(chalk.blue("📦 Installing dependencies..."));
		await $`bun install`;

		// Step 2: Run code quality checks
		xConsole.log(chalk.blue("🔍 Running code quality checks..."));
		await $`bun run check:fix`;

		// Step 3: Type checking
		xConsole.log(chalk.blue("🔍 Running type checks..."));
		await $`bun run check:types`;

		// Step 4: Run tests (unless skipped)
		if (!args["skip-tests"]) {
			xConsole.log(chalk.blue("🧪 Running tests..."));
			await $`bun run test`;
		}

		// Step 5: Build all packages
		xConsole.log(chalk.blue("🏗️ Building all packages..."));
		await $`bun run build`;

		// Step 6: Sync VS Code configuration (unless skipped)
		if (!args["skip-vscode"]) {
			xConsole.log(chalk.blue("🎯 Syncing VS Code configuration..."));
			await $`bun run local:vscode`;
		}

		xConsole.log(chalk.green("✅ Local setup completed successfully!"));

		xConsole.log(chalk.cyan("\n💡 Useful commands:"));
		xConsole.log(chalk.cyan(" - bun run check:quick # Quick verification"));
		xConsole.log(
			chalk.cyan(" - bun run dev:setup # Setup DevContainer environment"),
		);
		xConsole.log(chalk.cyan(" - bun run local:cleanup # Clean everything"));
	},
);

if (import.meta.main) {
	setupLocal();
}
