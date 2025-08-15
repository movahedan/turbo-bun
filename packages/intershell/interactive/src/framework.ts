/**
 * InterShell Framework - Main orchestrator for interactive CLI applications
 * Provides page-based navigation, state management, and event handling
 */

import type { FrameworkOptions, EventHandler, StateListener } from '@intershell/core';
import { colorify } from '@intershell/core';
import { InteractiveCLI } from './cli.js';
import type { Page, PageAction } from './pages.js';

// Framework events
export interface FrameworkEvents<TState> {
  pageChange: { from: string; to: string };
  stateChange: { oldState: TState; newState: TState };
  error: Error;
  exit: TState;
}

// Reducer type for state updates
export type Reducer<TState, TAction> = (state: TState, action: TAction) => TState;
export type ReducerMap<TState, TAction> = Record<string, Reducer<TState, TAction>>;

// Framework lifecycle hooks
export interface FrameworkHooks<TState> {
  onPageEnter?: (pageId: string, state: TState) => void | Promise<void>;
  onPageExit?: (pageId: string, state: TState) => void | Promise<void>;
  onBeforeRender?: (page: Page<TState>, state: TState) => void | Promise<void>;
  onAfterRender?: (page: Page<TState>, state: TState) => void | Promise<void>;
  onStateChange?: (oldState: TState, newState: TState) => void | Promise<void>;
  onError?: (error: Error, state: TState) => void | Promise<void>;
}

/**
 * Main InterShell Framework class
 * Orchestrates the entire interactive CLI application
 */
export class InterShellFramework<TState, TAction = any> {
  private cli: InteractiveCLI;
  private state: TState;
  private pages: Map<string, Page<TState, TAction>> = new Map();
  private reducers: ReducerMap<TState, TAction>;
  private options: Required<FrameworkOptions>;
  private hooks: FrameworkHooks<TState> = {};
  
  // Navigation state
  private currentPageId: string;
  private pageHistory: string[] = [];
  private isRunning = false;
  
  // Event system
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private stateListeners: Set<StateListener<TState>> = new Set();

  constructor(
    initialState: TState,
    pages: Page<TState, TAction>[],
    reducers: ReducerMap<TState, TAction>,
    options: FrameworkOptions = {}
  ) {
    this.state = initialState;
    this.reducers = reducers;
    this.options = {
      debug: options.debug ?? false,
      logLevel: options.logLevel ?? 'info',
      enableHotkeys: options.enableHotkeys ?? true,
      enableHistory: options.enableHistory ?? true,
      maxHistorySize: options.maxHistorySize ?? 50,
      renderMode: options.renderMode ?? 'immediate',
      renderDelay: options.renderDelay ?? 0,
    };

    // Set up pages
    pages.forEach(page => this.pages.set(page.id, page));
    
    if (pages.length === 0) {
      throw new Error('At least one page is required');
    }
    
    this.currentPageId = pages[0].id;
    
    // Initialize CLI
    this.cli = new InteractiveCLI();
    
    // Set up cleanup
    process.on('SIGINT', () => {
      this.cleanup();
      process.exit(0);
    });
  }

  // Core framework methods
  async run(): Promise<TState> {
    if (this.isRunning) {
      throw new Error('Framework is already running');
    }

    this.isRunning = true;
    this.log('debug', 'Starting InterShell framework');

    try {
      while (this.isRunning) {
        const currentPage = this.getCurrentPage();
        
        if (!currentPage) {
          throw new Error(`Page not found: ${this.currentPageId}`);
        }

        // Call page enter hook
        if (currentPage.onEnter) {
          await currentPage.onEnter(this.state);
        }
        
        // Call framework hook
        if (this.hooks.onPageEnter) {
          await this.hooks.onPageEnter(this.currentPageId, this.state);
        }

        // Render page
        await this.renderPage(currentPage);

        // Get next action from page
        const nextAction = currentPage.getNextAction(this.state);
        
        // Handle page action
        const shouldContinue = await this.handlePageAction(nextAction, currentPage);
        
        if (!shouldContinue) {
          break;
        }
      }

      this.log('debug', 'InterShell framework finished');
      this.emit('exit', this.state);
      return this.state;
      
    } catch (error) {
      this.log('error', 'Framework error:', error);
      this.emit('error', error as Error);
      
      if (this.hooks.onError) {
        await this.hooks.onError(error as Error, this.state);
      }
      
      throw error;
    } finally {
      this.isRunning = false;
      this.cleanup();
    }
  }

  // Navigation methods
  navigateTo(pageId: string): void {
    const targetPage = this.pages.get(pageId);
    if (!targetPage) {
      throw new Error(`Page not found: ${pageId}`);
    }

    const currentPage = this.getCurrentPage();
    if (currentPage && currentPage.canNavigateTo && !currentPage.canNavigateTo(pageId, this.state)) {
      this.log('warn', `Navigation to ${pageId} not allowed from ${this.currentPageId}`);
      return;
    }

    const previousPageId = this.currentPageId;
    
    // Update history
    if (this.options.enableHistory) {
      this.pageHistory.push(this.currentPageId);
      
      // Limit history size
      if (this.pageHistory.length > this.options.maxHistorySize) {
        this.pageHistory = this.pageHistory.slice(-this.options.maxHistorySize);
      }
    }

    // Call exit hook for current page
    if (currentPage && currentPage.onExit) {
      currentPage.onExit(this.state);
    }
    
    if (this.hooks.onPageExit) {
      this.hooks.onPageExit(this.currentPageId, this.state);
    }

    // Navigate to new page
    this.currentPageId = pageId;
    this.log('debug', `Navigated from ${previousPageId} to ${pageId}`);
    this.emit('pageChange', { from: previousPageId, to: pageId });
  }

  goBack(): boolean {
    if (!this.options.enableHistory || this.pageHistory.length === 0) {
      return false;
    }

    const previousPageId = this.pageHistory.pop()!;
    this.currentPageId = previousPageId;
    this.log('debug', `Went back to ${previousPageId}`);
    return true;
  }

  // State management
  dispatch(action: TAction): void {
    const actionType = (action as any)?.type || 'unknown';
    const reducer = this.reducers[actionType];
    
    if (!reducer) {
      this.log('warn', `No reducer found for action type: ${actionType}`);
      return;
    }

    const oldState = this.state;
    const newState = reducer(this.state, action);
    
    if (newState !== oldState) {
      this.state = newState;
      this.log('debug', `State updated by action: ${actionType}`);
      
      // Notify listeners
      for (const listener of this.stateListeners) {
        try {
          listener(newState, oldState);
        } catch (error) {
          this.log('error', 'Error in state listener:', error);
        }
      }
      
      // Call hook
      if (this.hooks.onStateChange) {
        this.hooks.onStateChange(oldState, newState);
      }
      
      this.emit('stateChange', { oldState, newState });
    }
  }

  getState(): TState {
    return this.state;
  }

  setState(newState: TState): void {
    const oldState = this.state;
    this.state = newState;
    
    // Notify listeners
    for (const listener of this.stateListeners) {
      try {
        listener(newState, oldState);
      } catch (error) {
        this.log('error', 'Error in state listener:', error);
      }
    }
    
    if (this.hooks.onStateChange) {
      this.hooks.onStateChange(oldState, newState);
    }
    
    this.emit('stateChange', { oldState, newState });
  }

  // Event system
  on<K extends keyof FrameworkEvents<TState>>(
    event: K, 
    handler: EventHandler<FrameworkEvents<TState>[K]>
  ): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off<K extends keyof FrameworkEvents<TState>>(
    event: K, 
    handler: EventHandler<FrameworkEvents<TState>[K]>
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit<K extends keyof FrameworkEvents<TState>>(
    event: K, 
    data: FrameworkEvents<TState>[K]
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          this.log('error', `Error in event handler for ${event}:`, error);
        }
      }
    }
  }

  // State subscription
  subscribe(listener: StateListener<TState>): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  // Page management
  getPage(pageId: string): Page<TState, TAction> | undefined {
    return this.pages.get(pageId);
  }

  getCurrentPage(): Page<TState, TAction> {
    const page = this.pages.get(this.currentPageId);
    if (!page) {
      throw new Error(`Current page not found: ${this.currentPageId}`);
    }
    return page;
  }

  // Lifecycle hooks
  setHooks(hooks: FrameworkHooks<TState>): void {
    this.hooks = { ...this.hooks, ...hooks };
  }

  // Private methods
  private async renderPage(page: Page<TState, TAction>): Promise<void> {
    try {
      if (this.hooks.onBeforeRender) {
        await this.hooks.onBeforeRender(page, this.state);
      }

      if (this.options.renderMode === 'debounced' && this.options.renderDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, this.options.renderDelay));
      }

      await page.render(this.cli, this.state);

      if (this.hooks.onAfterRender) {
        await this.hooks.onAfterRender(page, this.state);
      }
    } catch (error) {
      this.log('error', 'Error rendering page:', error);
      throw error;
    }
  }

  private async handlePageAction(action: PageAction, currentPage: Page<TState, TAction>): Promise<boolean> {
    switch (action.type) {
      case 'NEXT_PAGE':
        const pages = Array.from(this.pages.keys());
        const currentIndex = pages.indexOf(this.currentPageId);
        if (currentIndex < pages.length - 1) {
          this.navigateTo(pages[currentIndex + 1]);
        } else {
          return false; // End of pages
        }
        break;

      case 'PREV_PAGE':
        if (!this.goBack()) {
          const pages = Array.from(this.pages.keys());
          const currentIndex = pages.indexOf(this.currentPageId);
          if (currentIndex > 0) {
            this.navigateTo(pages[currentIndex - 1]);
          }
        }
        break;

      case 'CHANGE_PAGE':
        this.navigateTo(action.payload);
        break;

      case 'RE_RENDER':
        // Just continue the loop to re-render
        break;

      case 'EXIT':
        return false;

      case 'CUSTOM':
        // Handle custom actions through reducers
        if (action.payload) {
          this.dispatch(action.payload);
        }
        break;

      default:
        this.log('warn', 'Unknown page action:', action);
    }

    return true;
  }

  private log(level: string, ...args: any[]): void {
    if (!this.options.debug && level === 'debug') {
      return;
    }

    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.options.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    if (messageLevelIndex <= currentLevelIndex) {
      const prefix = colorify.gray(`[InterShell:${level.toUpperCase()}]`);
      console.log(prefix, ...args);
    }
  }

  private cleanup(): void {
    this.cli.cleanup();
    this.eventHandlers.clear();
    this.stateListeners.clear();
  }
}

export default InterShellFramework;