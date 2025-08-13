#!/usr/bin/env bun
import { EntityAffected } from "./entities";
import { createScript, type ScriptConfig, validators } from "./shell/create-scripts";

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
		{
			short: "-b",
			long: "--base-sha",
			description: "The base SHA to compare against (defaults to latest tag)",
			required: false,
			validator: validators.nonEmpty,
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

		let baseSha = options["base-sha"];
		if (!baseSha) {
			const eventName = process.env.GITHUB_EVENT_NAME;
			const isPR = eventName === "pull_request";

			if (isPR) {
				baseSha = process.env.GITHUB_BASE_REF;
				xConsole.log(`🔍 PR detected, using base branch: ${baseSha}`);
			} else {
				baseSha = process.env.GITHUB_BEFORE_SHA || "HEAD~1";
				xConsole.log(`🔍 Push detected, using base SHA: ${baseSha}`);
			}
		} else {
			xConsole.log(`🔍 Using provided base SHA: ${baseSha}`);
		}

		xConsole.log(`🔍 Comparing changes from ${baseSha} to HEAD`);
		const affectedList =
			mode === "docker"
				? await EntityAffected.getAffectedServices(baseSha)
				: await EntityAffected.getAffectedPackages(baseSha);
		xConsole.log(`🔍 Found ${affectedList.length} affected items`);

		const affectedServicesNames = affectedList
			.map((i) => (mode === "docker" ? (typeof i !== "string" ? i.name : i) : `--filter="${i}"`))
			.join(" ");

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
