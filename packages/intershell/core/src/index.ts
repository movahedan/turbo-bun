/**
 * @intershell/core - Core utilities for InterShell CLI framework
 * 
 * This package provides the foundation utilities for building interactive
 * command-line applications with the InterShell framework.
 */

// Core types
export type * from './types.js';

// Enhanced colorify system
export { colorify, EnhancedColorify } from './colorify.js';

// Enhanced script framework
export {
  WrapShell,
  validators,
  defaultConfig,
  type InferArgs,
} from './wrapshell.js';

// CLI tools and utilities
export {
  Terminal,
  KeyParser,
  TextFormatter,
  ProgressIndicators,
  TableFormatter,
  InputValidation,
} from './cli-tools.js';

// Re-export specific types for convenience
export type {
  ScriptConfig,
  ArgOption,
  ValidationResult,
  Logger,
  KeyPress,
  ColorFunction,
  ColorSystem,
  ProgressTracker,
  Spinner,
  ProgressBar,
} from './types.js';