/**
 * Enhanced Interactive CLI foundation with event-based architecture
 * 
 * This replaces the Promise-based methods from the original interactive-cli.ts
 * with a clean event-driven foundation that can be used by the framework.
 */

import { Terminal, KeyParser, type KeyPress } from '@intershell/core';
import type { InteractiveCLI } from './types.js';

/**
 * Enhanced Interactive CLI with event-based architecture
 */
export class EnhancedInteractiveCLI implements InteractiveCLI {
  private isRawMode = false;
  private keyPressHandlers: Set<(key: KeyPress) => void> = new Set();
  private controlledPromises = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>();

  constructor() {
    this.enableRawMode();
    this.setupKeyHandling();
  }

  /**
   * Enable raw mode for key input
   */
  private enableRawMode(): void {
    if (process.stdin.isTTY && !this.isRawMode) {
      Terminal.enableRawMode();
      this.isRawMode = true;
    }
  }

  /**
   * Setup key handling with the enhanced key parser
   */
  private setupKeyHandling(): void {
    const handleData = (data: Buffer) => {
      const key = KeyParser.parse(data);
      
      // Emit to all registered handlers
      for (const handler of this.keyPressHandlers) {
        try {
          handler(key);
        } catch (error) {
          console.error('Error in key press handler:', error);
        }
      }
    };

    process.stdin.on('data', handleData);
  }

  /**
   * Register a key press handler
   */
  onKeyPress(handler: (key: KeyPress) => void): void {
    this.keyPressHandlers.add(handler);
  }

  /**
   * Unregister a key press handler
   */
  offKeyPress(handler: (key: KeyPress) => void): void {
    this.keyPressHandlers.delete(handler);
  }

  /**
   * Create a controlled promise that can be resolved externally
   */
  createControlledPromise<T>(): {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (error: any) => void;
  } {
    let resolve: (value: T) => void;
    let reject: (error: any) => void;

    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return {
      promise,
      resolve: resolve!,
      reject: reject!,
    };
  }

  /**
   * Clear the entire screen
   */
  clearScreen(): void {
    Terminal.clearScreen();
  }

  /**
   * Clear the current line
   */
  clearLine(): void {
    Terminal.clearLine();
  }

  /**
   * Move cursor to specific position
   */
  moveTo(x: number, y: number): void {
    Terminal.moveTo(x, y);
  }

  /**
   * Hide cursor
   */
  hideCursor(): void {
    Terminal.hideCursor();
  }

  /**
   * Show cursor
   */
  showCursor(): void {
    Terminal.showCursor();
  }

  /**
   * Move cursor up
   */
  moveUp(lines: number = 1): void {
    Terminal.moveUp(lines);
  }

  /**
   * Move cursor down
   */
  moveDown(lines: number = 1): void {
    Terminal.moveDown(lines);
  }

  /**
   * Move cursor left
   */
  moveLeft(columns: number = 1): void {
    Terminal.moveLeft(columns);
  }

  /**
   * Move cursor right
   */
  moveRight(columns: number = 1): void {
    Terminal.moveRight(columns);
  }

  /**
   * Save cursor position
   */
  saveCursor(): void {
    Terminal.saveCursor();
  }

  /**
   * Restore cursor position
   */
  restoreCursor(): void {
    Terminal.restoreCursor();
  }

  /**
   * Get terminal size
   */
  getSize(): { width: number; height: number } {
    return Terminal.getSize();
  }

  /**
   * Enable alternative screen buffer
   */
  enableAltScreen(): void {
    Terminal.enableAltScreen();
  }

  /**
   * Disable alternative screen buffer
   */
  disableAltScreen(): void {
    Terminal.disableAltScreen();
  }

  /**
   * Write text to stdout
   */
  write(text: string): void {
    process.stdout.write(text);
  }

  /**
   * Write line to stdout
   */
  writeLine(text: string = ''): void {
    process.stdout.write(text + '\n');
  }

  /**
   * Cleanup resources and restore terminal state
   */
  cleanup(): void {
    this.showCursor();
    
    if (this.isRawMode) {
      Terminal.disableRawMode();
      this.isRawMode = false;
    }

    // Reject any pending controlled promises
    for (const { reject } of this.controlledPromises.values()) {
      reject(new Error('CLI cleanup - operation cancelled'));
    }
    this.controlledPromises.clear();

    // Clear all handlers
    this.keyPressHandlers.clear();
  }
}

/**
 * Utility functions for common interactive patterns
 */
export class InteractiveUtils {
  /**
   * Wait for a specific key press
   */
  static waitForKey(cli: EnhancedInteractiveCLI, targetKey: Partial<KeyPress>): Promise<KeyPress> {
    const { promise, resolve } = cli.createControlledPromise<KeyPress>();

    const handler = (key: KeyPress) => {
      if (KeyParser.matches(key, targetKey)) {
        cli.offKeyPress(handler);
        resolve(key);
      }
    };

    cli.onKeyPress(handler);
    return promise;
  }

  /**
   * Wait for any key press
   */
  static waitForAnyKey(cli: EnhancedInteractiveCLI): Promise<KeyPress> {
    const { promise, resolve } = cli.createControlledPromise<KeyPress>();

    const handler = (key: KeyPress) => {
      cli.offKeyPress(handler);
      resolve(key);
    };

    cli.onKeyPress(handler);
    return promise;
  }

  /**
   * Wait for Enter key
   */
  static waitForEnter(cli: EnhancedInteractiveCLI): Promise<void> {
    return InteractiveUtils.waitForKey(cli, { name: 'return' }).then(() => {});
  }

  /**
   * Wait for Escape key
   */
  static waitForEscape(cli: EnhancedInteractiveCLI): Promise<void> {
    return InteractiveUtils.waitForKey(cli, { name: 'escape' }).then(() => {});
  }

  /**
   * Wait for Ctrl+C
   */
  static waitForCtrlC(cli: EnhancedInteractiveCLI): Promise<void> {
    return InteractiveUtils.waitForKey(cli, { name: 'c', ctrl: true }).then(() => {});
  }

  /**
   * Create a key handler that resolves when any of the specified keys are pressed
   */
  static waitForKeys(cli: EnhancedInteractiveCLI, keys: Partial<KeyPress>[]): Promise<KeyPress> {
    const { promise, resolve } = cli.createControlledPromise<KeyPress>();

    const handler = (key: KeyPress) => {
      for (const targetKey of keys) {
        if (KeyParser.matches(key, targetKey)) {
          cli.offKeyPress(handler);
          resolve(key);
          return;
        }
      }
    };

    cli.onKeyPress(handler);
    return promise;
  }

  /**
   * Create a timeout that can be cancelled by key press
   */
  static waitForKeyOrTimeout(
    cli: EnhancedInteractiveCLI, 
    targetKey: Partial<KeyPress>, 
    timeoutMs: number
  ): Promise<KeyPress | 'timeout'> {
    const { promise, resolve } = cli.createControlledPromise<KeyPress | 'timeout'>();

    const timeout = setTimeout(() => {
      cli.offKeyPress(handler);
      resolve('timeout');
    }, timeoutMs);

    const handler = (key: KeyPress) => {
      if (KeyParser.matches(key, targetKey)) {
        clearTimeout(timeout);
        cli.offKeyPress(handler);
        resolve(key);
      }
    };

    cli.onKeyPress(handler);
    return promise;
  }
}