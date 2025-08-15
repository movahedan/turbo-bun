/**
 * @intershell/interactive - Interactive CLI framework for InterShell
 * 
 * This package provides a complete interactive CLI framework with page-based
 * navigation, state management, and event-driven architecture.
 */

// Core types
export type * from './types.js';

// Enhanced CLI foundation
export { EnhancedInteractiveCLI, InteractiveUtils } from './cli.js';

// Framework implementation
export { InterShellFrameworkImpl } from './framework.js';

// Framework builder
export { 
  InterShellFrameworkBuilder,
  createFramework,
  createSimpleFramework 
} from './builder.js';

// Re-export specific types for convenience
export type {
  Page,
  PageAction,
  PageMetadata,
  ValidationResult,
  Reducer,
  ReducerMap,
  FrameworkOptions,
  FrameworkEvents,
  InterShellFramework,
  FrameworkBuilder,
  Plugin,
  Middleware,
  EventEmitter,
  InteractiveCLI,
  NavigationManager,
  HistoryEntry,
  Renderer,
} from './types.js';