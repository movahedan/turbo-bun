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
			// Configure Git for GitHub Actions if running in CI
			if (process.env.GITHUB_ACTIONS) {
				await $`git config user.name "github-actions[bot]"`.text();
				await $`git config user.email "github-actions[bot]@users.noreply.github.com"`.text();

				// Configure Git for GitHub Actions authentication
				if (process.env.GITHUB_TOKEN) {
					xConsole.log(chalk.blue("🔐 Configuring Git authentication..."));

					// Use GITHUB_TOKEN for authentication
					const token = process.env.GITHUB_TOKEN;
					const repo = process.env.GITHUB_REPOSITORY;

					await $`git remote set-url origin https://x-access-token:${token}@github.com/${repo}.git`.text();

					// Verify the remote URL
					const actualRemoteUrl = await $`git remote get-url origin`.text();
					xConsole.log(
						chalk.cyan(
							`🔗 Remote URL: ${actualRemoteUrl.replace(/x-access-token:[^@]+@/, "x-access-token:***@")}`,
						),
					);
					xConsole.log(chalk.green("✅ Git authentication configured"));
				} else {
					xConsole.log(chalk.yellow("⚠️  GITHUB_TOKEN not found"));
				}
			} else {
				// Local development - use default authentication
				xConsole.log(chalk.blue("🔐 Using local Git authentication..."));
			}

			// Run changesets version to generate changelog and bump versions
			await $`bunx @changesets/cli version`.text();

			// Check if there are changes to commit
			const status = await $`git status --porcelain`.text();
			if (status.trim()) {
				// Commit the version changes
				await $`git add .`.text();
				await $`git commit -m "chore: bump package versions and generate changelogs

- Update package.json versions for all affected packages
- Generate CHANGELOG.md files with release notes
- Apply changeset versioning rules (patch/minor/major)
- Prepare for deployment pipeline"`.text();
			} else {
				xConsole.log(
					chalk.yellow(
						"ℹ️  No changes to commit - changesets already committed",
					),
				);
			}

			// Get the new version and create a Git tag AFTER committing
			const newVersion = await getLatestVersion();
			if (newVersion) {
				await createVersionTag(newVersion);
				xConsole.log(chalk.green(`🏷️  Created version tag: v${newVersion}`));
			}

			// Check if we have commits to push
			const aheadCount = await $`git rev-list --count origin/main..HEAD`.text();
			if (Number.parseInt(aheadCount.trim()) > 0) {
				// Always push to main branch (whether we committed or changesets did)
				xConsole.log(chalk.blue("🚀 Pushing changes to main branch..."));
				await $`git push origin main`.text();
				xConsole.log(chalk.green("✅ Successfully pushed version changes"));
			} else {
				xConsole.log(
					chalk.yellow(
						"⚠️  No commits to push - version pipeline completed without changes",
					),
				);
			}
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
