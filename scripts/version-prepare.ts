#!/usr/bin/env bun

import { ChangelogManager, EntityChangelog, EntityPackageJson, EntityTag } from "./entities";
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
			description: "Package name to version (default: root)",
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
	const packageName = args.package || "root";
	const fromRef = args.from || (await EntityTag.getBaseTagSha()) || "HEAD~10";
	const toRef = args.to || "HEAD";

	xConsole.info(`📦 Preparing version for package: ${packageName}`);
	xConsole.info(`📊 Analyzing commits from ${fromRef} to ${toRef}`);

	const currentVersion = await EntityPackageJson.getVersion(packageName);
	xConsole.info(`🏷️ Current version: ${currentVersion}`);

	const changelogManager = new ChangelogManager(packageName);
	await changelogManager.setRange(fromRef, toRef);
	const snapshot = await changelogManager.snapshot();

	const { bumpType, nextVersion } = snapshot.versionData;
	xConsole.info(`🚀 Bump type: ${bumpType} → ${nextVersion}`);

	xConsole.info("📚 Generating changelog...");
	const newChangelog = await EntityChangelog.generateContent(snapshot.changelogData);
	const existingChangelog = await EntityPackageJson.getChangelog(packageName);
	const mergedChangelog = EntityChangelog.mergeWithExisting(existingChangelog, newChangelog);

	if (args["dry-run"]) {
		xConsole.info(
			`✅ Changelog would be written to: ${colorify.blue(
				EntityPackageJson.getChangelogPath(packageName),
			)}`,
		);
		xConsole.info(mergedChangelog);
	} else {
		await EntityPackageJson.writeChangelog(packageName, mergedChangelog);
		xConsole.info("✅ Changelog generated and written");
	}

	xConsole.info(`📦 Bumping version to ${nextVersion}`);
	await EntityPackageJson.bumpVersion(packageName, nextVersion);

	xConsole.log(colorify.green("✅ Version preparation completed!"));
	xConsole.log(colorify.blue(`📦 Package: ${packageName}`));
	xConsole.log(colorify.blue(`🏷️ Version: ${currentVersion} → ${nextVersion}`));

	const commitCount =
		Object.values(snapshot.changelogData.prCategorizedCommits).flat().length +
		Object.values(snapshot.changelogData.orphanCategorizedCommits).flat().length;
	xConsole.log(colorify.blue(`📝 Commits: ${commitCount}`));
});

if (import.meta.main) {
	versionPrepare();
}
