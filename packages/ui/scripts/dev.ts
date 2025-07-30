#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";

let checkInterval: NodeJS.Timeout;

async function main() {
	console.log(chalk.cyan("🚀 Starting UI development environment..."));
	console.log(
		chalk.yellow("📁 Watching src/ for changes and running prebuild"),
	);
	console.log(chalk.blue("📚 Starting Storybook\n"));

	console.log(chalk.green("🔄 Running initial prebuild..."));
	await $`bun run prebuild`;

	// Set up a simple polling mechanism for file changes
	// Create a timestamp file for reference
	await $`touch .last-check.log`;
	const delay = 2000;

	checkInterval = setInterval(async () => {
		try {
			// Update timestamp file on every iteration
			await $`touch .last-check.log`;
			const { stdout } = await $`find src -type f -newer .last-check.log`;

			if (stdout.toString().trim()) {
				console.log(chalk.green("📝 Files changed, running prebuild..."));
				console.log(chalk.yellow("🔄 Running prebuild..."));

				try {
					await $`bun run prebuild`;
					console.log(chalk.green("✅ Prebuild completed"));
				} catch (error) {
					console.error(chalk.red(`❌ Prebuild failed: ${error}`));
				}
			}
		} catch (error) {
			console.error(chalk.red(`❌ Polling error: ${error}`));
		}
	}, delay);

	// Run Storybook directly instead of spawning it
	console.log(chalk.blue("🎬 Starting Storybook directly..."));
	await $`bun run dev:storybook -- --port ${process.env.PORT || process.env.REPO_PORTS_UI} --host ${process.env.HOST}`;
}

// Handle process termination
const cleanup = () => {
	console.log(chalk.magenta("\n🛑 Shutting down development environment..."));
	clearInterval(checkInterval);
	process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Start the main function
main().catch((error) => {
	console.error(chalk.red(`❌ Fatal error: ${error}`));
	process.exit(1);
});
