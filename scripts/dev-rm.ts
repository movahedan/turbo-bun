#!/usr/bin/env bun

import { $ } from "bun";
import { colorify } from "./scripting-utils/colorify";
import type { ScriptConfig } from "./scripting-utils/create-scripts";
import { createScript } from "./scripting-utils/create-scripts";

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
	vConsole.log(colorify.blue("🐳 Stopping VS Code DevContainer..."));

	// Check if we're in a DevContainer
	const isInDevContainer = process.env.REMOTE_CONTAINERS === "true";
	if (isInDevContainer) {
		vConsole.error(
			colorify.red(
				"❌ ERROR: This script must be run from the HOST machine, not from within the DevContainer.",
			),
		);
		vConsole.info(
			colorify.yellow(
				"💡 Please exit the DevContainer and run this command from your host terminal.",
			),
		);
		process.exit(1);
	}

	async function stepStopDevContainer() {
		vConsole.log(colorify.yellow("🛑 Stopping VS Code DevContainer..."));
		// Stop the DevContainer using VS Code CLI
		await $`code --command "devcontainers.stop"`.nothrow();
	}
	await stepStopDevContainer();

	async function stepStopRemoveAllContainers() {
		vConsole.log(colorify.yellow("🐳 Stopping all related containers..."));
		await $`docker compose -f .devcontainer/docker-compose.dev.yml --profile all down --volumes --remove-orphans`;
		await $`docker compose -f docker-compose.yml down --volumes --remove-orphans`;
		vConsole.log(colorify.yellow("🗑️ Removing containers..."));
		await $`docker compose -f .devcontainer/docker-compose.dev.yml --profile all rm -f --volumes`;
		await $`docker compose -f docker-compose.yml rm -f --volumes`;
	}
	await stepStopRemoveAllContainers();

	vConsole.log(colorify.green("✅ DevContainer removal completed successfully!"));
	vConsole.log(colorify.cyan("\n💡 To start fresh, run:"));
	vConsole.log(colorify.cyan("  - bun run local:setup # For local development"));
	vConsole.log(colorify.cyan("  - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS) "));
	vConsole.log(
		colorify.cyan("  -Type 'Dev Containers: Reopen in Container' and select the command"),
	);
	vConsole.log(colorify.cyan("  - bun run dev:setup # For DevContainer development"));
});

if (import.meta.main) {
	devRm();
}
