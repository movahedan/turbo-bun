#!/usr/bin/env bun

import { parse } from "yaml";

interface DockerComposeService {
	ports?: string[];
}

interface DockerCompose {
	services: Record<string, DockerComposeService>;
}

/**
 * Reads docker-compose.yml and returns port mappings for services
 */
async function getServicePorts(): Promise<Record<string, string>> {
	try {
		const composeFile = Bun.file("docker-compose.yml");
		const composeContent = await composeFile.text();
		const compose = parse(composeContent) as DockerCompose;

		const portMappings: Record<string, string> = {};

		for (const [serviceName, service] of Object.entries(compose.services)) {
			if (service.ports && service.ports.length > 0) {
				// Extract host port from "host:container" format
				const portMapping = service.ports[0];
				const hostPort = portMapping.split(":")[0];
				portMappings[serviceName] = hostPort;
			}
		}

		return portMappings;
	} catch (error) {
		console.error("Error reading docker-compose.yml:", error);
		return {};
	}
}

async function attachServicePortsToGithubOutput() {
	try {
		const portMappings = await getServicePorts();

		// Output in GitHub Actions format
		if (process.env.GITHUB_OUTPUT) {
			const output = `service-ports<<EOF\n${JSON.stringify(portMappings)}\nEOF\n`;
			await Bun.write(process.env.GITHUB_OUTPUT, output);
		}

		if (Object.keys(portMappings).length === 0) {
			console.log("No service ports found");
		} else {
			// Output clean list for bash capture
			console.log("Service ports:");
			console.log(JSON.stringify(portMappings, null, 2));
		}

		process.exit(0);
	} catch (error) {
		console.error("Error getting service ports:", error);
		process.exit(1);
	}
}

attachServicePortsToGithubOutput();
