#!/usr/bin/env bun

import { $ } from "bun";
import { colorify } from "./shell/colorify";
import {
	createScript,
	type InferArgs,
	type ScriptConfig,
	validators,
} from "./shell/create-scripts";
import { repoUtils } from "./shell/repo-utils";

const scriptConfig = {
	name: "Version Tag",
	description: "Create and manage git version tags",
	usage: "bun run version-tag.ts [options]",
	examples: [
		"bun run version-tag.ts --version 1.2.3",
		"bun run version-tag.ts --version 1.2.3 --message 'Release version 1.2.3'",
		"bun run version-tag.ts --list",
		"bun run version-tag.ts --delete v1.2.3",
	],
	options: [
		{
			short: "-v",
			long: "--version",
			description: "Version to tag (without 'v' prefix)",
			required: false,
			validator: validators.nonEmpty,
		},
		{
			short: "-m",
			long: "--message",
			description: "Tag message",
			required: false,
			validator: validators.nonEmpty,
		},
		{
			short: "-l",
			long: "--list",
			description: "List all version tags",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-d",
			long: "--delete",
			description: "Delete a specific tag",
			required: false,
			validator: validators.boolean,
		},
		{
			short: "-p",
			long: "--push",
			description: "Push tag to remote after creation",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-f",
			long: "--force",
			description: "Force tag creation (overwrite existing)",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
	],
} as const satisfies ScriptConfig;

export const versionTag = createScript(scriptConfig, async function main(args, xConsole) {
	if (args.list) {
		await listTags(xConsole);
	} else if (args.delete) {
		if (!args.version) {
			throw new Error("Version is required when deleting a tag");
		}
		await deleteTag(args.version, args, xConsole);
	} else if (args.version) {
		await createTag(args.version, args, xConsole);
	} else {
		// Default: create tag from current root package version
		await createTagFromPackageJson(args, xConsole);
	}

	xConsole.log(colorify.green("✅ Version tag operation completed successfully!"));
});

async function listTags(xConsole: typeof console): Promise<void> {
	xConsole.info("📋 Listing all version tags...");

	const result =
		await $`git tag --list "${repoUtils.tags.prefix}*" --sort=-version:refname`.nothrow();

	if (result.exitCode !== 0) {
		xConsole.warn(colorify.yellow("⚠️ Failed to list tags"));
		return;
	}

	const tags = result.text().trim().split("\n").filter(Boolean);

	if (tags.length === 0) {
		xConsole.log(colorify.yellow("📭 No version tags found"));
		return;
	}

	xConsole.log(`\n🏷️ Found ${tags.length} version tags:`);
	for (const tag of tags) {
		const tagInfo = await repoUtils.tags.info(tag);
		xConsole.log(`  ${tag} - ${tagInfo.date} - ${tagInfo.message}`);
	}
}

async function deleteTag(
	tagName: string,
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
): Promise<void> {
	xConsole.info(`🗑️ Deleting tag: ${tagName}`);

	// Ensure tag has proper prefix
	const fullTagName = tagName;

	const exists = await repoUtils.tags.exists(fullTagName);
	if (!exists) {
		throw new Error(`Tag ${fullTagName} does not exist`);
	}

	if (args["dry-run"]) {
		xConsole.log(colorify.yellow(`🔍 Dry run: Would delete tag ${fullTagName}`));
		return;
	}

	await $`git tag -d ${fullTagName}`;
	xConsole.log(`✅ Deleted local tag: ${fullTagName}`);

	try {
		await $`git push origin :refs/tags/${fullTagName}`;
		xConsole.log(`✅ Deleted remote tag: ${fullTagName}`);
	} catch {
		xConsole.warn(colorify.yellow(`⚠️ Remote tag ${fullTagName} may not exist or failed to delete`));
	}
}

async function createTag(
	version: string,
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
): Promise<void> {
	const tagName = repoUtils.tags.toTag(version);
	const tagMessage = args.message || `Release version ${version} (auto-generated)`;

	xConsole.info(`🏷️ Creating tag: ${tagName}`);

	if (!args.force) {
		const exists = await repoUtils.tags.exists(tagName);
		if (exists) {
			throw new Error(`Tag ${tagName} already exists. Use --force to overwrite.`);
		}
	}

	if (args["dry-run"]) {
		xConsole.log(
			colorify.yellow(`🔍 Dry run: Would create tag ${tagName} with message "${tagMessage}"`),
		);
		if (args.push) {
			xConsole.log(colorify.yellow("🔍 Dry run: Would push tag to remote"));
		}
		return;
	}

	const forceFlag = args.force ? "-f" : "";
	await $`git tag ${forceFlag} -a ${tagName} -m "${tagMessage}"`;
	xConsole.log(`✅ Created tag: ${tagName}`);

	if (args.push) {
		await pushTag(tagName, xConsole);
	}
}

async function createTagFromPackageJson(
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
): Promise<void> {
	xConsole.info("📦 Creating tag from package.json version...");
	const packageJson = await Bun.file("package.json").json();
	const version = packageJson.version;

	if (!version) {
		throw new Error("No version found in package.json");
	}

	xConsole.log(`📦 Found version: ${version}`);
	await createTag(version, args, xConsole);
}

async function pushTag(tagName: string, xConsole: typeof console): Promise<void> {
	xConsole.info(`🚀 Pushing tag to remote: ${tagName}`);

	try {
		await $`git push origin ${tagName}`;
		xConsole.log(`✅ Pushed tag to remote: ${tagName}`);
	} catch (error) {
		throw new Error(
			`Failed to push tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

if (import.meta.main) {
	versionTag();
}
