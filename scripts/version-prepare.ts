#!/usr/bin/env bun

import { ChangelogManager, EntityPackageJson } from "./entities";
import { colorify } from "./shell/colorify";
import { createScript, type ScriptConfig, validators } from "./shell/create-scripts";

const scriptConfig = {
	name: "Version Prepare",
	description: "Prepare version bumps and generate changelogs",
	usage: "bun run version-prepare.ts [options]",
	examples: [
		"bun run version-prepare.ts",
		"bun run version-prepare.ts --package root",
		"bun run version-prepare.ts --package root --from v1.0.0 --to HEAD",
	],
	options: [
		{
			short: "-p",
			long: "--package",
			description: "Package name to process",
			required: false,
			validator: validators.nonEmpty,
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
	const packageName = args.package || "root";
	const fromCommit = args.from || "HEAD~1";
	const toCommit = args.to || "HEAD";

	xConsole.info(`🚀 Preparing version for package: ${colorify.blue(packageName)}`);
	xConsole.info(
		`📝 Generating changelog from ${colorify.blue(fromCommit)} to ${colorify.blue(toCommit)}`,
	);

	try {
		const changelogManager = new ChangelogManager(packageName);
		await changelogManager.setRange(fromCommit, toCommit);

		if (!changelogManager.hasCommits()) {
			xConsole.log(colorify.yellow("⚠️ No commits found in the specified range"));
			return;
		}

		const snapshot = await changelogManager.snapshot();
		const { currentVersion, targetVersion, bumpType } = snapshot.versionData;
		const commitCount = changelogManager.getCommitCount();

		xConsole.info(`🏷️ Current version: ${currentVersion}`);
		xConsole.info(`🎯 Target version: ${targetVersion}`);
		xConsole.info(`🚀 Bump type: ${bumpType}`);
		xConsole.info(`📊 Commits: ${commitCount}`);

		// Check if version bump is needed
		if (targetVersion !== currentVersion) {
			xConsole.log(
				`\n🎯 ${colorify.green("Version bump needed!")}\n` +
					`📦 Package: ${colorify.blue(packageName)}\n` +
					`🔄 Current: ${colorify.yellow(currentVersion)} → ${colorify.green(targetVersion)}\n` +
					`📈 Type: ${colorify.blue(bumpType)}\n` +
					`💡 Reason: New ${bumpType} version bump to ${targetVersion}\n`,
			);

			// Actually bump the version in package.json
			await EntityPackageJson.bumpVersion(packageName, targetVersion);
			xConsole.log(`✅ Package.json updated to version ${colorify.green(targetVersion)}`);

			xConsole.log(
				"\n📝 Next steps:\n" +
					"1. Review the generated changelog\n" +
					`2. Run ${colorify.blue("bun run version:apply")} to commit and tag the version\n` +
					`3. Push the changes: ${colorify.blue("git push && git push --tags")}`,
			);
		} else {
			xConsole.log(
				"\n✅ " +
					colorify.green("No version bump needed") +
					"\n" +
					"📦 Package: " +
					colorify.blue(packageName) +
					"\n" +
					"🔄 Current: " +
					colorify.yellow(currentVersion) +
					"\n" +
					"💡 Reason: Versions are the same\n",
			);
		}

		// Always generate changelog if there are commits
		if (commitCount > 0) {
			xConsole.info("📚 Generating changelog...");
			await changelogManager.generateChangelog();
			xConsole.info("✅ Changelog generated and written");
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
