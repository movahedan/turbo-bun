import { $ } from "bun";
import chalk from "chalk";

export async function stop() {
	try {
		console.log(chalk.blue("🔴 Stopping services..."));
		await $`docker-compose down`;

		await $`docker-compose ps`;
		console.log(chalk.green("👋 Services stopped successfully"));
	} catch (error) {
		console.error(chalk.red("Failed to stop docker services:"), error);
		process.exit(1);
	}
}

stop();
