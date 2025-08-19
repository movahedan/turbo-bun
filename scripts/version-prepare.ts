#!/usr/bin/env bun

import { colorify, createScript, type ScriptConfig } from "@repo/intershell/core";
import {
	DefaultChangelogTemplate,
	EntityChangelog,
	EntityPackages,
	EntityTag,
	type VersionData,
} from "@repo/intershell/entities";

const scriptConfig = {
	name: "Version Prepare",
	description: "Prepare version bumps and generate changelogs for packages",
	usage: "bun run version-prepare.ts [options]",
	examples: [
		"bun run version-prepare.ts",
		"bun run version-prepare.ts --package root",
		"bun run version-prepare.ts --from v1.0.0 --to HEAD",
	],
	options: [
		{
			short: "-p",
			long: "--package",
			description: "Package name to process (default: all packages)",
			required: false,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
		{
			short: "-f",
			long: "--from",
			description: "Start commit/tag for changelog generation",
			required: false,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
		{
			short: "-t",
			long: "--to",
			description: "End commit/tag for changelog generation (default: HEAD)",
			required: false,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
	],
} as const satisfies ScriptConfig;

export const versionPrepare = createScript(scriptConfig, async function main(args, xConsole) {
	const fromCommit = await EntityTag.getBaseTagSha(args.from);
	const toCommit = args.to || "HEAD";
	const processAll = !args.package;

	xConsole.info("🚀 Starting version preparation");
	xConsole.info(
		`📝 Generating changelog from ${colorify.blue(fromCommit)} to ${colorify.blue(toCommit)}`,
	);

	let versionCommitMessage = "";

	try {
		let packagesToProcess: string[] = [];

		if (processAll) {
			xConsole.info("📦 Processing all packages in workspace...");
			packagesToProcess = await EntityPackages.getAllPackages();
			xConsole.info(`Found ${packagesToProcess.length} packages: ${packagesToProcess.join(", ")}`);
		} else {
			const packageName = args.package;
			if (!packageName) {
				throw new Error("Package name is required when not processing all packages");
			}
			packagesToProcess = [packageName];
			xConsole.info(`📦 Processing single package: ${colorify.blue(packageName)}`);
		}

		const results: Array<
			{
				packageName: string;
				commitCount: number;
			} & VersionData
		> = [];

		let totalBumps = 0;
		let totalCommits = 0;

		for (const packageName of packagesToProcess) {
			xConsole.info(`\n🔍 Processing package: ${colorify.blue(packageName)}`);

			try {
				const packageJson = new EntityPackages(packageName);
				const template = new DefaultChangelogTemplate(packageName);
				const changelog = new EntityChangelog(packageName, template);
				await changelog.setRange(fromCommit, toCommit);
				const commitCount = changelog.getCommitCount();
				const versionData = changelog.getVersionData();

				if (commitCount === 0) {
					xConsole.log(colorify.yellow(`⚠️ No commits found for ${packageName}`));
					results.push({
						packageName,
						commitCount,
						...versionData,
					});
					continue;
				}

				results.push({
					packageName,
					commitCount,
					...versionData,
				});

				if (versionData.shouldBump) {
					totalBumps++;
					xConsole.log(
						`🎯 ${colorify.green("Version bump needed!")}\n` +
							`📦 Package: ${colorify.blue(packageName)}\n` +
							`🔄 Current: ${colorify.yellow(versionData.currentVersion)} → ${colorify.green(versionData.targetVersion)}\n` +
							`📈 Type: ${colorify.blue(versionData.bumpType)}\n` +
							`💡 Reason: New ${versionData.bumpType} version bump to ${versionData.targetVersion}\n`,
					);

					await packageJson.writeVersion(versionData.targetVersion);

					const log = `Bumped: ${packageName}: ${versionData.currentVersion} -> ${versionData.targetVersion} (${versionData.bumpType})`;
					versionCommitMessage += `release: ${EntityTag.toTag(versionData.targetVersion)}\n`;
					versionCommitMessage += `\n${log}`;
					xConsole.log(colorify.green(log));
				} else {
					xConsole.log(
						`✅ ${colorify.green("No version bump needed")}\n` +
							`📦 Package: ${colorify.blue(packageName)}\n` +
							`🔄 Current: ${colorify.yellow(versionData.currentVersion)}\n` +
							"💡 Reason: Versions are the same\n",
					);
				}

				if (commitCount > 0) {
					xConsole.info(`📚 Generating changelog for ${packageName}...`);
					const changelogContent = await changelog.generateMergedChangelog();
					await packageJson.writeChangelog(changelogContent);

					const log = `Changelog generated for ${packageName}`;
					versionCommitMessage += `\n${log}`;
					xConsole.log(colorify.green(log));

					totalCommits += commitCount;
				}
			} catch (error) {
				xConsole.error(colorify.red(`❌ Failed to process package ${packageName}: ${error}`));
				// Continue with other packages
			}
		}

		// Summary
		const summaryLog = "Version Preparation Summary:";
		versionCommitMessage += `\n${summaryLog}`;
		xConsole.log(colorify.green(summaryLog));
		const totalPackagesLog = `📦 Total packages processed: ${packagesToProcess.length}`;
		versionCommitMessage += `\n${totalPackagesLog}`;
		xConsole.log(colorify.green(totalPackagesLog));
		const totalBumpsLog = `🚀 Packages needing version bumps: ${totalBumps}`;
		versionCommitMessage += `\n${totalBumpsLog}`;
		xConsole.log(colorify.green(totalBumpsLog));
		const totalCommitsLog = `📝 Total commits processed: ${totalCommits}`;
		versionCommitMessage += `\n${totalCommitsLog}`;
		xConsole.log(colorify.green(totalCommitsLog));

		if (totalBumps > 0) {
			xConsole.log(
				"\n📝 Next steps:\n" +
					"1. Review the generated changelogs\n" +
					`2. Run ${colorify.blue("bun run version:apply")} to commit and tag the versions\n` +
					`3. Push the changes: ${colorify.blue("git push && git push --tags")}`,
			);
		}

		await Bun.write(".git/COMMIT_EDITMSG", versionCommitMessage);

		// Output packages that need deployment (for CI)
		const packagesToDeploy = results
			.filter((r) => r.shouldBump)
			.map((r) => r.packageName)
			.join(",");

		if (packagesToDeploy) {
			// Set output for CI workflow (GitHub Actions syntax)
			if (process.env.GITHUB_OUTPUT) {
				// New GitHub Actions syntax
				const fs = await import("node:fs");
				await fs.promises.appendFile(
					process.env.GITHUB_OUTPUT,
					`packages-to-deploy=${packagesToDeploy}\n`,
				);
			} else {
				// Fallback for local development
				console.log(`::set-output name=packages-to-deploy::${packagesToDeploy}`);
			}
			// Also log it for visibility
			xConsole.log(`\n🚀 Packages to deploy: ${colorify.blue(packagesToDeploy)}`);
		}

		xConsole.log(colorify.green("\n✅ Version preparation completed!"));
	} catch (error) {
		xConsole.error(colorify.red(`❌ Version preparation failed: ${error}`));
		process.exit(1);
	}
});

if (import.meta.main) {
	versionPrepare.run();
}
