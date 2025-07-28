#!/usr/bin/env bun

import { setTimeout } from "node:timers/promises";
import { $ } from "bun";
import chalk from "chalk";
import { validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";
import {
	getExposedServices,
	getServiceHealthFromPs,
	getServiceUrls,
	type ServiceHealth,
} from "./utils/docker-compose-parser";

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
} as const;

const devCheck = createScript(
	devCheckConfig,
	async function main(args, xConsole) {
		xConsole.log(chalk.blue("🧪 Starting DevContainer Health Check..."));

		const keepRunning = !args.shutdown;
		if (keepRunning) {
			xConsole.log(chalk.green("🔧 Mode: Keep services running after checks"));
		} else {
			xConsole.log(chalk.yellow("🧹 Mode: Cleanup after checks"));
		}

		// Step 1: Start services with build
		xConsole.log(chalk.blue("🚀 Starting DevContainer services..."));
		await $`bun run dev:up --build`;

		// Step 2: Monitor health checks
		await monitorServiceHealth(xConsole);

		// Step 3: Show service URLs
		await showServiceUrls(xConsole);

		// Step 4: Cleanup if requested
		if (!keepRunning) {
			xConsole.log(chalk.yellow("🧹 Cleaning up services..."));
			await $`bun run dev:down`;
		}

		xConsole.log(
			chalk.green("✅ DevContainer health check completed successfully!"),
		);
	},
);

async function monitorServiceHealth(xConsole: typeof console) {
	xConsole.log(chalk.yellow("⏳ Waiting for services to become healthy..."));

	const maxRetries = 6; // 30 seconds total (6 * 5 seconds)
	const retryInterval = 5000; // 5 seconds
	let retryCount = 0;
	let allHealthy = false;

	// Get expected services from docker-compose parser
	const allExposedServices = await getExposedServices(
		".devcontainer/docker-compose.dev.yml",
	);
	let healthResult: Awaited<ReturnType<typeof areAllServicesHealthy>> | null =
		null;

	while (retryCount < maxRetries && !allHealthy) {
		if (retryCount > 0) {
			xConsole.log(
				chalk.yellow(
					`🔄 Retry ${retryCount}/${maxRetries} - Checking health again in 5 seconds...`,
				),
			);
			await setTimeout(retryInterval);
		}

		// Get health status using the utility
		healthResult = await areAllServicesHealthy(
			".devcontainer/docker-compose.dev.yml",
		);

		// Check if all expected services are healthy
		if (
			healthResult.healthy &&
			healthResult.healthyServices.length === allExposedServices.length
		) {
			allHealthy = true;
		} else {
			retryCount++;
		}
	}

	// Print detailed health status
	xConsole.log(chalk.blue("\n📊 Final Service Health Status:"));
	xConsole.log("-".repeat(50));

	const icons = {
		healthy: "✅",
		starting: "🔄",
		unhealthy: "❌",
	};
	const colors = {
		healthy: chalk.green,
		starting: chalk.yellow,
		unhealthy: chalk.red,
	};

	if (!healthResult) {
		throw new Error("Failed to get health status from services");
	}

	for (const service of healthResult.services) {
		const icon = icons[service.status as keyof typeof icons];
		const color = colors[service.status as keyof typeof colors];
		xConsole.log(
			`${icon} ${color(service.name)}: ${service.status} ${service.port ? `(${service.port})` : ""}`,
		);
	}

	// Check for failures
	if (healthResult.unhealthyServices.length > 0) {
		throw new Error(
			`Unhealthy services after ${maxRetries} retries: ${healthResult.unhealthyServices.join(", ")}`,
		);
	}

	xConsole.log(chalk.green("✅ All services are healthy"));
}

async function showServiceUrls(xConsole: typeof console) {
	xConsole.log(chalk.blue("\n📊 Services are available at:"));

	// Get service URLs using the utility
	const devUrls = await getServiceUrls(".devcontainer/docker-compose.dev.yml");

	for (const [name, url] of Object.entries(devUrls)) {
		xConsole.log(chalk.cyan(`   • ${name}: ${url}`));
	}

	xConsole.log(
		chalk.yellow("💡 Use 'bun run dev:cleanup' to stop services when done"),
	);
}

/**
 * Check if all services are healthy
 */
export async function areAllServicesHealthy(composePath: string): Promise<{
	healthy: boolean;
	services: ServiceHealth[];
	healthyServices: string[];
	unhealthyServices: string[];
}> {
	const services = await getServiceHealthFromPs(composePath);
	const healthyServices = services
		.filter((s) => s.status === "healthy")
		.map((s) => s.name);
	const unhealthyServices = services
		.filter((s) => s.status === "unhealthy")
		.map((s) => s.name);

	return {
		healthy: unhealthyServices.length === 0 && healthyServices.length > 0,
		services,
		healthyServices,
		unhealthyServices,
	};
}

if (import.meta.main) {
	devCheck();
}
