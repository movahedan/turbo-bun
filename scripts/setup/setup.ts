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
		console.log(chalk.blue("🚀 Starting comprehensive development setup..."));

		// Step 2: Install dependencies
		console.log(chalk.blue("📦 Installing dependencies..."));
		await $`bun install`;

		// Step 3: Build Docker images
		console.log(chalk.blue("🐳 Building Docker images..."));
		await $`bun run dev:build`;

		// Step 4: Start services
		console.log(chalk.blue("🚀 Starting services..."));
		await $`docker compose -f .devcontainer/docker-compose.dev.yml --profile vscode up -d`;
		await $`bun run dev:up`;

		// Step 5: Check service status
		console.log(chalk.yellow("🔍 Checking service status..."));
		await $`bun run dev:status`;

		// Step 6: Wait a moment for services to fully start
		console.log(chalk.yellow("⏳ Waiting for services to fully start..."));
		await new Promise((resolve) => setTimeout(resolve, 5000));

		// Step 7: Final status check
		console.log(chalk.green("✅ Setup completed successfully!"));
		console.log(chalk.green("📱 Services are running at:"));
		console.log(runnables.map(getLogsForRunnable).join("\n"));

		console.log(chalk.cyan("\n💡 Useful commands:"));
		console.log(chalk.cyan("  - bun run dev:logs     # View all service logs"));
		console.log(chalk.cyan("  - bun run dev:status   # Check service status"));
		console.log(chalk.cyan("  - bun run cleanup      # Clean everything"));
	} catch (error) {
		console.error(chalk.red("❌ Failed to run setup:"), error);
		process.exit(1);
	}
}

start();
