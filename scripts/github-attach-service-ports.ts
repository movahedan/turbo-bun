#!/usr/bin/env bun

import { getServicePorts } from "./utils/docker-compose-parser";

async function githubAttachServicePorts() {
	try {
		const portMappings = await getServicePorts("docker-compose.yml");

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

if (import.meta.main) {
	await githubAttachServicePorts();
}
