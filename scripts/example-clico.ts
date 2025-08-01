#!/usr/bin/env bun
import {
	type ClicoCommand,
	createClicoCommand,
	defaultClicoConfig,
	validators,
} from "./utils/clico";

// Example configuration
const exampleConfig: ClicoCommand = {
	name: "example",
	description: "An example CLI using the clico system",
	usage: "bun run example hello|nested [options]",
	examples: [
		"bun run example hello",
		"bun run example hello --name world",
		"bun run example nested subcommand",
	],
	options: [...defaultClicoConfig.options],
	commands: {
		hello: {
			name: "hello",
			description: "Say hello",
			usage: "bun run example hello [--name]",
			examples: ["bun run example hello", "bun run example hello --name world"],
			options: [
				{
					long: "--name",
					description: "Name to greet",
					required: false,
					defaultValue: "world",
					type: "string",
					multiple: false,
					validator: (
						value: string | number | boolean | string[] | number[],
					) => {
						if (typeof value === "string") {
							return validators.nonEmpty(value);
						}
						return false;
					},
				},
			],
		},
		nested: {
			name: "nested",
			description: "Nested command example",
			usage: "bun run example nested subcommand [options]",
			examples: [
				"bun run example nested subcommand",
				"bun run example nested subcommand --flag",
			],
			options: [],
			commands: {
				subcommand: {
					name: "subcommand",
					description: "A subcommand",
					usage: "bun run example nested subcommand [--flag]",
					examples: [
						"bun run example nested subcommand",
						"bun run example nested subcommand --flag",
					],
					options: [
						{
							long: "--flag",
							description: "A flag",
							required: false,
							defaultValue: false,
							type: "boolean",
							multiple: false,
							validator: validators.boolean,
						},
					],
				},
			},
		},
	},
} as const;

// Type-safe handlers with proper structure
export const exampleCommand = createClicoCommand(
	exampleConfig,
	({ xConsole, isLeaf }) => {
		if (isLeaf) {
			xConsole.log("📋 Example CLI - no subcommand provided");
			return;
		}

		return {
			hello: ({ options, xConsole }) => {
				const name = options.name || "world";
				xConsole.log(`👋 Hello, ${name}!`);
			},

			nested: ({ xConsole, isLeaf }) => {
				if (isLeaf) {
					xConsole.log("📁 Nested command structure - no subcommand provided");
					return;
				}

				return {
					subcommand: ({ options, xConsole }) => {
						const flag = options.flag;
						xConsole.log(`🔧 Subcommand executed${flag ? " with flag" : ""}`);
					},
				};
			},
		};
	},
);

if (import.meta.main) {
	exampleCommand(null); // Explicitly use null for process mode
} else {
	// Manual usage example - using explicit typing for better auto-complete
	exampleCommand({
		options: {
			verbose: true,
			quiet: false,
			"dry-run": false,
			help: false,
		},
		nested: {
			options: {
				verbose: true,
				quiet: false,
				"dry-run": false,
				help: false,
			},
			subcommand: {
				options: {
					verbose: true,
					quiet: false,
					"dry-run": false,
					help: false,
					flag: true,
				},
			},
		},
	});
}
