#!/usr/bin/env bun
import { getAffectedServicesWithDependencies } from "./affected";
import { createScript } from "./utils/create-scripts";

const ciAttachAffectedConfig = {
	name: "GitHub Attach Affected",
	description: "Attach affected services to GitHub Actions",
	usage: "bun run ci-attach-affected.ts",
	examples: ["bun run ci-attach-affected.ts"],
	options: [],
} as const;

export const ciAttachAffected = createScript(
	ciAttachAffectedConfig,
	async function main(_, xConsole) {
		try {
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

			if (affectedServicesWithDependencies.length === 0) {
				xConsole.log("No affected packages found");
			} else {
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
	ciAttachAffected();
}
