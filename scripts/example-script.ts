#!/usr/bin/env bun
/**
 * Example script demonstrating the modular argument parsing system
 * This shows how easy it is to create new scripts with consistent argument handling
 */
import { validators } from "./utils/arg-parser";
import { findCommand } from "./utils/command-finder";
import { createScript } from "./utils/create-scripts";

export const exampleScript = createScript(
	{
		name: "Example Script",
		description:
			"A simple example script demonstrating modular argument parsing",
		usage: "bun run example-script -f <file> -o <output> [--verbose]",
		examples: [
			"bun run example-script -f input.txt -o output.txt",
			"bun run example-script --file data.json --output result.json --verbose",
		],
		options: [
			{
				short: "-f",
				long: "--file",
				description: "Input file to process",
				required: true,
				validator: validators.fileExists,
			},
			{
				short: "-o",
				long: "--output",
				description: "Output file path",
				required: true,
				validator: validators.nonEmpty,
			},
			{
				short: "-v",
				long: "--verbose",
				description: "Enable verbose output",
				required: false,
				validator: validators.boolean,
			},
		],
	} as const,
	async (args: { file: string; output: string; verbose?: boolean }) => {
		console.log("📁 Processing file:", args.file);
		console.log("💾 Output will be saved to:", args.output);

		if (args.verbose) {
			console.log("🔍 Verbose mode enabled");
		}

		// Example of using the centralized command system
		const gitCmd = await findCommand("git");
		console.log(`✅ Found git at: ${gitCmd}`);

		// Your script logic here...
		console.log("✅ Example script completed successfully!");
	},
);

if (import.meta.main) {
	await exampleScript();
}
