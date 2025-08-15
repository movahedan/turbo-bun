/**
 * InterShell Core - Foundation utilities and types for the InterShell CLI framework
 * 
 * This package provides the core building blocks for creating interactive CLI applications:
 * - Enhanced colorify system with RGB, HSL, and gradient support
 * - WrapShell script creation framework with type-safe argument parsing
 * - CLI utility functions for common operations
 * - Comprehensive type definitions for the entire framework
 * 
 * @example
 * ```typescript
 * import { colorify, WrapShell, validators } from '@intershell/core';
 * 
 * const script = WrapShell.createScript({
 *   name: 'My CLI',
 *   description: 'A sample CLI application',
 *   options: [
 *     {
 *       short: '-n',
 *       long: '--name',
 *       description: 'Your name',
 *       required: true,
 *       validator: validators.nonEmpty,
 *     }
 *   ]
 * }, async (args, console) => {
 *   console.log(colorify.green(`Hello, ${args.name}!`));
 * });
 * 
 * await script.run();
 * ```
 */

// Core utilities
export { colorify, default as colorifyDefault } from './colorify.js';
export { WrapShell, createScript, validators } from './wrapshell.js';
export * as cliTools from './cli-tools.js';

// Type definitions
export type * from './types.js';

// Re-export specific types for convenience
export type {
  ScriptConfig,
  ScriptHandler,
  ScriptInstance,
  InferArgs,
  ValidationResult,
  ValidationError,
  ArgOption,
  KeyPress,
  QuickAction,
  SelectConfig,
  PromptConfig,
  ConfirmConfig,
  InteractiveCLI,
  InteractiveCLIOptions,
  ColorFunction,
  ColorSystem,
  EventHandler,
  EventEmitter,
  StateListener,
  StateManager,
  ProgressTracker,
  Spinner,
  ProgressBar,
  FrameworkOptions,
} from './types.js';

// Version information
export const VERSION = '0.1.0';
export const PACKAGE_NAME = '@intershell/core';

// Framework metadata
export const FRAMEWORK_INFO = {
  name: 'InterShell',
  version: VERSION,
  description: 'Next generation CLI framework for interactive applications',
  author: 'Monobun',
  license: 'MIT',
} as const;