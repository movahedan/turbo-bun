import { colorify } from "./colorify";
import type { InteractiveCLI } from "./interactive-cli";

// Page-aware step system
export interface Page {
	id: string;
	title: string;
	description?: string;
	render: (cli: InteractiveCLI, context: PageContext) => Promise<void>;
	quickActions?: QuickAction[];
}

export interface PageContext {
	navigationState: NavigationState;
	currentStep: CLIStepHandler;
	allSteps: CLIStepHandler[];
	commitMessage: string;
	errors: string[];
	goBack: () => void;
	renderPage: (pageId: string) => void;
	renderStep: (stepIndex: number) => void;
	pages: Page[];
}

// Enhanced step handler that can render different pages
export interface CLIStepHandler {
	key: string;
	pages: Page[]; // Multiple pages this step can render
	defaultPage: string; // Which page to show first
	run: (
		cli: InteractiveCLI,
		message: string,
		errors?: string[],
		goBack?: () => void,
		quickActions?: QuickAction[],
		pageContext?: PageContext,
	) => Promise<string>;
	validate: (message: string) => true | string;
	canSkip?: (message: string) => boolean;
	skipMessage?: string;
}

// Enhanced navigation state for better CLI experience
export interface NavigationState {
	currentStepIndex: number;
	currentPage: string; // Current page within the step
	shouldGoBack: boolean;
	completedSteps: Set<number>;
	skippedSteps: Set<number>;
	validationErrors: Map<number, string[]>;
	canSkipCurrentStep: boolean;
	showHelp: boolean;
	showPreview: boolean;
	quickActions: QuickAction[];
	pageHistory: string[]; // Track page navigation history
}

export interface QuickAction {
	key: string;
	label: string;
	description: string;
	action: () => void;
	shortcut?: string;
}

export interface CommitProgress {
	currentStep: number;
	totalSteps: number;
	completedSteps: number;
	skippedSteps: number;
	progressPercentage: number;
	canProceed: boolean;
	validationStatus: "valid" | "invalid" | "pending";
}

// Utility functions for CLI operations
export const cliUtils = {
	// Create a help page for any step
	createHelpPage: (stepKey: string, question: string, options?: string[]): Page => ({
		id: "help",
		title: `Help: ${stepKey}`,
		description: `Help information for ${stepKey} step`,
		render: async (cli: InteractiveCLI, context: PageContext) => {
			cli.clearScreen();
			console.log(colorify.blue(`📚 Help: ${stepKey.toUpperCase()}`));
			console.log(colorify.cyan("─".repeat(50)));
			console.log(question);
			console.log(colorify.cyan("─".repeat(50)));

			if (options?.length) {
				console.log(colorify.green("\n📋 Available options:"));
				options.forEach((option) => console.log(`  • ${option}`));
			}

			console.log(colorify.gray("\nPress any key to return to the step..."));
			await new Promise((resolve) => {
				const onKey = () => {
					process.stdin.removeListener("data", onKey);
					resolve(undefined);
				};
				process.stdin.on("data", onKey);
			});

			context.renderPage("main");
		},
		quickActions: [
			{
				key: "back",
				label: "Back to Step",
				description: "Return to the main step",
				shortcut: "b",
				action: () => {
					// This will be set when the page is created
				},
			},
		],
	}),

	// Create a preview page
	createPreviewPage: (): Page => ({
		id: "preview",
		title: "Commit Preview",
		description: "Preview the final commit message",
		render: async (cli: InteractiveCLI, context: PageContext) => {
			cli.clearScreen();
			console.log(colorify.green("📝 Commit Preview"));
			console.log(colorify.cyan("─".repeat(50)));
			console.log(context.commitMessage);
			console.log(colorify.cyan("─".repeat(50)));

			console.log(colorify.gray("\nPress any key to return to the step..."));
			await new Promise((resolve) => {
				const onKey = () => {
					process.stdin.removeListener("data", onKey);
					resolve(undefined);
				};
				process.stdin.on("data", onKey);
			});

			context.renderPage("main");
		},
		quickActions: [
			{
				key: "back",
				label: "Back to Step",
				description: "Return to the main step",
				shortcut: "b",
				action: () => {
					// This will be set when the page is created
				},
			},
		],
	}),

	// Create standard quick actions for a step
	createStandardQuickActions: (stepIndex: number, context: PageContext): QuickAction[] => {
		const actions: QuickAction[] = [
			{
				key: "help",
				label: "Show Help",
				description: "Display help for this step",
				shortcut: "h",
				action: () => context.renderPage("help"),
			},
			{
				key: "preview",
				label: "Preview Commit",
				description: "Show what the final commit will look like",
				shortcut: "p",
				action: () => context.renderPage("preview"),
			},
		];

		// Add back action if not first step
		if (stepIndex > 0) {
			actions.push({
				key: "back",
				label: "Go Back",
				description: "Return to previous step",
				shortcut: "←",
				action: () => context.goBack(),
			});
		}

		return actions;
	},

	// Render progress bar
	renderProgressBar: (navigationState: NavigationState, totalSteps: number): void => {
		const completedSteps = navigationState.completedSteps.size;
		const skippedSteps = navigationState.skippedSteps.size;
		const currentStep = navigationState.currentStepIndex;

		const progress = ((completedSteps + skippedSteps) / totalSteps) * 100;
		const barLength = 30;
		const filledLength = Math.round((barLength * progress) / 100);

		const bar = "█".repeat(filledLength) + "░".repeat(barLength - filledLength);

		console.log(colorify.blue("🚀 Interactive Commit Wizard"));
		console.log(colorify.gray("─".repeat(50)));
		console.log(colorify.cyan(`Progress: [${bar}] ${progress.toFixed(1)}%`));
		console.log(
			colorify.gray(
				"Step " +
					(currentStep + 1) +
					"/" +
					totalSteps +
					" • Completed: " +
					completedSteps +
					" • Skipped: " +
					skippedSteps,
			),
		);
		console.log(colorify.gray("─".repeat(50)));
	},

	// Show final confirmation with commit preview
	showFinalConfirmation: async (
		cli: InteractiveCLI,
		message: string,
		navigationState: NavigationState,
		totalSteps: number,
	): Promise<boolean> => {
		cli.clearScreen();

		console.log(colorify.green("🎉 All steps completed!"));
		console.log(colorify.cyan("─".repeat(50)));
		console.log(colorify.blue("📝 Final Commit Message:"));
		console.log(colorify.cyan("─".repeat(50)));
		console.log(message);
		console.log(colorify.cyan("─".repeat(50)));

		// Show summary
		const completedSteps = navigationState.completedSteps.size;
		const skippedSteps = navigationState.skippedSteps.size;

		console.log(colorify.gray("\n📊 Summary:"));
		console.log(colorify.gray(`  • Total Steps: ${totalSteps}`));
		console.log(colorify.gray(`  • Completed: ${completedSteps}`));
		console.log(colorify.gray(`  • Skipped: ${skippedSteps}`));

		return await cli.confirm("🚀 Ready to commit this message?", {
			defaultValue: true,
			message: message,
		});
	},
};
