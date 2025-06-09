import { $ } from "bun";
import chalk from "chalk";
import { runnables } from "./config";

const base = "http://localhost";
const getLogsForRunnable = (runnable: (typeof runnables)[number]) => {
	const label = `- ${runnable.label}:`;
	const url = `${base}:${runnable.port}`;

	return `${chalk.cyan(label)} ${chalk.bgGreen(url)}`;
};

export async function start() {
	try {
		console.log("🚀 Installing dependencies...");
		await $`bun install`;

		console.log(chalk.blue("🚀 Building Docker images..."));
		await $`docker-compose build`;

		console.log(chalk.blue("🚀 Starting services..."));
		await $`docker-compose up -d`;

		console.log(chalk.yellow("🔍 Checking service status..."));
		await $`docker-compose ps`;

		console.log(chalk.green("📱 Services are running at:"));
		console.log(runnables.map(getLogsForRunnable).join("\n"));
	} catch (error) {
		console.error("Failed to run docker services:", error);
		process.exit(1);
	}
}

start();
