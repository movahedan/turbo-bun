#!/usr/bin/env bun

import { cliSteps, EntityCommit } from "./entities";
import { colorify } from "./shell/colorify";
import {
	createScript,
	type InferArgs,
	type ScriptConfig,
	validators,
} from "./shell/create-scripts";
import { InteractiveCLI } from "./shell/interactive-cli";

const commitConfig = {
	name: "Commit",
	description: "Execute git commit with the provided message",
	usage: "bun run commit -m <message> [options]",
	examples: [
		'bun run commit -m "feat: add new feature"',
		"bun run commit -m 'fix: resolve bug' --no-verify",
		"bun run commit -m 'docs: update readme' --amend",
	],
	options: [
		{
			short: "-m",
			long: "--message",
			description: "Commit message (optional: run interactive mode)",
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
		{
			short: "",
			long: "--dry-run",
			description: "Show what would be committed without actually committing",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
	],
} as const satisfies ScriptConfig;

export const commit = createScript(commitConfig, async function main(args, xConsole) {
	if (args.message) return await executeCommit(args, xConsole);

	const message = await runInteractiveMode(xConsole);
	return await executeCommit({ ...args, message }, xConsole);
});

if (import.meta.main) {
	commit();
}

const executeCommit = async (args: InferArgs<typeof commitConfig>, xConsole: typeof console) => {
	const gitArgs = ["commit"];

	if (args.all) gitArgs.push("-a");
	if (args.message) gitArgs.push("-m", args.message);
	if (args.amend) gitArgs.push("--amend");
	if (args["no-edit"]) gitArgs.push("--no-edit");
	if (args["no-verify"]) gitArgs.push("--no-verify");

	if (args["dry-run"]) {
		xConsole.log(colorify.blue("🔍 Dry run - would execute:"));
		xConsole.log(colorify.gray(`git ${gitArgs.join(" ")}`));
		return;
	}

	// Check if there are staged changes
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

	xConsole.log(colorify.blue("🚀 Executing commit..."));
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
};

async function runInteractiveMode(xConsole: typeof console): Promise<string> {
	const cli = new InteractiveCLI();
	let currentCommitMessage = "";

	try {
		let currentStepIndex = 0;
		const finalCommitMessage = "";
		let stepErrors: string[] = [];

		while (currentStepIndex !== cliSteps.length) {
			while (currentStepIndex < cliSteps.length && stepErrors.length > 0) {
				const step = cliSteps[currentStepIndex];

				currentCommitMessage = await step.run(cli, currentCommitMessage, stepErrors);
				const validation = step.validate(currentCommitMessage);

				if (typeof validation === "string") {
					stepErrors = [validation];
				} else {
					stepErrors = [];
					currentStepIndex++;
				}
			}

			const finalValidation = await EntityCommit.validateCommitMessage(currentCommitMessage);
			if (finalValidation.length === 0) {
				stepErrors = [];
				currentStepIndex++;
				continue;
			}

			const failedStep = cliSteps.findIndex((step) =>
				finalValidation.some((v) => v.split(" | ")[0] === step.key),
			);
			if (failedStep === -1) {
				throw new Error("❌ Final validation failed");
			}

			xConsole.log(`🔙 Going back to step ${failedStep + 1}: ${cliSteps[failedStep].key}`);
			stepErrors = finalValidation.filter((v) => v.split(" | ")[0] === cliSteps[failedStep].key);
			currentStepIndex = failedStep;
		}

		const confirmed = await cli.confirm("🚀 Ready to commit this message?", {
			defaultValue: true,
			message: finalCommitMessage,
		});

		if (!confirmed) {
			xConsole.log(colorify.yellow("  Commit cancelled."));
			process.exit(0);
		}

		cli.cleanup();
		return finalCommitMessage;
	} catch (error) {
		cli.cleanup();
		throw error;
	}
}
