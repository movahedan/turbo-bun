// #!/usr/bin/env bun

// /**
//  * Test Configuration Script
//  * Provides utilities for managing bun testing with watch mode and different scenarios
//  */

// import { $ } from "bun";
// import { colorify } from "./colorify";

// interface TestConfig {
// 	mode: "watch" | "coverage" | "normal";
// 	parallel: boolean;
// 	clear: boolean;
// 	coverage: boolean;
// 	timeout: number;
// 	filter?: string;
// 	affected: boolean;
// 	force: boolean;
// }

// class TestManager {
// 	private config: TestConfig;

// 	constructor(config: Partial<TestConfig> = {}) {
// 		this.config = {
// 			mode: "normal",
// 			parallel: false,
// 			clear: false,
// 			coverage: false,
// 			timeout: 5000,
// 			affected: false,
// 			force: false,
// 			...config,
// 		};
// 	}

// 	/**
// 	 * Run tests with the current configuration
// 	 */
// 	async runTests(): Promise<void> {
// 		const args = this.buildArgs();

// 		console.log(colorify.blue("🧪 Running tests with configuration:"));
// 		console.log(colorify.gray(`Mode: ${this.config.mode}`));
// 		console.log(colorify.gray(`Parallel: ${this.config.parallel}`));
// 		console.log(colorify.gray(`Coverage: ${this.config.coverage}`));
// 		console.log(colorify.gray(`Filter: ${this.config.filter || "all"}`));

// 		try {
// 			if (this.config.mode === "watch") {
// 				await this.runWatchMode();
// 			} else {
// 				await this.runNormalMode();
// 			}
// 		} catch (error) {
// 			console.error(colorify.red("❌ Test run failed:"), error);
// 			process.exit(1);
// 		}
// 	}

// 	/**
// 	 * Build command line arguments for bun test
// 	 */
// 	private buildArgs(): string[] {
// 		const args: string[] = [];

// 		// Add watch mode
// 		if (this.config.mode === "watch") {
// 			args.push("--watch");
// 		}

// 		// Add coverage
// 		if (this.config.coverage) {
// 			args.push("--coverage");
// 		}

// 		// Add timeout
// 		if (this.config.timeout) {
// 			args.push("--timeout", this.config.timeout.toString());
// 		}

// 		// Add parallel execution
// 		if (this.config.parallel) {
// 			args.push("--parallel");
// 		}

// 		// Add clear console
// 		if (this.config.clear) {
// 			args.push("--clear");
// 		}

// 		return args;
// 	}

// 	/**
// 	 * Run tests in watch mode
// 	 */
// 	private async runWatchMode(): Promise<void> {
// 		console.log(colorify.yellow("👀 Starting watch mode..."));
// 		console.log(colorify.gray("Press Ctrl+C to stop watching"));

// 		const args = this.buildArgs();
// 		await $`turbo run test:watch ${args}`;
// 	}

// 	/**
// 	 * Run tests in normal mode
// 	 */
// 	private async runNormalMode(): Promise<void> {
// 		const args = this.buildArgs();
// 		const turboArgs: string[] = [];

// 		if (this.config.affected) {
// 			turboArgs.push("--affected");
// 		}

// 		if (this.config.force) {
// 			turboArgs.push("--force");
// 		}

// 		if (this.config.filter) {
// 			turboArgs.push("--filter", this.config.filter);
// 		}

// 		await $`turbo run test ${args} ${turboArgs}`;
// 	}

// 	/**
// 	 * Set watch mode
// 	 */
// 	watch(): this {
// 		this.config.mode = "watch";
// 		return this;
// 	}

// 	/**
// 	 * Set coverage mode
// 	 */
// 	coverage(): this {
// 		this.config.coverage = true;
// 		return this;
// 	}

// 	/**
// 	 * Set parallel execution
// 	 */
// 	parallel(): this {
// 		this.config.parallel = true;
// 		return this;
// 	}

// 	/**
// 	 * Set clear console
// 	 */
// 	clear(): this {
// 		this.config.clear = true;
// 		return this;
// 	}

// 	/**
// 	 * Set filter
// 	 */
// 	filter(filter: string): this {
// 		this.config.filter = filter;
// 		return this;
// 	}

// 	/**
// 	 * Set affected mode
// 	 */
// 	affected(): this {
// 		this.config.affected = true;
// 		return this;
// 	}

// 	/**
// 	 * Set force mode
// 	 */
// 	force(): this {
// 		this.config.force = true;
// 		return this;
// 	}

// 	/**
// 	 * Set timeout
// 	 */
// 	timeout(ms: number): this {
// 		this.config.timeout = ms;
// 		return this;
// 	}
// }

// // Export the TestManager class
// export { TestManager };

// // If this script is run directly
// if ((import.meta as any).main) {
// 	const args = process.argv.slice(2);
// 	const manager = new TestManager();

// 	// Parse command line arguments
// 	for (let i = 0; i < args.length; i++) {
// 		const arg = args[i];

// 		switch (arg) {
// 			case "--watch":
// 			case "-w":
// 				manager.watch();
// 				break;
// 			case "--coverage":
// 			case "-c":
// 				manager.coverage();
// 				break;
// 			case "--parallel":
// 			case "-p":
// 				manager.parallel();
// 				break;
// 			case "--clear":
// 				manager.clear();
// 				break;
// 			case "--affected":
// 			case "-a":
// 				manager.affected();
// 				break;
// 			case "--force":
// 			case "-f":
// 				manager.force();
// 				break;
// 			case "--filter":
// 			case "-F": {
// 				const filter = args[++i];
// 				if (filter) manager.filter(filter);
// 				break;
// 			}
// 			case "--timeout":
// 			case "-t": {
// 				const timeout = Number.parseInt(args[++i]);
// 				if (!isNaN(timeout)) manager.timeout(timeout);
// 				break;
// 			}
// 			case "--help":
// 			case "-h":
// 				console.log(`
// ${colorify.blue("🧪 Bun Test Manager")}

// Usage: bun run @repo/test-preset/config [options]

// Options:
//   --watch, -w           Run tests in watch mode
//   --coverage, -c        Generate coverage report
//   --parallel, -p        Run tests in parallel
//   --clear               Clear console before each run
//   --affected, -a        Only run tests for affected packages
//   --force, -f           Force run all tests
//   --filter <filter>, -F <filter>  Filter packages to test
//   --timeout <ms>, -t <ms>  Set test timeout in milliseconds
//   --help, -h            Show this help message

// Examples:
//   bun run @repo/test-preset/config --watch
//   bun run @repo/test-preset/config --coverage --affected
//   bun run @repo/test-preset/config --filter @repo/ui --watch
// `);
// 				process.exit(0);
// 				break;
// 		}
// 	}

// 	// Run tests with the configuration
// 	await manager.runTests();
// }
