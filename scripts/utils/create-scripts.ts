/**
 * Utility to create a script with automatic error handling and type safety
 */
export function createScript<
	Config extends ScriptConfig,
	Return extends Promise<void> | void,
>(
	config: Config,
	fn: (
		args: InferArgs<typeof defaultConfig> & InferArgs<Config>,
		cliConsole: typeof console,
	) => Return,
	options: {
		exitOnError?: boolean;
		showStack?: boolean;
	} = {},
): (
	passedArgs?: InferArgs<typeof defaultConfig> & InferArgs<Config>,
) => Return {
	return (passedArgs) => {
		// Parse command line args if no passed args
		const cliArgs =
			passedArgs ||
			parseArgs({
				...defaultConfig,
				...config,
				options: [...defaultConfig.options, ...config.options],
			});

		// Merge with defaults to ensure all default values are present
		const defaultArgs = {
			verbose: true,
			quiet: false,
			"dry-run": false,
			help: false,
		};

		const args = {
			...defaultArgs,
			...cliArgs,
		} as InferArgs<typeof defaultConfig> & InferArgs<Config>;

		const c: typeof console = Object.assign({}, console, {
			warn: (...props: Parameters<typeof console.warn>) => {
				if (!("quiet" in args) || !args.quiet) console.warn(...props);
			},
			info: (...props: Parameters<typeof console.info>) => {
				if (!("verbose" in args) || !args.verbose) console.info(...props);
			},
			log: (...props: Parameters<typeof console.log>) => {
				if (!("verbose" in args) || args.verbose) console.log(...props);
			},
		});

		try {
			return fn(args, c);
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			c.error(`❌ ${config.name} failed:`, message);
			if (e instanceof Error && e.stack) c.error(`Stack trace:\n${e.stack}\n`);

			if (options.exitOnError) process.exit(1);
			throw e;
		}
	};
}

export interface ArgOption {
	short: string;
	long: string;
	description: string;
	required?: boolean;
	defaultValue?: string | boolean | number;
	multiple?: boolean; // Allow multiple values for this option
	validator?: (value: string) => boolean | string;
	examples?: string[];
}

export interface ScriptConfig {
	name: string;
	description: string;
	usage: string;
	examples: readonly string[];
	options: readonly ArgOption[];
}

type ScriptConfigOptions = Pick<ScriptConfig, "options">;

export interface ParsedArgs {
	[key: string]: string | boolean | string[] | undefined;
}

type InferArgName<T extends ArgOption> = T["long"] extends `--${infer Name}`
	? Name
	: never;

type InferArgValue<T extends ArgOption> = T["multiple"] extends true
	? string[]
	: T["validator"] extends typeof validators.boolean
		? boolean
		: string;

type RequiredOptions<T extends ScriptConfigOptions> = {
	[K in T["options"][number] as K["required"] extends true
		? InferArgName<K>
		: never]: InferArgValue<K>;
};

type OptionalOptions<T extends ScriptConfigOptions> = {
	[K in T["options"][number] as K["required"] extends true
		? never
		: InferArgName<K>]?: InferArgValue<K>;
};

/**
 * Type utility to infer argument types from ScriptConfig
 * Combines required and optional options
 */
export type InferArgs<T extends ScriptConfigOptions> = RequiredOptions<T> &
	OptionalOptions<T>;

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
		const isLastArg = !nextArg;
		const nextArgIsOption = !!nextArg && nextArg.startsWith("-");

		// Set default values for options that are not required
		config.options.forEach((option) => {
			const key = option.long.replace("--", "");
			if (!option.required && !result[key]) {
				result[key] = option.defaultValue as InferArgValue<typeof option>;
			}
		});

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

		const optionKey = option.long.replace("--", "");
		// Handle boolean flags (no value needed)
		if (option.validator === validators.boolean) {
			const consideredTrue = isLastArg || nextArgIsOption;

			const nextArgIsTrue =
				nextArg?.toLowerCase().toString() === "true" ||
				nextArg?.toLowerCase().toString() === "1";
			const nextArgIsFalse =
				nextArg?.toLowerCase().toString() === "false" ||
				nextArg?.toLowerCase().toString() === "0";

			if (!consideredTrue && !nextArgIsTrue && !nextArgIsFalse) {
				throw new Error(
					`❌ Error: ${option.short}/${option.long} is a boolean flag and cannot be used with a value ${nextArg}.`,
				);
			}

			result[optionKey] = consideredTrue || nextArgIsTrue || !nextArgIsFalse;

			if (nextArgIsTrue || nextArgIsFalse) {
				i++;
			}

			continue;
		}

		// Handle value options
		if (isLastArg || nextArgIsOption) {
			throw new Error(
				`❌ Error: ${option.short}/${option.long} requires a value`,
			);
		}

		// Validate the value
		const validation = option.validator?.(nextArg) ?? true;
		if (typeof validation === "string") {
			throw new Error(`❌ Error: ${validation}`);
		}
		if (!validation) {
			throw new Error(
				`❌ Error: Invalid value for ${option.short}/${option.long}`,
			);
		}

		// Handle multiple values for the same option
		if (!option.multiple) {
			result[optionKey] = nextArg;
		} else {
			result[optionKey] = (result[optionKey] || []) as string[];
			result[optionKey];
		}

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

export const defaultConfig = {
	options: [
		{
			short: "-v",
			long: "--verbose",
			description: "Enable verbose output",
			required: false,
			defaultValue: true,
			validator: validators.boolean,
		},
		{
			short: "-q",
			long: "--quiet",
			description: "Disable all of warns, still show errors",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-d",
			long: "--dry-run",
			description: "Run the script without making any changes",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-h",
			long: "--help",
			description: "Show help message for the script",
			required: false,
			defaultValue: false,
			validator: validators.boolean,
		},
	],
} as const satisfies Pick<ScriptConfig, "options">;
