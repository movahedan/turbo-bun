#!/usr/bin/env bun
import { validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";
import { git } from "./utils/git-command";

const checkBranchNameConfig = {
	name: "Branch Name Checker",
	description: "Validates branch names against predefined patterns",
	usage: "bun run check-branch-name [--verbose] [--force-check]",
	examples: [
		"bun run check-branch-name",
		"bun run check-branch-name --verbose",
		"bun run check-branch-name --force-check",
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

export const checkBranchName = createScript(
	checkBranchNameConfig,
	async function main(args, vConsole): Promise<void> {
		// In GitHub Actions, we might not have a proper branch name for pull requests
		// Skip the check if we're in a CI environment and don't have a valid branch name
		const isCI =
			process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

		const branchName =
			process.env.GITHUB_HEAD_REF ||
			process.env.GITHUB_REF?.replace("refs/heads/", "") ||
			git(["branch", "--show-current"]).stdout.trim() ||
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

			vConsole.log(`🔍 Checking branch name: ${name}`);
			vConsole.log(`📋 Patterns to match: ${Object.keys(patterns).join(", ")}`);

			const isValid = Object.values(patterns).some((pattern) =>
				pattern.test(name),
			);

			vConsole.log("✅ Branch name is valid!");

			return isValid;
		};

		// Skip branch name check in CI if we don't have a valid branch name
		if (isCI && !args["force-check"] && !isValidBranchName(branchName)) {
			vConsole.log("⚠️  Skipping branch name check in CI environment");
			vConsole.log(`Branch name detected: ${branchName}`);
			process.exit(0);
		}

		if (isValidBranchName(branchName)) {
			process.exit(0);
		}

		const showHelp = () => {
			vConsole.error("❌ Invalid branch name!");
			vConsole.error("\nBranch name should follow one of these patterns:");
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
	checkBranchName();
}
