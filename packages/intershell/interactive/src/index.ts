/**
 * InterShell Interactive - Interactive CLI framework with page-based navigation
 * 
 * This package provides a complete framework for building interactive CLI applications
 * with page-based navigation, state management, and event handling.
 * 
 * @example
 * ```typescript
 * import { InterShellFramework, PageBuilder } from '@intershell/interactive';
 * 
 * interface AppState {
 *   name: string;
 *   confirmed: boolean;
 * }
 * 
 * const pages = [
 *   PageBuilder.create<AppState>('input', 'Enter Name')
 *     .render(async (cli, state) => {
 *       const name = await cli.prompt('What is your name?');
 *       state.name = name;
 *     })
 *     .handleKey(() => null)
 *     .getNextAction(() => ({ type: 'NEXT_PAGE' }))
 *     .build(),
 *   
 *   PageBuilder.create<AppState>('confirm', 'Confirm')
 *     .render(async (cli, state) => {
 *       const confirmed = await cli.confirm(`Hello ${state.name}, continue?`);
 *       state.confirmed = confirmed;
 *     })
 *     .handleKey(() => null)
 *     .getNextAction((state) => state.confirmed ? { type: 'EXIT' } : { type: 'PREV_PAGE' })
 *     .build(),
 * ];
 * 
 * const framework = new InterShellFramework(
 *   { name: '', confirmed: false },
 *   pages,
 *   {}
 * );
 * 
 * const finalState = await framework.run();
 * console.log('Final state:', finalState);
 * ```
 */

// Core framework
export { InterShellFramework, default as Framework } from './framework.js';
export type { 
  FrameworkEvents, 
  FrameworkHooks, 
  Reducer, 
  ReducerMap 
} from './framework.js';

// Interactive CLI
export { InteractiveCLI, default as CLI } from './cli.js';
export type { CLIEvents } from './cli.js';

// Page system
export { 
  PageBuilder,
  pageUtils,
  createInputPage,
  createSelectPage, 
  createConfirmPage,
  createInfoPage
} from './pages.js';
export type { 
  Page, 
  PageAction, 
  PageMetadata,
  InputPageState,
  SelectPageState,
  ConfirmPageState
} from './pages.js';

// Re-export core types for convenience
export type {
  KeyPress,
  ValidationResult,
  QuickAction,
  SelectConfig,
  PromptConfig,
  ConfirmConfig,
  FrameworkOptions,
  EventHandler,
  StateListener
} from '@intershell/core';

// Version information
export const VERSION = '0.1.0';
export const PACKAGE_NAME = '@intershell/interactive';

// Framework metadata
export const FRAMEWORK_INFO = {
  name: 'InterShell Interactive',
  version: VERSION,
  description: 'Interactive CLI framework with page-based navigation and state management',
  author: 'Monobun',
  license: 'MIT',
} as const;