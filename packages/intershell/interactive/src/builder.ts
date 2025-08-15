/**
 * Framework builder for fluent configuration of InterShell applications
 */

import type {
  Page,
  ReducerMap,
  FrameworkOptions,
  Plugin,
  Middleware,
  InterShellFramework,
  FrameworkBuilder,
} from './types.js';
import { InterShellFrameworkImpl } from './framework.js';

/**
 * Fluent builder for creating InterShell framework instances
 */
export class InterShellFrameworkBuilder<TState = any, TAction = any> 
  implements FrameworkBuilder<TState, TAction> {
  
  private _initialState: TState | null = null;
  private _pages: Page<TState, TAction>[] = [];
  private _reducers: ReducerMap<TState, TAction> = {};
  private _options: FrameworkOptions = {};
  private _plugins: Plugin<TState, TAction>[] = [];
  private _middleware: Middleware<TState, TAction>[] = [];

  /**
   * Set the initial state for the application
   */
  withInitialState(state: TState): FrameworkBuilder<TState, TAction> {
    this._initialState = state;
    return this;
  }

  /**
   * Add pages to the application
   */
  withPages(pages: Page<TState, TAction>[]): FrameworkBuilder<TState, TAction> {
    this._pages.push(...pages);
    return this;
  }

  /**
   * Add a single page to the application
   */
  withPage(page: Page<TState, TAction>): FrameworkBuilder<TState, TAction> {
    this._pages.push(page);
    return this;
  }

  /**
   * Add reducers for state management
   */
  withReducers(reducers: ReducerMap<TState, TAction>): FrameworkBuilder<TState, TAction> {
    Object.assign(this._reducers, reducers);
    return this;
  }

  /**
   * Add a single reducer
   */
  withReducer(name: string, reducer: (state: TState, action: TAction) => TState): FrameworkBuilder<TState, TAction> {
    this._reducers[name] = reducer;
    return this;
  }

  /**
   * Set framework options
   */
  withOptions(options: FrameworkOptions): FrameworkBuilder<TState, TAction> {
    Object.assign(this._options, options);
    return this;
  }

  /**
   * Add plugins to extend functionality
   */
  withPlugins(plugins: Plugin<TState, TAction>[]): FrameworkBuilder<TState, TAction> {
    this._plugins.push(...plugins);
    return this;
  }

  /**
   * Add a single plugin
   */
  withPlugin(plugin: Plugin<TState, TAction>): FrameworkBuilder<TState, TAction> {
    this._plugins.push(plugin);
    return this;
  }

  /**
   * Add middleware for action processing
   */
  withMiddleware(middleware: Middleware<TState, TAction>[]): FrameworkBuilder<TState, TAction> {
    this._middleware.push(...middleware);
    return this;
  }

  /**
   * Add a single middleware function
   */
  withMiddlewareFunction(middleware: Middleware<TState, TAction>): FrameworkBuilder<TState, TAction> {
    this._middleware.push(middleware);
    return this;
  }

  /**
   * Enable debug mode
   */
  withDebug(enabled: boolean = true): FrameworkBuilder<TState, TAction> {
    this._options.debug = enabled;
    return this;
  }

  /**
   * Set log level
   */
  withLogLevel(level: 'error' | 'warn' | 'info' | 'debug'): FrameworkBuilder<TState, TAction> {
    this._options.logLevel = level;
    return this;
  }

  /**
   * Enable or disable hotkeys
   */
  withHotkeys(enabled: boolean = true): FrameworkBuilder<TState, TAction> {
    this._options.enableHotkeys = enabled;
    return this;
  }

  /**
   * Enable or disable history
   */
  withHistory(enabled: boolean = true, maxSize: number = 50): FrameworkBuilder<TState, TAction> {
    this._options.enableHistory = enabled;
    this._options.maxHistorySize = maxSize;
    return this;
  }

  /**
   * Set render mode
   */
  withRenderMode(mode: 'immediate' | 'debounced' | 'throttled', delay: number = 0): FrameworkBuilder<TState, TAction> {
    this._options.renderMode = mode;
    this._options.renderDelay = delay;
    return this;
  }

  /**
   * Build the framework instance
   */
  build(): InterShellFramework<TState, TAction> {
    if (this._initialState === null) {
      throw new Error('Initial state is required. Use withInitialState() to set it.');
    }

    if (this._pages.length === 0) {
      throw new Error('At least one page is required. Use withPages() or withPage() to add pages.');
    }

    // Create the framework
    const framework = new InterShellFrameworkImpl(
      this._initialState,
      this._pages,
      this._reducers,
      this._options
    );

    // Install plugins
    for (const plugin of this._plugins) {
      framework.use(plugin);
    }

    return framework;
  }

  /**
   * Reset the builder to start fresh
   */
  reset(): FrameworkBuilder<TState, TAction> {
    this._initialState = null;
    this._pages = [];
    this._reducers = {};
    this._options = {};
    this._plugins = [];
    this._middleware = [];
    return this;
  }

  /**
   * Create a copy of the current builder state
   */
  clone(): FrameworkBuilder<TState, TAction> {
    const clone = new InterShellFrameworkBuilder<TState, TAction>();
    
    if (this._initialState !== null) {
      clone._initialState = this._initialState;
    }
    
    clone._pages = [...this._pages];
    clone._reducers = { ...this._reducers };
    clone._options = { ...this._options };
    clone._plugins = [...this._plugins];
    clone._middleware = [...this._middleware];
    
    return clone;
  }
}

/**
 * Create a new framework builder
 */
export function createFramework<TState = any, TAction = any>(): FrameworkBuilder<TState, TAction> {
  return new InterShellFrameworkBuilder<TState, TAction>();
}

/**
 * Quick builder for simple applications
 */
export function createSimpleFramework<TState, TAction>(
  initialState: TState,
  pages: Page<TState, TAction>[],
  reducers?: ReducerMap<TState, TAction>
): InterShellFramework<TState, TAction> {
  const builder = createFramework<TState, TAction>()
    .withInitialState(initialState)
    .withPages(pages);

  if (reducers) {
    builder.withReducers(reducers);
  }

  return builder.build();
}