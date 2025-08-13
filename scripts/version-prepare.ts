#!/usr/bin/env bun

import { ChangelogManager, EntityPackageJson, EntityWorkspace } from "./entities";
import { colorify } from "./shell/colorify";
import { createScript, type ScriptConfig, validators } from "./shell/create-scripts";

const scriptConfig = {
	name: "Version Prepare",
	description: "Prepare version bumps and generate changelogs for packages",
	usage: "bun run version-prepare.ts [options]",
	examples: [
		"bun run version-prepare.ts",
		"bun run version-prepare.ts --package root",
		"bun run version-prepare.ts --all",
		"bun run version-prepare.ts --from v1.0.0 --to HEAD",
	],
	options: [
		{
			short: "-p",
			long: "--package",
			description: "Package name to process (default: all packages)",
			required: false,
			validator: validators.nonEmpty,
		},
		{
			short: "-a",
			long: "--all",
			description: "Process all packages in workspace",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-f",
			long: "--from",
			description: "Start commit/tag for changelog generation",
			required: false,
			validator: validators.nonEmpty,
		},
		{
			short: "-t",
			long: "--to",
			description: "End commit/tag for changelog generation (default: HEAD)",
			required: false,
			validator: validators.nonEmpty,
		},
	],
} as const satisfies ScriptConfig;

export const versionPrepare = createScript(scriptConfig, async function main(args, xConsole) {
	const fromCommit = args.from || "HEAD~1";
	const toCommit = args.to || "HEAD";
	const processAll = args.all || !args.package;

	xConsole.info("🚀 Starting version preparation");
	xConsole.info(
		`📝 Generating changelog from ${colorify.blue(fromCommit)} to ${colorify.blue(toCommit)}`,
	);

	try {
		let packagesToProcess: string[];

		if (processAll) {
			xConsole.info("📦 Processing all packages in workspace...");
			packagesToProcess = await EntityWorkspace.getAllPackages();
			xConsole.info(`Found ${packagesToProcess.length} packages: ${packagesToProcess.join(", ")}`);
		} else {
			const packageName = args.package;
			if (!packageName) {
				throw new Error("Package name is required when not processing all packages");
			}
			packagesToProcess = [packageName];
			xConsole.info(`📦 Processing single package: ${colorify.blue(packageName)}`);
		}

		const results: Array<{
			packageName: string;
			needsBump: boolean;
			currentVersion: string;
			targetVersion: string;
			bumpType: string;
			commitCount: number;
		}> = [];

		let totalBumps = 0;
		let totalCommits = 0;

		for (const packageName of packagesToProcess) {
			xConsole.info(`\n🔍 Processing package: ${colorify.blue(packageName)}`);

			try {
				const changelogManager = new ChangelogManager(packageName);
				await changelogManager.setRange(fromCommit, toCommit);

				if (!changelogManager.hasCommits()) {
					xConsole.log(colorify.yellow(`⚠️ No commits found for ${packageName}`));
					results.push({
						packageName,
						needsBump: false,
						currentVersion: EntityPackageJson.getVersion(packageName),
						targetVersion: EntityPackageJson.getVersion(packageName),
						bumpType: "none",
						commitCount: 0,
					});
					continue;
				}

				const snapshot = await changelogManager.snapshot();
				const { currentVersion, targetVersion, bumpType } = snapshot.versionData;
				const commitCount = changelogManager.getCommitCount();
				const needsBump = targetVersion !== currentVersion;

				results.push({
					packageName,
					needsBump,
					currentVersion,
					targetVersion,
					bumpType,
					commitCount,
				});

				if (needsBump) {
					totalBumps++;
					xConsole.log(
						`🎯 ${colorify.green("Version bump needed!")}\n` +
							`📦 Package: ${colorify.blue(packageName)}\n` +
							`🔄 Current: ${colorify.yellow(currentVersion)} → ${colorify.green(targetVersion)}\n` +
							`📈 Type: ${colorify.blue(bumpType)}\n` +
							`💡 Reason: New ${bumpType} version bump to ${targetVersion}\n`,
					);

					// Actually bump the version in package.json
					await EntityPackageJson.bumpVersion(packageName, targetVersion);
					xConsole.log(`✅ Package.json updated to version ${colorify.green(targetVersion)}`);
				} else {
					xConsole.log(
						`✅ ${colorify.green("No version bump needed")}\n` +
							`📦 Package: ${colorify.blue(packageName)}\n` +
							`🔄 Current: ${colorify.yellow(currentVersion)}\n` +
							"💡 Reason: Versions are the same\n",
					);
				}

				// Always generate changelog if there are commits
				if (commitCount > 0) {
					xConsole.info(`📚 Generating changelog for ${packageName}...`);
					await changelogManager.generateChangelog();
					xConsole.info(`✅ Changelog generated for ${packageName}`);
					totalCommits += commitCount;
				}
			} catch (error) {
				xConsole.error(colorify.red(`❌ Failed to process package ${packageName}: ${error}`));
				// Continue with other packages
			}
		}

		// Summary
		xConsole.log(colorify.green("\n📊 Version Preparation Summary:"));
		xConsole.log(`📦 Total packages processed: ${packagesToProcess.length}`);
		xConsole.log(`🚀 Packages needing version bumps: ${totalBumps}`);
		xConsole.log(`📝 Total commits processed: ${totalCommits}`);

		if (totalBumps > 0) {
			xConsole.log(
				"\n📝 Next steps:\n" +
					"1. Review the generated changelogs\n" +
					`2. Run ${colorify.blue("bun run version:apply")} to commit and tag the versions\n` +
					`3. Push the changes: ${colorify.blue("git push && git push --tags")}`,
			);
		}

		// Output packages that need deployment (for CI)
		const packagesToDeploy = results
			.filter((r) => r.needsBump)
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
	versionPrepare();
}
