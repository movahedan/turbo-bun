/**
 * Type definitions for InterShell interactive CLI framework
 */

import type { KeyPress, EventHandler, StateListener } from '@intershell/core';

/**
 * Page action types for navigation and control flow
 */
export type PageAction = 
  | { type: 'NEXT_PAGE' }
  | { type: 'PREV_PAGE' }
  | { type: 'CHANGE_PAGE'; payload: string }
  | { type: 'RE_RENDER' }
  | { type: 'EXIT' }
  | { type: 'CUSTOM'; payload: any };

/**
 * Validation result for page validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Page metadata for categorization and organization
 */
export interface PageMetadata {
  tags?: string[];
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
  description?: string;
  version?: string;
}

/**
 * Page interface for interactive CLI applications
 */
export interface Page<TState = any, TAction = any> {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  
  // Page logic
  render(cli: InteractiveCLI, state: TState): Promise<void>;
  handleKey(key: KeyPress, state: TState): TAction | null;
  getNextAction(state: TState): PageAction;
  
  // Navigation
  canNavigateTo?(targetPage: string, state: TState): boolean;
  onEnter?(state: TState): void | Promise<void>;
  onExit?(state: TState): void | Promise<void>;
  
  // Validation
  validate?(state: TState): ValidationResult;
  canSkip?(state: TState): boolean;
  
  // Metadata
  metadata?: PageMetadata;
}

/**
 * Reducer function for state updates
 */
export type Reducer<TState = any, TAction = any> = (state: TState, action: TAction) => TState;

/**
 * Map of reducers by name
 */
export type ReducerMap<TState = any, TAction = any> = Record<string, Reducer<TState, TAction>>;

/**
 * Framework configuration options
 */
export interface FrameworkOptions {
  debug?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
  enableHotkeys?: boolean;
  enableHistory?: boolean;
  maxHistorySize?: number;
  renderMode?: 'immediate' | 'debounced' | 'throttled';
  renderDelay?: number;
  exitKeys?: KeyPress[];
  helpKey?: KeyPress;
}

/**
 * Framework event types
 */
export interface FrameworkEvents<TState = any> {
  'state:change': { oldState: TState; newState: TState };
  'page:enter': { pageId: string; state: TState };
  'page:exit': { pageId: string; state: TState };
  'page:render': { pageId: string; state: TState };
  'navigation:change': { from: string; to: string; state: TState };
  'error': { error: Error; context?: string };
  'debug': { message: string; data?: any };
}

/**
 * Navigation history entry
 */
export interface HistoryEntry<TState = any> {
  pageId: string;
  state: TState;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Navigation manager interface
 */
export interface NavigationManager<TState = any> {
  getCurrentPage(): Page<TState> | undefined;
  navigateTo(pageId: string): Promise<void>;
  canNavigate(pageId: string, state: TState): boolean;
  getHistory(): HistoryEntry<TState>[];
  goBack(): Promise<void>;
  goForward(): Promise<void>;
  canGoBack(): boolean;
  canGoForward(): boolean;
}

/**
 * Event emitter interface
 */
export interface EventEmitter<TEvents = Record<string, any>> {
  on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void;
  off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void;
  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void;
  once<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void;
  removeAllListeners(event?: keyof TEvents): void;
}

/**
 * Enhanced interactive CLI interface
 */
export interface InteractiveCLI {
  // Core I/O methods
  clearScreen(): void;
  clearLine(): void;
  moveTo(x: number, y: number): void;
  hideCursor(): void;
  showCursor(): void;
  
  // Key handling
  onKeyPress(handler: (key: KeyPress) => void): void;
  offKeyPress(handler: (key: KeyPress) => void): void;
  
  // Promise management
  createControlledPromise<T>(): {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error: any) => void;
  };
  
  // Lifecycle
  cleanup(): void;
}

/**
 * Renderer interface for different output formats
 */
export interface Renderer<TState = any> {
  render(page: Page<TState>, state: TState, cli: InteractiveCLI): Promise<void>;
  canRender(page: Page<TState>): boolean;
  getName(): string;
}

/**
 * Middleware function for intercepting actions
 */
export type Middleware<TState = any, TAction = any> = (
  action: TAction,
  state: TState,
  next: (action: TAction) => TState
) => TState;

/**
 * Plugin interface for extending framework functionality
 */
export interface Plugin<TState = any, TAction = any> {
  name: string;
  version: string;
  
  // Lifecycle hooks
  onInstall?(framework: InterShellFramework<TState, TAction>): void | Promise<void>;
  onUninstall?(framework: InterShellFramework<TState, TAction>): void | Promise<void>;
  
  // Extension points
  pages?: Page<TState, TAction>[];
  reducers?: ReducerMap<TState, TAction>;
  middleware?: Middleware<TState, TAction>[];
  renderers?: Renderer<TState>[];
}

/**
 * Main framework interface
 */
export interface InterShellFramework<TState = any, TAction = any> {
  // Core methods
  run(): Promise<TState>;
  stop(): void;
  
  // State management
  getState(): TState;
  dispatch(action: TAction): void;
  subscribe(listener: StateListener<TState>): () => void;
  
  // Navigation
  navigateTo(pageId: string): Promise<void>;
  getCurrentPage(): Page<TState, TAction> | undefined;
  getPage(pageId: string): Page<TState, TAction> | undefined;
  
  // Event system
  on<K extends keyof FrameworkEvents<TState>>(
    event: K, 
    handler: EventHandler<FrameworkEvents<TState>[K]>
  ): void;
  off<K extends keyof FrameworkEvents<TState>>(
    event: K, 
    handler: EventHandler<FrameworkEvents<TState>[K]>
  ): void;
  emit<K extends keyof FrameworkEvents<TState>>(
    event: K, 
    data: FrameworkEvents<TState>[K]
  ): void;
  
  // Lifecycle hooks
  onPageEnter(pageId: string, callback: () => void | Promise<void>): void;
  onPageExit(pageId: string, callback: () => void | Promise<void>): void;
  onBeforeRender(callback: (page: Page<TState, TAction>) => void | Promise<void>): void;
  onAfterRender(callback: (page: Page<TState, TAction>) => void | Promise<void>): void;
  
  // Plugin system
  use(plugin: Plugin<TState, TAction>): void;
  unuse(pluginName: string): void;
  getPlugins(): Plugin<TState, TAction>[];
}

/**
 * Framework builder for fluent configuration
 */
export interface FrameworkBuilder<TState = any, TAction = any> {
  withInitialState(state: TState): FrameworkBuilder<TState, TAction>;
  withPages(pages: Page<TState, TAction>[]): FrameworkBuilder<TState, TAction>;
  withReducers(reducers: ReducerMap<TState, TAction>): FrameworkBuilder<TState, TAction>;
  withOptions(options: FrameworkOptions): FrameworkBuilder<TState, TAction>;
  withPlugins(plugins: Plugin<TState, TAction>[]): FrameworkBuilder<TState, TAction>;
  withMiddleware(middleware: Middleware<TState, TAction>[]): FrameworkBuilder<TState, TAction>;
  build(): InterShellFramework<TState, TAction>;
}