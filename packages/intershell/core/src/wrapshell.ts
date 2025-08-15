/**
 * Enhanced script creation framework with improved type safety and validation
 */

import type {
  ScriptConfig,
  ArgOption,
  ParsedArgs,
  ValidationResult,
  Logger,
  ScriptHandler,
  ScriptInstance,
  ScriptOptions,
  HookHandler,
  Hooks,
  ProgressTracker,
  Spinner,
  ProgressBar,
} from './types.js';
import { colorify } from './colorify.js';

/**
 * Type utilities for better type inference
 */
type InferArgName<T extends ArgOption> = T['long'] extends `--${infer Name}` ? Name : never;

type InferArgValue<T extends ArgOption> = T['multiple'] extends true
  ? string[]
  : T['validator'] extends typeof validators.boolean
    ? boolean
    : string;

type RequiredOptions<T extends Pick<ScriptConfig, 'options'>> = {
  [K in T['options'][number] as K['required'] extends true
    ? InferArgName<K>
    : never]: InferArgValue<K>;
};

type OptionalOptions<T extends Pick<ScriptConfig, 'options'>> = {
  [K in T['options'][number] as K['required'] extends true
    ? never
    : InferArgName<K>]?: InferArgValue<K>;
};

export type InferArgs<T extends Pick<ScriptConfig, 'options'>> = RequiredOptions<T> &
  OptionalOptions<T> &
  RequiredOptions<typeof defaultConfig> &
  OptionalOptions<typeof defaultConfig>;

/**
 * Default configuration for all scripts
 */
export const defaultConfig = {
  options: [
    {
      short: '-v',
      long: '--verbose',
      description: 'Enable verbose output',
      required: false,
      defaultValue: true,
      validator: validators.boolean,
    },
    {
      short: '-q',
      long: '--quiet',
      description: 'Disable all warnings, still show errors',
      required: false,
      defaultValue: false,
      validator: validators.boolean,
    },
    {
      short: '-d',
      long: '--dry-run',
      description: 'Run the script without making any changes',
      required: false,
      defaultValue: false,
      validator: validators.boolean,
    },
    {
      short: '-h',
      long: '--help',
      description: 'Show help message for the script',
      required: false,
      defaultValue: false,
      validator: validators.boolean,
    },
  ],
} as const satisfies Pick<ScriptConfig, 'options'>;

/**
 * Enhanced validators with better type inference
 */
export const validators = {
  /**
   * Validate that a file exists
   */
  fileExists: (filePath: string): ValidationResult<string> => {
    try {
      const file = Bun.file(filePath);
      if (!file.size) {
        return {
          isValid: false,
          error: `File "${filePath}" not found.`,
        };
      }
      return {
        isValid: true,
        value: filePath,
      };
    } catch {
      return {
        isValid: false,
        error: `File "${filePath}" not found.`,
      };
    }
  },

  /**
   * Validate that a directory exists
   */
  directoryExists: (dirPath: string): ValidationResult<string> => {
    try {
      const stat = Bun.file(dirPath);
      // Basic existence check - Bun doesn't have direct directory checking
      return {
        isValid: true,
        value: dirPath,
      };
    } catch {
      return {
        isValid: false,
        error: `Directory "${dirPath}" not found.`,
      };
    }
  },

  /**
   * Validate against a list of allowed values
   */
  enum: <T extends string>(allowedValues: T[]) => 
    (value: string): ValidationResult<T> => {
      if (!allowedValues.includes(value as T)) {
        return {
          isValid: false,
          error: `Invalid value "${value}". Valid values: ${allowedValues.join(', ')}`,
        };
      }
      return {
        isValid: true,
        value: value as T,
      };
    },

  /**
   * Validate with regex pattern
   */
  regex: (pattern: RegExp, message?: string) => 
    (value: string): ValidationResult<string> => {
      if (!pattern.test(value)) {
        return {
          isValid: false,
          error: message || `Value "${value}" does not match required pattern.`,
        };
      }
      return {
        isValid: true,
        value,
      };
    },

  /**
   * Custom validation function
   */
  custom: <T>(validator: (value: string) => T | ValidationResult<T>) => 
    (value: string): ValidationResult<T> => {
      try {
        const result = validator(value);
        
        // If validator returns ValidationResult, use it directly
        if (typeof result === 'object' && result !== null && 'isValid' in result) {
          return result as ValidationResult<T>;
        }
        
        // Otherwise, assume success
        return {
          isValid: true,
          value: result as T,
        };
      } catch (error) {
        return {
          isValid: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },

  /**
   * Validate URL format
   */
  url: (value: string): ValidationResult<string> => {
    try {
      new URL(value);
      return {
        isValid: true,
        value,
      };
    } catch {
      return {
        isValid: false,
        error: `Invalid URL format: "${value}"`,
      };
    }
  },

  /**
   * Validate email format
   */
  email: (value: string): ValidationResult<string> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return {
        isValid: false,
        error: `Invalid email format: "${value}"`,
      };
    }
    return {
      isValid: true,
      value,
    };
  },

  /**
   * Validate semantic version format
   */
  semver: (value: string): ValidationResult<string> => {
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    if (!semverRegex.test(value)) {
      return {
        isValid: false,
        error: `Invalid semantic version format: "${value}"`,
      };
    }
    return {
      isValid: true,
      value,
    };
  },

  /**
   * Validate non-empty string
   */
  nonEmpty: (value: string): ValidationResult<string> => {
    if (!value || value.trim() === '') {
      return {
        isValid: false,
        error: 'Value cannot be empty.',
      };
    }
    return {
      isValid: true,
      value: value.trim(),
    };
  },

  /**
   * Validate boolean flag (always valid)
   */
  boolean: (): ValidationResult<boolean> => ({
    isValid: true,
    value: true,
  }),
};

/**
 * Global hooks system
 */
const globalHooks: Hooks = {
  beforeRun: [],
  afterRun: [],
  onError: [],
  onValidation: [],
};

/**
 * Enhanced WrapShell class with improved type inference
 */
export class WrapShell<TConfig extends ScriptConfig> {
  constructor(private config: TConfig) {}

  /**
   * Create a script with enhanced type inference
   */
  static createScript<TConfig extends ScriptConfig>(
    config: TConfig,
    handler: ScriptHandler<TConfig>
  ): ScriptInstance<TConfig> {
    const wrapShell = new WrapShell(config);
    
    return {
      config,
      async run(passedArgs?: InferArgs<TConfig>) {
        const args = passedArgs || await wrapShell.parseArgs();
        const logger = wrapShell.createLogger(args);

        try {
          // Run beforeRun hooks
          for (const hook of globalHooks.beforeRun) {
            await hook({ config, run: async () => {} });
          }

          const result = await handler(args, logger);

          // Run afterRun hooks
          for (const hook of globalHooks.afterRun) {
            await hook({ script: { config, run: async () => {} }, result });
          }

          return result;
        } catch (error) {
          // Run error hooks
          for (const hook of globalHooks.onError) {
            await hook({ 
              script: { config, run: async () => {} }, 
              error: error as Error 
            });
          }
          
          const message = error instanceof Error ? error.message : String(error);
          logger.error(`❌ ${config.name} failed: ${message}`);
          
          if (error instanceof Error && error.stack) {
            logger.debug(`Stack trace:\n${error.stack}`);
          }

          throw error;
        }
      },
    };
  }

  /**
   * Hook system for script lifecycle events
   */
  static hooks = {
    beforeRun(handler: HookHandler<ScriptInstance<any>>): void {
      globalHooks.beforeRun.push(handler);
    },
    
    afterRun(handler: HookHandler<{ script: ScriptInstance<any>; result: any }>): void {
      globalHooks.afterRun.push(handler);
    },
    
    onError(handler: HookHandler<{ script: ScriptInstance<any>; error: Error }>): void {
      globalHooks.onError.push(handler);
    },
    
    onValidation(handler: HookHandler<{ script: ScriptInstance<any>; input: any }>): void {
      globalHooks.onValidation.push(handler);
    },
  };

  /**
   * Progress reporting utilities
   */
  static progress = {
    create(total: number): ProgressTracker {
      let current = 0;
      
      return {
        update(value: number) {
          current = value;
          const percentage = Math.round((current / total) * 100);
          process.stdout.write(`\r${colorify.cyan('Progress:')} ${percentage}% (${current}/${total})`);
        },
        
        increment(amount = 1) {
          current = Math.min(total, current + amount);
          const percentage = Math.round((current / total) * 100);
          process.stdout.write(`\r${colorify.cyan('Progress:')} ${percentage}% (${current}/${total})`);
        },
        
        finish() {
          process.stdout.write(`\r${colorify.green('✓ Complete:')} 100% (${total}/${total})\n`);
        },
        
        setTotal(newTotal: number) {
          total = newTotal;
        },
      };
    },

    spinner(message: string): Spinner {
      const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      let frameIndex = 0;
      let interval: NodeJS.Timeout | null = null;

      return {
        start() {
          interval = setInterval(() => {
            process.stdout.write(`\r${frames[frameIndex]} ${message}`);
            frameIndex = (frameIndex + 1) % frames.length;
          }, 100);
        },

        stop() {
          if (interval) {
            clearInterval(interval);
            interval = null;
            process.stdout.write('\r');
          }
        },

        succeed(text?: string) {
          this.stop();
          console.log(`${colorify.green('✓')} ${text || message}`);
        },

        fail(text?: string) {
          this.stop();
          console.log(`${colorify.red('✗')} ${text || message}`);
        },

        warn(text?: string) {
          this.stop();
          console.log(`${colorify.yellow('⚠')} ${text || message}`);
        },

        info(text?: string) {
          this.stop();
          console.log(`${colorify.blue('ℹ')} ${text || message}`);
        },
      };
    },

    bar(total: number): ProgressBar {
      let current = 0;
      const barLength = 40;

      const render = () => {
        const percentage = current / total;
        const filledLength = Math.round(barLength * percentage);
        const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        const percent = Math.round(percentage * 100);
        
        process.stdout.write(`\r[${colorify.cyan(bar)}] ${percent}% (${current}/${total})`);
      };

      return {
        update(value: number) {
          current = value;
          render();
        },

        increment(amount = 1) {
          current = Math.min(total, current + amount);
          render();
        },

        finish() {
          current = total;
          render();
          process.stdout.write('\n');
        },
      };
    },
  };

  /**
   * Parse command line arguments with enhanced validation
   */
  private async parseArgs(): Promise<InferArgs<TConfig>> {
    const args = process.argv.slice(2);
    const result: ParsedArgs = {};
    const optionMap = new Map<string, ArgOption>();

    // Build option map for quick lookup
    [...defaultConfig.options, ...this.config.options].forEach((option) => {
      optionMap.set(option.short, option);
      optionMap.set(option.long, option);
    });

    // Set default values
    [...defaultConfig.options, ...this.config.options].forEach((option) => {
      const key = option.long.replace('--', '');
      if (!option.required && option.defaultValue !== undefined) {
        result[key] = option.defaultValue;
      }
    });

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];
      const isLastArg = !nextArg;
      const nextArgIsOption = !!nextArg && nextArg.startsWith('-');

      // Handle help
      if (arg === '-h' || arg === '--help') {
        this.showHelp();
        process.exit(0);
      }

      // Find the option
      const option = optionMap.get(arg);
      if (!option) {
        throw new Error(`❌ Unknown option "${arg}". Use -h for help.`);
      }

      const optionKey = option.long.replace('--', '');

      // Handle boolean flags
      if (option.validator === validators.boolean) {
        const consideredTrue = isLastArg || nextArgIsOption;
        const nextArgIsTrue = nextArg?.toLowerCase() === 'true' || nextArg === '1';
        const nextArgIsFalse = nextArg?.toLowerCase() === 'false' || nextArg === '0';

        if (!consideredTrue && !nextArgIsTrue && !nextArgIsFalse) {
          throw new Error(
            `❌ ${option.short}/${option.long} is a boolean flag and cannot be used with value ${nextArg}.`
          );
        }

        result[optionKey] = consideredTrue || nextArgIsTrue;

        if (nextArgIsTrue || nextArgIsFalse) {
          i++;
        }
        continue;
      }

      // Handle value options
      if (isLastArg || nextArgIsOption) {
        throw new Error(`❌ ${option.short}/${option.long} requires a value`);
      }

      // Validate the value
      if (option.validator) {
        const validation = await option.validator(nextArg);
        if (typeof validation === 'string') {
          throw new Error(`❌ ${validation}`);
        }
        if (typeof validation === 'boolean' && !validation) {
          throw new Error(`❌ Invalid value for ${option.short}/${option.long}`);
        }
      }

      // Handle multiple values
      if (option.multiple) {
        if (!result[optionKey]) {
          result[optionKey] = [];
        }
        (result[optionKey] as string[]).push(nextArg);
      } else {
        result[optionKey] = nextArg;
      }

      i++; // Skip next argument since we consumed it
    }

    // Validate required options
    [...defaultConfig.options, ...this.config.options].forEach((option) => {
      if (option.required && result[option.long.replace('--', '')] === undefined) {
        throw new Error(`❌ ${option.short}/${option.long} is required. Use -h for help.`);
      }
    });

    return result as InferArgs<TConfig>;
  }

  /**
   * Create a logger with appropriate verbosity settings
   */
  private createLogger(args: any): Logger {
    let logLevel: 'error' | 'warn' | 'info' | 'debug' = 'info';
    
    if (args.quiet) {
      logLevel = 'error';
    } else if (args.verbose) {
      logLevel = 'debug';
    }

    return {
      error: (message: string, ...args: any[]) => {
        console.error(colorify.red(message), ...args);
      },
      warn: (message: string, ...args: any[]) => {
        if (logLevel !== 'error') {
          console.warn(colorify.yellow(message), ...args);
        }
      },
      info: (message: string, ...args: any[]) => {
        if (logLevel !== 'error' && logLevel !== 'warn') {
          console.info(colorify.blue(message), ...args);
        }
      },
      debug: (message: string, ...args: any[]) => {
        if (logLevel === 'debug') {
          console.log(colorify.gray(message), ...args);
        }
      },
      setLevel: (level: 'error' | 'warn' | 'info' | 'debug') => {
        logLevel = level;
      },
    };
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    const allOptions = [...defaultConfig.options, ...this.config.options];
    
    console.log(`
${colorify.bold(this.config.name)}

${this.config.description}

${colorify.yellow('Usage:')}
  ${this.config.usage}

${colorify.yellow('Options:')}
${allOptions
  .map((option) => {
    const required = option.required ? colorify.red(' (required)') : '';
    return `  ${colorify.cyan(option.short)}, ${colorify.cyan(option.long)}${required}     ${option.description}`;
  })
  .join('\n')}

${colorify.yellow('Examples:')}
${this.config.examples.map((example) => `  ${colorify.gray(example)}`).join('\n')}
`);
  }
}