#!/usr/bin/env bun
import { $ } from "bun";
import { validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";

const ciBranchNameConfig = {
	name: "CI Branch Name Checker",
	description: "Validates branch names against predefined patterns for CI/CD",
	usage: "bun run ci:branchname [--verbose] [--force-check]",
	examples: [
		"bun run ci:branchname",
		"bun run ci:branchname --verbose",
		"bun run ci:branchname --force-check",
	],
	options: [
		{
			short: "-f",
			long: "--force-check",
			description: "Force check even in CI environment",
			required: false,
			validator: validators.boolean,
		},
	],
} as const;

export const ciBranchName = createScript(
	ciBranchNameConfig,
	async function main(args, xConsole): Promise<void> {
		// In GitHub Actions, we might not have a proper branch name for pull requests
		// Skip the check if we're in a CI environment and don't have a valid branch name
		const isCI =
			process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

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

			xConsole.log(`🔍 Checking branch name: ${name}`);
			xConsole.log(`📋 Patterns to match: ${Object.keys(patterns).join(", ")}`);

			const isValid = Object.values(patterns).some((pattern) =>
				pattern.test(name),
			);

			xConsole.log("✅ Branch name is valid!");

			return isValid;
		};

		// Skip branch name check in CI if we don't have a valid branch name
		if (isCI && !args["force-check"] && !isValidBranchName(branchName)) {
			xConsole.log("⚠️  Skipping branch name check in CI environment");
			xConsole.log(`Branch name detected: ${branchName}`);
			process.exit(0);
		}

		if (isValidBranchName(branchName)) {
			process.exit(0);
		}

		const showHelp = () => {
			xConsole.error("❌ Invalid branch name!");
			xConsole.error("\nBranch name should follow one of these patterns:");
			for (const prefix of validBranchPrefixes) {
				if (prefix === "release") {
					console.error(`- ${prefix}/1.0.0`);
				} else {
					console.error(`- ${prefix}/your-${prefix}-name`);
				}
			}
			process.exit(1);
		};
		showHelp();
	},
);

if (import.meta.main) {
	ciBranchName();
}
