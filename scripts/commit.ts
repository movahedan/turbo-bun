#!/usr/bin/env bun

import { validTypes } from "./entities/commit.types";
import type { CLIStepHandler, NavigationState, PageContext } from "./shell/cli-tools";
import { cliUtils } from "./shell/cli-tools";
import { colorify } from "./shell/colorify";
import {
	createScript,
	type InferArgs,
	type ScriptConfig,
	validators,
} from "./shell/create-scripts";
import { InteractiveCLI } from "./shell/interactive-cli";

// Shared quick actions for commit type selection
const commitTypeQuickActions = [
	{
		key: "help",
		label: "Show Help",
		description: "Display help for this step",
		shortcut: "h",
		action: () => {},
	},
	{
		key: "preview",
		label: "Preview Commit",
		description: "Show what the final commit will look like",
		shortcut: "p",
		action: () => {},
	},
];

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

	const message = await runEnhancedInteractiveMode(xConsole);
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

// Enhanced interactive mode with page-aware step system
async function runEnhancedInteractiveMode(xConsole: typeof console): Promise<string> {
	const cli = new InteractiveCLI(xConsole);
	const currentCommitMessage = "";

	// Initialize enhanced navigation state
	const navigationState: NavigationState = {
		currentStepIndex: 0,
		currentPage: "main",
		shouldGoBack: false,
		completedSteps: new Set(),
		skippedSteps: new Set(),
		validationErrors: new Map(),
		canSkipCurrentStep: false,
		showHelp: false,
		showPreview: false,
		quickActions: [],
		pageHistory: [],
	};

	// Create page-aware steps
	const pageAwareSteps = createPageAwareSteps();

	try {
		while (navigationState.currentStepIndex < pageAwareSteps.length) {
			const step = pageAwareSteps[navigationState.currentStepIndex];

			// Update skip status for current step
			navigationState.canSkipCurrentStep = step.canSkip?.(currentCommitMessage) ?? false;

			// Create page context
			const pageContext: PageContext = {
				navigationState,
				currentStep: step,
				allSteps: pageAwareSteps,
				commitMessage: currentCommitMessage,
				errors: navigationState.validationErrors.get(navigationState.currentStepIndex) || [],
				goBack: () => {
					navigationState.shouldGoBack = true;
				},
				renderPage: (pageId: string) => {
					navigationState.currentPage = pageId;
					navigationState.pageHistory.push(pageId);
				},
				renderStep: (stepIndex: number) => {
					navigationState.currentStepIndex = stepIndex;
					navigationState.currentPage = "main";
				},
				pages: step.pages,
			};

			// Render current step with progress and navigation
			await renderStepWithProgress(cli, step, pageContext);

			// Check if we need to go back
			if (navigationState.shouldGoBack) {
				navigationState.shouldGoBack = false;
				navigationState.currentStepIndex = Math.max(0, navigationState.currentStepIndex - 1);
				navigationState.currentPage = "main";
				continue;
			}

			// Validate current step
			const validation = step.validate(currentCommitMessage);
			if (typeof validation === "string") {
				// Validation failed - stay on this step
				navigationState.validationErrors.set(navigationState.currentStepIndex, [validation]);
				continue;
			}

			// Validation passed - clear errors and move to next step
			navigationState.validationErrors.delete(navigationState.currentStepIndex);
			navigationState.completedSteps.add(navigationState.currentStepIndex);
			navigationState.currentStepIndex++;
			navigationState.currentPage = "main";
		}

		// Final confirmation with commit preview
		const confirmed = await cliUtils.showFinalConfirmation(
			cli,
			currentCommitMessage,
			navigationState,
			pageAwareSteps.length,
		);

		if (!confirmed) {
			xConsole.log(colorify.yellow("  Commit cancelled."));
			process.exit(0);
		}

		cli.cleanup();
		return currentCommitMessage;
	} catch (error) {
		cli.cleanup();
		throw error;
	}
}

// Create page-aware steps from commit rules
function createPageAwareSteps(): CLIStepHandler[] {
	// For now, create a simple step structure
	// We'll implement the full page system in the next iteration
	return [
		{
			key: "type",
			defaultPage: "main",
			pages: [
				{
					id: "main",
					title: "Step 1: Type",
					description: "What type of change is this?",
					render: async (cli: InteractiveCLI, context: PageContext) => {
						cli.clearScreen();
						console.log(colorify.blue("🎯 What type of change is this?"));
						console.log(colorify.cyan("─".repeat(50)));

						const options = validTypes.map((t) => `${t.emoji} ${t.type} - ${t.description}`);

						const selected = await cli.select("Choose the commit type:", options, {
							quickActions: commitTypeQuickActions.map((action) => ({
								...action,
								action:
									action.key === "help"
										? () => context.renderPage("help")
										: () => context.renderPage("preview"),
							})),
						});

						const selectedType = selected[0].split(" ")[1]; // Extract type from selected option
						context.commitMessage = `${selectedType}: `;
					},
					quickActions: commitTypeQuickActions,
				},
				cliUtils.createHelpPage(
					"type",
					"What type of change is this?",
					validTypes.map((type) => type.type),
				),
				cliUtils.createPreviewPage(),
			],
			canSkip: () => false,
			skipMessage: "Type is required",
			run: async () => `${validTypes[0].type}: `,
			validate: () => true,
		},
	];
}

// Render step with progress bar and navigation
async function renderStepWithProgress(
	cli: InteractiveCLI,
	step: CLIStepHandler,
	pageContext: PageContext,
): Promise<void> {
	cli.clearScreen();

	// Show progress bar
	cliUtils.renderProgressBar(pageContext.navigationState, pageContext.allSteps.length);

	// Show current step info
	console.log(
		colorify.blue(
			`\n📋 Step ${pageContext.navigationState.currentStepIndex + 1}/${pageContext.allSteps.length}: ${step.key}`,
		),
	);

	// Show validation errors if any
	const errors = pageContext.navigationState.validationErrors.get(
		pageContext.navigationState.currentStepIndex,
	);
	if (errors?.length) {
		console.log(colorify.red("\n❌ Validation Errors:"));
		errors.forEach((error) => console.log(colorify.red(`  • ${error}`)));
	}

	// Get current page
	const currentPage =
		step.pages.find((p) => p.id === pageContext.navigationState.currentPage) || step.pages[0];
	if (currentPage) {
		// Update quick actions for current page
		pageContext.navigationState.quickActions = currentPage.quickActions || [];

		// Show quick actions
		if (pageContext.navigationState.quickActions.length > 0) {
			console.log(colorify.cyan("\n⚡ Quick Actions:"));
			pageContext.navigationState.quickActions.forEach((action) => {
				const shortcut = action.shortcut ? ` (${action.shortcut})` : "";
				console.log(colorify.cyan(`  • ${action.label}${shortcut}`));
			});
		}

		// Render the current page
		await currentPage.render(cli, pageContext);
	}
}
