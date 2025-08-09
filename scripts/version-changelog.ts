#!/usr/bin/env bun

import { colorify } from "./shell/colorify";
import { createScript, type ScriptConfig, validators } from "./shell/create-scripts";
import { repoUtils } from "./shell/repo-utils";
import { VersionUtils } from "./shell/version-utils";

const scriptConfig = {
	name: "Version Changelog",
	description: "Generate changelogs for packages based on git commits",
	usage: "bun run version-changelog.ts [options]",
	examples: [
		"bun run version-changelog.ts --package admin",
		"bun run version-changelog.ts --package @repo/ui --from v1.0.0 --to HEAD",
		"bun run version-changelog.ts --all",
	],
	options: [
		{
			short: "-p",
			long: "--package",
			description: "Generate changelog for specific package",
			required: false,
			validator: validators.nonEmpty,
		},
		{
			short: "-a",
			long: "--all",
			description: "Generate changelogs for all packages",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-f",
			long: "--from",
			description: "Start from specific version/tag - defaults to base tag",
			required: false,
			validator: validators.nonEmpty,
		},
		{
			short: "-t",
			long: "--to",
			description: "End at specific version/tag - defaults to the current version in package.json",
			required: false,
			defaultValue: "HEAD",
			validator: validators.nonEmpty,
		},
	],
} as const satisfies ScriptConfig;

export const versionChangelog = createScript(scriptConfig, async function main(args, xConsole) {
	xConsole.info("📋 Generating changelogs...");

	if (args.all) {
		const from = args.from || (await repoUtils.tags.firstCommit());
		const packages = await repoUtils.affected(from).packages(args.to);
		xConsole.log(`📦 Found ${packages.length} packages: ${packages.join(", ")}`);

		for (const pkg of packages) {
			xConsole.log(`\n📝 Generating changelog for ${pkg}...`);
			await generatePackageChangelog(
				pkg,
				args.from || "",
				args.to || "",
				xConsole,
				args["dry-run"],
			);
		}
	} else if (args.package) {
		await generatePackageChangelog(
			args.package,
			args.from || "",
			args.to || "",
			xConsole,
			args["dry-run"],
		);
	} else {
		// Default to root package
		await generatePackageChangelog(
			"root",
			args.from || "",
			args.to || "",
			xConsole,
			args["dry-run"],
		);
	}

	xConsole.log(colorify.green("✅ Changelog generation completed successfully!"));
});

const { repository } = await repoUtils.packageJson("root").get();
const repoUrl = typeof repository === "string" ? repository : repository?.url;
async function generatePackageChangelog(
	packageName: string,
	from: string,
	to: string,
	xConsole: typeof console,
	dryRun = false,
): Promise<void> {
	const fromSha = await repoUtils.tags.baseTagSha(from);
	const version = to || (await repoUtils.packageJson(packageName).version());
	const versionTag = to || repoUtils.tags.toTag(version);

	xConsole.log(`📅 Generating changelog from ${fromSha} to ${versionTag}`);
	const versionUtils = new VersionUtils();
	const commits = await versionUtils.getCommitsForPackage(packageName, fromSha, versionTag, true);

	if (commits.length === 0) {
		xConsole.log(colorify.yellow(`⚠️ No commits found for ${packageName}`));
		return;
	}
	xConsole.log(`📊 Found ${commits.length} commits`);

	const entries = commits.map((commit) => versionUtils.parseCommitToChangelogEntry(commit));
	const changelog = await versionUtils.generateChangelogContent(
		entries,
		version,
		repoUrl,
		packageName,
	);
	if (!dryRun) {
		const outputPath = await repoUtils
			.packageJson(packageName)
			.writeChangelog(changelog, fromSha, versionTag);
		xConsole.log(colorify.green(`✅ Changelog written to ${outputPath}`));
	} else {
		xConsole.log(
			`${colorify.yellow("🔍 Dry run - would have been written to:")} ${colorify.cyan(packageName)}`,
		);
		xConsole.log(changelog);
	}
}

if (import.meta.main) {
	versionChangelog();
}
