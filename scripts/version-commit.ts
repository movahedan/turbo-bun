#!/usr/bin/env bun
import { readdir } from "node:fs/promises";
import { $ } from "bun";
import { getAffectedPackages } from "./scripting-utils/affected";
import { parseChangeset, type VersionPackages } from "./scripting-utils/changeset-parser";
import { createScript, type ScriptConfig } from "./scripting-utils/create-scripts";

// Versioning -------------------------------------------------------------------------------------
const VERSION_TAG_PREFIX = "v";
async function getLatestVersionTag(): Promise<string | undefined> {
	const tags = await $`git tag --list "${VERSION_TAG_PREFIX}*" --sort=-version:refname`
		.nothrow()
		.text();
	const tagList = tags?.split("\n").filter(Boolean) ?? [];

	return tagList[0];
}
async function getLastVersionTagSha(): Promise<string> {
	try {
		const latestTag = await getLatestVersionTag();
		if (!latestTag) throw new Error("No version tags found");
		const commitSha = await $`git rev-list -n 1 ${latestTag}`.text();
		return commitSha.trim();
	} catch (_error) {
		const initialCommit = await $`git rev-list --max-parents=0 HEAD`.text();
		return initialCommit.trim();
	}
}
async function tagVersion(version: string): Promise<string> {
	const tagName = `${VERSION_TAG_PREFIX}${version}`;
	const existingTag = await $`git tag --list "${tagName}"`.nothrow().text();
	if (existingTag.trim()) {
		throw new Error(`Tag ${tagName} already exists`);
	}
	await $`git tag -a ${tagName} -m "Release version ${version} (auto-generated)"`;
	return tagName;
}

// Changesets -------------------------------------------------------------------------------------
async function readChangesets(): Promise<VersionPackages[]> {
	const files = await readdir(".changeset");
	const changesets = files.filter((file) => file.endsWith(".md") && file !== "README.md");

	const results = await Promise.all(
		changesets.map(async (filename) => (await parseChangeset(filename)).packages),
	);

	return results;
}
async function createChangeset(packages: VersionPackages, rootVersionTag: string): Promise<string> {
	const changesetContent = Object.entries(packages).reduce((accumulator, current, index, array) => {
		console.log({ current });
		const isFirst = index === 0;
		const firstLineSegment = isFirst ? "---\n" : "";
		const versionTag = `${VERSION_TAG_PREFIX}${rootVersionTag}`;
		const summary = `Automated version bump for ${current[0]} and other affected packages on root version tag: ${versionTag}.`;

		const isLast = index === array.length - 1;
		const lastLineSegment = isLast ? `---\n\n${summary}` : "";

		const [packageName, versionType] = current;
		const newPackageSegment = `"${packageName}": ${versionType}\n`;

		return `${accumulator}${firstLineSegment}${newPackageSegment}${lastLineSegment}`;
	}, "");

	const timestamp = Date.now();
	const filename = `auto-${timestamp}.md`;
	await Bun.write(`.changeset/${filename}`, changesetContent);
	return filename;
}

// Version Commit ---------------------------------------------------------------------------------
export const versionCommit = createScript(
	{
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
	} as const satisfies ScriptConfig,
	async function main({ "dry-run": dryRun, "attach-to-output-id": outputId }, xConsole) {
		xConsole.info("🚀 Analyzing deployment packages for production...");

		// Configure Git authentication ----------------------------------------------------------------
		xConsole.log("🔍 Configuring Git authentication...");
		if (dryRun) xConsole.log("-> 🔍 Dry run, skipping git config");
		else if (!process.env.GITHUB_ACTIONS) xConsole.log("-> 🔍 Running locally, skip git config");
		else if (!process.env.GITHUB_REPOSITORY) xConsole.log("-> ⚠️ GITHUB_REPOSITORY not found");
		else if (!process.env.GITHUB_TOKEN) xConsole.log("-> ⚠️ GITHUB_TOKEN not found");
		else {
			xConsole.log("-> 🔐 Configuring Git authentication...");
			await $`git config user.name "github-actions[bot]"`.text();
			await $`git config user.email "github-actions[bot]@users.noreply.github.com"`.text();
			await $`git remote set-url origin https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`.text();

			const actualRemoteUrl = await $`git remote get-url origin`.text(); // Verify the remote URL
			const maskedUrl = actualRemoteUrl.replace(/https:\/\/x-access-token:[^@]+@/, "***@");
			xConsole.log(`-> 🔗 Git authentication configured, remote URL: ${maskedUrl}`);
		}

		// Get affected packages ----------------------------------------------------------------------
		const lastVersionTagSha = await getLastVersionTagSha();
		xConsole.log(`🔍 Analyzing affected packages by last version tag SHA: ${lastVersionTagSha}`);
		const affectedPackages = await getAffectedPackages(lastVersionTagSha);
		if (affectedPackages.length === 0) {
			xConsole.log("-> ⚠️ No affected packages detected");
			return;
		}
		xConsole.log(`-> 📦 Found ${affectedPackages.length} affected packages: ${affectedPackages}`);

		xConsole.log("🔍 Reading existing changesets...");
		const changesets = await readChangesets();
		xConsole.log(`-> 📋 Found ${changesets.length} existing changesets`);

		xConsole.log("🤖 Automatic version bump for affected packages...");
		const packagesToAdd: VersionPackages = affectedPackages.reduce((acc, pkg) => {
			const hasChangeset = changesets.some((packages) => packages[pkg]);
			if (!hasChangeset) acc[pkg] = "patch";
			return acc;
		}, {} as VersionPackages);

		// Version bump -------------------------------------------------------------------------------
		const packageJson = await Bun.file("package.json").json();
		const [currentMajor, currentMinor, currentPatch] = packageJson.version.split(".").map(Number);
		const newRootVersion = `${currentMajor}.${currentMinor}.${currentPatch + 1}`;
		packageJson.version = newRootVersion;

		await Bun.write("package.json", JSON.stringify(packageJson, null, 2));
		await $`bun biome check --write --no-errors-on-unmatched package.json`.text();
		await $`git add package.json`.text();

		if (Object.keys(packagesToAdd).length === 0) {
			xConsole.log("-> ✅ All changed packages already have changesets");
		} else {
			const filename = await createChangeset(packagesToAdd, newRootVersion);
			xConsole.log(`-> ✅ Created ./changeset/${filename} for: ${Object.keys(packagesToAdd)}`);
		}

		xConsole.log("📝 Generating and committing changesets (.changeset/config.json)...");
		await $`bunx @changesets/cli version`.text();

		// Tag version ---------------------------------------------------------------------------------
		const tagName = await tagVersion(newRootVersion);
		xConsole.log(`🏷️ Created version tag: ${tagName}`);
		if (!dryRun) {
			await $`git push origin ${tagName}`;
			xConsole.log("-> ✅ Version tag pushed to remote");
		}

		xConsole.log("🔍 Checking for commits to push...");
		const aheadCount = await $`git rev-list --count origin/main..HEAD`.text();
		if (Number.parseInt(aheadCount.trim()) === 0) xConsole.log("-> ⚠️ No commits to push");
		else if (dryRun) xConsole.log("-> 🔍 Dry run, skipping push");
		else {
			await $`git push origin main`.text();
			xConsole.log("-> 🚀 Successfully pushed version changes to main branch...");
		}

		// Attach affected packages to github output --------------------------------------------------
		if (outputId) {
			xConsole.log(`📱 Attaching affected packages to github output ${outputId}`);
			const affectedPackagesString = JSON.stringify(affectedPackages);
			const output = `${outputId}<<EOF\n${JSON.stringify(affectedPackages)}\nEOF\n`;

			if (dryRun) xConsole.log("-> 🔍 Dry run, skipping attachment");
			else if (!process.env.GITHUB_OUTPUT) xConsole.log("-> ⚠️ GITHUB_OUTPUT not found");
			else await Bun.write(process.env.GITHUB_OUTPUT, output);

			xConsole.log(`\n-> 📱 Attached: ${outputId}=${affectedPackagesString}\n`);
		}

		xConsole.log("🎉 Version commit complete, you can now deploy the packages");
		xConsole.log(
			`📱 Git tag: ${tagName} for versioning affected packages: ${affectedPackages.join(", ")}`,
		);
		xConsole.log(
			"💡 Tip: You can also create changesets manually with 'bun run version:add' and run 'bun run version:commit' again.",
		);
	},
);

if (import.meta.main) {
	versionCommit();
}
