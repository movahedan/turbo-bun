/**
 * Simple command finder utility
 * Finds commands in common locations with fallback paths
 */

import { $ } from "bun";
import { COMMANDS, type CommandConfig, type CommandName } from "./commands";

/**
 * Find a command in the system
 */
export async function findCommand(
	commandName: CommandName | CommandConfig,
	paths?: string[],
	installInstructions?: string,
	verbose?: boolean,
): Promise<string> {
	// If commandName is a string, use the predefined config
	if (typeof commandName === "string") {
		const config = COMMANDS[commandName];
		return findCommand(config);
	}

	// Use provided paths and instructions, or fall back to config
	const config = commandName;
	const commandPaths = paths || config.paths;
	const instructions = installInstructions || config.installInstructions;

	for (const path of commandPaths) {
		try {
			if (path.startsWith("./")) {
				// Handle local file paths
				await $`test -f ${path}`.quiet();
			} else {
				await $`which ${path}`.quiet();
			}

			if (verbose) {
				console.log(`✅ Found ${config.name} at: ${path}`);
			}
			return path;
		} catch {
			// Continue to next path
		}
	}

	throw new Error(
		`❌ ${config.name} is not installed or not found in PATH. ${instructions || ""}`,
	);
}
