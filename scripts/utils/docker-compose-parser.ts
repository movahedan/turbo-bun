#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { $ } from "bun";
// waiting for https://github.com/oven-sh/bun/issues/1003
import { parse as pYaml } from "yaml";

export interface ServiceInfo {
	name: string;
	port?: number;
	hostPort?: number;
	containerPort?: number;
	environment?: Record<string, string>;
	dependencies?: string[];
	healthcheck?: {
		test: string[];
		interval?: string;
		timeout?: string;
		retries?: number;
		start_period?: string;
	};
}

export interface ServiceHealth {
	name: string;
	status: "healthy" | "unhealthy" | "starting" | "none";
	port?: string;
}

const composePaths = {
	dev: ".devcontainer/docker-compose.dev.yml",
	prod: "docker-compose.yml",
} as const;

export const parseCompose = async (mode: "dev" | "prod") => {
	const services = await parse(composePaths[mode]);

	return {
		exposedServices: () => services.filter((s) => s.port !== undefined),
		serviceHealth: () => {
			return $`docker compose -f ${composePaths[mode]} --profile all ps`.then(({ stdout }) =>
				parseDockerPsOutput(stdout.toString()),
			);
		},
		serviceUrls: (baseUrl = "http://localhost") => {
			return Object.fromEntries(
				services
					.filter((service) => service.port !== undefined)
					.map((service) => [service.name, service.port ? `${baseUrl}:${service.port}` : ""]),
			);
		},
		servicePorts: () => Object.fromEntries(services.map((s) => [s.name, s.port?.toString() ?? ""])),
		dependentServices: (serviceName: string) =>
			services.filter((service) => service.dependencies?.includes(serviceName)),
	};
};

interface DockerCompose {
	name?: string;
	services: Record<
		string,
		{
			ports?: string[];
			environment?: Record<string, string>;
			depends_on?: string[];
			healthcheck?: {
				test: string[];
				interval?: string;
				timeout?: string;
				retries?: number;
				start_period?: string;
			};
		}
	>;
}

async function parse(composePath: string): Promise<ServiceInfo[]> {
	try {
		if (!existsSync(composePath)) {
			throw new Error(`Docker compose file not found: ${composePath}`);
		}

		const services: ServiceInfo[] = [];
		const compose: DockerCompose = pYaml(await Bun.file(composePath).text());

		for (const [serviceName, service] of Object.entries(compose.services)) {
			const serviceInfo: ServiceInfo = {
				name: serviceName,
				environment: service.environment,
				dependencies: service.depends_on,
				healthcheck: service.healthcheck,
			};

			if (service.ports && service.ports.length > 0) {
				const portMapping = service.ports[0];

				if (/^\d+$/.test(portMapping)) {
					// Single number format (e.g., "8080")
					const port = Number.parseInt(portMapping, 10);
					serviceInfo.hostPort = port;
					serviceInfo.containerPort = port;
					serviceInfo.port = port; // Use the same port for host and container
				} else if (/^\d+:\d+$/.test(portMapping)) {
					// Host:Container format (e.g., "8080:80")
					const [hostPort, containerPort] = portMapping.split(":");
					serviceInfo.hostPort = Number.parseInt(hostPort, 10);
					serviceInfo.containerPort = Number.parseInt(containerPort, 10);
					serviceInfo.port = serviceInfo.hostPort; // Use host port as default
				} else {
					// Unsupported format - log warning but don't fail
					console.warn(`Unsupported port format for service ${serviceName}: ${portMapping}`);
				}
			}

			services.push(serviceInfo);
		}

		return services;
	} catch (error) {
		console.error(`Error parsing ${composePath}:`, error);
		return [];
	}
}

function parseDockerPsOutput(output: string): ServiceHealth[] {
	const lines = output.trim().split("\n");
	const services: ServiceHealth[] = [];

	for (const line of lines) {
		if (line.includes("NAME") || line.includes("----")) continue; // Skip header

		// Look for health status patterns in the line
		const nameMatch = line.match(/^(\S+)/);
		if (!nameMatch) continue;

		const name = nameMatch[1];
		let healthStatus: "healthy" | "unhealthy" | "starting" | "none" = "none";

		// Check for health status patterns
		if (line.includes("healthy") || line.includes("Up")) {
			healthStatus = "healthy";
		} else if (line.includes("unhealthy")) {
			healthStatus = "unhealthy";
		} else if (line.includes("starting")) {
			healthStatus = "starting";
		}

		// Extract port information using a regex pattern
		const portMatch = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+->\d+)/);
		const port = portMatch ? portMatch[1] : undefined;

		services.push({
			name,
			status: healthStatus,
			port,
		});
	}

	return services;
}
