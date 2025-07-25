#!/usr/bin/env bun

import { parse } from "yaml";
import { getAffectedRunnables } from "./utils/affected";

interface DockerComposeService {
	depends_on?: string[];
}

interface DockerCompose {
	services: Record<string, DockerComposeService>;
}

/**
 * Reads docker-compose.yml and returns service dependencies
 */
async function getServiceDependencies(): Promise<Record<string, string[]>> {
	try {
		const composeFile = Bun.file("docker-compose.yml");
		const composeContent = await composeFile.text();
		const compose = parse(composeContent) as DockerCompose;

		const dependencies: Record<string, string[]> = {};

		for (const [serviceName, service] of Object.entries(compose.services)) {
			dependencies[serviceName] = service.depends_on || [];
		}

		return dependencies;
	} catch (error) {
		console.error("Error reading docker-compose.yml:", error);
		return {};
	}
}

/**
 * Gets all services that need to be built/started based on affected packages and dependencies
 */
function getRequiredServices(
	affectedServices: string[],
	dependencies: Record<string, string[]>,
): string[] {
	const requiredServices = new Set<string>(affectedServices);

	// Add dependencies for all affected services
	for (const service of affectedServices) {
		const serviceDeps = dependencies[service] || [];
		for (const dep of serviceDeps) {
			requiredServices.add(dep);
		}
	}

	return Array.from(requiredServices);
}

async function attachAffectedToGithubOutput() {
	try {
		const affectedRunnables = await getAffectedRunnables().then((runnables) =>
			runnables.map((runnable) => {
				// Handle UI package specially - convert @repo/ui to ui
				const key = runnable.key === "@repo/ui" ? "ui" : runnable.key;
				return `prod-${key}`;
			}),
		);

		// Get service dependencies from docker-compose.yml
		const dependencies = await getServiceDependencies();

		// Get all required services (affected + dependencies)
		const requiredServices = getRequiredServices(
			affectedRunnables,
			dependencies,
		);

		// Output in GitHub Actions format
		if (process.env.GITHUB_OUTPUT) {
			const output = `packages<<EOF\n${requiredServices.join(" ")}\nEOF\n`;
			await Bun.write(process.env.GITHUB_OUTPUT, output);
		}

		if (affectedRunnables.length === 0) {
			console.log("No affected packages found");
		} else {
			// Output clean list for bash capture
			console.log("Affected packages:", affectedRunnables.join(" "));
			console.log(
				"Required services (including dependencies):",
				requiredServices.join(" "),
			);
		}

		process.exit(0);
	} catch (error) {
		console.error("Error getting affected packages:", error);
		process.exit(1);
	}
}

attachAffectedToGithubOutput();
