#!/usr/bin/env bun

import { colorify, createScript, type ScriptConfig } from "@repo/intershell/core";
import { $ } from "bun";

const devCleanupConfig = {
	name: "DevContainer Cleanup",
	description: `Clean up DevContainer services and development artifacts.
This only cleans up the development services, not the VS Code DevContainer itself.
To stop the VS Code DevContainer, run \`bun run dev:rm\` from the host machine.`,
	usage: "bun run dev:cleanup [options]",
	examples: ["bun run dev:cleanup", "bun run dev:cleanup --verbose"],
	options: [],
} as const satisfies ScriptConfig;

const devCleanup = createScript(devCleanupConfig, async (_, vConsole): Promise<void> => {
	vConsole.log(colorify.blue("🧹 Starting DevContainer cleanup..."));

	async function stepDockerServices() {
		vConsole.log(colorify.yellow("🐳 Stopping DevContainer services..."));
		await $`docker compose -f ./docker-compose.dev.yml --profile all down --volumes`;
		await $`docker compose -f ./docker-compose.dev.yml --profile all rm -f --volumes`;
	}
	await stepDockerServices();

	vConsole.log(colorify.green("✅ DevContainer cleanup completed successfully!"));
	vConsole.log(colorify.cyan("\n💡 To start fresh on devcontainer, run:"));
	vConsole.log(colorify.cyan("  - bun run dev:setup"));
	vConsole.log(colorify.cyan("  - bun run dev:rm # To stop VS Code DevContainer (host only)"));
});

if (import.meta.main) {
	devCleanup.run();
}
