/**
 * Third-party command configurations
 * Centralized location for all external command paths and instructions
 */

export interface CommandConfig {
	name: string;
	paths: readonly string[] | string[];
	installInstructions?: string;
}

/**
 * All available third-party commands
 */
export const COMMANDS = {
	act: {
		name: "act",
		paths: ["./bin/act", "act"],
		installInstructions: "Please run the devcontainer setup first.",
	},
	docker: {
		name: "docker",
		paths: ["docker"],
		installInstructions: "Please install Docker and start the Docker daemon.",
	},
	git: {
		name: "git",
		paths: ["git"],
		installInstructions: "Please install Git.",
	},
	bun: {
		name: "bun",
		paths: ["bun"],
		installInstructions: "Please install Bun.",
	},
	turbo: {
		name: "turbo",
		paths: ["turbo", "node_modules/.bin/turbo"],
		installInstructions: "Please install Turbo.",
	},
} as const;

export type CommandName = keyof typeof COMMANDS;
