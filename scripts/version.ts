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
import { versionBump } from "./version-bump";
import { versionChangelog } from "./version-changelog";
import { versionCommit } from "./version-commit";
import { versionTag } from "./version-tag";

const scriptConfig = {
	name: "Version Flow",
	description: "Complete versioning flow: analyze, bump, changelog, tag, and commit",
	usage: "bun run version-flow.ts [options]",
	examples: [
		"bun run version-flow.ts",
		"bun run version-flow.ts --dry-run",
		"bun run version-flow.ts --type minor",
		"bun run version-flow.ts --skip-changelog",
	],
	options: [
		{
			short: "-t",
			long: "--type",
			description: "Force version bump type (major, minor, patch)",
			required: false,
			validator: (value): value is "major" | "minor" | "patch" =>
				["major", "minor", "patch"].includes(value),
		},

		{
			short: "-s",
			long: "--skip-changelog",
			description: "Skip changelog generation",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-n",
			long: "--skip-tag",
			description: "Skip git tagging",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-p",
			long: "--push",
			description: "Push changes and tags to remote",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-o",
			long: "--attach-to-output-id",
			description: "Attach packages to deploy to the github job output",
			required: false,
			validator: validators.nonEmpty,
		},
	],
} as const satisfies ScriptConfig;

export const versionFlow = createScript(scriptConfig, async function main(args, xConsole) {
	xConsole.info("🚀 Starting complete version flow...");
	const defaultArgs = {
		"dry-run": args["dry-run"],
		verbose: args.verbose,
		quiet: args.quiet,
	};

	await configureGitAuth(args, xConsole);

	const from = await repoUtils.tags.baseTagSha();
	const affected = await repoUtils.affected(from).packages();
	if (affected.length === 0) {
		xConsole.log(colorify.yellow("⚠️ No affected packages detected"));
		return;
	}

	xConsole.log(`📦 Found ${affected.length} affected packages: ${affected.join(", ")}`);

	xConsole.info("\n🔢 Bumping versions...");
	await versionBump({ ...defaultArgs, type: args.type });

	if (!args["skip-changelog"]) {
		xConsole.info("\n📋 Generating changelogs...");
		await versionChangelog({ ...defaultArgs });
	}

	xConsole.info("\n💾 Committing changes...");
	await versionCommit({ ...defaultArgs, "add-all": true });

	if (!args["skip-tag"]) {
		xConsole.info("\n🏷️ Creating version tag...");
		await versionTag({ ...defaultArgs, push: args.push });
	}

	if (args.push) {
		xConsole.info("\n🚀 Pushing changes...");
		await pushChanges(args, xConsole);
	}

	if (args["attach-to-output-id"]) {
		await attachToGitHubOutput(args, xConsole, affected);
	}

	const newVersion = await repoUtils.packageJson("root").version();
	xConsole.log(colorify.green("\n🎉 Version flow completed successfully!"));
	xConsole.log("\n📊 Summary:");
	xConsole.log(`  🏷️ New version: v${newVersion}`);
	xConsole.log(`  📦 Affected packages: ${affected.join(", ")}`);
	xConsole.log("\n💡 Tip: You can now deploy the affected packages");
});

async function configureGitAuth(
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
): Promise<void> {
	xConsole.log("🔍 Configuring Git authentication...");

	if (args["dry-run"]) {
		xConsole.log("-> 🔍 Dry run, skipping git config");
		return;
	}

	if (!process.env.GITHUB_ACTIONS) {
		xConsole.log("-> 🔍 Running locally, skip git config");
		return;
	}

	if (!process.env.GITHUB_REPOSITORY) {
		xConsole.log("-> ⚠️ GITHUB_REPOSITORY not found");
		return;
	}

	if (!process.env.GITHUB_TOKEN) {
		xConsole.log("-> ⚠️ GITHUB_TOKEN not found");
		return;
	}

	xConsole.log("-> 🔐 Configuring Git authentication...");
	await $`git config user.name "github-actions[bot]"`;
	await $`git config user.email "github-actions[bot]@users.noreply.github.com"`;
	await $`git remote set-url origin https://x-access-token:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;

	const actualRemoteUrl = await $`git remote get-url origin`.text();
	const maskedUrl = actualRemoteUrl.replace(/https:\/\/x-access-token:[^@]+@/, "***@");
	xConsole.log(`-> 🔗 Git authentication configured, remote URL: ${maskedUrl}`);
}

async function pushChanges(
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
): Promise<void> {
	const aheadCount = await $`git rev-list --count origin/main..HEAD`.nothrow().text();
	const commitsAhead = Number.parseInt(aheadCount.trim() || "0");

	if (commitsAhead === 0) {
		xConsole.log("ℹ️ No commits to push");
		return;
	}

	if (args["dry-run"]) {
		xConsole.log(colorify.yellow(`🔍 Dry run: Would push ${commitsAhead} commits to remote`));
		return;
	}

	await $`git push origin main`;
	xConsole.log(`✅ Changes pushed ${commitsAhead} commits to remote`);
}

async function attachToGitHubOutput(
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
	affected: string[],
): Promise<void> {
	const outputId = args["attach-to-output-id"];
	xConsole.log(`📱 Attaching affected packages to GitHub output ${outputId}`);

	const affectedPackagesString = JSON.stringify(affected);
	const output = `${outputId}<<EOF\n${affectedPackagesString}\nEOF\n`;

	if (args["dry-run"]) {
		xConsole.log(colorify.yellow(`🔍 Dry run: Would attach to GitHub output ${outputId}`));
		xConsole.log(`-> ${outputId}=${affectedPackagesString}`);
		return;
	}

	if (!process.env.GITHUB_OUTPUT) {
		xConsole.log("-> ⚠️ GITHUB_OUTPUT not found");
		return;
	}

	await Bun.write(process.env.GITHUB_OUTPUT, output);
	xConsole.log(`-> 📱 Attached: ${outputId}=${affectedPackagesString}`);
}

if (import.meta.main) {
	versionFlow();
}
