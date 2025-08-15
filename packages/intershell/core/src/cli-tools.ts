/**
 * CLI utility functions for the InterShell framework
 * Provides common CLI operations and helpers
 */

import type { QuickAction, ProgressTracker } from './types.js';
import { colorify } from './colorify.js';

// Progress bar utilities
export function renderProgressBar(current: number, total: number, width = 30): string {
  const percent = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${percent}%`;
}

// Quick action utilities
export function renderQuickActions(actions: QuickAction[]): void {
  if (actions.length === 0) return;
  
  console.log(colorify.cyan('\n⚡ Quick Actions:'));
  actions.forEach((action) => {
    const shortcut = action.shortcut ? ` (${action.shortcut})` : '';
    console.log(colorify.cyan(`  • ${action.label}${shortcut} - ${action.description}`));
  });
}

// Common quick action factories
export const commonQuickActions = {
  help: (callback: () => void): QuickAction => ({
    key: 'help',
    label: 'Show Help',
    description: 'Display help for this step',
    shortcut: 'h',
    action: callback,
  }),
  
  back: (callback: () => void): QuickAction => ({
    key: 'back',
    label: 'Go Back',
    description: 'Return to previous step',
    shortcut: '←',
    action: callback,
  }),
  
  exit: (callback: () => void): QuickAction => ({
    key: 'exit',
    label: 'Exit',
    description: 'Exit the application',
    shortcut: 'Ctrl+C',
    action: callback,
  }),
  
  skip: (callback: () => void): QuickAction => ({
    key: 'skip',
    label: 'Skip',
    description: 'Skip this step',
    shortcut: 's',
    action: callback,
  }),
};

// Text formatting utilities
export function formatTitle(title: string, width = 50): string {
  return `${colorify.bold(colorify.blue(title))}\n${colorify.cyan('─'.repeat(width))}`;
}

export function formatSection(title: string, content: string[]): string {
  if (content.length === 0) return '';
  
  return `${colorify.bold(title)}\n${content.map(item => `  • ${item}`).join('\n')}\n`;
}

// Input validation helpers
export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateLength(value: string, min: number, max: number, fieldName: string): string | null {
  if (value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  if (value.length > max) {
    return `${fieldName} must be no more than ${max} characters`;
  }
  return null;
}

export function validatePattern(value: string, pattern: RegExp, fieldName: string, message?: string): string | null {
  if (!pattern.test(value)) {
    return message || `${fieldName} format is invalid`;
  }
  return null;
}

// Screen management utilities
export function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[0f');
}

export function showCursor(): void {
  process.stdout.write('\x1b[?25h');
}

export function hideCursor(): void {
  process.stdout.write('\x1b[?25l');
}

export function moveCursor(x: number, y: number): void {
  process.stdout.write(`\x1b[${y};${x}H`);
}

// Key press utilities
export function isEnterKey(key: string): boolean {
  return key === '\r' || key === '\n';
}

export function isEscapeKey(key: string): boolean {
  return key === '\x1b';
}

export function isBackspaceKey(key: string): boolean {
  return key === '\x7f' || key === '\b';
}

export function isArrowKey(key: string): { isArrow: boolean; direction?: 'up' | 'down' | 'left' | 'right' } {
  if (key === '\x1b[A') return { isArrow: true, direction: 'up' };
  if (key === '\x1b[B') return { isArrow: true, direction: 'down' };
  if (key === '\x1b[C') return { isArrow: true, direction: 'right' };
  if (key === '\x1b[D') return { isArrow: true, direction: 'left' };
  return { isArrow: false };
}

export function isCtrlC(key: string): boolean {
  return key === '\x03';
}

// Terminal detection
export function isTerminal(): boolean {
  return process.stdout.isTTY;
}

export function getTerminalSize(): { width: number; height: number } {
  return {
    width: process.stdout.columns || 80,
    height: process.stdout.rows || 24,
  };
}

// Error formatting
export function formatError(error: Error | string, prefix = '❌'): string {
  const message = error instanceof Error ? error.message : error;
  return `${colorify.red(prefix)} ${colorify.red(message)}`;
}

export function formatWarning(message: string, prefix = '⚠️'): string {
  return `${colorify.yellow(prefix)} ${colorify.yellow(message)}`;
}

export function formatSuccess(message: string, prefix = '✅'): string {
  return `${colorify.green(prefix)} ${colorify.green(message)}`;
}

export function formatInfo(message: string, prefix = 'ℹ️'): string {
  return `${colorify.blue(prefix)} ${colorify.blue(message)}`;
}

// Table formatting
export function formatTable(headers: string[], rows: string[][]): string {
  if (rows.length === 0) return '';
  
  const columnWidths = headers.map((header, i) => {
    const maxRowWidth = Math.max(...rows.map(row => (row[i] || '').length));
    return Math.max(header.length, maxRowWidth);
  });
  
  const formatRow = (row: string[]) => {
    return row.map((cell, i) => cell.padEnd(columnWidths[i])).join(' | ');
  };
  
  const separator = columnWidths.map(width => '-'.repeat(width)).join('-+-');
  
  return [
    formatRow(headers),
    separator,
    ...rows.map(formatRow)
  ].join('\n');
}

export default {
  renderProgressBar,
  renderQuickActions,
  commonQuickActions,
  formatTitle,
  formatSection,
  validateRequired,
  validateLength,
  validatePattern,
  clearScreen,
  showCursor,
  hideCursor,
  moveCursor,
  isEnterKey,
  isEscapeKey,
  isBackspaceKey,
  isArrowKey,
  isCtrlC,
  isTerminal,
  getTerminalSize,
  formatError,
  formatWarning,
  formatSuccess,
  formatInfo,
  formatTable,
};