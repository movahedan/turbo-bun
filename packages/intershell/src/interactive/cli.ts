/**
 * Event-based Interactive CLI foundation for the InterShell framework
 * Provides low-level I/O handling with controlled Promise management
 */

import type {
	ConfirmConfig,
	EventHandler,
	InteractiveCLI as IInteractiveCLI,
	InteractiveCLIOptions,
	KeyPress,
	PromptConfig,
	SelectConfig,
} from "../core";
import { colorify } from "../core";

// Event types for the CLI system
export interface CLIEvents {
	keypress: KeyPress;
	error: Error;
	exit: () => void;
	cleanup: () => void;
}

// Controlled promise for managing async operations
interface ControlledPromise<T = unknown> {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (reason: unknown) => void;
}

/**
 * Event-based Interactive CLI implementation
 * Replaces the Promise-based approach with clean event handling
 */
export class InteractiveCLI implements IInteractiveCLI {
	private isRawMode = false;
	private currentPromise: ControlledPromise | null = null;
	private keyHandlers: Set<EventHandler<KeyPress>> = new Set();
	private console: Console;
	private options: Required<InteractiveCLIOptions>;

	constructor(console: Console = globalThis.console, options: InteractiveCLIOptions = {}) {
		this.console = console;
		this.options = {
			enableRawMode: options.enableRawMode ?? true,
			exitOnCtrlC: options.exitOnCtrlC ?? true,
			clearOnExit: options.clearOnExit ?? true,
		};

		if (this.options.enableRawMode) {
			this.enableRawMode();
		}

		// Set up cleanup on process exit
		process.on("SIGINT", () => {
			if (this.options.exitOnCtrlC) {
				this.cleanup();
				process.exit(0);
			}
		});

		process.on("exit", () => {
			this.cleanup();
		});
	}

	// Raw mode management
	private enableRawMode(): void {
		if (process.stdin.isTTY && !this.isRawMode) {
			process.stdin.setRawMode(true);
			process.stdin.resume();
			this.isRawMode = true;
		}
	}

	private disableRawMode(): void {
		if (process.stdin.isTTY && this.isRawMode) {
			process.stdin.setRawMode(false);
			process.stdin.pause();
			this.isRawMode = false;
		}
	}

	// Controlled Promise management
	createControlledPromise<T>(): ControlledPromise<T> {
		let resolve: (value: T) => void = () => {};
		let reject: (reason: unknown) => void = () => {};

		const promise = new Promise<T>((res, rej) => {
			resolve = res;
			reject = rej;
		});

		return {
			promise,
			resolve,
			reject,
		};
	}

	resolveCurrentPromise<T>(value: T): void {
		if (this.currentPromise) {
			this.currentPromise.resolve(value);
			this.currentPromise = null;
		}
	}

	rejectCurrentPromise(reason: unknown): void {
		if (this.currentPromise) {
			this.currentPromise.reject(reason);
			this.currentPromise = null;
		}
	}

	// Event handling
	onKeyPress(callback: EventHandler<KeyPress>): void {
		this.keyHandlers.add(callback);

		// Set up stdin listener if this is the first handler
		if (this.keyHandlers.size === 1) {
			process.stdin.on("data", this.handleKeyData);
		}
	}

	offKeyPress(callback: EventHandler<KeyPress>): void {
		this.keyHandlers.delete(callback);

		// Remove stdin listener if no handlers remain
		if (this.keyHandlers.size === 0) {
			process.stdin.off("data", this.handleKeyData);
		}
	}

	private handleKeyData = (data: Buffer): void => {
		const key = this.parseKeyPress(data);

		// Emit to all handlers
		for (const handler of this.keyHandlers) {
			try {
				handler(key);
			} catch (error) {
				this.console.error("Error in key handler:", error);
			}
		}
	};

	private parseKeyPress(data: Buffer): KeyPress {
		const sequence = data.toString();
		let name: string | undefined;
		let ctrl = false;
		const meta = false;
		let shift = false;

		// Parse special keys
		if (sequence === "\x03") {
			name = "c";
			ctrl = true;
		} else if (sequence === "\x1b[A") {
			name = "up";
		} else if (sequence === "\x1b[B") {
			name = "down";
		} else if (sequence === "\x1b[C") {
			name = "right";
		} else if (sequence === "\x1b[D") {
			name = "left";
		} else if (sequence === "\r" || sequence === "\n") {
			name = "return";
		} else if (sequence === "\x1b") {
			name = "escape";
		} else if (sequence === "\x7f" || sequence === "\b") {
			name = "backspace";
		} else if (sequence === "\t") {
			name = "tab";
		} else if (sequence.length === 1 && sequence.charCodeAt(0) < 32) {
			// Control character
			ctrl = true;
			name = String.fromCharCode(sequence.charCodeAt(0) + 96); // Convert to letter
		} else if (sequence.length === 1) {
			name = sequence;
			shift = sequence !== sequence.toLowerCase();
		}

		return {
			sequence,
			name,
			ctrl,
			meta,
			shift,
		};
	}

	// Screen management
	clearScreen(): void {
		process.stdout.write("\u001b[2J\u001b[0;0H");
	}

	showCursor(): void {
		process.stdout.write("\u001b[?25h");
	}

	hideCursor(): void {
		process.stdout.write("\u001b[?25l");
	}

	// High-level interface methods (built on event system)
	async select(question: string, options: string[], config: SelectConfig = {}): Promise<string[]> {
		const {
			multiple = false,
			clearScreen = true,
			showCursor = false,
			exitOnCtrlC = true,
			quickActions = [],
		} = config;

		if (clearScreen) this.clearScreen();
		if (showCursor) this.showCursor();
		else this.hideCursor();

		let selectedIndex = 0;
		const selectedIndices = new Set<number>();
		const controlledPromise = this.createControlledPromise<string[]>();
		this.currentPromise = controlledPromise as ControlledPromise<unknown>;

		const render = () => {
			if (clearScreen) this.clearScreen();

			this.console.log(colorify.bold(question));
			this.console.log();

			options.forEach((option, index) => {
				const isSelected = selectedIndices.has(index);
				const isCurrent = index === selectedIndex;

				let prefix = "  ";
				if (multiple) {
					prefix = isSelected ? colorify.green("✓ ") : "  ";
				}

				if (isCurrent) {
					this.console.log(colorify.cyan(`❯ ${prefix}${option}`));
				} else {
					this.console.log(`  ${prefix}${option}`);
				}
			});

			if (quickActions.length > 0) {
				console.log();
				console.log(colorify.cyan("Quick Actions:"));
				quickActions.forEach((action) => {
					const shortcut = action.shortcut ? ` [${action.shortcut}]` : "";
					console.log(`  ${colorify.gray("•")} ${action.label}${shortcut} - ${action.description}`);
				});
			}

			this.console.log();
			this.console.log(
				colorify.gray(
					`Use arrow keys to navigate, Enter to select${multiple ? ", Space to toggle" : ""}`,
				),
			);
		};

		const keyHandler = (key: KeyPress) => {
			if (key.name === "up" && selectedIndex > 0) {
				selectedIndex--;
				render();
			} else if (key.name === "down" && selectedIndex < options.length - 1) {
				selectedIndex++;
				render();
			} else if (key.name === "return") {
				if (multiple) {
					if (selectedIndices.size === 0) {
						selectedIndices.add(selectedIndex);
					}
					const result = Array.from(selectedIndices)
						.sort()
						.map((i) => options[i]);
					this.offKeyPress(keyHandler);
					this.resolveCurrentPromise(result);
				} else {
					this.offKeyPress(keyHandler);
					this.resolveCurrentPromise([options[selectedIndex]]);
				}
			} else if (key.sequence === " " && multiple) {
				if (selectedIndices.has(selectedIndex)) {
					selectedIndices.delete(selectedIndex);
				} else {
					selectedIndices.add(selectedIndex);
				}
				render();
			} else if (key.ctrl && key.name === "c" && exitOnCtrlC) {
				this.offKeyPress(keyHandler);
				this.rejectCurrentPromise(new Error("User cancelled"));
			} else if (key.name === "escape") {
				this.offKeyPress(keyHandler);
				this.rejectCurrentPromise(new Error("User cancelled"));
			}

			// Handle quick actions
			for (const action of quickActions) {
				if (action.shortcut && key.sequence === action.shortcut) {
					action.action();
					break;
				}
			}
		};

		this.onKeyPress(keyHandler);
		render();

		return controlledPromise.promise;
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

		this.console.log(question);
		if (quickActions.length > 0) {
			console.log();
			console.log(colorify.cyan("Quick Actions:"));
			quickActions.forEach((action) => {
				const shortcut = action.shortcut ? ` [${action.shortcut}]` : "";
				console.log(`  ${colorify.gray("•")} ${action.label}${shortcut} - ${action.description}`);
			});
		}
		process.stdout.write(colorify.green("❯ "));

		let input = "";
		const controlledPromise = this.createControlledPromise<string>();
		this.currentPromise = controlledPromise as ControlledPromise<unknown>;

		const keyHandler = (key: KeyPress) => {
			if (key.name === "return") {
				if (!allowEmpty && input.trim().length === 0) {
					// Don't resolve, just continue
					return;
				}
				this.offKeyPress(keyHandler);
				this.console.log(); // New line
				this.resolveCurrentPromise(input);
			} else if (key.name === "backspace") {
				if (input.length > 0) {
					input = input.slice(0, -1);
					process.stdout.write("\b \b");
				}
			} else if (key.ctrl && key.name === "c" && exitOnCtrlC) {
				this.offKeyPress(keyHandler);
				this.rejectCurrentPromise(new Error("User cancelled"));
			} else if (key.name === "escape") {
				this.offKeyPress(keyHandler);
				this.rejectCurrentPromise(new Error("User cancelled"));
			} else if (key.sequence && key.sequence.length === 1 && !key.ctrl && !key.meta) {
				// Regular character input
				input += key.sequence;
				process.stdout.write(key.sequence);
			}

			// Handle quick actions
			for (const action of quickActions) {
				if (action.shortcut && key.sequence === action.shortcut) {
					action.action();
					break;
				}
			}
		};

		this.onKeyPress(keyHandler);

		return controlledPromise.promise;
	}

	async confirm(question: string, config: ConfirmConfig = {}): Promise<boolean> {
		const { clearScreen = true, defaultValue = false, exitOnCtrlC = true } = config;

		if (clearScreen) this.clearScreen();

		const defaultText = defaultValue ? "Y/n" : "y/N";
		this.console.log(`${question} (${defaultText})`);
		process.stdout.write(colorify.green("❯ "));

		const controlledPromise = this.createControlledPromise<boolean>();
		this.currentPromise = controlledPromise as ControlledPromise<unknown>;

		const keyHandler = (key: KeyPress) => {
			if (key.name === "return") {
				this.offKeyPress(keyHandler);
				this.console.log(); // New line
				this.resolveCurrentPromise(defaultValue);
			} else if (key.sequence?.toLowerCase() === "y") {
				this.offKeyPress(keyHandler);
				this.console.log("y");
				this.resolveCurrentPromise(true);
			} else if (key.sequence?.toLowerCase() === "n") {
				this.offKeyPress(keyHandler);
				this.console.log("n");
				this.resolveCurrentPromise(false);
			} else if (key.ctrl && key.name === "c" && exitOnCtrlC) {
				this.offKeyPress(keyHandler);
				this.rejectCurrentPromise(new Error("User cancelled"));
			} else if (key.name === "escape") {
				this.offKeyPress(keyHandler);
				this.rejectCurrentPromise(new Error("User cancelled"));
			}
		};

		this.onKeyPress(keyHandler);

		return controlledPromise.promise;
	}

	// Cleanup
	cleanup(): void {
		this.disableRawMode();
		this.showCursor();
		if (this.options.clearOnExit) {
			this.clearScreen();
		}

		// Clear all handlers
		this.keyHandlers.clear();
		process.stdin.off("data", this.handleKeyData);

		// Reject any pending promise
		if (this.currentPromise) {
			this.currentPromise.reject(new Error("CLI cleanup"));
			this.currentPromise = null;
		}
	}
}

export default InteractiveCLI;
