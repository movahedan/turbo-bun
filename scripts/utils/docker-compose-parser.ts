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
				const [hostPort, containerPort] = portMapping.split(":");

				serviceInfo.hostPort = Number.parseInt(hostPort, 10);
				serviceInfo.containerPort = Number.parseInt(containerPort, 10);
				serviceInfo.port = serviceInfo.hostPort; // Use host port as default
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
