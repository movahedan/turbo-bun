import { $ } from "bun";
import chalk from "chalk";

async function cleanup() {
	try {
		await $`docker compose -f docker-compose.yml down -v`;
		await $`docker compose -f docker-compose.dev.yml down -v`;
		console.log(chalk.green("👋 Services stopped successfully"));

		await $`docker compose -f docker-compose.yml rm -f -v`;
		await $`docker compose -f docker-compose.dev.yml rm -f -v`;
		console.log(chalk.green("👋 Services removed successfully"));

		await $`docker compose ps`;
		console.log(chalk.green("👋 Services stopped successfully"));
	} catch (error) {
		console.error("docker compose down failed:", error);
	}

	await $`bun run dev:cleanup`;
}

cleanup();
