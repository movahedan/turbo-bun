#!/usr/bin/env bun

import { readFileSync } from "node:fs";
import { $ } from "bun";
import chalk from "chalk";
import { getAffectedPackages } from "./affected";
import { createScript } from "./utils/create-scripts";
import { readExistingChangesets } from "./version-add-auto";

interface ChangesetEntry {
	packages: Record<string, "patch" | "minor" | "major">;
	summary: string;
}

interface ChangesetFile {
	filename: string;
	content: ChangesetEntry;
}

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
			default: "origin/main",
		},
		{
			short: "-a",
			long: "--attach-to-output",
			description: "Attach packages to deploy to the github job output",
			required: false,
			default: "",
		},
	],
} as const;

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

async function getPackagesToDeploy(
	xConsole: typeof console,
): Promise<string[]> {
	try {
		const changesetFiles = await readExistingChangesets(xConsole);
		const bumpedPackages: string[] = [];

		for (const changeset of changesetFiles) {
			for (const pkg of Object.keys(changeset.content.packages)) {
				if (!bumpedPackages.includes(pkg)) {
					bumpedPackages.push(pkg);
				}
			}
		}

		return filterPackagesToDeploy(bumpedPackages);
	} catch (error) {
		xConsole.warn("Error analyzing deployment packages:", error);
	}

	// Fallback to affected packages, filtered to only versioned packages
	return filterPackagesToDeploy(await getAffectedPackages());
}

async function getBaseSha(xConsole: typeof console): Promise<string> {
	// Get the current commit SHA
	const currentSha = await $`git rev-parse HEAD`.text();
	xConsole.log(`Current SHA: ${currentSha.trim()}`);

	// Check if this is a merge commit (has 2 parents)
	const parentCount =
		await $`git rev-list --count ${currentSha.trim()}^@`.text();
	const isMergeCommit = Number.parseInt(parentCount.trim()) === 2;

	let baseSha: string;

	if (isMergeCommit) {
		xConsole.log("🔍 This is a merge commit, finding base SHA...");

		// For merge commits, we want the previous head of main before the merge
		// This is the first parent of the merge commit
		const firstParent = await $`git rev-parse ${currentSha.trim()}^1`.text();
		xConsole.log(`First parent (base): ${firstParent.trim()}`);

		baseSha = firstParent.trim();
	} else {
		xConsole.log("📋 This is a regular commit, using origin/main as base");
		baseSha = "origin/main";
	}

	xConsole.log(`Base SHA: ${baseSha}`);
	return baseSha;
}

export const versionCommit = createScript(
	versionCommitConfig,
	async function main(options, xConsole) {
		xConsole.info(chalk.blue("🚀 Analyzing deployment packages..."));

		const baseSha = await getBaseSha(xConsole);
		await $`bun run version:add:auto --base-sha ${baseSha}`.text();
		const packagesToDeploy = await getPackagesToDeploy(xConsole);

		if (options["dry-run"]) {
			xConsole.log(chalk.yellow("🔍 Dry run, skipping commit and push"));
		} else {
			await $`bun run @changesets/cli version --commit`.text();
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
		if (options["attach-to-output"]) {
			const output = `packages-to-deploy<<EOF\n${JSON.stringify(packagesToDeploy)}\nEOF\n`;
			xConsole.log(
				chalk.yellow("📱 Attaching packages to output:\n", output, "\n"),
			);

			if (process.env.GITHUB_OUTPUT && !options["dry-run"]) {
				await Bun.write(process.env.GITHUB_OUTPUT, output);
			}

			xConsole.log(
				chalk.green(
					"📱 Packages to deploy attached to output, access it via:",
					"```",
					`echo \${{ needs.<job-name>.outputs.${options["attach-to-output"]} }}`,
					"```",
				),
			);
		}
	},
);

if (import.meta.main) {
	versionCommit();
}
