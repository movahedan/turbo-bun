#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";
import type { ScriptConfig } from "./utils/create-scripts";
import { createScript } from "./utils/create-scripts";

const devRmConfig = {
	name: "DevContainer Removal",
	description: `Stop and remove the VS Code DevContainer itself.
⚠️  WARNING: This script must be run from the HOST machine, not from within the DevContainer.
This will stop the VS Code DevContainer and all associated containers.`,
	usage: "bun run dev:rm [options]",
	examples: ["bun run dev:rm", "bun run dev:rm --force"],
	options: [],
} as const satisfies ScriptConfig;

const devRm = createScript(devRmConfig, async (_, vConsole): Promise<void> => {
	vConsole.log(chalk.blue("🐳 Stopping VS Code DevContainer..."));

	// Check if we're in a DevContainer
	const isInDevContainer = process.env.REMOTE_CONTAINERS === "true";
	if (isInDevContainer) {
		vConsole.error(
			chalk.red(
				"❌ ERROR: This script must be run from the HOST machine, not from within the DevContainer.",
			),
		);
		vConsole.info(
			chalk.yellow(
				"💡 Please exit the DevContainer and run this command from your host terminal.",
			),
		);
		process.exit(1);
	}

	async function stepStopDevContainer() {
		vConsole.log(chalk.yellow("🛑 Stopping VS Code DevContainer..."));
		// Stop the DevContainer using VS Code CLI
		await $`code --command "devcontainers.stop"`.nothrow();
	}
	await stepStopDevContainer();

	async function stepStopRemoveAllContainers() {
		vConsole.log(chalk.yellow("🐳 Stopping all related containers..."));
		await $`docker compose -f .devcontainer/docker-compose.dev.yml --profile all down --volumes --remove-orphans`;
		await $`docker compose -f docker-compose.yml down --volumes --remove-orphans`;
		vConsole.log(chalk.yellow("🗑️ Removing containers..."));
		await $`docker compose -f .devcontainer/docker-compose.dev.yml --profile all rm -f --volumes`;
		await $`docker compose -f docker-compose.yml rm -f --volumes`;
	}
	await stepStopRemoveAllContainers();

	vConsole.log(chalk.green("✅ DevContainer removal completed successfully!"));
	vConsole.log(chalk.cyan("\n💡 To start fresh, run:"));
	vConsole.log(chalk.cyan("  - bun run local:setup # For local development"));
	vConsole.log(
		chalk.cyan("  - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) "),
	);
	vConsole.log(
		chalk.cyan(
			"  -Type 'Dev Containers: Reopen in Container' and select the command",
		),
	);
	vConsole.log(
		chalk.cyan("  - bun run dev:setup # For DevContainer development"),
	);
});

if (import.meta.main) {
	devRm();
}
