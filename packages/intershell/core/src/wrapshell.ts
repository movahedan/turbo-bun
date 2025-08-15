/**
 * Enhanced script creation framework for the InterShell CLI system
 * Provides type-safe argument parsing, validation, and hook system
 */

import type {
  ScriptConfig,
  ScriptHandler,
  ScriptInstance,
  InferArgs,
  ValidationResult,
  ValidationError,
  ArgOption,
  HookSystem,
  HookContext,
  ProgressTracker,
  Spinner,
  ProgressBar
} from './types.js';

import { colorify } from './colorify.js';

// Default configuration for all scripts
const defaultConfig = {
  name: 'Script',
  description: 'A CLI script',
  options: [
    {
      short: '-v',
      long: '--verbose',
      description: 'Enable verbose logging',
      required: false,
      defaultValue: true,
      validator: validators.boolean,
    },
    {
      short: '-q',
      long: '--quiet',
      description: 'Suppress output',
      required: false,
      defaultValue: false,
      validator: validators.boolean,
    },
    {
      short: '',
      long: '--dry-run',
      description: 'Show what would happen without executing',
      required: false,
      defaultValue: false,
      validator: validators.boolean,
    },
    {
      short: '-h',
      long: '--help',
      description: 'Show help information',
      required: false,
      defaultValue: false,
      validator: validators.boolean,
    },
  ],
} as const satisfies ScriptConfig;

// Enhanced validation system
export const validators = {
  // Basic validators
  nonEmpty: (value: string): ValidationResult<string> => ({
    isValid: value.trim().length > 0,
    value: value.trim(),
    error: value.trim().length === 0 ? 'Value cannot be empty' : undefined,
  }),

  boolean: (value: string): ValidationResult<boolean> => {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
      return { isValid: true, value: true };
    }
    if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
      return { isValid: true, value: false };
    }
    return {
      isValid: false,
      error: 'Value must be a boolean (true/false, 1/0, yes/no)',
    };
  },

  number: (value: string): ValidationResult<number> => {
    const num = Number(value);
    return {
      isValid: !isNaN(num) && isFinite(num),
      value: num,
      error: isNaN(num) || !isFinite(num) ? 'Value must be a valid number' : undefined,
    };
  },

  integer: (value: string): ValidationResult<number> => {
    const num = Number(value);
    const isInteger = Number.isInteger(num);
    return {
      isValid: !isNaN(num) && isFinite(num) && isInteger,
      value: num,
      error: !isInteger ? 'Value must be an integer' : undefined,
    };
  },

  // File system validators
  fileExists: (path: string): ValidationResult<string> => {
    try {
      const fs = require('fs');
      const exists = fs.existsSync(path) && fs.statSync(path).isFile();
      return {
        isValid: exists,
        value: path,
        error: exists ? undefined : `File does not exist: ${path}`,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Error checking file: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },

  directoryExists: (path: string): ValidationResult<string> => {
    try {
      const fs = require('fs');
      const exists = fs.existsSync(path) && fs.statSync(path).isDirectory();
      return {
        isValid: exists,
        value: path,
        error: exists ? undefined : `Directory does not exist: ${path}`,
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Error checking directory: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },

  // Advanced validators
  enum: <T extends string>(values: T[]) => (value: string): ValidationResult<T> => {
    const isValid = values.includes(value as T);
    return {
      isValid,
      value: value as T,
      error: isValid ? undefined : `Value must be one of: ${values.join(', ')}`,
    };
  },

  regex: (pattern: RegExp, message?: string) => (value: string): ValidationResult<string> => {
    const isValid = pattern.test(value);
    return {
      isValid,
      value,
      error: isValid ? undefined : message || `Value must match pattern: ${pattern}`,
    };
  },

  custom: <T>(validator: (value: string) => T | ValidationError) => (value: string): ValidationResult<T> => {
    try {
      const result = validator(value);
      if (typeof result === 'object' && result !== null && 'message' in result) {
        return {
          isValid: false,
          error: result.message,
        };
      }
      return {
        isValid: true,
        value: result,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },

  // Network validators
  url: (value: string): ValidationResult<string> => {
    try {
      new URL(value);
      return { isValid: true, value };
    } catch {
      return {
        isValid: false,
        error: 'Value must be a valid URL',
      };
    }
  },

  email: (value: string): ValidationResult<string> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    return {
      isValid,
      value,
      error: isValid ? undefined : 'Value must be a valid email address',
    };
  },

  // Version validators
  semver: (value: string): ValidationResult<string> => {
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    const isValid = semverRegex.test(value);
    return {
      isValid,
      value,
      error: isValid ? undefined : 'Value must be a valid semantic version (e.g., 1.0.0)',
    };
  },
};

// Progress tracking implementations
class SimpleProgressTracker implements ProgressTracker {
  current = 0;
  total: number;
  message?: string;

  constructor(total: number, message?: string) {
    this.total = total;
    this.message = message;
  }

  update(current: number, message?: string): void {
    this.current = current;
    if (message) this.message = message;
    this.render();
  }

  complete(): void {
    this.current = this.total;
    this.render();
    console.log(); // New line after completion
  }

  private render(): void {
    const percent = Math.round((this.current / this.total) * 100);
    const barLength = 30;
    const filled = Math.round((this.current / this.total) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    
    process.stdout.write(`\r${colorify.cyan('Progress:')} [${bar}] ${percent}% ${this.message || ''}`);
  }
}

class SimpleSpinner implements Spinner {
  private interval?: NodeJS.Timeout;
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private frameIndex = 0;
  text: string;

  constructor(text: string) {
    this.text = text;
  }

  start(): void {
    this.interval = setInterval(() => {
      process.stdout.write(`\r${this.frames[this.frameIndex]} ${this.text}`);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 100);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    process.stdout.write('\r' + ' '.repeat(this.text.length + 2) + '\r');
  }

  succeed(text?: string): void {
    this.stop();
    console.log(colorify.green('✓'), text || this.text);
  }

  fail(text?: string): void {
    this.stop();
    console.log(colorify.red('✗'), text || this.text);
  }

  warn(text?: string): void {
    this.stop();
    console.log(colorify.yellow('⚠'), text || this.text);
  }

  info(text?: string): void {
    this.stop();
    console.log(colorify.blue('ℹ'), text || this.text);
  }
}

// Enhanced WrapShell class
export class WrapShell<TConfig extends ScriptConfig> {
  private config: TConfig;
  private hooks: Partial<HookSystem<TConfig>> = {};

  constructor(config: TConfig) {
    this.config = config;
  }

  // Static factory method for creating scripts
  static createScript<TConfig extends ScriptConfig>(
    config: TConfig,
    handler: ScriptHandler<TConfig>
  ): ScriptInstance<TConfig> {
    const wrapShell = new WrapShell(config);
    
    return {
      config,
      handler,
      run: async (passedArgs?: Partial<InferArgs<TConfig>>) => {
        const args = passedArgs || await wrapShell.parseArgs();
        const context: HookContext<TConfig> = {
          script: { config, handler, run: async () => {} }, // Circular reference handled
          args,
          startTime: Date.now(),
        };

        try {
          // Run beforeRun hooks
          if (wrapShell.hooks.beforeRun) {
            for (const hook of wrapShell.hooks.beforeRun) {
              await hook(context);
            }
          }

          // Create enhanced console
          const enhancedConsole = wrapShell.createEnhancedConsole(args);

          // Run the main handler
          const result = await handler(args, enhancedConsole);

          // Run afterRun hooks
          if (wrapShell.hooks.afterRun) {
            for (const hook of wrapShell.hooks.afterRun) {
              await hook(context);
            }
          }

          return result;
        } catch (error) {
          // Run onError hooks
          if (wrapShell.hooks.onError) {
            const errorContext = { ...context, error: error as Error };
            for (const hook of wrapShell.hooks.onError) {
              await hook(errorContext as any);
            }
          }
          throw error;
        }
      },
    };
  }

  // Parse command line arguments
  private async parseArgs(): Promise<InferArgs<TConfig>> {
    const args = process.argv.slice(2);
    const result: Record<string, any> = {};
    const allOptions = [...defaultConfig.options, ...this.config.options];

    // Set default values
    allOptions.forEach((option) => {
      const key = option.long.replace('--', '');
      if (option.defaultValue !== undefined) {
        result[key] = option.defaultValue;
      }
    });

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const nextArg = args[i + 1];

      if (arg === '-h' || arg === '--help') {
        this.showHelp();
        process.exit(0);
      }

      const option = allOptions.find(opt => opt.short === arg || opt.long === arg);
      if (option) {
        const key = option.long.replace('--', '');
        
        if (option.validator === validators.boolean) {
          result[key] = true;
        } else if (nextArg && !nextArg.startsWith('-')) {
          result[key] = nextArg;
          i++; // Skip next argument as it's the value
        }
      }
    }

    // Validate arguments
    await this.validateArgs(result, allOptions);

    return result as InferArgs<TConfig>;
  }

  // Validate parsed arguments
  private async validateArgs(args: Record<string, any>, options: readonly ArgOption[]): Promise<void> {
    for (const option of options) {
      const key = option.long.replace('--', '');
      const value = args[key];

      if (option.required && (value === undefined || value === null || value === '')) {
        throw new Error(`Required option ${option.long} is missing`);
      }

      if (value !== undefined && option.validator && option.validator !== validators.boolean) {
        const validation = await option.validator(String(value));
        if (typeof validation === 'object' && !validation.isValid) {
          throw new Error(`Invalid value for ${option.long}: ${validation.error}`);
        }
      }
    }
  }

  // Create enhanced console with verbose/quiet support
  private createEnhancedConsole(args: InferArgs<TConfig>): Console {
    const originalConsole = console;
    
    return Object.assign({}, originalConsole, {
      log: (...props: Parameters<typeof console.log>) => {
        if (!('quiet' in args) || !args.quiet) {
          originalConsole.log(...props);
        }
      },
      info: (...props: Parameters<typeof console.info>) => {
        if (('verbose' in args && args.verbose) && !('quiet' in args || args.quiet)) {
          originalConsole.info(...props);
        }
      },
      warn: (...props: Parameters<typeof console.warn>) => {
        if (!('quiet' in args) || !args.quiet) {
          originalConsole.warn(...props);
        }
      },
      error: (...props: Parameters<typeof console.error>) => {
        originalConsole.error(...props); // Always show errors
      },
    });
  }

  // Show help information
  private showHelp(): void {
    console.log(colorify.bold(colorify.blue(this.config.name)));
    console.log(this.config.description);
    console.log();
    
    if (this.config.usage) {
      console.log(colorify.bold('Usage:'));
      console.log(`  ${this.config.usage}`);
      console.log();
    }

    const allOptions = [...defaultConfig.options, ...this.config.options];
    if (allOptions.length > 0) {
      console.log(colorify.bold('Options:'));
      allOptions.forEach((option) => {
        const shortFlag = option.short ? `${option.short}, ` : '    ';
        const required = option.required ? colorify.red(' (required)') : '';
        console.log(`  ${shortFlag}${option.long}${required}`);
        console.log(`      ${option.description}`);
      });
      console.log();
    }

    if (this.config.examples && this.config.examples.length > 0) {
      console.log(colorify.bold('Examples:'));
      this.config.examples.forEach((example) => {
        console.log(`  ${colorify.gray(example)}`);
      });
    }
  }

  // Static utility methods
  static progress = {
    create: (total: number, message?: string): ProgressTracker => 
      new SimpleProgressTracker(total, message),
    
    spinner: (message: string): Spinner => 
      new SimpleSpinner(message),
    
    bar: (total: number, message?: string): ProgressBar => 
      new SimpleProgressTracker(total, message) as ProgressBar,
  };

  static hooks = {
    beforeRun: <TConfig extends ScriptConfig>(hook: (context: HookContext<TConfig>) => Promise<void> | void) => hook,
    afterRun: <TConfig extends ScriptConfig>(hook: (context: HookContext<TConfig>) => Promise<void> | void) => hook,
    onError: <TConfig extends ScriptConfig>(hook: (context: HookContext<TConfig> & { error: Error }) => Promise<void> | void) => hook,
    onValidation: <TConfig extends ScriptConfig>(hook: (context: HookContext<TConfig>) => Promise<ValidationResult> | ValidationResult) => hook,
  };

  static validators = validators;
}

// Export convenience function for backward compatibility
export function createScript<TConfig extends ScriptConfig>(
  config: TConfig,
  handler: ScriptHandler<TConfig>
): ScriptInstance<TConfig> {
  return WrapShell.createScript(config, handler);
}

export default WrapShell;