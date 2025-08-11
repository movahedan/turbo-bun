#!/usr/bin/env bun

import {
	ChangelogManager,
	EntityAffected,
	EntityChangelog,
	EntityPackageJson,
	EntityTag,
} from "./entities";
import { colorify } from "./shell/colorify";
import { createScript, type ScriptConfig, validators } from "./shell/create-scripts";

const scriptConfig = {
	name: "Version Prepare",
	description: "Prepare version bump and generate changelog",
	usage: "bun run version-prepare.ts [options]",
	examples: [
		"bun run version-prepare.ts",
		"bun run version-prepare.ts --package root",
		"bun run version-prepare.ts --package @repo/ui --from v1.0.0",
		"bun run version-prepare.ts --no-changelog",
	],
	options: [
		{
			short: "-p",
			long: "--package",
			description: "Package name to version (default: all affected packages)",
			required: false,
			validator: validators.nonEmpty,
		},
		{
			short: "-f",
			long: "--from",
			description: "From version/tag (default: last tag)",
			required: false,
			validator: validators.nonEmpty,
		},
		{
			short: "-t",
			long: "--to",
			description: "To version/tag (default: HEAD)",
			required: false,
			validator: validators.nonEmpty,
		},
	],
} as const satisfies ScriptConfig;

export const versionPrepare = createScript(scriptConfig, async function main(args, xConsole) {
	const packageName = args.package;
	const fromRef = args.from || (await EntityTag.getBaseTagSha()) || "HEAD~10";
	const toRef = args.to || "HEAD";

	xConsole.info(`📊 Analyzing commits from ${fromRef} to ${toRef}`);

	let packages: string[];

	if (packageName) {
		packages = [packageName];
		xConsole.info(`📦 Processing specific package: ${packageName}`);
	} else {
		xConsole.info("🔍 Detecting affected packages...");
		const allAffectedPackages = await EntityAffected.getAffectedPackages(fromRef, toRef);

		if (allAffectedPackages.length === 0) {
			xConsole.info("✅ No affected packages found");
			return;
		}

		xConsole.info(
			`🔍 Found ${allAffectedPackages.length} potentially affected packages, checking for actual commits...`,
		);

		// Filter packages that actually have commits in the range
		const packagesWithCommits: string[] = [];
		for (const pkg of allAffectedPackages) {
			try {
				const changelogManager = new ChangelogManager(pkg);
				await changelogManager.setRange(fromRef, toRef);
				const snapshot = await changelogManager.snapshot();

				const commitCount =
					Object.values(snapshot.changelogData.prCategorizedCommits).flat().length +
					Object.values(snapshot.changelogData.orphanCategorizedCommits).flat().length;

				if (commitCount > 0) {
					packagesWithCommits.push(pkg);
					xConsole.log(`  ✅ ${pkg}: ${commitCount} commits`);
				} else {
					xConsole.log(`  ⏭️ ${pkg}: no commits, skipping`);
				}
			} catch (error) {
				xConsole.warn(`  ⚠️ ${pkg}: error checking commits, skipping`, error);
			}
		}

		packages = packagesWithCommits;

		if (packages.length === 0) {
			xConsole.info("✅ No packages with commits found in the specified range");
			return;
		}

		xConsole.info(`📦 Found ${packages.length} packages with commits: ${packages.join(", ")}`);
	}

	const results: Array<{
		packageName: string;
		currentVersion: string;
		nextVersion: string;
		bumpType: string;
		commitCount: number;
		success: boolean;
		error?: string;
	}> = [];

	for (const pkg of packages) {
		try {
			xConsole.info(`\n📦 Processing package: ${pkg}`);

			const currentVersion = await EntityPackageJson.getVersion(pkg);
			xConsole.info(`🏷️ Current version: ${currentVersion}`);

			const changelogManager = new ChangelogManager(pkg);
			await changelogManager.setRange(fromRef, toRef);
			const snapshot = await changelogManager.snapshot();

			const { bumpType, nextVersion } = snapshot.versionData;
			xConsole.info(`🚀 Bump type: ${bumpType} → ${nextVersion}`);

			xConsole.info("📚 Generating changelog...");
			const newChangelog = await EntityChangelog.generateContent(snapshot.changelogData);
			const existingChangelog = await EntityPackageJson.getChangelog(pkg);
			const mergedChangelog = EntityChangelog.mergeWithExisting(existingChangelog, newChangelog);

			if (args["dry-run"]) {
				xConsole.info(
					`✅ Changelog would be written to: ${colorify.blue(
						EntityPackageJson.getChangelogPath(pkg),
					)}`,
				);
				xConsole.info(mergedChangelog);
			} else {
				await EntityPackageJson.writeChangelog(pkg, mergedChangelog);
				xConsole.info("✅ Changelog generated and written");
			}

			xConsole.info(`📦 Bumping version to ${nextVersion}`);
			await EntityPackageJson.bumpVersion(pkg, nextVersion);

			const commitCount =
				Object.values(snapshot.changelogData.prCategorizedCommits).flat().length +
				Object.values(snapshot.changelogData.orphanCategorizedCommits).flat().length;

			results.push({
				packageName: pkg,
				currentVersion,
				nextVersion,
				bumpType,
				commitCount,
				success: true,
			});

			xConsole.info(`✅ Package ${pkg} completed successfully`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			xConsole.error(`❌ Failed to process package ${pkg}: ${errorMessage}`);

			results.push({
				packageName: pkg,
				currentVersion: "unknown",
				nextVersion: "unknown",
				bumpType: "unknown",
				commitCount: 0,
				success: false,
				error: errorMessage,
			});
		}
	}

	xConsole.log(`\n${colorify.green("🎯 Version preparation summary:")}`);
	xConsole.log(colorify.blue(`📦 Total packages processed: ${results.length}`));

	const successfulResults = results.filter((r) => r.success);
	const failedResults = results.filter((r) => !r.success);

	if (successfulResults.length > 0) {
		xConsole.log(colorify.green(`✅ Successful: ${successfulResults.length}`));
		for (const result of successfulResults) {
			xConsole.log(
				colorify.blue(
					`  • ${result.packageName}: ${result.currentVersion} → ${result.nextVersion} (${result.bumpType}) - ${result.commitCount} commits`,
				),
			);
		}
	}

	if (failedResults.length > 0) {
		xConsole.log(colorify.red(`❌ Failed: ${failedResults.length}`));
		for (const result of failedResults) {
			xConsole.log(colorify.red(`  • ${result.packageName}: ${result.error}`));
		}
	}

	if (successfulResults.length > 0) {
		xConsole.log(colorify.green("\n✅ Version preparation completed!"));
	} else {
		xConsole.log(colorify.red("\n❌ No packages were successfully processed"));
		process.exit(1);
	}
});

if (import.meta.main) {
	versionPrepare();
}
