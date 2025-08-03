#!/usr/bin/env bun

import { $ } from "bun";
import { colorify } from "./scripting-utils/colorify";
import { createScript, validators } from "./scripting-utils/create-scripts";
import { parseCompose } from "./scripting-utils/docker-compose-parser";

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

const devSetup = createScript(devSetupConfig, async function main(args, xConsole) {
	xConsole.log(colorify.blue("🐳 Starting DevContainer setup..."));

	await $`bun run dev:up --build`;
	if (!args["skip-health-check"]) {
		xConsole.log(colorify.blue("🏥 Running health checks..."));
		await $`bun run dev:check`;
	}

	xConsole.log(colorify.cyan("\n💡 Services are running and available at:"));
	const parsedCompose = await parseCompose("dev");
	const devUrls = parsedCompose.serviceUrls();
	for (const [name, url] of Object.entries(devUrls)) {
		xConsole.log(colorify.cyan(`   • ${name}: ${url}`));
	}

	xConsole.log(colorify.yellow("💡 Use 'bun run dev:cleanup' to stop services when done"));
	xConsole.log(colorify.cyan("\n💡 Useful commands:"));
	xConsole.log(colorify.cyan(" - bun run dev:check # Check DevContainer health"));
	xConsole.log(colorify.cyan(" - bun run dev:logs # View service logs"));
	xConsole.log(colorify.cyan(" - bun run dev:cleanup # Clean DevContainer environment"));
});

if (import.meta.main) {
	devSetup();
}
