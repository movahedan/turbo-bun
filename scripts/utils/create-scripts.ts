/**
 * Error handling utilities for scripts
 * Provides consistent error handling patterns across all scripts
 */

import type { InferArgs, ScriptConfig } from "./arg-parser";

/**
 * Higher-order function that wraps script execution with consistent error handling
 */
export function withErrorHandling<T extends unknown[]>(
	fn: (...args: T) => Promise<void> | void,
	options: {
		scriptName?: string;
		exitOnError?: boolean;
		showStack?: boolean;
	} = {},
): (...args: T) => Promise<void> {
	const {
		scriptName = "Script",
		exitOnError = true,
		showStack = false,
	} = options;

	return async (...args: T): Promise<void> => {
		try {
			await fn(...args);
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error(`❌ ${scriptName} failed:`, errorMessage);

			if (showStack && error instanceof Error && error.stack) {
				console.error("Stack trace:");
				console.error(error.stack);
			}

			if (exitOnError) {
				process.exit(1);
			}

			throw error;
		}
	};
}

/**
 * Utility to create a script with automatic error handling and type safety
 */
export function createScript<T extends Readonly<ScriptConfig>>(
	config: Readonly<T>,
	fn: (args: InferArgs<Readonly<T>>) => Promise<void> | void,
	options: {
		exitOnError?: boolean;
		showStack?: boolean;
	} = {},
): () => Promise<void> {
	return withErrorHandling(
		async () => {
			const { parseArgs } = await import("./arg-parser");
			const args = parseArgs(config);
			await fn(args);
		},
		{ scriptName: config.name, ...options },
	);
}

/**
 * Utility for handling specific types of errors with custom messages
 */
export function handleSpecificErrors<T extends unknown[]>(
	fn: (...args: T) => Promise<void> | void,
	errorHandlers: Array<{
		test: (error: unknown) => boolean;
		message: string | ((error: unknown) => string);
		exitCode?: number;
	}>,
): (...args: T) => Promise<void> {
	return async (...args: T): Promise<void> => {
		try {
			await fn(...args);
		} catch (error) {
			// Check for specific error handlers
			for (const handler of errorHandlers) {
				if (handler.test(error)) {
					const message =
						typeof handler.message === "function"
							? handler.message(error)
							: handler.message;
					console.error(`❌ Error: ${message}`);
					process.exit(handler.exitCode || 1);
				}
			}

			// Default error handling
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error("❌ Error:", errorMessage);
			process.exit(1);
		}
	};
}
