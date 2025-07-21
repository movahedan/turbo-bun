import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";
import chalk from "chalk";
import { runnables } from "./utils/config";

async function cleanup() {
	try {
		console.log(chalk.blue("🧹 Starting comprehensive cleanup..."));

		// Step 1: Stop and remove Docker containers
		console.log(chalk.yellow("🐳 Stopping Docker containers..."));
		await $`docker compose -f docker-compose.yml down -v --remove-orphans --volumes`;
		await $`docker compose -f .devcontainer/docker-compose.dev.yml down -v --remove-orphans --volumes`;

		// Step 2: Remove Docker containers and volumes
		console.log(chalk.yellow("🗑️ Removing Docker containers and volumes..."));
		await $`docker compose -f docker-compose.yml rm -f -v`;
		await $`docker compose -f .devcontainer/docker-compose.dev.yml rm -f -v`;

		// Step 3: Clean Docker system
		// console.log(chalk.yellow("🧽 Cleaning Docker system..."));
		// await $`docker system prune -f`;
		// await $`docker volume prune -f`;
		// await $`docker network prune -f`;
		// await $`docker image prune -f`;

		// Step 4: Clean all development artifacts
		console.log(chalk.yellow("🗂️ Cleaning development artifacts..."));
		await $`rm -rf node_modules`;
		await $`rm -rf .turbo`;
		await $`rm -rf dist`;
		await $`rm -rf build`;
		await $`rm -rf .next`;
		await $`rm -rf .nuxt`;
		await $`rm -rf .output`;
		await $`rm -rf coverage`;
		await $`rm -rf .nyc_output`;
		await $`rm -rf .cache`;
		await $`rm -rf .parcel-cache`;
		await $`rm -rf .vite`;
		await $`rm -rf .swc`;
		await $`rm -rf .eslintcache`;
		await $`rm -rf .stylelintcache`;
		await $`rm -rf .prettiercache`;
		await $`rm -rf .biomecache`;
		await $`rm -rf .tsbuildinfo`;
		await $`rm -rf .bun`;

		// Step 5: Clean node_modules in all apps and packages
		console.log(
			chalk.yellow("📦 Cleaning node_modules in apps and packages..."),
		);
		for (const runnable of runnables) {
			if (runnable.absPath && fs.existsSync(runnable.absPath)) {
				const nodeModulesPath = path.join(runnable.absPath, "node_modules");
				if (fs.existsSync(nodeModulesPath)) {
					await $`rm -rf ${nodeModulesPath}`;
				}
				// Also clean other common build artifacts
				const buildArtifacts = [
					"dist",
					"build",
					".next",
					".nuxt",
					".output",
					"coverage",
					".cache",
					".tsbuildinfo",
					".vite",
					".swc",
					".bun",
				];
				for (const artifact of buildArtifacts) {
					const artifactPath = path.join(runnable.absPath, artifact);
					if (fs.existsSync(artifactPath)) {
						await $`rm -rf ${artifactPath}`;
					}
				}
			}
		}

		// Step 6: Clean all packages
		const packagesDir = path.join(process.cwd(), "packages");
		if (fs.existsSync(packagesDir)) {
			const packages = fs.readdirSync(packagesDir);
			for (const pkg of packages) {
				const pkgPath = path.join(packagesDir, pkg);
				const nodeModulesPath = path.join(pkgPath, "node_modules");
				if (fs.existsSync(nodeModulesPath)) {
					await $`rm -rf ${nodeModulesPath}`;
				}
				// Also clean build artifacts in packages
				const buildArtifacts = [
					"dist",
					"build",
					".next",
					".nuxt",
					".output",
					"coverage",
					".cache",
					".vite",
					".swc",
					".bun",
				];
				for (const artifact of buildArtifacts) {
					const artifactPath = path.join(pkgPath, artifact);
					if (fs.existsSync(artifactPath)) {
						await $`rm -rf ${artifactPath}`;
					}
				}
			}
		}

		// Step 7: Clean logs
		console.log(chalk.yellow("📝 Cleaning logs..."));
		await $`find . -name "*.log" -type f -delete`;
		await $`find . -name "logs" -type d -exec rm -rf {} + 2>/dev/null || true`;

		// Step 8: Clean temporary files
		console.log(chalk.yellow("🗑️ Cleaning temporary files..."));
		await $`find . -name "*.tmp" -type f -delete`;
		await $`find . -name "*.temp" -type f -delete`;
		await $`find . -name ".DS_Store" -type f -delete`;
		await $`find . -name "Thumbs.db" -type f -delete`;

		// Step 9: Clean lock files (optional - uncomment if you want to remove them)
		// console.log(chalk.yellow("🔓 Cleaning lock files..."));
		// await $`rm -f bun.lock`;
		// await $`rm -f package-lock.json`;
		// await $`rm -f yarn.lock`;
		// await $`rm -f pnpm-lock.yaml`;

		// Step 10: Clean VS Code configuration (will be recreated on setup)
		console.log(chalk.yellow("🎯 Cleaning VS Code configuration..."));
		await $`rm -rf .vscode`;

		// Step 11: Final verification
		console.log(chalk.yellow("🔍 Verifying cleanup..."));
		await $`docker compose ps`;

		console.log(chalk.green("✅ Cleanup completed successfully!"));
		console.log(chalk.cyan("\n💡 To start fresh, run:"));
		console.log(chalk.cyan("  - bun run setup"));
	} catch (error) {
		console.error(chalk.red("❌ Cleanup failed:"), error);
		process.exit(1);
	}
}

cleanup();
