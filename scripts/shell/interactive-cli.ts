import { colorify } from "./colorify";

export interface CLIConfig {
	clearScreen?: boolean;
	showCursor?: boolean;
	exitOnCtrlC?: boolean;
}

// Base interface for common CLI operations
interface BaseCLIOperation extends CLIConfig {
	onLeft?: () => void;
	quickActions?: QuickAction[];
}

export interface SelectConfig extends BaseCLIOperation {
	allowMultiple?: boolean;
	allowEmpty?: boolean;
}

export interface PromptConfig extends BaseCLIOperation {
	allowEmpty?: boolean;
}

export interface ConfirmConfig extends BaseCLIOperation {
	defaultValue?: boolean;
	message?: string; // For showing additional content above confirmation
}

interface KeyPress {
	name?: string;
	ctrl?: boolean;
	sequence: string;
}

interface KeyHandlers {
	onUp?: () => void;
	onDown?: () => void;
	onLeft?: () => void;
	onRight?: () => void;
	onReturn?: () => void;
	onSpace?: () => void;
	onBackspace?: () => void;
	onEscape?: () => void;
	onCtrlC?: () => void;
	onChar?: (char: string) => void;
	onKey?: (key: KeyPress) => void;
	onQuickAction?: (action: QuickAction) => void;
}

export interface QuickAction {
	key: string;
	label: string;
	description: string;
	shortcut?: string;
	action: () => void;
}

export class InteractiveCLI {
	private isRawMode = false;
	private currentError: string | null = null;
	private xConsole: typeof console;

	constructor(xConsole: typeof console = console) {
		this.xConsole = xConsole;
		this.enableRawMode();
	}

	private enableRawMode() {
		if (process.stdin.isTTY && !this.isRawMode) {
			process.stdin.setRawMode(true);
			process.stdin.resume();
			process.stdin.setEncoding("utf8");
			this.isRawMode = true;
		}
	}

	// Common key mappings to reduce duplication
	private static readonly KEY_MAPPINGS = new Map([
		["\u0003", { name: "c", ctrl: true }],
		["\r", { name: "return" }],
		["\n", { name: "return" }],
		["\u001b[A", { name: "up" }],
		["\u001b[B", { name: "down" }],
		["\u001b[D", { name: "left" }],
		["\u001b[C", { name: "right" }],
		[" ", { name: "space" }],
		["\u0020", { name: "space" }],
		["\u007f", { name: "backspace" }],
		["\u0008", { name: "backspace" }],
		["\u001b", { name: "escape" }],
	]);

	private parseKey(data: string): KeyPress {
		const key: KeyPress = { sequence: data };
		const mapping = InteractiveCLI.KEY_MAPPINGS.get(data);

		if (mapping) {
			Object.assign(key, mapping);
		} else {
			key.name = data;
		}

		return key;
	}

	getKey(data: Buffer): KeyPress {
		return this.parseKey(data.toString());
	}

	handleKey(data: Buffer, handlers: KeyHandlers): void {
		const key = this.getKey(data);
		this.xConsole.log(`Key detected: ${key.name}, sequence: ${JSON.stringify(key.sequence)}`); // Debug

		if (key.ctrl && key.name === "c" && handlers.onCtrlC) {
			handlers.onCtrlC();
			return;
		}

		// Handle quick action shortcuts first
		if (key.name && key.name.length === 1 && handlers.onQuickAction) {
			// This will be handled by the calling function with the quickActions array
			return;
		}

		switch (key.name) {
			case "up":
				handlers.onUp?.();
				break;
			case "down":
				handlers.onDown?.();
				break;
			case "left":
				this.xConsole.log("Left arrow key handler called"); // Debug
				handlers.onLeft?.();
				break;
			case "right":
				handlers.onRight?.();
				break;
			case "return":
				handlers.onReturn?.();
				break;
			case "space":
				if (handlers.onSpace) {
					handlers.onSpace();
				} else {
					// If no space handler, treat space as a regular character
					handlers.onChar?.(" ");
				}
				break;
			case "backspace":
				handlers.onBackspace?.();
				break;
			case "escape":
				handlers.onEscape?.();
				break;
			default:
				if (key.sequence && key.sequence.length === 1 && key.sequence.charCodeAt(0) >= 32) {
					handlers.onChar?.(key.sequence);
				}
				handlers.onKey?.(key);
				break;
		}
	}

	renderError(error: string | undefined | null): void {
		this.currentError = error || null;
	}

	clearError(): void {
		this.currentError = null;
	}

	refreshDisplay(): void {
		// Clear the screen and redraw if there are errors
		if (this.currentError) {
			this.clearScreen();
			this.showCursor();
		}
	}

	clearScreen(): void {
		process.stdout.write("\u001b[2J\u001b[0;0H");
	}

	private renderErrorSection(): void {
		if (this.currentError) {
			this.xConsole.log(colorify.red("\n  ❌ Error:"));
			this.xConsole.log(colorify.red(`  ${this.currentError}`));
		}
	}

	// Common rendering utilities to reduce duplication
	private renderQuickActions(quickActions: QuickAction[]): void {
		if (quickActions.length > 0) {
			this.xConsole.log(colorify.cyan("\n⚡ Quick Actions:"));
			quickActions.forEach((action) => {
				const shortcut = action.shortcut ? ` (${action.shortcut})` : "";
				this.xConsole.log(colorify.cyan(`  • ${action.label}${shortcut}`));
			});
		}
	}

	private renderInstructions(allowMultiple: boolean): void {
		const instructions = allowMultiple
			? "\n  ↑/↓ Navigate • ← Back • Space Toggle • Enter Continue • Ctrl+C Exit"
			: "\n  ↑/↓ Navigate • ← Back • Enter Select • Ctrl+C Exit";
		this.xConsole.log(colorify.gray(instructions));
	}

	private renderSelectionCount(selected: Set<number>): void {
		if (selected.size > 0) {
			this.xConsole.log(
				colorify.blue(`  Selected: ${selected.size} item${selected.size > 1 ? "s" : ""}`),
				this.xConsole,
			);
		}
	}

	// Common key handling utilities to reduce duplication
	private createQuickActionHandler(
		quickActions: QuickAction[],
		onKeyPress: (data: Buffer) => void,
	) {
		return (data: Buffer) => {
			const key = this.getKey(data);
			if (key.name && key.name.length === 1) {
				const char = key.name.toLowerCase();
				const action = quickActions.find((a) => a.shortcut?.toLowerCase() === char);
				if (action) {
					this.xConsole.log(`Executing quick action: ${action.label}`); // Debug
					action.action();
					return;
				}
			}
			// If no quick action found, pass to regular handler
			onKeyPress(data);
		};
	}

	private createExitHandler(exitOnCtrlC: boolean) {
		return exitOnCtrlC
			? () => {
					this.cleanup();
					process.exit(0);
				}
			: undefined;
	}

	// async waitForErrorAcknowledgment(): Promise<void> {
	// 	if (!this.currentError) return;

	// 	return new Promise((resolve) => {
	// 		const onKeyPress = (data: Buffer) => {
	// 			process.stdin.removeListener("data", onKeyPress);
	// 			resolve();
	// 		};

	// 		process.stdin.on("data", onKeyPress);
	// 	});
	// }

	private hideCursor() {
		process.stdout.write("\u001b[?25l");
	}

	private showCursor() {
		process.stdout.write("\u001b[?25h");
	}

	async select(question: string, options: string[], config: SelectConfig = {}): Promise<string[]> {
		const {
			clearScreen = true,
			allowMultiple = false,
			exitOnCtrlC = true,
			onLeft,
			quickActions = [],
		} = config;

		if (clearScreen) this.clearScreen();
		this.hideCursor();

		let selectedIndex = 0;
		const selected = new Set<number>();

		const render = () => {
			if (clearScreen) this.clearScreen();

			this.xConsole.log(question);
			for (let i = 0; i < options.length; i++) {
				const isHighlighted = i === selectedIndex;
				const isSelected = selected.has(i);

				let prefix = "  ";
				let text = options[i];

				if (allowMultiple) {
					const checkbox = isSelected ? colorify.green("☑ ") : "☐ ";
					prefix = isHighlighted ? colorify.yellow("❯ ") : "  ";
					text = isHighlighted
						? colorify.yellow(options[i])
						: isSelected
							? colorify.green(options[i])
							: colorify.gray(options[i]);
					this.xConsole.log(`${prefix}${checkbox}${text}`);
				} else {
					prefix = isHighlighted ? colorify.green("❯ ") : "  ";
					text = isHighlighted ? colorify.green(options[i]) : colorify.gray(options[i]);
					this.xConsole.log(`${prefix}${text}`);
				}
			}

			this.renderErrorSection();
			this.renderQuickActions(quickActions);
			this.renderInstructions(allowMultiple);
			this.renderSelectionCount(selected);
		};

		return new Promise((resolve) => {
			const onKeyPress = (data: Buffer) => {
				this.handleKey(data, {
					onUp: () => {
						selectedIndex = Math.max(0, selectedIndex - 1);
						render();
					},
					onDown: () => {
						selectedIndex = Math.min(options.length - 1, selectedIndex + 1);
						render();
					},
					...(onLeft ? { onLeft } : {}),
					onSpace: () => {
						if (selected.has(selectedIndex)) {
							selected.delete(selectedIndex);
						} else {
							selected.add(selectedIndex);
						}
						render();
					},
					onReturn: () => {
						process.stdin.removeListener("data", onKeyPress);
						if (allowMultiple) {
							const result = Array.from(selected).map((i) => options[i]);
							resolve(result);
						} else {
							resolve([options[selectedIndex]]);
						}
					},
					onQuickAction: (action) => {
						// Handle quick action shortcuts
						const char = action.shortcut?.toLowerCase();
						if (char && char.length === 1) {
							action.action();
						}
					},
					onCtrlC: this.createExitHandler(exitOnCtrlC),
				});
			};

			// Add direct key handling for quick actions
			const handleQuickActionKey = this.createQuickActionHandler(quickActions, onKeyPress);

			process.stdin.on("data", handleQuickActionKey);
			render();
		});
	}

	async prompt(question: string, config: PromptConfig = {}): Promise<string> {
		const {
			clearScreen = true,
			allowEmpty = true,
			showCursor = true,
			exitOnCtrlC = true,
			quickActions = [],
		} = config;

		if (clearScreen) this.clearScreen();
		if (showCursor) this.showCursor();

		this.xConsole.log(question);
		// Show error if exists, but don't let it interfere with input
		if (this.currentError) {
			this.xConsole.log(colorify.red("\n  ❌ Error:"));
			this.xConsole.log(colorify.red(`\n  ${this.currentError}\n`));
			this.xConsole.log(""); // Add spacing
		}

		// Show quick actions if available
		this.renderQuickActions(quickActions);

		// Show helper text for available actions
		if (config.onLeft) {
			this.xConsole.log(colorify.gray("\n← Back • ESC Clear • Ctrl+C Exit"));
		} else {
			this.xConsole.log(colorify.gray("\nESC Clear • Ctrl+C Exit"));
		}
		process.stdout.write(colorify.green("❯ "));

		let input = "";

		return new Promise((resolve) => {
			const onKeyPress = (data: Buffer) => {
				this.handleKey(data, {
					onReturn: () => {
						if (!allowEmpty && !input.trim()) {
							return;
						}
						process.stdin.removeListener("data", onKeyPress);
						resolve(input.trim());
					},
					onBackspace: () => {
						if (input.length > 0) {
							input = input.slice(0, -1);
							process.stdout.write("\b \b");
						}
					},
					onEscape: () => {
						// Clear the input
						input = "";
						// Clear the current line and redraw
						process.stdout.write("\r\x1b[K"); // Clear line
						process.stdout.write(colorify.green("❯ "));
					},
					onChar: (char: string) => {
						input += char;
						process.stdout.write(char);
					},
					onLeft: config.onLeft,
					onQuickAction: (action) => {
						// Handle quick action shortcuts
						const char = action.shortcut?.toLowerCase();
						if (char && char.length === 1) {
							action.action();
						}
					},
					onCtrlC: this.createExitHandler(exitOnCtrlC),
				});
			};

			// Add direct key handling for quick actions
			const handleQuickActionKey = this.createQuickActionHandler(quickActions, onKeyPress);

			process.stdin.on("data", handleQuickActionKey);
		});
	}

	async confirm(question: string, config: ConfirmConfig = {}): Promise<boolean> {
		const {
			clearScreen = true,
			defaultValue = false,
			message,
			exitOnCtrlC = true,
			quickActions = [],
		} = config;

		if (clearScreen) this.clearScreen();
		this.hideCursor();

		let selected = defaultValue;

		const render = () => {
			if (clearScreen) this.clearScreen();

			// Show additional message if provided
			if (message) {
				this.xConsole.log(colorify.green("\n  ✅ Generated commit message:\n"));
				this.xConsole.log(colorify.cyan("  ─".repeat(5)));
				this.xConsole.log(`  ${message}`);
				this.xConsole.log(colorify.cyan("  ─".repeat(5)));
				this.xConsole.log("");
			}

			this.xConsole.log(colorify.blue(`  ${question}\n`));

			const yesPrefix = selected ? colorify.green("❯ ") : "  ";
			const noPrefix = !selected ? colorify.red("❯ ") : "  ";
			const yesText = selected ? colorify.green("Yes") : colorify.gray("Yes");
			const noText = !selected ? colorify.red("No") : colorify.gray("No");

			this.xConsole.log(`${yesPrefix}${yesText}`);
			this.xConsole.log(`${noPrefix}${noText}`);

			// Show quick actions if available
			this.renderQuickActions(quickActions);

			this.xConsole.log(colorify.gray("\n  ↑/↓ Navigate • Enter Select • Ctrl+C Exit"));

			this.renderErrorSection();
		};

		return new Promise((resolve) => {
			const onKeyPress = (data: Buffer) => {
				this.handleKey(data, {
					onUp: () => {
						selected = !selected;
						render();
					},
					onDown: () => {
						selected = !selected;
						render();
					},
					onReturn: () => {
						process.stdin.removeListener("data", onKeyPress);
						resolve(selected);
					},
					onChar: (char: string) => {
						if (char === "y") {
							selected = true;
							render();
						} else if (char === "n") {
							selected = false;
							render();
						}
					},
					onCtrlC: exitOnCtrlC
						? () => {
								this.cleanup();
								process.exit(0);
							}
						: undefined,
				});
			};

			// Add direct key handling for quick actions
			const handleQuickActionKey = (data: Buffer) => {
				const key = this.getKey(data);
				if (key.name && key.name.length === 1) {
					const char = key.name.toLowerCase();
					const action = quickActions.find((a) => a.shortcut?.toLowerCase() === char);
					if (action) {
						this.xConsole.log(`Executing quick action: ${action.label}`); // Debug
						action.action();
						return;
					}
				}
				// If no quick action found, pass to regular handler
				onKeyPress(data);
			};

			process.stdin.on("data", handleQuickActionKey);
			render();
		});
	}

	cleanup() {
		this.showCursor();
		if (process.stdin.isTTY && this.isRawMode) {
			process.stdin.setRawMode(false);
			this.isRawMode = false;
		}
		process.stdin.pause();
	}
}
