#!/usr/bin/env bun

import { createScript, type ScriptConfig, validators } from "./shell/create-scripts";
import { repoUtils } from "./shell/repo-utils";

const ciAttachServicePortsConfig = {
	name: "GitHub Attach Service Ports",
	description: "Attach service ports to GitHub Actions",
	usage: "bun run ci-attach-service-ports.ts",
	examples: ["bun run ci-attach-service-ports.ts"],
	options: [
		{
			short: "-o",
			long: "--output-id",
			description: "The ID of the output to attach the affected packages to",
			required: true,
			validator: validators.nonEmpty,
		},
	],
} as const satisfies ScriptConfig;

export const ciAttachServicePorts = createScript(
	ciAttachServicePortsConfig,
	async function main(options, xConsole) {
		const outputId = options["output-id"];

		const portMappings = await repoUtils.compose.parse("prod").then((c) => c.servicePorts());

		// Output in GitHub Actions format
		if (process.env.GITHUB_OUTPUT) {
			const output = `${outputId}<<EOF\n${JSON.stringify(portMappings)}\nEOF\n`;
			await Bun.write(process.env.GITHUB_OUTPUT, output);
			xConsole.log(`\nAttached: ${outputId}=${JSON.stringify(portMappings)}\n`);
		}
	},
);

if (import.meta.main) {
	ciAttachServicePorts();
}
