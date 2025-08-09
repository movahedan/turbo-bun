#!/usr/bin/env bun

import { setTimeout } from "node:timers/promises";
import { $ } from "bun";
import { colorify } from "./shell/colorify";
import { createScript, type ScriptConfig, validators } from "./shell/create-scripts";
import { repoUtils, type ServiceHealth, type ServiceInfo } from "./shell/repo-utils";

const devCheckConfig = {
	name: "DevContainer Health Check",
	description: "Check the health of the DevContainer services",
	usage: "bun run dev:check [options]",
	examples: ["bun run dev:check", "bun run dev:check --shutdown"],
	options: [
		{
			short: "-s",
			long: "--shutdown",
			description: "Shutdown services after checks complete",
			required: false,
			validator: validators.boolean,
		},
	],
} as const satisfies ScriptConfig;

const devCheck = createScript(devCheckConfig, async function main(args, xConsole) {
	xConsole.log(colorify.blue("🧪 Starting DevContainer Health Check..."));

	await $`bun run dev:up --build`;
	const compose = await repoUtils.compose.parse("dev");
	await monitorServiceHealth(compose.serviceHealth, compose.exposedServices, xConsole);

	xConsole.log(colorify.blue("\n📊 Services are available at:"));
	const devUrls = compose.serviceUrls();
	for (const [name, url] of Object.entries(devUrls)) {
		xConsole.log(colorify.cyan(`   • ${name}: ${url}`));
	}

	xConsole.log(colorify.green("✅ DevContainer health check completed successfully!"));

	if (args.shutdown) {
		xConsole.log(colorify.yellow("🧹 Cleaning up services..."));
		await $`bun run dev:down`;
	} else {
		xConsole.log(
			colorify.yellow("💡 Use 'bun run dev:check --shutdown' to stop services when done"),
		);
	}
});

if (import.meta.main) {
	devCheck();
}

const icons: Record<ServiceHealth["status"], string> = {
	healthy: "✅",
	starting: "🔄",
	unhealthy: "❌",
	none: "❓",
};
const colors: Record<ServiceHealth["status"], (text: string) => string> = {
	healthy: colorify.green,
	starting: colorify.yellow,
	unhealthy: colorify.red,
	none: colorify.gray,
};
async function monitorServiceHealth(
	serviceHealth: () => Promise<ServiceHealth[]>,
	services: () => ServiceInfo[],
	xConsole: typeof console,
) {
	xConsole.log(colorify.yellow("⏳ Waiting for services to become healthy..."));

	const retryInterval = 5_000;
	const maxRetries = 6; // 6 * retryInterval = 30 seconds total
	let retryCount = 0;
	let allHealthy = false;

	let healthResult: ServiceHealth[] | null = null;
	while (retryCount < maxRetries && !allHealthy) {
		if (retryCount > 0) {
			xConsole.log(
				colorify.yellow(
					`🔄 Retry ${retryCount}/${maxRetries} - Checking health again in 5 seconds...`,
				),
			);
			await setTimeout(retryInterval);
		}

		healthResult = await serviceHealth();

		if (
			healthResult.every((s) => s.status === "healthy") &&
			healthResult.length === services.length
		) {
			allHealthy = true;
		} else {
			retryCount++;
		}
	}

	// Print detailed health status
	xConsole.log(colorify.blue("\n📊 Final Service Health Status:"));
	xConsole.log("-".repeat(50));
	if (!healthResult) {
		throw new Error("Failed to get health status from services");
	}

	for (const service of healthResult) {
		const icon = icons[service.status];
		const color = colors[service.status];
		xConsole.log(
			`${icon} ${color(service.name)}: ${service.status} ${service.port ? `(${service.port})` : ""}`,
		);
	}

	if (healthResult.some((s) => s.status === "unhealthy")) {
		throw new Error(
			`Unhealthy services after ${maxRetries} retries: ${healthResult
				.filter((s) => s.status === "unhealthy")
				.map((s) => s.name)
				.join(", ")}`,
		);
	}

	xConsole.log(colorify.green("✅ All services are healthy"));
}
