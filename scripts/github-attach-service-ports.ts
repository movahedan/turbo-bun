#!/usr/bin/env bun

import { createScript } from "./utils/create-scripts";
import { getServicePorts } from "./utils/docker-compose-parser";

const githubAttachServicePortsConfig = {
	name: "GitHub Attach Service Ports",
	description: "Attach service ports to GitHub Actions",
	usage: "bun run github-attach-service-ports",
	examples: ["bun run github-attach-service-ports"],
	options: [],
} as const;

export const githubAttachServicePorts = createScript(
	githubAttachServicePortsConfig,
	async function main(_, xConsole) {
		const portMappings = await getServicePorts("docker-compose.yml");

		// Output in GitHub Actions format
		if (process.env.GITHUB_OUTPUT) {
			const output = `service-ports<<EOF\n${JSON.stringify(portMappings)}\nEOF\n`;
			await Bun.write(process.env.GITHUB_OUTPUT, output);
		}

		if (Object.keys(portMappings).length === 0) {
			xConsole.log("No service ports found");
		} else {
			// Output clean list for bash capture
			xConsole.log("Service ports:");
			xConsole.log(JSON.stringify(portMappings, null, 2));
		}
	},
);

if (import.meta.main) {
	githubAttachServicePorts();
}
