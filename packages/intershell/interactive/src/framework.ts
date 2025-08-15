/**
 * Core InterShell Framework Implementation
 * 
 * This is the main framework class that orchestrates the interactive CLI experience
 * using the page-based navigation system and event-driven architecture.
 */

import { colorify, type KeyPress, type StateListener, type EventHandler } from '@intershell/core';
import { EnhancedInteractiveCLI } from './cli.js';
import type {
  Page,
  PageAction,
  Reducer,
  ReducerMap,
  FrameworkOptions,
  FrameworkEvents,
  InterShellFramework,
  Plugin,
  Middleware,
  EventEmitter,
} from './types.js';

/**
 * Simple event emitter implementation
 */
class SimpleEventEmitter<TEvents = Record<string, any>> implements EventEmitter<TEvents> {
  private listeners = new Map<keyof TEvents, Set<EventHandler<any>>>();

  on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${String(event)}:`, error);
        }
      }
    }
  }

  once<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    const onceHandler = (data: TEvents[K]) => {
      this.off(event, onceHandler);
      handler(data);
    };
    this.on(event, onceHandler);
  }

  removeAllListeners(event?: keyof TEvents): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

/**
 * Default framework options
 */
const DEFAULT_OPTIONS: Required<FrameworkOptions> = {
  debug: false,
  logLevel: 'info',
  enableHotkeys: true,
  enableHistory: true,
  maxHistorySize: 50,
  renderMode: 'immediate',
  renderDelay: 0,
  exitKeys: [{ name: 'c', ctrl: true }],
  helpKey: { name: 'f1' },
};

/**
 * Main InterShell Framework implementation
 */
export class InterShellFrameworkImpl<TState = any, TAction = any> 
  implements InterShellFramework<TState, TAction> {
  
  private cli: EnhancedInteractiveCLI;
  private eventEmitter: SimpleEventEmitter<FrameworkEvents<TState>>;
  private options: Required<FrameworkOptions>;
  
  private state: TState;
  private pages: Map<string, Page<TState, TAction>> = new Map();
  private reducers: ReducerMap<TState, TAction>;
  private middleware: Middleware<TState, TAction>[] = [];
  private plugins: Map<string, Plugin<TState, TAction>> = new Map();
  
  private currentPageId: string | null = null;
  private isRunning = false;
  private stateListeners: Set<StateListener<TState>> = new Set();
  
  // Page lifecycle hooks
  private pageEnterCallbacks = new Map<string, (() => void | Promise<void>)[]>();
  private pageExitCallbacks = new Map<string, (() => void | Promise<void>)[]>();
  private beforeRenderCallbacks: ((page: Page<TState, TAction>) => void | Promise<void>)[] = [];
  private afterRenderCallbacks: ((page: Page<TState, TAction>) => void | Promise<void>)[] = [];

  constructor(
    initialState: TState,
    pages: Page<TState, TAction>[],
    reducers: ReducerMap<TState, TAction>,
    options: FrameworkOptions = {}
  ) {
    this.cli = new EnhancedInteractiveCLI();
    this.eventEmitter = new SimpleEventEmitter<FrameworkEvents<TState>>();
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    this.state = initialState;
    this.reducers = reducers;
    
    // Register pages
    for (const page of pages) {
      this.pages.set(page.id, page);
    }
    
    // Set initial page if pages exist
    if (pages.length > 0) {
      this.currentPageId = pages[0].id;
    }
    
    this.setupGlobalKeyHandlers();
  }

  /**
   * Setup global key handlers for framework-level operations
   */
  private setupGlobalKeyHandlers(): void {
    this.cli.onKeyPress((key: KeyPress) => {
      // Handle exit keys
      for (const exitKey of this.options.exitKeys) {
        if (this.matchesKey(key, exitKey)) {
          this.stop();
          return;
        }
      }
      
      // Handle help key
      if (this.matchesKey(key, this.options.helpKey)) {
        this.showHelp();
        return;
      }
      
      // Forward to current page
      this.handlePageKey(key);
    });
  }

  /**
   * Check if a key matches a key pattern
   */
  private matchesKey(key: KeyPress, pattern: KeyPress): boolean {
    return Object.entries(pattern).every(([prop, value]) => {
      return (key as any)[prop] === value;
    });
  }

  /**
   * Handle key press for the current page
   */
  private async handlePageKey(key: KeyPress): Promise<void> {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return;

    try {
      // Let the page handle the key and potentially return an action
      const action = currentPage.handleKey(key, this.state);
      
      if (action) {
        // Dispatch the action through reducers
        this.dispatch(action);
      }
      
      // Get the next page action from the current page
      const pageAction = currentPage.getNextAction(this.state);
      await this.handlePageAction(pageAction);
      
    } catch (error) {
      this.emit('error', { 
        error: error as Error, 
        context: `Handling key in page ${currentPage.id}` 
      });
    }
  }

  /**
   * Handle page action (navigation, re-render, etc.)
   */
  private async handlePageAction(action: PageAction): Promise<void> {
    switch (action.type) {
      case 'NEXT_PAGE':
        await this.navigateToNextPage();
        break;
      case 'PREV_PAGE':
        await this.navigateToPreviousPage();
        break;
      case 'CHANGE_PAGE':
        await this.navigateTo(action.payload);
        break;
      case 'RE_RENDER':
        await this.renderCurrentPage();
        break;
      case 'EXIT':
        this.stop();
        break;
      case 'CUSTOM':
        // Emit custom action for external handling
        this.emit('debug', { 
          message: 'Custom page action', 
          data: action.payload 
        });
        break;
    }
  }

  /**
   * Navigate to the next page in sequence
   */
  private async navigateToNextPage(): Promise<void> {
    const pages = Array.from(this.pages.keys());
    const currentIndex = pages.indexOf(this.currentPageId || '');
    
    if (currentIndex >= 0 && currentIndex < pages.length - 1) {
      await this.navigateTo(pages[currentIndex + 1]);
    }
  }

  /**
   * Navigate to the previous page in sequence
   */
  private async navigateToPreviousPage(): Promise<void> {
    const pages = Array.from(this.pages.keys());
    const currentIndex = pages.indexOf(this.currentPageId || '');
    
    if (currentIndex > 0) {
      await this.navigateTo(pages[currentIndex - 1]);
    }
  }

  /**
   * Render the current page
   */
  private async renderCurrentPage(): Promise<void> {
    const currentPage = this.getCurrentPage();
    if (!currentPage) return;

    try {
      // Run before render callbacks
      for (const callback of this.beforeRenderCallbacks) {
        await callback(currentPage);
      }

      // Clear screen and render page
      this.cli.clearScreen();
      await currentPage.render(this.cli, this.state);

      // Emit render event
      this.emit('page:render', { 
        pageId: currentPage.id, 
        state: this.state 
      });

      // Run after render callbacks
      for (const callback of this.afterRenderCallbacks) {
        await callback(currentPage);
      }

    } catch (error) {
      this.emit('error', { 
        error: error as Error, 
        context: `Rendering page ${currentPage.id}` 
      });
    }
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    this.cli.clearScreen();
    this.cli.writeLine(colorify.bold('InterShell Framework Help'));
    this.cli.writeLine();
    this.cli.writeLine('Available Pages:');
    
    for (const page of this.pages.values()) {
      const current = page.id === this.currentPageId ? colorify.green('→ ') : '  ';
      const title = page.title || page.id;
      const description = page.description ? ` - ${page.description}` : '';
      
      this.cli.writeLine(`${current}${colorify.cyan(title)}${colorify.gray(description)}`);
    }
    
    this.cli.writeLine();
    this.cli.writeLine('Global Keys:');
    this.cli.writeLine(`  ${colorify.cyan('F1')} - Show this help`);
    this.cli.writeLine(`  ${colorify.cyan('Ctrl+C')} - Exit application`);
    this.cli.writeLine();
    this.cli.writeLine(colorify.gray('Press any key to continue...'));
  }

  // Public API Implementation

  /**
   * Start the framework and begin the interactive session
   */
  async run(): Promise<TState> {
    if (this.isRunning) {
      throw new Error('Framework is already running');
    }

    this.isRunning = true;
    
    try {
      // Render initial page
      await this.renderCurrentPage();
      
      // Wait for the framework to be stopped
      await new Promise<void>((resolve) => {
        const stopHandler = () => {
          resolve();
        };
        
        // Set up stop handler
        const originalStop = this.stop;
        this.stop = () => {
          originalStop.call(this);
          stopHandler();
        };
      });
      
      return this.state;
      
    } finally {
      this.isRunning = false;
      this.cli.cleanup();
    }
  }

  /**
   * Stop the framework
   */
  stop(): void {
    this.isRunning = false;
    this.cli.cleanup();
  }

  /**
   * Get current state
   */
  getState(): TState {
    return this.state;
  }

  /**
   * Dispatch an action to update state
   */
  dispatch(action: TAction): void {
    const oldState = this.state;
    
    // Apply middleware
    let finalAction = action;
    const next = (middlewareAction: TAction): TState => {
      // Find appropriate reducer
      const reducerName = this.findReducerForAction(middlewareAction);
      const reducer = this.reducers[reducerName];
      
      if (reducer) {
        return reducer(this.state, middlewareAction);
      }
      
      return this.state;
    };
    
    // Apply middleware chain
    for (const middleware of this.middleware) {
      const newState = middleware(finalAction, this.state, next);
      this.state = newState;
    }
    
    // If no middleware, apply reducer directly
    if (this.middleware.length === 0) {
      this.state = next(finalAction);
    }
    
    // Notify state listeners
    if (this.state !== oldState) {
      this.emit('state:change', { oldState, newState: this.state });
      
      for (const listener of this.stateListeners) {
        try {
          listener(this.state, oldState);
        } catch (error) {
          console.error('Error in state listener:', error);
        }
      }
    }
  }

  /**
   * Find the appropriate reducer for an action
   */
  private findReducerForAction(action: TAction): string {
    // Simple strategy: use the first reducer that exists
    // In a real implementation, this could be more sophisticated
    const reducerNames = Object.keys(this.reducers);
    return reducerNames[0] || 'default';
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StateListener<TState>): () => void {
    this.stateListeners.add(listener);
    
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  /**
   * Navigate to a specific page
   */
  async navigateTo(pageId: string): Promise<void> {
    const targetPage = this.pages.get(pageId);
    if (!targetPage) {
      throw new Error(`Page "${pageId}" not found`);
    }

    const currentPage = this.getCurrentPage();
    const oldPageId = this.currentPageId;

    // Check if navigation is allowed
    if (currentPage?.canNavigateTo && !currentPage.canNavigateTo(pageId, this.state)) {
      return;
    }

    try {
      // Run exit callbacks for current page
      if (currentPage && oldPageId) {
        const exitCallbacks = this.pageExitCallbacks.get(oldPageId) || [];
        for (const callback of exitCallbacks) {
          await callback();
        }
        
        if (currentPage.onExit) {
          await currentPage.onExit(this.state);
        }
        
        this.emit('page:exit', { pageId: oldPageId, state: this.state });
      }

      // Update current page
      this.currentPageId = pageId;

      // Run enter callbacks for new page
      const enterCallbacks = this.pageEnterCallbacks.get(pageId) || [];
      for (const callback of enterCallbacks) {
        await callback();
      }
      
      if (targetPage.onEnter) {
        await targetPage.onEnter(this.state);
      }
      
      this.emit('page:enter', { pageId, state: this.state });

      // Emit navigation change
      if (oldPageId) {
        this.emit('navigation:change', { 
          from: oldPageId, 
          to: pageId, 
          state: this.state 
        });
      }

      // Render the new page
      await this.renderCurrentPage();

    } catch (error) {
      this.emit('error', { 
        error: error as Error, 
        context: `Navigating to page ${pageId}` 
      });
    }
  }

  /**
   * Get current page
   */
  getCurrentPage(): Page<TState, TAction> | undefined {
    return this.currentPageId ? this.pages.get(this.currentPageId) : undefined;
  }

  /**
   * Get page by ID
   */
  getPage(pageId: string): Page<TState, TAction> | undefined {
    return this.pages.get(pageId);
  }

  // Event system methods
  on<K extends keyof FrameworkEvents<TState>>(
    event: K, 
    handler: EventHandler<FrameworkEvents<TState>[K]>
  ): void {
    this.eventEmitter.on(event, handler);
  }

  off<K extends keyof FrameworkEvents<TState>>(
    event: K, 
    handler: EventHandler<FrameworkEvents<TState>[K]>
  ): void {
    this.eventEmitter.off(event, handler);
  }

  emit<K extends keyof FrameworkEvents<TState>>(
    event: K, 
    data: FrameworkEvents<TState>[K]
  ): void {
    this.eventEmitter.emit(event, data);
  }

  // Lifecycle hooks
  onPageEnter(pageId: string, callback: () => void | Promise<void>): void {
    if (!this.pageEnterCallbacks.has(pageId)) {
      this.pageEnterCallbacks.set(pageId, []);
    }
    this.pageEnterCallbacks.get(pageId)!.push(callback);
  }

  onPageExit(pageId: string, callback: () => void | Promise<void>): void {
    if (!this.pageExitCallbacks.has(pageId)) {
      this.pageExitCallbacks.set(pageId, []);
    }
    this.pageExitCallbacks.get(pageId)!.push(callback);
  }

  onBeforeRender(callback: (page: Page<TState, TAction>) => void | Promise<void>): void {
    this.beforeRenderCallbacks.push(callback);
  }

  onAfterRender(callback: (page: Page<TState, TAction>) => void | Promise<void>): void {
    this.afterRenderCallbacks.push(callback);
  }

  // Plugin system
  use(plugin: Plugin<TState, TAction>): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already installed`);
    }

    this.plugins.set(plugin.name, plugin);

    // Install plugin components
    if (plugin.pages) {
      for (const page of plugin.pages) {
        this.pages.set(page.id, page);
      }
    }

    if (plugin.reducers) {
      Object.assign(this.reducers, plugin.reducers);
    }

    if (plugin.middleware) {
      this.middleware.push(...plugin.middleware);
    }

    // Call plugin install hook
    if (plugin.onInstall) {
      plugin.onInstall(this);
    }
  }

  unuse(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" is not installed`);
    }

    // Call plugin uninstall hook
    if (plugin.onUninstall) {
      plugin.onUninstall(this);
    }

    // Remove plugin components (basic implementation)
    if (plugin.pages) {
      for (const page of plugin.pages) {
        this.pages.delete(page.id);
      }
    }

    if (plugin.middleware) {
      for (const middleware of plugin.middleware) {
        const index = this.middleware.indexOf(middleware);
        if (index >= 0) {
          this.middleware.splice(index, 1);
        }
      }
    }

    this.plugins.delete(pluginName);
  }

  getPlugins(): Plugin<TState, TAction>[] {
    return Array.from(this.plugins.values());
  }
}