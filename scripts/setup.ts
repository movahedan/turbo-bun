#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";
import { validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";

/**
 * Comprehensive development environment setup script
 * Installs dependencies, builds Docker images, and starts all services
 */
const setupScript = createScript(
	{
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
	} as const,
	async (args: {
		"skip-docker"?: boolean;
		"skip-vscode"?: boolean;
		"dry-run"?: boolean;
	}): Promise<void> => {
		console.log(chalk.blue("🚀 Starting comprehensive development setup..."));
		// Step 1: Install dependencies
		console.log(chalk.blue("📦 Installing dependencies..."));
		await $`bun install`;

		// Step 2: Docker operations (unless skipped)
		if (!args["skip-docker"]) {
			console.log(chalk.blue("🎯 Run devcontainer setup..."));
			await $`bun run dev:checkup`;
		}

		// Step 3: Sync VS Code configuration (unless skipped)
		if (!args["skip-vscode"]) {
			console.log(chalk.blue("🎯 Syncing VS Code configuration..."));
			await $`bun run sync:vscode`;
		}

		console.log(chalk.green("✅ Setup completed successfully!"));

		console.log(chalk.cyan("\n💡 Useful commands:"));
		console.log(chalk.cyan("  - bun run dev:logs     # View all service logs"));
		console.log(chalk.cyan("  - bun run dev:status   # Check service status"));
		console.log(chalk.cyan("  - bun run cleanup      # Clean everything"));
	},
	undefined,
);

if (import.meta.main) {
	setupScript();
}
