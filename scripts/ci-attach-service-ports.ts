#!/usr/bin/env bun

import { createScript } from "./utils/create-scripts";
import { parseCompose } from "./utils/docker-compose-parser";

const ciAttachServicePortsConfig = {
	name: "GitHub Attach Service Ports",
	description: "Attach service ports to GitHub Actions",
	usage: "bun run ci-attach-service-ports.ts",
	examples: ["bun run ci-attach-service-ports.ts"],
	options: [],
} as const;

export const ciAttachServicePorts = createScript(
	ciAttachServicePortsConfig,
	async function main(_, xConsole) {
		const portMappings = (await parseCompose("prod")).servicePorts();

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
	ciAttachServicePorts();
}
