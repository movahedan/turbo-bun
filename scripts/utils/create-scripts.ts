import type { InferArgs, ScriptConfig } from "./arg-parser";
import { defaultConfig, parseArgs } from "./arg-parser";

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

		const c: typeof console = Object.assign(console, {
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
