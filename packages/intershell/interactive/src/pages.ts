/**
 * Page system for the InterShell interactive framework
 * Provides page-based navigation with custom key handling and state management
 */

import type { KeyPress, ValidationResult } from '@intershell/core';
import type { InteractiveCLI } from './cli.js';

// Page action types for navigation
export type PageAction = 
  | { type: 'NEXT_PAGE' }
  | { type: 'PREV_PAGE' }
  | { type: 'CHANGE_PAGE'; payload: string }
  | { type: 'RE_RENDER' }
  | { type: 'EXIT' }
  | { type: 'CUSTOM'; payload: any };

// Page metadata interface
export interface PageMetadata {
  tags?: string[];
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  estimatedTime?: number;
  version?: string;
}

// Core page interface
export interface Page<TState = any, TAction = any> {
  // Basic properties
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

// Page builder for creating pages with fluent API
export class PageBuilder<TState = any, TAction = any> {
  private page: Partial<Page<TState, TAction>> = {};

  static create<TState = any, TAction = any>(id: string, title: string): PageBuilder<TState, TAction> {
    const builder = new PageBuilder<TState, TAction>();
    builder.page.id = id;
    builder.page.title = title;
    return builder;
  }

  description(description: string): this {
    this.page.description = description;
    return this;
  }

  icon(icon: string): this {
    this.page.icon = icon;
    return this;
  }

  render(renderFn: (cli: InteractiveCLI, state: TState) => Promise<void>): this {
    this.page.render = renderFn;
    return this;
  }

  handleKey(keyHandler: (key: KeyPress, state: TState) => TAction | null): this {
    this.page.handleKey = keyHandler;
    return this;
  }

  getNextAction(actionGetter: (state: TState) => PageAction): this {
    this.page.getNextAction = actionGetter;
    return this;
  }

  canNavigateTo(navigationChecker: (targetPage: string, state: TState) => boolean): this {
    this.page.canNavigateTo = navigationChecker;
    return this;
  }

  onEnter(enterHandler: (state: TState) => void | Promise<void>): this {
    this.page.onEnter = enterHandler;
    return this;
  }

  onExit(exitHandler: (state: TState) => void | Promise<void>): this {
    this.page.onExit = exitHandler;
    return this;
  }

  validate(validator: (state: TState) => ValidationResult): this {
    this.page.validate = validator;
    return this;
  }

  canSkip(skipChecker: (state: TState) => boolean): this {
    this.page.canSkip = skipChecker;
    return this;
  }

  metadata(metadata: PageMetadata): this {
    this.page.metadata = metadata;
    return this;
  }

  build(): Page<TState, TAction> {
    // Validate required fields
    if (!this.page.id) {
      throw new Error('Page ID is required');
    }
    if (!this.page.title) {
      throw new Error('Page title is required');
    }
    if (!this.page.render) {
      throw new Error('Page render function is required');
    }
    if (!this.page.handleKey) {
      throw new Error('Page key handler is required');
    }
    if (!this.page.getNextAction) {
      throw new Error('Page next action getter is required');
    }

    return this.page as Page<TState, TAction>;
  }
}

// Common page types and factories

// Input page for text input
export interface InputPageState {
  value: string;
  isValid: boolean;
  error?: string;
}

export function createInputPage<TState extends { input: InputPageState }>(
  id: string,
  title: string,
  question: string,
  validator?: (value: string) => ValidationResult<string>
): Page<TState> {
  return PageBuilder.create<TState>(id, title)
    .description(question)
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(title);
      console.log('─'.repeat(50));
      console.log(question);
      
      if (state.input.error) {
        console.log(`Error: ${state.input.error}`);
      }
      
      const value = await cli.prompt('Enter value:', {
        clearScreen: false,
        allowEmpty: !validator,
      });
      
      // Update state
      (state as any).input.value = value;
      
      if (validator) {
        const validation = validator(value);
        (state as any).input.isValid = validation.isValid;
        (state as any).input.error = validation.error;
      } else {
        (state as any).input.isValid = true;
        (state as any).input.error = undefined;
      }
    })
    .handleKey((key, state) => {
      // Key handling is done in render method for input pages
      return null;
    })
    .getNextAction((state) => {
      if (state.input.isValid) {
        return { type: 'NEXT_PAGE' };
      }
      return { type: 'RE_RENDER' };
    })
    .validate((state) => ({
      isValid: state.input.isValid,
      error: state.input.error,
    }))
    .build();
}

// Select page for choosing from options
export interface SelectPageState {
  selectedIndex: number;
  selectedValues: string[];
  isMultiple: boolean;
}

export function createSelectPage<TState extends { select: SelectPageState }>(
  id: string,
  title: string,
  question: string,
  options: string[],
  multiple = false
): Page<TState> {
  return PageBuilder.create<TState>(id, title)
    .description(question)
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(title);
      console.log('─'.repeat(50));
      console.log(question);
      
      const result = await cli.select(question, options, {
        multiple,
        clearScreen: false,
      });
      
      // Update state
      (state as any).select.selectedValues = result;
      (state as any).select.selectedIndex = options.indexOf(result[0]);
      (state as any).select.isMultiple = multiple;
    })
    .handleKey((key, state) => {
      // Key handling is done in render method for select pages
      return null;
    })
    .getNextAction((state) => {
      return { type: 'NEXT_PAGE' };
    })
    .build();
}

// Confirm page for yes/no questions
export interface ConfirmPageState {
  confirmed: boolean;
}

export function createConfirmPage<TState extends { confirm: ConfirmPageState }>(
  id: string,
  title: string,
  question: string,
  defaultValue = false
): Page<TState> {
  return PageBuilder.create<TState>(id, title)
    .description(question)
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(title);
      console.log('─'.repeat(50));
      
      const result = await cli.confirm(question, {
        clearScreen: false,
        defaultValue,
      });
      
      // Update state
      (state as any).confirm.confirmed = result;
    })
    .handleKey((key, state) => {
      // Key handling is done in render method for confirm pages
      return null;
    })
    .getNextAction((state) => {
      return { type: 'NEXT_PAGE' };
    })
    .build();
}

// Info page for displaying information
export function createInfoPage<TState>(
  id: string,
  title: string,
  content: string | ((state: TState) => string)
): Page<TState> {
  return PageBuilder.create<TState>(id, title)
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(title);
      console.log('─'.repeat(50));
      
      const displayContent = typeof content === 'function' ? content(state) : content;
      console.log(displayContent);
      console.log();
      console.log('Press any key to continue...');
      
      // Wait for any key press
      await new Promise<void>((resolve) => {
        const handler = () => {
          cli.offKeyPress(handler);
          resolve();
        };
        cli.onKeyPress(handler);
      });
    })
    .handleKey((key, state) => {
      return { type: 'NEXT_PAGE' };
    })
    .getNextAction((state) => {
      return { type: 'NEXT_PAGE' };
    })
    .build();
}

// Export page utilities
export const pageUtils = {
  createInputPage,
  createSelectPage,
  createConfirmPage,
  createInfoPage,
};

export default {
  Page,
  PageBuilder,
  pageUtils,
};