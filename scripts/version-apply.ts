#!/usr/bin/env bun

import { $ } from "bun";
import { EntityPackageJson, EntityTag } from "./entities";
import { colorify } from "./shell/colorify";
import {
	createScript,
	type InferArgs,
	type ScriptConfig,
	validators,
} from "./shell/create-scripts";

const scriptConfig = {
	name: "Version Apply",
	description: "Create git version tags and commit version changes",
	usage: "bun run version-apply.ts [options]",
	examples: [
		"bun run version-apply.ts",
		"bun run version-apply.ts --message 'Release version 1.2.3'",
		"bun run version-apply.ts --no-push",
	],
	options: [
		{
			short: "-m",
			long: "--message",
			description: "Tag message",
			required: false,
			validator: validators.nonEmpty,
		},
		{
			short: "-n",
			long: "--no-push",
			description: "Don't push tag to remote after creation",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
	],
} as const satisfies ScriptConfig;

export const versionApply = createScript(scriptConfig, async function main(args, xConsole) {
	const version = EntityPackageJson.getVersion("root");

	if (args["dry-run"]) {
		xConsole.log(colorify.yellow("🔍 Dry run mode - would execute:"));
		xConsole.log(colorify.gray(`  • Commit version changes for ${version}`));
		xConsole.log(colorify.gray(`  • Create tag v${version}`));
		if (!args["no-push"]) {
			xConsole.log(colorify.gray("  • Push commit changes to remote"));
			xConsole.log(colorify.gray("  • Push tag to remote"));
		}
		return;
	}

	await commitVersionChanges(xConsole);
	await createTag(version, args, xConsole);
	await pushChanges(args, xConsole);

	xConsole.log(colorify.green("✅ Version apply operation completed successfully!"));
});

async function pushChanges(
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
): Promise<void> {
	if (args["no-push"]) {
		xConsole.log(colorify.yellow("⚠️ Skipping push (--no-push specified)"));
		return;
	}

	if (args["dry-run"]) {
		xConsole.log(colorify.yellow("⚠️ Skipping push (--dry-run specified)"));
		return;
	}

	try {
		xConsole.info("📤 Pushing commit changes to remote...");
		await $`git push --follow-tags`;
		xConsole.log("✅ Pushed commit changes to remote");
	} catch (error) {
		throw new Error(
			`Failed to push commit changes to remote: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

async function createTag(
	version: string,
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
): Promise<void> {
	const tagName = EntityTag.toTag(version);
	xConsole.info(`🏷️ Creating tag: ${tagName}`);

	try {
		await EntityTag.createVersionTag(version, {
			message: args.message || `Release version ${version}`,
			force: false,
			dryRun: false,
		});

		xConsole.log(`✅ Created tag: ${tagName}`);
	} catch (error) {
		throw new Error(
			`Failed to create tag ${tagName}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

async function commitVersionChanges(xConsole: typeof console): Promise<void> {
	xConsole.info("💾 Committing version changes...");

	xConsole.log("📁 Adding all changes...");
	await $`git add .`;
	const statusResult = await $`git status --porcelain`.nothrow();
	const hasChanges = statusResult.text().trim() !== "";

	if (!hasChanges) {
		xConsole.log(colorify.yellow("⚠️ No changes to commit"));
		return;
	}

	const version = EntityPackageJson.getVersion("root");
	const commitMessage = await Bun.file(".git/COMMIT_EDITMSG").text();

	xConsole.log("📝 Commit message:");
	xConsole.log(commitMessage);

	await $`git commit -m "${commitMessage}"`;

	xConsole.log(colorify.green(`✅ Successfully committed version ${version} changes`));
	const commitHash = await $`git rev-parse --short HEAD`.text();
	xConsole.log(`🏷️ Commit hash: ${commitHash.trim()}`);
}

if (import.meta.main) {
	versionApply();
}
