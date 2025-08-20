#!/usr/bin/env bun
import { createScript, type ScriptConfig } from "@repo/intershell/core";

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
			short: "-b",
			long: "--build",
			description: "Build mode",
			required: false,
			type: "boolean",
			validator: createScript.validators.boolean,
		},
		{
			short: "-f",
			long: "--file",
			description: "Input file to process",
			required: true,
			type: "string",
			validator: createScript.validators.fileExists,
		},
		{
			short: "-o",
			long: "--output",
			description: "Output file path",
			required: true,
			type: "string",
			validator: createScript.validators.nonEmpty,
		},
	],
} as const satisfies ScriptConfig;

export const exampleScript = createScript(exampleScriptConfig, async function main(args, xConsole) {
	xConsole.info("📁 Processing file:", args.file);
	xConsole.log("💾 Output will be saved to:", args.output);
	xConsole.warn("🔍 Verbose mode enabled");
	// Your script logic here...
	xConsole.log("✅ Example script completed successfully!");
});

if (import.meta.main) {
	exampleScript.run();
}
