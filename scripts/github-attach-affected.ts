#!/usr/bin/env bun
import {
	getAffectedServices,
	getAffectedServicesWithDependencies,
} from "./get-affected-services";
import { createScript } from "./utils/create-scripts";

const githubAttachAffectedConfig = {
	name: "GitHub Attach Affected",
	description: "Attach affected services to GitHub Actions",
	usage: "bun run github-attach-affected",
	examples: ["bun run github-attach-affected"],
	options: [],
} as const;

export const githubAttachAffected = createScript(
	githubAttachAffectedConfig,
	async function main(_, xConsole) {
		try {
			const affectedServices = await getAffectedServices("prod");
			const affectedServicesWithDependencies =
				await getAffectedServicesWithDependencies("prod");
			const affectedServicesNames = affectedServicesWithDependencies.map(
				(s) => s.name,
			);

			// Output in GitHub Actions format
			if (process.env.GITHUB_OUTPUT) {
				const output = `packages<<EOF\n${affectedServicesNames.join(" ")}\nEOF\n`;
				await Bun.write(process.env.GITHUB_OUTPUT, output);
			}

			if (affectedServices.length === 0) {
				xConsole.log("No affected packages found");
			} else {
				// Output clean list for bash capture
				xConsole.log(
					"Affected packages:",
					affectedServices.map((s) => JSON.stringify(s)).join("\n"),
				);
				xConsole.log(
					"Required services (including dependencies):",
					affectedServicesWithDependencies
						.map((s) => JSON.stringify(s))
						.join("\n"),
				);
			}

			process.exit(0);
		} catch (error) {
			xConsole.error("Error getting affected packages:", error);
			process.exit(1);
		}
	},
);

if (import.meta.main) {
	await githubAttachAffected();
}
