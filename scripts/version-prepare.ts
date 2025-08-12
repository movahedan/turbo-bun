#!/usr/bin/env bun

import { $ } from "bun";
import { ChangelogManager, EntityAffected, EntityPackageJson, EntityTag } from "./entities";
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

	// Get the last version tag, or fall back to first commit if none exists
	const lastVersionTag = await EntityTag.getBaseTagSha();
	const fromRef = args.from || lastVersionTag;
	const toRef = args.to || "HEAD";

	xConsole.info(`📊 Analyzing commits from ${fromRef} to ${toRef}`);

	// Check if there are any new commits since the last version tag
	if (lastVersionTag && lastVersionTag !== fromRef) {
		const commitsSinceLastVersion = await $`git log ${lastVersionTag}..HEAD --oneline`.text();
		if (commitsSinceLastVersion.trim() === "") {
			xConsole.info("✅ No new commits since last version tag, nothing to version");
			return;
		}
		xConsole.info(`📝 Found commits since last version tag ${lastVersionTag}:`);
		xConsole.log(commitsSinceLastVersion.trim());
	} else {
		xConsole.info("ℹ️ No version tags found, analyzing all commits in range");
	}

	// Early exit if we're analyzing the same commit range (no new commits)
	if (fromRef === toRef) {
		xConsole.info("✅ No commit range to analyze, nothing to version");
		return;
	}

	// Check if there are actually any commits in the range
	const commitsInRange = await $`git log ${fromRef}..${toRef} --oneline`.text();
	if (commitsInRange.trim() === "") {
		xConsole.info("✅ No commits found in the specified range, nothing to version");
		return;
	}

	xConsole.info(
		`📝 Found ${commitsInRange.split("\n").filter((line) => line.trim()).length} commits in range`,
	);

	let packages: string[];

	if (packageName) {
		packages = [packageName];
		xConsole.info(`📦 Processing specific package: ${packageName}`);
	} else {
		xConsole.info("🔍 Detecting affected packages...");
		const affectedPackages = await EntityAffected.getAffectedPackages(fromRef, toRef);

		if (affectedPackages.length === 0) {
			xConsole.info("✅ No affected packages found");
			return;
		}

		xConsole.info(
			`🔍 Found ${affectedPackages.length} potentially affected packages, checking for actual commits...`,
		);

		// Filter packages that actually have commits in the range
		const packagesWithCommits: string[] = [];
		for (const pkg of affectedPackages) {
			try {
				const changelogManager = new ChangelogManager(pkg);
				await changelogManager.setRange(fromRef, toRef);

				if (changelogManager.hasCommits()) {
					packagesWithCommits.push(pkg);
					xConsole.log(`  ✅ ${pkg}: ${changelogManager.getCommitCount()} commits`);
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
		targetVersion: string;
		bumpType: string;
		commitCount: number;
		shouldBump: boolean;
		success: boolean;
		error?: string;
	}> = [];

	for (const pkg of packages) {
		xConsole.info(`\n🔍 Processing package: ${pkg}`);

		try {
			const changelogManager = new ChangelogManager(pkg);
			await changelogManager.setRange(fromRef, toRef);
			const snapshot = await changelogManager.snapshot();

			const { currentVersion, targetVersion, bumpType } = snapshot.versionData;
			const commitCount = changelogManager.getCommitCount();

			xConsole.info(`🏷️ Current version: ${currentVersion}`);
			xConsole.info(`🎯 Target version: ${targetVersion}`);
			xConsole.info(`🚀 Bump type: ${bumpType}`);
			xConsole.info(`📊 Commits: ${commitCount}`);

			// Bump version if target is different from current
			if (targetVersion !== currentVersion) {
				xConsole.info(`📦 Bumping version to ${targetVersion}`);
				await EntityPackageJson.bumpVersion(pkg, targetVersion);
			} else {
				xConsole.info("⏭️ No version bump needed: versions are the same");
			}

			// Always generate changelog if there are commits
			if (commitCount > 0) {
				xConsole.info("📚 Generating changelog...");
				await changelogManager.generateChangelog();
				xConsole.info("✅ Changelog generated and written");
			}

			results.push({
				packageName: pkg,
				currentVersion,
				targetVersion,
				bumpType,
				commitCount,
				shouldBump: targetVersion !== currentVersion,
				success: true,
			});

			xConsole.info(`✅ Package ${pkg} completed successfully`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			xConsole.error(`❌ Failed to process package ${pkg}: ${errorMessage}`);

			results.push({
				packageName: pkg,
				currentVersion: "unknown",
				targetVersion: "unknown",
				bumpType: "unknown",
				commitCount: 0,
				shouldBump: false,
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
			const bumpStatus = result.shouldBump ? "→" : "=";
			xConsole.log(
				colorify.blue(
					`  • ${result.packageName}: ${result.currentVersion} ${bumpStatus} ${result.targetVersion} (${result.bumpType}) - ${result.commitCount} commits`,
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
