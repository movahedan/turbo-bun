/**
 * Core type definitions for InterShell framework
 */

export interface ValidationResult<T = any> {
  isValid: boolean;
  value?: T;
  error?: string;
}

export interface ValidationError {
  message: string;
  field?: string;
  code?: string;
}

export interface KeyPress {
  name?: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  sequence: string;
}

export interface EventHandler<T = any> {
  (data: T): void | Promise<void>;
}

export interface StateListener<TState> {
  (state: TState, previousState: TState): void | Promise<void>;
}

export interface ProgressTracker {
  update(current: number): void;
  increment(amount?: number): void;
  finish(): void;
  setTotal(total: number): void;
}

export interface Spinner {
  start(): void;
  stop(): void;
  succeed(text?: string): void;
  fail(text?: string): void;
  warn(text?: string): void;
  info(text?: string): void;
}

export interface ProgressBar {
  update(current: number): void;
  increment(amount?: number): void;
  finish(): void;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface Logger {
  error(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  setLevel(level: LogLevel): void;
}

// Color system types
export interface ColorFunction {
  (text: string): string;
}

export interface ColorSystem {
  red: ColorFunction;
  green: ColorFunction;
  yellow: ColorFunction;
  blue: ColorFunction;
  cyan: ColorFunction;
  magenta: ColorFunction;
  white: ColorFunction;
  gray: ColorFunction;
  black: ColorFunction;
  bold: ColorFunction;
  italic: ColorFunction;
  underline: ColorFunction;
  strikethrough: ColorFunction;
  dim: ColorFunction;
  reset: string;
  supportsColor(): boolean;
  enable(): void;
  disable(): void;
}

// Script framework types
export interface ScriptConfig {
  name: string;
  description: string;
  usage: string;
  examples: readonly string[];
  options: readonly ArgOption[];
}

export interface ArgOption {
  short: string;
  long: string;
  description: string;
  required?: boolean;
  defaultValue?: string | boolean | number;
  multiple?: boolean;
  validator?: (value: string) => boolean | string | Promise<boolean | string>;
  examples?: string[];
}

export interface ParsedArgs {
  [key: string]: string | boolean | string[] | undefined;
}

export type ScriptHandler<TConfig extends ScriptConfig> = (
  args: any,
  logger: Logger
) => Promise<void> | void;

export interface ScriptInstance<TConfig extends ScriptConfig> {
  config: TConfig;
  run(args?: any): Promise<void>;
}

export interface ScriptOptions {
  exitOnError?: boolean;
  showStack?: boolean;
  logger?: Logger;
}

// Hook system types
export interface HookHandler<T = any> {
  (data: T): Promise<void> | void;
}

export interface Hooks {
  beforeRun: HookHandler<ScriptInstance<any>>[];
  afterRun: HookHandler<{ script: ScriptInstance<any>; result: any }>[];
  onError: HookHandler<{ script: ScriptInstance<any>; error: Error }>[];
  onValidation: HookHandler<{ script: ScriptInstance<any>; input: any }>[];
}