import { $ } from "bun";

export async function start() {
	try {
		console.log("🚀 Installing dependencies...");
		await $`bun install`;

		const chalk = (await import("chalk")).default;

		console.log(chalk.blue("🚀 Building Docker images..."));
		await $`docker-compose build`;

		console.log(chalk.blue("🚀 Starting services..."));
		await $`docker-compose up -d`;

		console.log(chalk.yellow("🔍 Checking service status..."));
		await $`docker-compose ps`;

		// Print access URLs with different colors
		console.log(chalk.green("📱 Services are running at:"));
		const base = "http://localhost";
		console.log(`${chalk.cyan("- Admin:")} ${chalk.bgGreen(`${base}:3001`)}`);
		console.log(`${chalk.cyan("- Blog:")} ${chalk.bgGreen(`${base}:3002`)}`);
		console.log(`${chalk.cyan("- Store:")} ${chalk.bgGreen(`${base}:3003`)}`);
		console.log(`${chalk.cyan("- API:")} ${chalk.bgGreen(`${base}:3004`)}`);
	} catch (error) {
		console.error("Failed to run docker services:", error);
		process.exit(1);
	}
}

start();
