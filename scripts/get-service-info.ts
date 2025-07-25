#!/usr/bin/env bun

import chalk from "chalk";
import { validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";
import {
	getAllServices,
	getDependentServices,
	getServiceByName,
	getServiceDependencies,
	getServicePorts,
	getServiceUrls,
	type ServiceInfo,
} from "./utils/docker-compose-parser";

export const getServiceInfo = createScript(
	{
		name: "Service Information Extractor",
		description:
			"Extract service information from docker-compose files dynamically",
		usage: "bun run get-service-info [options]",
		examples: [
			"bun run get-service-info --format json",
			"bun run get-service-info --compose prod --format table",
			"bun run get-service-info --service prod-admin --dependencies",
			"bun run get-service-info --urls --compose dev",
			"bun run get-service-info --ports --compose prod",
		],
		options: [
			{
				short: "-f",
				long: "--format",
				description: "Output format (json, table, list)",
				required: false,
				validator: validators.enum(["json", "table", "list"]),
			},
			{
				short: "-c",
				long: "--compose",
				description: "Docker compose file to use (dev, prod, or both)",
				required: false,
				validator: validators.enum(["dev", "prod", "both"]),
			},
			{
				short: "-s",
				long: "--service",
				description: "Specific service name to get info for",
				required: false,
				validator: validators.nonEmpty,
			},
			{
				short: "-u",
				long: "--urls",
				description: "Show service URLs",
				required: false,
				validator: validators.boolean,
			},
			{
				short: "-d",
				long: "--dependencies",
				description: "Show service dependencies",
				required: false,
				validator: validators.boolean,
			},
			{
				short: "-e",
				long: "--exposed",
				description: "Show only services with exposed ports",
				required: false,
				validator: validators.boolean,
			},
			{
				short: "-p",
				long: "--ports",
				description: "Show service port mappings",
				required: false,
				validator: validators.boolean,
			},
		],
	} as const,
	async (args) => {
		const format = args.format || "table";
		const compose = args.compose || "both";
		const showUrls = args.urls || false;
		const showDependencies = args.dependencies || false;
		const exposedOnly = args.exposed || false;
		const showPorts = args.ports || false;

		try {
			// Handle ports display (new functionality)
			if (showPorts) {
				await displayServicePorts(compose);
				return;
			}

			if (args.service) {
				// Get specific service information
				const filePath = getComposeFilePath(compose);
				const service = await getServiceByName(args.service, filePath);

				if (!service) {
					console.error(
						chalk.red(`❌ Service '${args.service}' not found in ${filePath}`),
					);
					process.exit(1);
				}

				if (format === "json") {
					console.log(JSON.stringify(service, null, 2));
				} else {
					console.log(chalk.blue(`📋 Service: ${service.name}`));
					console.log(`   Port: ${service.port || "N/A"}`);
					console.log(`   Host Port: ${service.hostPort || "N/A"}`);
					console.log(`   Container Port: ${service.containerPort || "N/A"}`);

					if (showDependencies && service.dependencies) {
						console.log(`   Dependencies: ${service.dependencies.join(", ")}`);
					}

					if (showUrls && service.port) {
						console.log(`   URL: http://localhost:${service.port}`);
					}
				}

				// Show dependencies if requested
				if (showDependencies) {
					await displayDependencies(args.service, filePath);
				}

				return;
			}

			// Get all services
			const services = await getFilteredServices(compose, exposedOnly);

			// Output based on format
			if (format === "json") {
				console.log(JSON.stringify(services, null, 2));
			} else if (format === "list") {
				for (const service of services) {
					const env = service.environment ? ` [${service.environment}]` : "";
					const port = service.port ? ` :${service.port}` : "";
					console.log(`• ${service.name}${env}${port}`);
				}
			} else {
				// Table format
				console.log(chalk.blue("📋 Services Information:"));
				console.log("=".repeat(80));
				console.log(
					`${"Name".padEnd(20)} ${"Port".padEnd(10)} ${"Host".padEnd(10)} ${"Container".padEnd(10)} ${"Dependencies".padEnd(20)}`,
				);
				console.log("-".repeat(80));

				for (const service of services) {
					const name = service.name.padEnd(20);
					const port = (service.port?.toString() || "N/A").padEnd(10);
					const host = (service.hostPort?.toString() || "N/A").padEnd(10);
					const container = (service.containerPort?.toString() || "N/A").padEnd(
						10,
					);
					const deps = (service.dependencies?.join(", ") || "None").padEnd(20);

					console.log(`${name} ${port} ${host} ${container} ${deps}`);
				}
			}

			// Show URLs if requested
			if (showUrls) {
				await displayServiceUrls(compose);
			}
		} catch (error) {
			console.error(chalk.red("❌ Error getting service information:"), error);
			process.exit(1);
		}
	},
);

if (import.meta.main) {
	getServiceInfo();
}

/**
 * Get the appropriate file path based on compose environment
 */
const getComposeFilePath = (compose: string): string => {
	return compose === "prod"
		? "docker-compose.yml"
		: ".devcontainer/docker-compose.dev.yml";
};

/**
 * Display service URLs for the specified compose environment
 */
const displayServiceUrls = async (compose: string): Promise<void> => {
	console.log(chalk.blue("\n🌐 Service URLs:"));
	console.log("=".repeat(50));

	if (compose === "dev" || compose === "both") {
		const devUrls = await getServiceUrls(
			".devcontainer/docker-compose.dev.yml",
		);
		console.log(chalk.yellow("Development:"));
		for (const [name, url] of Object.entries(devUrls)) {
			console.log(`   ${name}: ${url}`);
		}
	}

	if (compose === "prod" || compose === "both") {
		const prodUrls = await getServiceUrls("docker-compose.yml");
		console.log(chalk.yellow("\nProduction:"));
		for (const [name, url] of Object.entries(prodUrls)) {
			console.log(`   ${name}: ${url}`);
		}
	}
};

/**
 * Display dependency information with consistent formatting
 */
const displayDependencies = async (
	serviceName: string,
	filePath: string,
): Promise<void> => {
	const dependencies = await getServiceDependencies(serviceName, filePath);
	const dependents = await getDependentServices(serviceName, filePath);

	console.log(chalk.blue("\n🔗 Dependencies:"));
	console.log(
		`   Depends on: ${dependencies.length > 0 ? dependencies.join(", ") : "None"}`,
	);
	console.log(
		`   Dependents: ${dependents.length > 0 ? dependents.join(", ") : "None"}`,
	);
};

/**
 * Get services based on compose environment and filters
 */
const getFilteredServices = async (
	compose: string,
	exposedOnly: boolean,
): Promise<ServiceInfo[]> => {
	const allServices = await getAllServices();
	let services: ServiceInfo[] = [];

	if (compose === "dev") {
		services = allServices.dev;
	} else if (compose === "prod") {
		services = allServices.prod;
	} else {
		services = [...allServices.dev, ...allServices.prod];
	}

	if (exposedOnly) {
		services = services.filter((s) => s.port !== undefined);
	}

	return services;
};

/**
 * Display service ports in standard output format
 */
const displayServicePorts = async (compose: string): Promise<void> => {
	const filePath = getComposeFilePath(compose);
	const portMappings = await getServicePorts(filePath);

	if (Object.keys(portMappings).length === 0) {
		console.log(chalk.yellow("No service ports found"));
	} else {
		console.log(chalk.blue("🔌 Service Ports:"));
		console.log("=".repeat(50));
		console.log(JSON.stringify(portMappings, null, 2));
	}
};
