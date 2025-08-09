#!/usr/bin/env bun

import { colorify } from "./shell/colorify";
import {
	type CommitMessage,
	commitTypes,
	formatCommitMessage,
	parseCommitMessage,
	validateCommitMessage,
} from "./shell/commit-utils";
import { createScript, type InferArgs, validators } from "./shell/create-scripts";
import { InteractiveCLI } from "./shell/interactive-cli";
import { repoUtils } from "./shell/repo-utils";

const scriptConfig = {
	name: "Interactive Commit",
	description:
		"Interactive CLI for creating conventional commits with validation. Accepts git commit arguments or enters interactive mode.",
	usage: "bun run interactive-commit [git-commit-options] [options]",
	examples: [
		"bun run interactive-commit",
		'bun run interactive-commit -m "feat: add new feature"',
		'bun run interactive-commit -m "fix(ui): resolve button issue" --dry-run',
		"bun run interactive-commit --amend --no-edit",
		'bun run interactive-commit -m "feat: new feature" --no-verify',
	],
	options: [
		{
			short: "-m",
			long: "--message",
			description: "Commit message (triggers direct commit mode)",
			required: false,
			validator: validators.nonEmpty,
		},
		{
			short: "-a",
			long: "--all",
			description: "Stage all modified files",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "",
			long: "--no-verify",
			description: "Skip git hooks when committing",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "",
			long: "--amend",
			description: "Amend the previous commit",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "",
			long: "--no-edit",
			description: "Use the selected commit message without launching an editor",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
	],
} as const;

async function runInteractiveMode(): Promise<string> {
	const cli = new InteractiveCLI();

	const message: CommitMessage = { type: "", description: "" };

	try {
		const typeResult = await cli.select("🎯 What type of change is this?", commitTypes);
		message.type = typeResult[0];

		const availableScopes = await repoUtils.workspace.getAllPackages();
		const selectedScopes = await cli.select(
			"📦 Select scope(s) (optional - press Enter to skip)",
			availableScopes,
			{ allowMultiple: true },
		);
		if (selectedScopes.length > 0) {
			message.scope = selectedScopes.join(",");
		}

		message.description = await cli.prompt("📝 Enter a short description:", {
			placeholder: "e.g., add user authentication system",
			allowEmpty: false,
		});

		const bodyInput = await cli.prompt("📄 Enter longer description (optional):", {
			placeholder: "Additional details about the change",
			allowEmpty: true,
		});
		if (bodyInput.trim()) {
			message.body = bodyInput;
		}

		const hasBreaking = await cli.confirm("⚠️  Is this a breaking change?", {
			defaultValue: false,
		});
		if (hasBreaking) {
			message.breaking = await cli.prompt("💥 Describe the breaking change:", {
				placeholder: "What breaks and how to migrate",
				allowEmpty: false,
			});
		}

		const errors = await validateCommitMessage(message);
		if (errors.length > 0) {
			cli.cleanup();
			console.error(colorify.red("❌ Validation errors:"));
			for (const error of errors) {
				console.error(colorify.red(`  • ${error}`));
			}
			throw new Error("Validation failed");
		}

		const commitMessage = formatCommitMessage(message);
		const confirmed = await cli.confirm("🚀 Ready to commit this message?", {
			defaultValue: true,
			message: commitMessage,
		});

		if (!confirmed) {
			console.log(colorify.yellow("  Commit cancelled."));
			process.exit(0);
		}

		cli.cleanup();
		return commitMessage;
	} catch (error) {
		cli.cleanup();
		throw error;
	}
}

async function executeCommit(
	commitMessage: string,
	args: InferArgs<typeof scriptConfig>,
	xConsole: typeof console,
): Promise<void> {
	const gitArgs = ["commit"];

	if (args.all) gitArgs.push("-a");
	gitArgs.push("-m", commitMessage);
	if (args.amend) gitArgs.push("--amend");
	if (args["no-edit"]) gitArgs.push("--no-edit");
	if (args["no-verify"]) gitArgs.push("--no-verify");

	if (args["dry-run"]) {
		xConsole.log(colorify.blue("🔍 Dry run - would execute:"));
		xConsole.log(colorify.gray(`git ${gitArgs.join(" ")}`));
		return;
	}

	if (!args.all && !args.amend) {
		const statusResult = Bun.spawn(["git", "diff", "--cached", "--quiet"]);
		const statusExitCode = await statusResult.exited;

		if (statusExitCode === 0) {
			xConsole.warn(colorify.yellow("⚠️  No staged changes found."));
			xConsole.log(colorify.blue("💡 Try one of these options:"));
			xConsole.log(colorify.gray("  • Stage your changes: git add <files>"));
			xConsole.log(colorify.gray('  • Use --all flag: bun run commit -a -m "message"'));
			xConsole.log(colorify.gray("  • Check git status: git status"));
			throw new Error("No staged changes to commit");
		}
	}

	const result = Bun.spawn(["git", ...gitArgs], {
		stdio: ["inherit", "pipe", "pipe"],
	});

	const exitCode = await result.exited;
	if (exitCode === 0) {
		xConsole.log(colorify.green("✅ Commit successful!"));
	} else {
		const stderr = await new Response(result.stderr).text();
		xConsole.error(colorify.red("❌ Git commit failed:"));
		if (stderr) xConsole.error(colorify.gray(stderr));
		throw new Error("Git commit failed");
	}
}

export const interactiveCommit = createScript(scriptConfig, async (args, xConsole) => {
	try {
		let commitMessage: string;

		const hasMessage = !!args.message;
		if (hasMessage && args.message) {
			xConsole.log(colorify.blue("📝 Direct Commit Mode"));

			const parsedMessage = parseCommitMessage(args.message);
			if (parsedMessage) {
				const errors = await validateCommitMessage(parsedMessage);
				if (errors.length > 0) {
					xConsole.error(colorify.red("❌ Validation errors in commit message:"));
					for (const error of errors) xConsole.error(colorify.red(`  • ${error}`));
					process.exit(1);
				}
				xConsole.log(colorify.green("✅ Commit message validated"));
			} else {
				xConsole.warn("⚠️  Message doesn't follow conventional commit format, but proceeding...");
			}

			commitMessage = args.message;
		} else {
			commitMessage = await runInteractiveMode();
		}

		await executeCommit(commitMessage, args, xConsole);
	} catch (error) {
		xConsole.error(
			colorify.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`),
		);
		process.exit(1);
	}
});

if (import.meta.main) {
	interactiveCommit();
}
