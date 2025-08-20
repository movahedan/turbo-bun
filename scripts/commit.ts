#!/usr/bin/env bun

import { colorify, createScript, type InferArgs, type ScriptConfig } from "@repo/intershell/core";

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
			required: false,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
		{
			short: "-a",
			long: "--all",
			description: "Stage all modified files",
			required: false,
			defaultValue: false,
			type: "boolean",
			validator: createScript.validators.boolean,
		},
		{
			short: "",
			long: "--no-verify",
			description: "Skip git hooks when committing",
			required: false,
			defaultValue: false,
			type: "boolean",
			validator: createScript.validators.boolean,
		},
		{
			short: "",
			long: "--amend",
			description: "Amend the previous commit",
			required: false,
			defaultValue: false,
			type: "boolean",
			validator: createScript.validators.boolean,
		},
		{
			short: "",
			long: "--no-edit",
			description: "Use the selected commit message without launching an editor",
			required: false,
			defaultValue: false,
			type: "boolean",
			validator: createScript.validators.boolean,
		},
		{
			short: "",
			long: "--dry-run",
			description: "Show what would be committed without actually committing",
			required: false,
			defaultValue: false,
			type: "boolean",
			validator: createScript.validators.boolean,
		},
	],
} as const satisfies ScriptConfig;

export const commit = createScript(commitConfig, async function main(args, xConsole) {
	if (args.message) return await executeCommit(args, xConsole);

	// const message = await runEnhancedInteractiveMode(xConsole);
	// return await executeCommit({ ...args, message }, xConsole);
});

if (import.meta.main) {
	commit.run();
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

	const result = Bun.spawn(["git", ...gitArgs], {
		stdio: ["inherit", "pipe", "pipe"],
	});

	const exitCode = await result.exited;
	if (exitCode === 0) {
		xConsole.log(colorify.green("🚀 Commit successful!"));
	} else {
		const stderr = await new Response(result.stderr).text();
		if (stderr) xConsole.error(colorify.gray(stderr));
		throw new Error("❌ Git commit failed");
	}
};
