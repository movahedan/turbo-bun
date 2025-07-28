#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { parse } from "yaml";

interface DockerComposeService {
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

interface DockerCompose {
	name?: string;
	services: Record<string, DockerComposeService>;
}

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

/**
 * Parse docker-compose file and extract service information
 */
export async function parseDockerCompose(composePath: string): Promise<{
	name?: string;
	services: ServiceInfo[];
}> {
	try {
		if (!existsSync(composePath)) {
			throw new Error(`Docker compose file not found: ${composePath}`);
		}

		const composeFile = Bun.file(composePath);
		const composeContent = await composeFile.text();
		const compose = parse(composeContent) as DockerCompose;

		const services: ServiceInfo[] = [];

		for (const [serviceName, service] of Object.entries(compose.services)) {
			const serviceInfo: ServiceInfo = {
				name: serviceName,
				environment: service.environment,
				dependencies: service.depends_on,
				healthcheck: service.healthcheck,
			};

			// Parse port mapping
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
					console.warn(
						`Unsupported port format for service ${serviceName}: ${portMapping}`,
					);
				}
			}

			services.push(serviceInfo);
		}

		return {
			name: compose.name,
			services,
		};
	} catch (error) {
		console.error(`Error parsing ${composePath}:`, error);
		return { services: [] };
	}
}

/**
 * Get service information from both dev and prod docker-compose files
 */
export async function getAllServices(): Promise<{
	dev: ServiceInfo[];
	prod: ServiceInfo[];
}> {
	const devServices = await parseDockerCompose(
		".devcontainer/docker-compose.dev.yml",
	);
	const prodServices = await parseDockerCompose("docker-compose.yml");

	return {
		dev: devServices.services,
		prod: prodServices.services,
	};
}

/**
 * Get service by name from a specific docker-compose file
 */
export async function getServiceByName(
	serviceName: string,
	composePath: string,
): Promise<ServiceInfo | null> {
	const { services } = await parseDockerCompose(composePath);
	return services.find((service) => service.name === serviceName) || null;
}

/**
 * Get all services that expose ports
 */
export async function getExposedServices(
	composePath: string,
): Promise<ServiceInfo[]> {
	const { services } = await parseDockerCompose(composePath);
	return services.filter((service) => service.port !== undefined);
}

/**
 * Get service URLs for a given docker-compose file
 */
export async function getServiceUrls(
	composePath: string,
	baseUrl = "http://localhost",
): Promise<Record<string, string>> {
	const services = await getExposedServices(composePath);
	const urls: Record<string, string> = {};

	for (const service of services) {
		if (service.port) {
			urls[service.name] = `${baseUrl}:${service.port}`;
		}
	}

	return urls;
}

/**
 * Get service ports for a given docker-compose file
 */
export async function getServicePorts(
	composePath: string,
): Promise<Record<string, string>> {
	const { services } = await parseDockerCompose(composePath);
	const ports: Record<string, string> = {};

	for (const service of services) {
		if (service.port) {
			ports[service.name] = service.port.toString();
		}
	}

	return ports;
}

/**
 * Get service dependencies for a given service
 */
export async function getServiceDependencies(
	serviceName: string,
	composePath: string,
): Promise<string[]> {
	const service = await getServiceByName(serviceName, composePath);
	return service?.dependencies || [];
}

/**
 * Get all services that depend on a specific service
 */
export async function getDependentServices(
	serviceName: string,
	composePath: string,
): Promise<string[]> {
	const { services } = await parseDockerCompose(composePath);
	const dependents: string[] = [];

	for (const service of services) {
		if (service.dependencies?.includes(serviceName)) {
			dependents.push(service.name);
		}
	}

	return dependents;
}

/**
 * Get service health information from Docker ps output
 */
export async function getServiceHealthFromPs(
	composePath: string,
): Promise<ServiceHealth[]> {
	const { stdout } = await Bun.spawn(
		["docker", "compose", "-f", composePath, "--profile", "all", "ps"],
		{
			stdout: "pipe",
			stderr: "pipe",
		},
	);

	const output = await new Response(stdout).text();
	return parseDockerPsOutput(output);
}

/**
 * Parse Docker ps output to extract service health information
 */
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
		if (line.includes("(healthy)")) {
			healthStatus = "healthy";
		} else if (line.includes("(unhealthy)")) {
			healthStatus = "unhealthy";
		} else if (line.includes("(health: starting)")) {
			healthStatus = "starting";
		} else if (line.includes("Up")) {
			healthStatus = "starting"; // Assume starting if Up but no health status
		}

		// Extract port information using a safer regex pattern
		const portMatch = line.match(
			/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+->\d+)/,
		);
		const port = portMatch ? portMatch[1] : undefined;

		services.push({
			name,
			status: healthStatus,
			port,
		});
	}

	return services;
}
