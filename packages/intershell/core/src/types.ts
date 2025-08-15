/**
 * Core type definitions for the InterShell CLI framework
 */

// Basic CLI types
export interface KeyPress {
  sequence: string;
  name?: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}

export interface ValidationResult<T = any> {
  isValid: boolean;
  value?: T;
  error?: string;
  warnings?: string[];
}

export interface ValidationError {
  message: string;
  field?: string;
  code?: string;
}

// Event system types
export type EventHandler<T = any> = (data: T) => void | Promise<void>;

export interface EventEmitter<TEvents extends Record<string, any> = Record<string, any>> {
  on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void;
  off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void;
  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void;
}

// State management types
export type StateListener<TState> = (state: TState, prevState: TState) => void;

export interface StateManager<TState> {
  getState(): TState;
  setState(newState: TState): void;
  subscribe(listener: StateListener<TState>): () => void;
}

// Script configuration types
export interface ArgOption {
  short: string;
  long: string;
  description: string;
  required?: boolean;
  defaultValue?: any;
  validator?: (value: any) => ValidationResult;
}

export interface ScriptConfig {
  name: string;
  description: string;
  usage?: string;
  examples?: string[];
  options: ArgOption[];
}

export type ScriptHandler<TConfig extends ScriptConfig> = (
  args: InferArgs<TConfig>,
  console: Console
) => Promise<void> | void;

export interface ScriptInstance<TConfig extends ScriptConfig> {
  config: TConfig;
  handler: ScriptHandler<TConfig>;
  run(args?: Partial<InferArgs<TConfig>>): Promise<void>;
}

// Utility type to infer argument types from config
export type InferArgs<TConfig extends ScriptConfig> = {
  [K in TConfig['options'][number] as K['long'] extends `--${infer Name}` 
    ? Name 
    : never]: K['required'] extends true 
      ? NonNullable<K['defaultValue']> 
      : K['defaultValue'];
} & {
  verbose?: boolean;
  quiet?: boolean;
  'dry-run'?: boolean;
  help?: boolean;
};

// Progress tracking types
export interface ProgressTracker {
  current: number;
  total: number;
  message?: string;
  update(current: number, message?: string): void;
  complete(): void;
}

export interface Spinner {
  text: string;
  start(): void;
  stop(): void;
  succeed(text?: string): void;
  fail(text?: string): void;
  warn(text?: string): void;
  info(text?: string): void;
}

export interface ProgressBar extends ProgressTracker {
  render(): string;
}

// Hook system types
export interface HookContext<TConfig extends ScriptConfig> {
  script: ScriptInstance<TConfig>;
  args: InferArgs<TConfig>;
  startTime: number;
}

export type Hook<TConfig extends ScriptConfig, TReturn = void> = (
  context: HookContext<TConfig>
) => Promise<TReturn> | TReturn;

export interface HookSystem<TConfig extends ScriptConfig> {
  beforeRun: Hook<TConfig>[];
  afterRun: Hook<TConfig, any>[];
  onError: Hook<TConfig & { error: Error }>[];
  onValidation: Hook<TConfig, ValidationResult>[];
}

// Color system types
export interface ColorFunction {
  (text: string): string;
}

export interface ColorSystem {
  // Basic colors
  red: ColorFunction;
  green: ColorFunction;
  blue: ColorFunction;
  yellow: ColorFunction;
  cyan: ColorFunction;
  magenta: ColorFunction;
  white: ColorFunction;
  black: ColorFunction;
  gray: ColorFunction;
  grey: ColorFunction;
  
  // Styles
  bold: ColorFunction;
  italic: ColorFunction;
  underline: ColorFunction;
  strikethrough: ColorFunction;
  
  // Advanced colors
  rgb(r: number, g: number, b: number): ColorFunction;
  hsl(h: number, s: number, l: number): ColorFunction;
  hex(color: string): ColorFunction;
  
  // Effects
  gradient(colors: string[]): ColorFunction;
  rainbow: ColorFunction;
  
  // Utilities
  strip(text: string): string;
  supportsColor(): boolean;
  enable(): void;
  disable(): void;
}

// CLI Tools types
export interface QuickAction {
  key: string;
  label: string;
  description: string;
  shortcut?: string;
  action: () => void | Promise<void>;
}

export interface SelectConfig {
  multiple?: boolean;
  clearScreen?: boolean;
  showCursor?: boolean;
  exitOnCtrlC?: boolean;
  quickActions?: QuickAction[];
}

export interface PromptConfig {
  clearScreen?: boolean;
  allowEmpty?: boolean;
  showCursor?: boolean;
  exitOnCtrlC?: boolean;
  quickActions?: QuickAction[];
  onLeft?: () => void;
}

export interface ConfirmConfig {
  clearScreen?: boolean;
  defaultValue?: boolean;
  exitOnCtrlC?: boolean;
}

// Interactive CLI types
export interface InteractiveCLIOptions {
  enableRawMode?: boolean;
  exitOnCtrlC?: boolean;
  clearOnExit?: boolean;
}

export interface InteractiveCLI {
  // Core methods
  select(question: string, options: string[], config?: SelectConfig): Promise<string[]>;
  prompt(question: string, config?: PromptConfig): Promise<string>;
  confirm(question: string, config?: ConfirmConfig): Promise<boolean>;
  
  // Screen management
  clearScreen(): void;
  showCursor(): void;
  hideCursor(): void;
  
  // Event handling
  onKeyPress(callback: (key: KeyPress) => void): void;
  offKeyPress(callback: (key: KeyPress) => void): void;
  
  // Lifecycle
  cleanup(): void;
}

// Framework-specific types (will be extended by interactive package)
export interface FrameworkOptions {
  debug?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  enableHotkeys?: boolean;
  enableHistory?: boolean;
  maxHistorySize?: number;
  renderMode?: 'immediate' | 'debounced' | 'throttled';
  renderDelay?: number;
}