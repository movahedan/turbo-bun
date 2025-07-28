#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";
import chalk from "chalk";
import type { ScriptConfig } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";

const cleanupConfig = {
	name: "Local Development Cleanup",
	description: `Comprehensive cleanup of Docker containers, build artifacts, and development files.
This includes DevContainer cleanup. To stop the VS Code DevContainer itself, run \`bun run dev:rm\` from host machine`,
	usage: "bun run local:cleanup [options]",
	examples: ["bun run local:cleanup", "bun run local:cleanup --verbose"],
	options: [],
} as const satisfies ScriptConfig;

const cleanup = createScript(
	cleanupConfig,
	async (_, vConsole): Promise<void> => {
		vConsole.log(chalk.blue("🧹 Starting comprehensive cleanup..."));

		function getAllDirectories(
			baseDir: string,
		): { name: string; path: string }[] {
			const directories: { name: string; path: string }[] = [
				{ name: "root", path: "." },
			];

			const appsDir = path.join(baseDir, "apps");
			if (fs.existsSync(appsDir)) {
				const apps = fs.readdirSync(appsDir);
				for (const app of apps) {
					directories.push({ name: app, path: `apps/${app}` });
				}
			}
			const packagesDir = path.join(baseDir, "packages");
			if (fs.existsSync(packagesDir)) {
				const packages = fs.readdirSync(packagesDir);
				for (const pkg of packages) {
					directories.push({ name: pkg, path: `packages/${pkg}` });
				}
			}

			return directories;
		}
		function removeFile(filePath: string) {
			if (fs.existsSync(filePath)) {
				fs.rmSync(filePath, { recursive: true, force: true });
				vConsole.log(chalk.gray(`  Removed: ${filePath}`));
			}
		}
		async function stepArtifacts() {
			vConsole.log(chalk.yellow("🗂️ Cleaning development artifacts..."));
			const directories = getAllDirectories(process.cwd());
			for (const directory of directories) {
				const dirPath = path.resolve(process.cwd(), directory.path);

				for (const ARTIFACT of DEVELOPMENT_ARTIFACT) {
					removeFile(path.join(dirPath, ARTIFACT));
				}
			}
		}
		await stepArtifacts();

		async function stepLogs() {
			vConsole.log(chalk.yellow("📝 Cleaning logs and temp files..."));
			await $`find . -name "*.log" -type f -delete`;
			await $`find . -name "logs" -type d -exec rm -rf {} + 2>/dev/null || true`;
			await $`find . -name "*.tmp" -type f -delete`;
			await $`find . -name "*.temp" -type f -delete`;
			await $`find . -name ".DS_Store" -type f -delete`;
			await $`find . -name "Thumbs.db" -type f -delete`;
		}
		await stepLogs();

		async function stepNodeModules() {
			vConsole.log(chalk.yellow("📦 Cleaning node_modules in directories..."));
			await $`rm -rf ./apps/**/node_modules`.nothrow();
			await $`rm -rf ./packages/**/node_modules`.nothrow();
			await $`rm -rf ./node_modules/*`.nothrow();
			await $`rm -rf ./node_modules/.bin/*`.nothrow();
		}
		await stepNodeModules();

		async function stepVSCode() {
			vConsole.log(chalk.yellow("🎯 Cleaning VS Code configuration..."));
			await $`rm -rf .vscode`;
		}
		await stepVSCode();

		vConsole.log(chalk.green("✅ Cleanup completed successfully!"));
		vConsole.log(chalk.cyan("\n💡 To start fresh, run:"));
		vConsole.log(chalk.cyan("  - bun run local:setup # For local development"));
		vConsole.log(
			chalk.cyan("  - bun run dev:setup # For DevContainer development"),
		);
	},
);

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
