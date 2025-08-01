import type {
	ClicoCommand,
	ClicoContext,
	ClicoHandler,
	DefaultOptions,
	NestedArgs,
	NestedOptions,
} from "./clico.d";

export * from "./clico.d";

// Validators - moved to top to avoid hoisting issues
export const validators = {
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

	enum:
		(allowedValues: string[]) =>
		(value: string): boolean | string => {
			if (!allowedValues.includes(value)) {
				return `Invalid value "${value}". Valid values: ${allowedValues.join(", ")}`;
			}
			return true;
		},

	nonEmpty: (value: string): boolean | string => {
		if (!value || value.trim() === "") {
			return "Value cannot be empty.";
		}
		return true;
	},

	boolean: () => true,

	number: (value: string): boolean | string => {
		const num = Number(value);
		return !Number.isNaN(num) ? true : `Invalid number: ${value}`;
	},
} as const;

// Default options that appear at every level
export const defaultClicoConfig = {
	options: [
		{
			short: "-v",
			long: "--verbose",
			type: "boolean" as const,
			description: "Enable verbose output",
			required: false,
			multiple: false,
			defaultValue: true,
			validator: validators.boolean,
		},
		{
			short: "-q",
			long: "--quiet",
			type: "boolean" as const,
			description: "Disable all warns, still show errors",
			required: false,
			multiple: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-d",
			long: "--dry-run",
			type: "boolean" as const,
			description: "Run the script without making any changes",
			required: false,
			multiple: false,
			defaultValue: false,
			validator: validators.boolean,
		},
		{
			short: "-h",
			long: "--help",
			type: "boolean" as const,
			description: "Show help message for the script",
			required: false,
			multiple: false,
			defaultValue: false,
			validator: validators.boolean,
		},
	],
} as const;

// Validation functions
const validateConfigStructure = (
	config: ClicoCommand,
	path: string[] = [],
): void => {
	const currentPath = [...path, config.name].join(".");

	// Check for duplicate options within this command
	const optionNames = new Set<string>();
	const optionShorts = new Set<string>();

	config.options.forEach((option) => {
		if (optionNames.has(option.long)) {
			throw new Error(
				`❌ Duplicate option "${option.long}" in command "${currentPath}"`,
			);
		}
		optionNames.add(option.long);

		if (option.short) {
			if (optionShorts.has(option.short)) {
				throw new Error(
					`❌ Duplicate short option "${option.short}" in command "${currentPath}"`,
				);
			}
			optionShorts.add(option.short);
		}
	});

	// Check commands at this level
	if (config.commands) {
		Object.entries(config.commands).forEach(([cmdName, cmd]) => {
			if (cmd.name !== cmdName) {
				throw new Error(
					`❌ Command key "${cmdName}" doesn't match command name "${cmd.name}" in "${currentPath}"`,
				);
			}

			// Recursively validate nested commands
			validateConfigStructure(cmd, [...path, config.name]);
		});
	}
};

// Parse process arguments into nested structure
export function parseProcessArgs<T extends ClicoCommand>(
	args: string[],
	config: T,
): NestedArgs<T> {
	validateConfigStructure(config);

	const result: NestedArgs<T> = {
		options: {} as NestedOptions<T>,
	} as NestedArgs<T>;

	const commandPath: string[] = [];
	let currentConfig: ClicoCommand = config;
	let currentResult = result;

	// Add default options to root level
	const defaultOptions: DefaultOptions = {
		verbose: true,
		quiet: false,
		"dry-run": false,
		help: false,
	};

	Object.assign(currentResult.options, defaultOptions);

	// Add config options to root level
	config.options.forEach((option) => {
		if ("defaultValue" in option) {
			const key = option.long.replace("--", "") as keyof NestedOptions<T>;
			Object.assign(currentResult.options, {
				[key]: option.defaultValue,
			});
		}
	});

	let i = 0;
	while (i < args.length) {
		const arg = args[i];

		// Handle help option
		if (arg === "-h" || arg === "--help") {
			showClicoCommandHelp(currentConfig, commandPath);
			process.exit(0);
		}

		// Check if it's an option
		if (arg.startsWith("-")) {
			const { consumed, error } = parseOption(
				args,
				i,
				currentConfig,
				currentResult,
			);
			if (error) {
				showClicoCommandHelp(currentConfig, commandPath);
				throw new Error(error);
			}
			i += consumed;
			continue;
		}

		// Check if it's a command
		if (currentConfig.commands) {
			const commandConfig = currentConfig.commands[arg];
			if (commandConfig) {
				commandPath.push(arg);

				// Create nested structure - command names are direct properties
				const nestedResult = {
					options: {} as NestedOptions<typeof commandConfig>,
				} as NestedArgs<typeof commandConfig>;
				(currentResult as Record<string, unknown>)[arg] = nestedResult;

				// Add default options to this level
				Object.assign(nestedResult.options, defaultOptions);

				// Add command-specific options with defaults
				commandConfig.options.forEach((option) => {
					const key = option.long.replace("--", "");
					if (!Object.hasOwn(nestedResult.options, key)) {
						Object.assign(nestedResult.options, {
							[key]: option.defaultValue,
						});
					}
				});

				// Move to nested level
				currentConfig = commandConfig;
				currentResult = nestedResult as NestedArgs<T>;
				i++;
				continue;
			}
		}

		// Unknown argument
		showClicoCommandHelp(currentConfig, commandPath);
		throw new Error(`❌ Unknown argument "${arg}"`);
	}

	// Validate required options at final level
	validateRequiredOptions(currentConfig, currentResult, commandPath);

	return result;
}

// Parse a single option
function parseOption(
	args: string[],
	index: number,
	config: ClicoCommand,
	result: NestedArgs<ClicoCommand>,
): { consumed: number; error?: string } {
	const arg = args[index];
	const nextArg = args[index + 1];

	// Find option in current config or default config
	let option = config.options.find(
		(opt) => opt.long === arg || opt.short === arg,
	);
	if (!option) {
		option = defaultClicoConfig.options.find(
			(opt) => opt.long === arg || opt.short === arg,
		);
	}

	if (!option) {
		return { consumed: 0, error: `Unknown option "${arg}"` };
	}

	const key = option.long.replace("--", "");

	// Handle boolean options
	if (option.validator === validators.boolean || !option.validator) {
		Object.assign(result.options, {
			[key]: true,
		});
		return { consumed: 1 };
	}

	// Handle value options
	if (!nextArg || nextArg.startsWith("-")) {
		return { consumed: 0, error: `Option "${arg}" requires a value` };
	}

	// Validate value
	if (option.validator) {
		const validation = option.validator(nextArg as never);
		if (typeof validation === "string") {
			return { consumed: 0, error: validation };
		}
		if (!validation) {
			return { consumed: 0, error: `Invalid value for "${arg}": ${nextArg}` };
		}
	}

	// Handle multiple values
	if (option.multiple) {
		if (!Object.hasOwn(result.options, key)) {
			Object.assign(result.options, {
				[key]: [nextArg],
			});
		} else {
			const existingValue = (result.options as Record<string, unknown>)[
				key
			] as string[];
			Object.assign(result.options, {
				[key]: [...existingValue, nextArg],
			});
		}
	} else {
		// Handle single value - convert to appropriate type
		let value: string | number | boolean = nextArg;

		// Convert to number if option type is number
		if (option.type === "number") {
			value = Number(nextArg);
		}
		// Convert to boolean if option type is boolean
		else if (option.type === "boolean") {
			value = nextArg === "true" || nextArg === "1";
		}

		Object.assign(result.options, {
			[key]: value,
		});
	}

	return { consumed: 2 };
}

// Validate required options
function validateRequiredOptions(
	config: ClicoCommand,
	result: NestedArgs<ClicoCommand>,
	commandPath: string[],
): void {
	config.options.forEach((option) => {
		if (option.required) {
			const key = option.long.replace("--", "");
			const options = result.options as Record<string, unknown>;
			if (options[key] === undefined || options[key] === null) {
				showClicoCommandHelp(config, commandPath);
				throw new Error(`❌ Required option "${option.long}" is missing`);
			}
		}
	});
}

// Show help for a specific command level
export function showClicoCommandHelp(
	config: ClicoCommand,
	commandPath: string[] = [],
): void {
	const fullPath =
		commandPath.length > 0
			? `${commandPath.join(" ")} ${config.name}`
			: config.name;

	console.log(`
${fullPath}

${config.description}

Usage:
  ${config.usage}

${
	config.commands && Object.keys(config.commands).length > 0
		? `Commands:
${Object.entries(config.commands)
	.map(([cmdName, cmd]) => `  ${cmdName}     ${cmd.description}`)
	.join("\n")}

`
		: ""
}Options:
${[...defaultClicoConfig.options, ...config.options]
	.map((option) => {
		const required = option.required ? " (required)" : "";
		const shortOpt = option.short ? `${option.short}, ` : "";
		return `  ${shortOpt}${option.long}${required}     ${option.description}`;
	})
	.join("\n")}

Examples:
${config.examples.map((example) => `  ${example}`).join("\n")}
`);
}

// Validate nested args structure at runtime
function validateNestedArgs<T extends ClicoCommand>(
	args: NestedArgs<T>,
	config: T,
	path: string[] = [],
): void {
	const currentPath = path.join(".");

	// Validate options at current level
	if (args.options) {
		config.options.forEach((option) => {
			const key = option.long.replace("--", "") as keyof typeof args.options;
			if (
				option.required &&
				(args.options[key] === undefined || args.options[key] === null)
			) {
				throw new Error(
					`❌ Required option "${option.long}" missing at ${currentPath || "root"}`,
				);
			}
		});
	}

	// Validate nested commands if present
	if (config.commands) {
		Object.keys(config.commands).forEach((cmdName) => {
			const cmdKey = cmdName as keyof typeof args;
			if (cmdKey in args && args[cmdKey] && config.commands) {
				const cmdConfig = config.commands[cmdName];
				if (!cmdConfig) {
					throw new Error(`❌ Command config not found for "${cmdName}"`);
				}
				validateNestedArgs(
					args[cmdKey] as NestedArgs<typeof cmdConfig>,
					cmdConfig,
					[...path, cmdName],
				);
			}
		});
	}
}

// Create enhanced console with recursive options
function createEnhancedConsole(
	options: NestedOptions<ClicoCommand>,
): typeof console {
	return Object.assign({}, console, {
		warn: (...props: Parameters<typeof console.warn>) => {
			if (!options.quiet) console.warn(...props);
		},
		info: (...props: Parameters<typeof console.info>) => {
			if (options.verbose) console.info(...props);
		},
		log: (...props: Parameters<typeof console.log>) => {
			if (options.verbose) console.log(...props);
		},
	});
}

// Recursive execution engine
async function executeHandlers<T extends ClicoCommand>(
	config: T,
	handler: ClicoHandler<T>,
	args: NestedArgs<T>,
	options: {
		runNested?: boolean;
		xConsole: typeof console;
		input: string;
	},
) {
	const { runNested = false, xConsole, input } = options;

	// Find which commands are present as direct properties
	const presentCommands = config.commands
		? Object.keys(config.commands).filter(
				(cmdName) => cmdName in args && args[cmdName as keyof typeof args],
			)
		: [];

	if (presentCommands.length > 1) {
		throw new Error(
			`❌ Only one command can be provided at a time. Found ${presentCommands.join(", ")}`,
		);
	}

	// Determine if this is a leaf node
	const cmdName = presentCommands[0];
	const commandArgs = cmdName ? args[cmdName as keyof typeof args] : undefined;
	const hasNestedCommand = presentCommands.length > 0;

	// If no nested commands and handler is a function, execute as leaf
	if (!hasNestedCommand) {
		const result = handler({
			options: args.options,
			xConsole,
			input,
			isLeaf: true,
		} as ClicoContext<T>);

		// Only return void or Promise<void> for leaf executions
		return result;
	}

	const isLeaf = !hasNestedCommand;

	// Execute current handler
	const result = await handler({
		options: args.options,
		xConsole,
		input,
		isLeaf,
	} as ClicoContext<T>);

	const nestedHandlers = result;

	const cmdConfig =
		cmdName && config.commands ? config.commands[cmdName] : undefined;
	if (!cmdConfig) {
		throw new Error(`❌ Command config not found for "${cmdName}"`);
	}

	const nestedHandler = nestedHandlers[cmdName as keyof typeof nestedHandlers];

	return executeHandlers(
		cmdConfig,
		nestedHandler as ClicoHandler<typeof cmdConfig>,
		commandArgs as NestedArgs<typeof cmdConfig>,
		{
			runNested,
			xConsole,
			input,
		},
	);
}

/**
 * Create a clico command with full type safety and recursive execution
 */
export function createClicoCommand<T extends ClicoCommand>(
	config: T,
	handler: ClicoHandler<T>,
	options: {
		exitOnError?: boolean;
		showStack?: boolean;
		runNested?: boolean;
	} = {},
): (passedArgs?: NestedArgs<T> | null) => Promise<void> | void {
	const { exitOnError = true, showStack = false, runNested = false } = options;

	return (passedArgs = null) => {
		try {
			const isProcessMode = passedArgs === null;
			const parsedArgs: NestedArgs<T> = isProcessMode
				? parseProcessArgs(process.argv.slice(2), config)
				: passedArgs;

			// Validate arguments
			validateNestedArgs(parsedArgs, config);

			// Create enhanced console
			const xConsole = createEnhancedConsole(parsedArgs.options);

			// Execute handlers recursively
			return executeHandlers(config, handler, parsedArgs, {
				runNested,
				xConsole,
				input: isProcessMode
					? process.argv.join(" ")
					: JSON.stringify(passedArgs),
			}) as void | Promise<void>;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(`❌ ${config.name} failed: ${message}`);

			if (showStack && error instanceof Error && error.stack) {
				console.error(`Stack trace:\n${error.stack}`);
			}

			if (exitOnError) {
				process.exit(1);
			}

			throw error;
		}
	};
}
