#!/usr/bin/env bun
import { validators } from "./utils/arg-parser";
import { createScript } from "./utils/create-scripts";

const exampleScriptConfig = {
	name: "Example Script",
	description: "A simple example script demonstrating modular argument parsing",
	usage: "bun run example-script -f <file> -o <output> [--verbose]",
	examples: [
		"bun run example-script -f input.txt -o output.txt",
		"bun run example-script --file data.json --output result.json --verbose --dry-run --quite --help",
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
	],
} as const;

export const exampleScript = createScript(
	exampleScriptConfig,
	async function main(args, xConsole) {
		xConsole.info("📁 Processing file:", args.file);
		xConsole.log("💾 Output will be saved to:", args.output);
		xConsole.warn("🔍 Verbose mode enabled");
		// Your script logic here...
		xConsole.log("✅ Example script completed successfully!");
	},
);

if (import.meta.main) {
	exampleScript();
}
