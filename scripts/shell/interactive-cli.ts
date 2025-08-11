import { colorify } from "./colorify";

export interface CLIConfig {
	clearScreen?: boolean;
	showCursor?: boolean;
	exitOnCtrlC?: boolean;
}

export interface SelectConfig extends CLIConfig {
	allowMultiple?: boolean;
	allowEmpty?: boolean;
}

export interface PromptConfig extends CLIConfig {
	placeholder?: string;
	allowEmpty?: boolean;
}

export interface ConfirmConfig extends CLIConfig {
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
}

export class InteractiveCLI {
	private isRawMode = false;
	private currentError: string | null = null;

	constructor() {
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

	private parseKey(data: string): KeyPress {
		const key: KeyPress = { sequence: data };

		if (data === "\u0003") {
			key.name = "c";
			key.ctrl = true;
		} else if (data === "\r" || data === "\n") {
			key.name = "return";
		} else if (data === "\u001b[A") {
			key.name = "up";
		} else if (data === "\u001b[B") {
			key.name = "down";
		} else if (data === " ") {
			key.name = "space";
		} else if (data === "\u007f" || data === "\u0008") {
			key.name = "backspace";
		} else if (data === "\u001b") {
			key.name = "escape";
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

		if (key.ctrl && key.name === "c" && handlers.onCtrlC) {
			handlers.onCtrlC();
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
				handlers.onLeft?.();
				break;
			case "right":
				handlers.onRight?.();
				break;
			case "return":
				handlers.onReturn?.();
				break;
			case "space":
				handlers.onSpace?.();
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
			console.log(colorify.red("\n  ❌ Error:"));
			console.log(colorify.red(`  ${this.currentError}`));
		}
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
		const { clearScreen = true, allowMultiple = false, exitOnCtrlC = true } = config;

		if (clearScreen) this.clearScreen();
		this.hideCursor();

		let selectedIndex = 0;
		const selected = new Set<number>();

		const render = () => {
			if (clearScreen) this.clearScreen();

			console.log(colorify.blue(`\n  ${question}\n`));

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
					console.log(`${prefix}${checkbox}${text}`);
				} else {
					prefix = isHighlighted ? colorify.green("❯ ") : "  ";
					text = isHighlighted ? colorify.green(options[i]) : colorify.gray(options[i]);
					console.log(`${prefix}${text}`);
				}
			}

			this.renderErrorSection();

			const instructions = allowMultiple
				? "\n  ↑/↓ Navigate • Space Toggle • Enter Continue • Ctrl+C Exit"
				: "\n  ↑/↓ Navigate • Enter Select • Ctrl+C Exit";
			console.log(colorify.gray(instructions));

			if (allowMultiple && selected.size > 0) {
				console.log(
					colorify.blue(`  Selected: ${selected.size} item${selected.size > 1 ? "s" : ""}`),
				);
			}
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
					onSpace: () => {
						if (allowMultiple) {
							if (selected.has(selectedIndex)) {
								selected.delete(selectedIndex);
							} else {
								selected.add(selectedIndex);
							}
							render();
						}
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
					onCtrlC: exitOnCtrlC
						? () => {
								this.cleanup();
								process.exit(0);
							}
						: undefined,
				});
			};

			process.stdin.on("data", onKeyPress);
			render();
		});
	}

	async prompt(question: string, config: PromptConfig = {}): Promise<string> {
		const {
			clearScreen = true,
			placeholder,
			allowEmpty = true,
			showCursor = true,
			exitOnCtrlC = true,
		} = config;

		if (clearScreen) this.clearScreen();
		if (showCursor) this.showCursor();

		console.log(colorify.blue(`\n  ${question}`));
		if (placeholder) {
			console.log(colorify.gray(`  ${placeholder}`));
		}

		// Show error if exists, but don't let it interfere with input
		if (this.currentError) {
			console.log(colorify.red("\n  ❌ Error:"));
			console.log(colorify.red(`  ${this.currentError}`));
			console.log(""); // Add spacing
		}

		process.stdout.write(colorify.green("  ❯ "));

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
					onChar: (char: string) => {
						input += char;
						process.stdout.write(char);
					},
					onCtrlC: exitOnCtrlC
						? () => {
								this.cleanup();
								process.exit(0);
							}
						: undefined,
				});
			};

			process.stdin.on("data", onKeyPress);
		});
	}

	async confirm(question: string, config: ConfirmConfig = {}): Promise<boolean> {
		const { clearScreen = true, defaultValue = false, message, exitOnCtrlC = true } = config;

		if (clearScreen) this.clearScreen();
		this.hideCursor();

		let selected = defaultValue;

		const render = () => {
			if (clearScreen) this.clearScreen();

			// Show additional message if provided
			if (message) {
				console.log(colorify.green("\n  ✅ Generated commit message:\n"));
				console.log(colorify.cyan("  ─".repeat(5)));
				console.log(`  ${message}`);
				console.log(colorify.cyan("  ─".repeat(5)));
				console.log("");
			}

			console.log(colorify.blue(`  ${question}\n`));

			const yesPrefix = selected ? colorify.green("❯ ") : "  ";
			const noPrefix = !selected ? colorify.red("❯ ") : "  ";
			const yesText = selected ? colorify.green("Yes") : colorify.gray("Yes");
			const noText = !selected ? colorify.red("No") : colorify.gray("No");

			console.log(`${yesPrefix}${yesText}`);
			console.log(`${noPrefix}${noText}`);
			console.log(colorify.gray("\n  ↑/↓ Navigate • Enter Select • Ctrl+C Exit"));

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

			process.stdin.on("data", onKeyPress);
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
