#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";
import { validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";

const setupConfig = {
	name: "Development Setup",
	description:
		"Comprehensive development environment setup with dependency installation, Docker builds, and service startup",
	usage: "bun run setup [options]",
	examples: [
		"bun run setup",
		"bun run setup --skip-docker",
		"bun run setup --skip-vscode",
	],
	options: [
		{
			short: "-s",
			long: "--skip-docker",
			description: "Skip Docker image building and service startup",
			required: false,
			validator: validators.boolean,
		},
		{
			short: "-c",
			long: "--skip-cleanup",
			description: "Skip cleanup after setup",
			required: false,
			validator: validators.boolean,
		},
		{
			short: "-v",
			long: "--skip-vscode",
			description: "Skip VS Code configuration sync",
			required: false,
			validator: validators.boolean,
		},
	],
} as const;

const setup = createScript(setupConfig, async function main(args, xConsole) {
	xConsole.log(chalk.blue("🚀 Starting comprehensive development setup..."));
	// Step 1: Install dependencies
	xConsole.log(chalk.blue("📦 Installing dependencies..."));
	await $`bun install`;

	// Step 2: Docker operations (unless skipped)
	if (!args["skip-docker"]) {
		xConsole.log(chalk.blue("🎯 Run devcontainer setup..."));
		await $`bun run dev:checkup`;
	}

	// Step 3: Sync VS Code configuration (unless skipped)
	if (!args["skip-vscode"]) {
		xConsole.log(chalk.blue("🎯 Syncing VS Code configuration..."));
		await $`bun run sync:vscode`;
	}

	xConsole.log(chalk.green("✅ Setup completed successfully!"));

	xConsole.log(chalk.cyan("\n💡 Useful commands:"));
	xConsole.log(chalk.cyan(" - bun run dev:compose logs -f # View all logs"));
	xConsole.log(chalk.cyan(" - bun run dev:compose ps # Check service status"));
	xConsole.log(chalk.cyan(" - bun run cleanup # Clean everything"));
});

if (import.meta.main) {
	setup();
}
