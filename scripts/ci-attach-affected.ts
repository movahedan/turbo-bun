#!/usr/bin/env bun
import { createScript, type ScriptConfig, validators } from "./shell/create-scripts";
import { repoUtils } from "./shell/repo-utils";

const ciAttachAffectedConfig = {
	name: "GitHub Attach Affected",
	description: "Attach affected services to GitHub Actions",
	usage: "bun run scripts/ci-attach-affected.ts",
	examples: ["bun run scripts/ci-attach-affected.ts"],
	options: [
		{
			short: "-o",
			long: "--output-id",
			description: "The ID of the output to attach the affected packages to",
			required: true,
			validator: validators.nonEmpty,
		},
		{
			short: "-m",
			long: "--mode",
			description: "The mode to use for the affected services",
			required: true,
			validator: validators.enum(["docker", "turbo"]),
		},
	],
} as const satisfies ScriptConfig;

export const ciAttachAffected = createScript(
	ciAttachAffectedConfig,
	async function main(options, xConsole) {
		const mode = options.mode;
		const outputId = options["output-id"];

		if (mode === "docker") {
			xConsole.log("🐳 Using docker output mode");
		} else {
			xConsole.log("🚀 Using turbo output mode");
		}

		const affectedList =
			mode === "docker"
				? await repoUtils.affected().services()
				: await repoUtils.affected().packages();

		const affectedServicesNames = affectedList.join(" ");

		// Output in GitHub Actions format
		if (process.env.GITHUB_OUTPUT) {
			const output = `${outputId}<<EOF\n${affectedServicesNames}\nEOF\n`;
			await Bun.write(process.env.GITHUB_OUTPUT, output);
			xConsole.log(`\nAttached: ${outputId}=${affectedServicesNames}\n`);
		}
	},
);

if (import.meta.main) {
	ciAttachAffected();
}
