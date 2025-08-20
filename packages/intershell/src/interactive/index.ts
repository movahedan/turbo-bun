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

// Re-export core types for convenience
export type {
	ConfirmConfig,
	EventHandler,
	FrameworkOptions,
	KeyPress,
	PromptConfig,
	QuickAction,
	SelectConfig,
	StateListener,
	ValidationResult,
} from "../core";
export type { CLIEvents } from "./cli";

// Interactive CLI
export { default as CLI, InteractiveCLI } from "./cli";
export type {
	FrameworkEvents,
	FrameworkHooks,
	Reducer,
	ReducerMap,
} from "./framework";
// Core framework
export { default as Framework, InterShellFramework } from "./framework";
export type {
	ConfirmPageState,
	InputPageState,
	Page,
	PageAction,
	PageMetadata,
	SelectPageState,
} from "./pages";
// Page system
export {
	createConfirmPage,
	createInfoPage,
	createInputPage,
	createSelectPage,
	PageBuilder,
	pageUtils,
} from "./pages";

// Version information
export const VERSION = "0.1.0";
export const PACKAGE_NAME = "@intershell/interactive";

// Framework metadata
export const FRAMEWORK_INFO = {
	name: "InterShell Interactive",
	version: VERSION,
	description: "Interactive CLI framework with page-based navigation and state management",
	author: "Monobun",
	license: "MIT",
} as const;
