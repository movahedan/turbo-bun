#!/usr/bin/env bun

import { $ } from "bun";
import { colorify } from "./scripting-utils/colorify";
import { createScript, type ScriptConfig } from "./scripting-utils/create-scripts";

const cleanupConfig = {
	name: "Local Development Cleanup",
	description: `Comprehensive cleanup of Docker containers, build artifacts, and development files.
This includes DevContainer cleanup. To stop the VS Code DevContainer itself, run \`bun run dev:rm\` from host machine`,
	usage: "bun run local:cleanup [options]",
	examples: ["bun run local:cleanup", "bun run local:cleanup --verbose"],
	options: [],
} as const satisfies ScriptConfig;

const directories = [
	"dist",
	"build",
	"dist",
	"dist-storybook",
	".turbo",
	".next",
	".output",
	"coverage",
	".nyc_output",
	".cache",
	".parcel-cache",
	".vite",
	".swc",
	".act",
	".biomecache",
	"bin",
];

const files = [
	".act-event.json",
	"*.tsbuildinfo",
	".log",
	".tmp",
	".temp",
	".DS_Store",
	"Thumbs.db",
];

const cleanup = createScript(cleanupConfig, async (_, vConsole): Promise<void> => {
	vConsole.log(colorify.blue("🧹 Starting comprehensive cleanup..."));

	vConsole.log(colorify.yellow("🗂️ Cleaning development artifacts..."));
	for (const directory of directories) {
		await $`rm -rf ${directory} **/${directory} **/${directory}/**`.quiet().nothrow();
	}

	vConsole.log(colorify.yellow("📝 Cleaning logs and temp files..."));
	for (const file of files) {
		await $`rm -rf ${file} **/${file}`.quiet().nothrow();
	}

	vConsole.log(colorify.yellow("📦 Cleaning node_modules in directories..."));
	await $`rm -rf node_modules **/node_modules`.quiet().nothrow();

	vConsole.log(colorify.yellow("🎯 Cleaning VS Code configuration..."));
	await $`rm -rf .vscode`.quiet().nothrow();

	vConsole.log(colorify.green("✅ Cleanup completed successfully!"));
	vConsole.log(colorify.cyan("\n💡 To start fresh, run:"));
	vConsole.log(colorify.cyan("  - bun run local:setup # For local development"));
	vConsole.log(colorify.cyan("  - bun run dev:setup # For DevContainer development"));
});

if (import.meta.main) {
	cleanup();
}
