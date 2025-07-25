#!/usr/bin/env bun

import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";
import chalk from "chalk";
import { validators } from "./utils/arg-parser";
import { findCommand } from "./utils/command-finder";
import { createScript } from "./utils/create-scripts";
import { getAllServices } from "./utils/docker-compose-parser";

type SkipOption = "docker" | "node-modules" | "build" | "vscode" | "turbo";

/**
 * Comprehensive development environment cleanup script
 * Stops Docker containers, removes build artifacts, and cleans all development files
 */
const cleanupScript = createScript(
	{
		name: "Development Cleanup",
		description:
			"Comprehensive cleanup of Docker containers, build artifacts, and development files",
		usage: "bun run cleanup [options]",
		examples: ["bun run cleanup", "bun run cleanup --skip docker node_modules"],
		options: [
			{
				short: "-s",
				long: "--skip",
				multiple: true,
				description: "Skip each of the following options",
				required: false,
				validator: validators.enum([
					"docker",
					"node-modules",
					"build",
					"vscode",
					"turbo",
				] as SkipOption[]),
			},
			{
				short: "-a",
				long: "--all",
				description:
					"Cleanup all development artifacts. By default they are skipped.",
				required: false,
				validator: validators.boolean,
			},
			{
				short: "-v",
				long: "--verbose",
				description: "Show detailed cleanup progress",
				required: false,
				validator: validators.boolean,
			},
		],
	} as const,
	async (args): Promise<void> => {
		console.log(chalk.blue("🧹 Starting comprehensive cleanup..."));
		const skips: SkipOption[] = (args.skip as SkipOption[]) || [];

		if (args.verbose) {
			console.log(chalk.yellow("📝 Cleaning logs..."));
		}
		await $`find . -name "*.log" -type f -delete`;
		await $`find . -name "logs" -type d -exec rm -rf {} + 2>/dev/null || true`;

		if (args.verbose) {
			console.log(chalk.yellow("🗑️ Cleaning temporary files..."));
		}
		await $`find . -name "*.tmp" -type f -delete`;
		await $`find . -name "*.temp" -type f -delete`;
		await $`find . -name ".DS_Store" -type f -delete`;
		await $`find . -name "Thumbs.db" -type f -delete`;

		if (!skips.includes("vscode")) {
			if (args.verbose) {
				console.log(chalk.yellow("🎯 Cleaning VS Code configuration..."));
			}
			await $`rm -rf .vscode`;
		}

		if (!skips.includes("docker")) {
			const dockerCmd = await findCommand("docker");

			if (args.verbose) {
				console.log(chalk.yellow("🐳 Stopping Docker containers..."));
			}
			await $`${dockerCmd} compose -f docker-compose.yml down -v --remove-orphans --volumes`;
			await $`${dockerCmd} compose -f .devcontainer/docker-compose.dev.yml down -v --remove-orphans --volumes`;

			if (args.verbose) {
				console.log(
					chalk.yellow("🗑️ Removing Docker containers and volumes..."),
				);
			}
			await $`${dockerCmd} compose -f docker-compose.yml rm -f -v`;
			await $`${dockerCmd} compose -f .devcontainer/docker-compose.dev.yml rm -f -v`;

			// Optional: Clean Docker system (commented out by default)
			// console.log(chalk.yellow("🧽 Cleaning Docker system..."));
			// await $`${dockerCmd} system prune -f`;
			// await $`${dockerCmd} volume prune -f`;
			// await $`${dockerCmd} network prune -f`;
			// await $`${dockerCmd} image prune -f`;
		}

		// Step 2: Clean all development artifacts
		if (args.verbose) {
			console.log(chalk.yellow("🗂️ Cleaning development artifacts..."));
		}
		const buildArtifacts = [
			[".bun"],
			skips.includes("build") ? undefined : ["dist", "build", ".tsbuildinfo"],
			skips.includes("turbo") ? undefined : [".turbo"],
			[
				".next",
				".nuxt",
				".output",
				"coverage",
				".nyc_output",
				".cache",
				".parcel-cache",
				".vite",
				".swc",
				".biomecache",
			],
		]
			.flat()
			.filter((artifact) => artifact !== undefined) as string[];

		for (const artifact of buildArtifacts) {
			if (fs.existsSync(artifact)) {
				await $`rm -rf ${artifact}`;
				if (args.verbose) {
					console.log(chalk.gray(`  Removed: ${artifact}`));
				}
			}
		}

		// Get all services from both dev and prod compose files
		const allServices = await getAllServices();
		const allServicePaths = [
			...allServices.dev.map((s) => ({
				name: s.name,
				path: `apps/${s.name.replace(/^prod-/, "")}`,
			})),
			...allServices.prod.map((s) => ({
				name: s.name,
				path: `apps/${s.name.replace(/^prod-/, "")}`,
			})),
		];

		// Add packages directory
		const packagesDir = path.join(process.cwd(), "packages");
		if (fs.existsSync(packagesDir)) {
			const packages = fs.readdirSync(packagesDir);
			for (const pkg of packages) {
				allServicePaths.push({ name: pkg, path: `packages/${pkg}` });
			}
		}

		for (const service of allServicePaths) {
			const servicePath = path.join(process.cwd(), service.path);
			if (fs.existsSync(servicePath)) {
				const nodeModulesPath = path.join(servicePath, "node_modules");
				if (fs.existsSync(nodeModulesPath)) {
					await $`rm -rf ${nodeModulesPath}`;
					if (args.verbose) {
						console.log(chalk.gray(`  Removed: ${service.path}/node_modules`));
					}
				}

				for (const artifact of buildArtifacts) {
					const artifactPath = path.join(servicePath, artifact);
					if (fs.existsSync(artifactPath)) {
						await $`rm -rf ${artifactPath}`;
						if (args.verbose) {
							console.log(chalk.gray(`  Removed: ${service.path}/${artifact}`));
						}
					}
				}
			}
		}

		if (!skips.includes("node-modules")) {
			if (args.verbose) {
				console.log(
					chalk.yellow("📦 Cleaning node_modules in apps and packages..."),
				);
			}
			await $`rm -rf ./**/node_modules`;
			await $`rm -rf ./node_modules || true`;
		}

		if (args.verbose) {
			console.log(chalk.green("✅ Cleanup completed successfully!"));
			console.log(chalk.cyan("\n💡 To start fresh, run:"));
			console.log(chalk.cyan("  - bun run setup"));
		}
	},
);

cleanupScript();
