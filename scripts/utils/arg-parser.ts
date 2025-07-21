/**
 * Reusable argument parsing utilities for scripts
 * Provides modular argument parsing, validation, and help generation
 */

// Import Bun types for file operations
declare const Bun: {
	file(path: string): { size: number };
};

export interface ArgOption {
	short: string;
	long: string;
	description: string;
	required?: boolean;
	validator?: (value: string) => boolean | string;
	examples?: string[];
}

export interface ScriptConfig {
	name: string;
	description: string;
	usage: string;
	examples: readonly string[] | string[];
	options: readonly ArgOption[] | ArgOption[];
}

export interface ParsedArgs {
	[key: string]: string | boolean;
}

/**
 * Type utility to infer argument types from ScriptConfig
 */
export type InferArgs<T extends ScriptConfig> = {
	[K in T["options"][number] as K["long"] extends `--${infer Name}`
		? Name
		: never]: K["validator"] extends typeof validators.boolean
		? boolean
		: string;
};

/**
 * Parse command line arguments based on script configuration
 */
export function parseArgs<T extends ScriptConfig>(config: T): InferArgs<T> {
	const args = process.argv.slice(2);
	const result: ParsedArgs = {};
	const optionMap = new Map<string, ArgOption>();

	// Build option map for quick lookup
	config.options.forEach((option) => {
		optionMap.set(option.short, option);
		optionMap.set(option.long, option);
	});

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		const nextArg = args[i + 1];

		// Handle help
		if (arg === "-h" || arg === "--help") {
			showHelp(config);
			process.exit(0);
		}

		// Find the option
		const option = optionMap.get(arg);
		if (!option) {
			throw new Error(`❌ Error: Unknown option "${arg}". Use -h for help.`);
		}

		// Handle boolean flags (no value needed)
		if (
			option.validator === undefined ||
			option.validator === validators.boolean
		) {
			result[option.long.replace("--", "")] = true;
			continue;
		}

		// Handle value options
		if (!nextArg || nextArg.startsWith("-")) {
			throw new Error(
				`❌ Error: ${option.short}/${option.long} requires a value`,
			);
		}

		// Validate the value
		const validation = option.validator(nextArg);
		if (typeof validation === "string") {
			throw new Error(`❌ Error: ${validation}`);
		}
		if (!validation) {
			throw new Error(
				`❌ Error: Invalid value for ${option.short}/${option.long}`,
			);
		}

		result[option.long.replace("--", "")] = nextArg;
		i++; // Skip next argument since we consumed it
	}

	// Validate required options
	config.options.forEach((option) => {
		if (option.required && !result[option.long.replace("--", "")]) {
			throw new Error(
				`❌ Error: ${option.short}/${option.long} is required. Use -h for help.`,
			);
		}
	});

	return result as InferArgs<T>;
}

/**
 * Generate and display help information
 */
export function showHelp(config: ScriptConfig): void {
	console.log(`
${config.name}

${config.description}

Usage:
  ${config.usage}

Arguments:
${config.options
	.map((option) => {
		const required = option.required ? " (required)" : "";
		return `  ${option.short}, ${option.long}${required}     ${option.description}`;
	})
	.join("\n")}

Examples:
${config.examples.map((example) => `  ${example}`).join("\n")}
`);
}

/**
 * Common validators for different types of arguments
 */
export const validators = {
	/**
	 * Validate that a file exists
	 */
	fileExists: (filePath: string): boolean | string => {
		try {
			const file = Bun.file(filePath);
			if (!file.size) {
				return `File "${filePath}" not found.`;
			}
			return true;
		} catch {
			return `File "${filePath}" not found.`;
		}
	},

	/**
	 * Validate against a list of allowed values
	 */
	enum:
		(allowedValues: string[]) =>
		(value: string): boolean | string => {
			if (!allowedValues.includes(value)) {
				return `Invalid value "${value}". Valid values: ${allowedValues.join(", ")}`;
			}
			return true;
		},

	/**
	 * Validate non-empty string
	 */
	nonEmpty: (value: string): boolean | string => {
		if (!value || value.trim() === "") {
			return "Value cannot be empty.";
		}
		return true;
	},

	/**
	 * Validate boolean flag (no validation needed)
	 */
	boolean: () => true,
};
