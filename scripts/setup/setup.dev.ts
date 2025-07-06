import { $ } from "bun";
import chalk from "chalk";

export async function start() {
	try {
		console.log("🚀 Installing dependencies...");
		await $`bun install`;
		console.log("🚀 Running checks...");
		await $`bun run check:types`;
		console.log("🚀 Running tests...");
		await $`bun run test`;
		console.log("🚀 Building...");
		await $`bun run build`;

		console.log(chalk.green("🚀 Everything is ready!"));
	} catch (error) {
		console.error("Failed to run setup:", error);
		process.exit(1);
	}
}

start();
