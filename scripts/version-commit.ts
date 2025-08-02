#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import { $ } from "bun";
import chalk from "chalk";
import { getAffectedPackages } from "./affected";
import type { ScriptConfig } from "./utils/create-scripts";
import { createScript } from "./utils/create-scripts";
import {
	createVersionTag,
	getLastVersioningCommit,
	getLatestVersion,
} from "./utils/version-utils";

const versionCommitConfig = {
	name: "Version Commit",
	description: "Automatically create and commit version changes",
	usage: "bun run version:commit",
	examples: ["bun run version:commit"],
	options: [
		{
			short: "-b",
			long: "--base-sha",
			description: "The base SHA to use for affected package detection",
			required: false,
			defaultValue: "origin/main",
		},
		{
			short: "-o",
			long: "--attach-to-output-id",
			description: "Attach packages to deploy to the github job output",
			required: false,
			defaultValue: "",
		},
	],
} as const satisfies ScriptConfig;

function filterPackagesToDeploy(packages: string[]): string[] {
	return packages.filter((pkg) => {
		try {
			const packageJsonPath = pkg.startsWith("@repo/")
				? `packages/${pkg.replace("@repo/", "")}/package.json`
				: `apps/${pkg}/package.json`;
			const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
			return packageJson.version !== undefined;
		} catch {
			return false;
		}
	});
}

export const versionCommit = createScript(
	versionCommitConfig,
	async function main(options, xConsole) {
		xConsole.info(
			chalk.blue("🚀 Analyzing deployment packages for production..."),
		);

		const baseSha = await getLastVersioningCommit();
		const outputId = options["attach-to-output-id"];
		xConsole.log(chalk.cyan(`📋 Using base SHA: ${baseSha}`));

		await $`bun run version:add:auto --base-sha ${baseSha}`.text();
		const packagesToDeploy = filterPackagesToDeploy(
			await getAffectedPackages(baseSha),
		);

		if (options["dry-run"]) {
			xConsole.log(chalk.yellow("🔍 Dry run, skipping commit and push"));
		} else {
			// Run changesets version to generate changelog and bump versions
			// Don't use --ignore flag here, let changesets handle dependencies automatically
			await $`bunx @changesets/cli version`.text();

			// Get the new version and create a Git tag
			const newVersion = await getLatestVersion();
			if (newVersion) {
				await createVersionTag(newVersion);
				xConsole.log(chalk.green(`🏷️  Created version tag: v${newVersion}`));
			}

			await $`git push origin main`.text();
		}

		if (packagesToDeploy.length === 0) {
			xConsole.log(chalk.yellow("⚠️  No packages need deployment"));
			return;
		}
		xConsole.log(
			chalk.green(`📱 Packages to deploy: ${packagesToDeploy.join(", ")}`),
		);

		// Output for GitHub Actions
		if (outputId) {
			const output = `${outputId}<<EOF\n${JSON.stringify(packagesToDeploy)}\nEOF\n`;
			xConsole.log(
				chalk.yellow(
					`\n📱 Attached: ${outputId}=${JSON.stringify(packagesToDeploy)}\n`,
				),
			);

			if (process.env.GITHUB_OUTPUT && !options["dry-run"]) {
				await Bun.write(process.env.GITHUB_OUTPUT, output);
			}
		}
	},
);

if (import.meta.main) {
	versionCommit();
}
