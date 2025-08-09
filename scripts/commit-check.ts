#!/usr/bin/env bun

import { $ } from "bun";
import { colorify } from "./shell/colorify";
import { parseCommitMessage, validateCommitMessage } from "./shell/commit-utils";
import { createScript, validators } from "./shell/create-scripts";

async function checkCommitMessage(commitMsgFile?: string): Promise<boolean> {
	let commitMessage: string;

	if (commitMsgFile) {
		// Read from file (used by git hooks)
		commitMessage = await Bun.file(commitMsgFile).text();
	} else {
		// Get the latest commit message
		const { stdout } = await $`git log -1 --pretty=%B`;
		commitMessage = stdout.toString().trim();
	}

	if (!commitMessage) {
		console.error(colorify.red("❌ No commit message found"));
		return false;
	}

	console.log(colorify.blue("📝 Checking commit message..."));
	console.log(colorify.gray(`Message: ${commitMessage}`));

	const parsedMessage = parseCommitMessage(commitMessage);
	if (!parsedMessage) {
		console.warn(colorify.yellow("⚠️  Message doesn't follow conventional commit format"));
		console.log(colorify.green("✅ Commit message check passed (non-conventional format allowed)"));
		return true;
	}

	const errors = await validateCommitMessage(parsedMessage);
	if (errors.length > 0) {
		console.error(colorify.red("❌ Commit message validation errors:"));
		for (const error of errors) {
			console.error(colorify.red(`  • ${error}`));
		}
		return false;
	}

	console.log(colorify.green("✅ Commit message validation passed"));
	return true;
}

async function checkBranchName(): Promise<boolean> {
	const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";
	const { stdout: currentBranch } = await $`git branch --show-current`;

	const branchName =
		process.env.GITHUB_HEAD_REF ||
		process.env.GITHUB_REF?.replace("refs/heads/", "") ||
		currentBranch.toString().trim() ||
		"";

	const validBranchPrefixes = [
		"main",
		"release",
		"feature",
		"fix",
		"hotfix",
		"docs",
		"refactor",
		"ci",
		"chore",
		"wip",
		"renovate",
	] as const;

	// Branch naming patterns
	const patterns = validBranchPrefixes.reduce(
		(acc, prefix) => {
			acc[prefix] = new RegExp(`^${prefix}/([a-z0-9.-]+)$`);
			return acc;
		},
		{} as Record<(typeof validBranchPrefixes)[number], RegExp>,
	);

	const isValidBranchName = (name: string): boolean => {
		if (name === "main") {
			return true;
		}

		console.log(colorify.blue(`🔍 Checking branch name: ${name}`));
		return Object.values(patterns).some((pattern) => pattern.test(name));
	};

	// Skip branch name check in CI if we don't have a valid branch name
	if (isCI && !isValidBranchName(branchName)) {
		console.log(colorify.yellow("⚠️  Skipping branch name check in CI environment"));
		console.log(colorify.gray(`Branch name detected: ${branchName}`));
		return true;
	}

	if (isValidBranchName(branchName)) {
		console.log(colorify.green("✅ Branch name validation passed"));
		return true;
	}

	console.error(colorify.red("❌ Invalid branch name!"));
	console.error(colorify.red("\nBranch name should follow one of these patterns:"));
	for (const prefix of validBranchPrefixes) {
		if (prefix === "release") {
			console.error(colorify.gray(`  - ${prefix}/1.0.0`));
		} else {
			console.error(colorify.gray(`  - ${prefix}/your-${prefix}-name`));
		}
	}
	return false;
}

const scriptConfig = {
	name: "Commit Check",
	description: "Validate commit message and branch name according to conventional commit standards",
	usage: "bun run commit-check [options] [commit-msg-file]",
	examples: [
		"bun run commit-check",
		"bun run commit-check .git/COMMIT_EDITMSG",
		"bun run commit-check --skip-branch",
		"bun run commit-check --commit-msg-only",
	],
	options: [
		{
			short: "-c",
			long: "--commit-msg-only",
			description: "Only check commit message, skip branch name validation",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-b",
			long: "--branch-only",
			description: "Only check branch name, skip commit message validation",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-s",
			long: "--skip-branch",
			description: "Skip branch name validation",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-f",
			long: "--commit-msg-file",
			description: "Path to commit message file",
			required: false,
			validator: validators.nonEmpty,
		},
	],
} as const;

export const commitCheck = createScript(scriptConfig, async (args, xConsole) => {
	try {
		let success = true;

		// Get commit message file from args or command line argument
		const commitMsgFile = args["commit-msg-file"] || process.argv[process.argv.length - 1];
		const isCommitMsgFile =
			commitMsgFile && commitMsgFile !== "commit-check.ts" && !commitMsgFile.startsWith("-");

		if (!args["branch-only"]) {
			xConsole.log(colorify.blue("🔍 Running commit message validation..."));
			const commitSuccess = await checkCommitMessage(isCommitMsgFile ? commitMsgFile : undefined);
			success = success && commitSuccess;
		}

		if (!args["commit-msg-only"] && !args["skip-branch"]) {
			xConsole.log(colorify.blue("🔍 Running branch name validation..."));
			const branchSuccess = await checkBranchName();
			success = success && branchSuccess;
		}

		if (success) {
			xConsole.log(colorify.green("✅ All commit checks passed!"));
		} else {
			xConsole.error(colorify.red("❌ Commit checks failed!"));
			process.exit(1);
		}
	} catch (error) {
		xConsole.error(
			colorify.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`),
		);
		process.exit(1);
	}
});

if (import.meta.main) {
	commitCheck();
}
