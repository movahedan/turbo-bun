#!/usr/bin/env bun

import { $ } from "bun";
import chalk from "chalk";
import { validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";
import { parseCompose } from "./utils/docker-compose-parser";

const devSetupConfig = {
	name: "DevContainer Setup",
	description:
		"Setup DevContainer environment with Docker builds, service startup, and health verification",
	usage: "bun run dev:setup [options]",
	examples: [
		"bun run dev:setup",
		"bun run dev:setup --skip-health-check",
		"bun run dev:setup --keep-running",
	],
	options: [
		{
			short: "-h",
			long: "--skip-health-check",
			description: "Skip health check verification",
			required: false,
			validator: validators.boolean,
		},
	],
} as const;

const devSetup = createScript(
	devSetupConfig,
	async function main(args, xConsole) {
		xConsole.log(chalk.blue("🐳 Starting DevContainer setup..."));

		await $`bun run dev:up --build`;
		if (!args["skip-health-check"]) {
			xConsole.log(chalk.blue("🏥 Running health checks..."));
			await $`bun run dev:check`;
		}

		xConsole.log(chalk.cyan("\n💡 Services are running and available at:"));
		const parsedCompose = await parseCompose("dev");
		const devUrls = parsedCompose.serviceUrls();
		for (const [name, url] of Object.entries(devUrls)) {
			xConsole.log(chalk.cyan(`   • ${name}: ${url}`));
		}

		xConsole.log(
			chalk.yellow("💡 Use 'bun run dev:cleanup' to stop services when done"),
		);
		xConsole.log(chalk.cyan("\n💡 Useful commands:"));
		xConsole.log(
			chalk.cyan(" - bun run dev:check # Check DevContainer health"),
		);
		xConsole.log(chalk.cyan(" - bun run dev:logs # View service logs"));
		xConsole.log(
			chalk.cyan(" - bun run dev:cleanup # Clean DevContainer environment"),
		);
	},
);

if (import.meta.main) {
	devSetup();
}
