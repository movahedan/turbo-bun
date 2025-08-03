#!/usr/bin/env bun

import path from "node:path";
import { $ } from "bun";
import { colorify } from "./scripting-utils/colorify";
import type { ScriptConfig } from "./scripting-utils/create-scripts";
import { createScript } from "./scripting-utils/create-scripts";
import { getAllDirectories } from "./scripting-utils/get-all-directories";

const cleanupConfig = {
	name: "Local Development Cleanup",
	description: `Comprehensive cleanup of Docker containers, build artifacts, and development files.
This includes DevContainer cleanup. To stop the VS Code DevContainer itself, run \`bun run dev:rm\` from host machine`,
	usage: "bun run local:cleanup [options]",
	examples: ["bun run local:cleanup", "bun run local:cleanup --verbose"],
	options: [],
} as const satisfies ScriptConfig;

const cleanup = createScript(cleanupConfig, async (_, vConsole): Promise<void> => {
	vConsole.log(colorify.blue("🧹 Starting comprehensive cleanup..."));

	async function removeFile(filePath: string) {
		if (await Bun.file(filePath).exists()) {
			await Bun.file(filePath).delete();
			vConsole.log(colorify.gray(`  Removed: ${filePath}`));
		}
	}
	async function stepArtifacts() {
		vConsole.log(colorify.yellow("🗂️ Cleaning development artifacts..."));
		const directories = await getAllDirectories(process.cwd());
		for (const directory of directories) {
			const dirPath = path.resolve(process.cwd(), directory.path);

			for (const ARTIFACT of DEVELOPMENT_ARTIFACT) {
				await removeFile(path.join(dirPath, ARTIFACT));
			}
		}
	}
	await stepArtifacts();

	async function stepLogs() {
		vConsole.log(colorify.yellow("📝 Cleaning logs and temp files..."));
		await $`find . -name "*.log" -type f -delete`;
		await $`find . -name "logs" -type d -exec rm -rf {} + 2>/dev/null || true`;
		await $`find . -name "*.tmp" -type f -delete`;
		await $`find . -name "*.temp" -type f -delete`;
		await $`find . -name ".DS_Store" -type f -delete`;
		await $`find . -name "Thumbs.db" -type f -delete`;
	}
	await stepLogs();

	async function stepNodeModules() {
		vConsole.log(colorify.yellow("📦 Cleaning node_modules in directories..."));
		await $`find . -type d -name "node_modules" -exec rm -rf {} +`.nothrow();
	}
	await stepNodeModules();

	async function stepVSCode() {
		vConsole.log(colorify.yellow("🎯 Cleaning VS Code configuration..."));
		await $`rm -rf .vscode`;
	}
	await stepVSCode();

	vConsole.log(colorify.green("✅ Cleanup completed successfully!"));
	vConsole.log(colorify.cyan("\n💡 To start fresh, run:"));
	vConsole.log(colorify.cyan("  - bun run local:setup # For local development"));
	vConsole.log(colorify.cyan("  - bun run dev:setup # For DevContainer development"));
});

if (import.meta.main) {
	cleanup();
}

const DEVELOPMENT_ARTIFACT = [
	".bun",
	"dist",
	"build",
	".tsbuildinfo",
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
	".act-event.json",
	".biomecache",
	"bin",
];
