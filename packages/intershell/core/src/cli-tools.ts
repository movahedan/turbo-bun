/**
 * Enhanced CLI tools and utilities for InterShell
 */

import type { KeyPress } from './types.js';
import { colorify } from './colorify.js';

/**
 * Terminal control utilities
 */
export class Terminal {
  /**
   * Clear the entire screen
   */
  static clearScreen(): void {
    process.stdout.write('\u001b[2J\u001b[0;0H');
  }

  /**
   * Clear the current line
   */
  static clearLine(): void {
    process.stdout.write('\u001b[2K');
  }

  /**
   * Clear from cursor to end of line
   */
  static clearToEndOfLine(): void {
    process.stdout.write('\u001b[0K');
  }

  /**
   * Clear from cursor to beginning of line
   */
  static clearToBeginningOfLine(): void {
    process.stdout.write('\u001b[1K');
  }

  /**
   * Move cursor to specific position
   */
  static moveTo(x: number, y: number): void {
    process.stdout.write(`\u001b[${y};${x}H`);
  }

  /**
   * Move cursor up by n lines
   */
  static moveUp(lines: number = 1): void {
    process.stdout.write(`\u001b[${lines}A`);
  }

  /**
   * Move cursor down by n lines
   */
  static moveDown(lines: number = 1): void {
    process.stdout.write(`\u001b[${lines}B`);
  }

  /**
   * Move cursor left by n columns
   */
  static moveLeft(columns: number = 1): void {
    process.stdout.write(`\u001b[${columns}D`);
  }

  /**
   * Move cursor right by n columns
   */
  static moveRight(columns: number = 1): void {
    process.stdout.write(`\u001b[${columns}C`);
  }

  /**
   * Save cursor position
   */
  static saveCursor(): void {
    process.stdout.write('\u001b[s');
  }

  /**
   * Restore cursor position
   */
  static restoreCursor(): void {
    process.stdout.write('\u001b[u');
  }

  /**
   * Hide cursor
   */
  static hideCursor(): void {
    process.stdout.write('\u001b[?25l');
  }

  /**
   * Show cursor
   */
  static showCursor(): void {
    process.stdout.write('\u001b[?25h');
  }

  /**
   * Get terminal size
   */
  static getSize(): { width: number; height: number } {
    return {
      width: process.stdout.columns || 80,
      height: process.stdout.rows || 24,
    };
  }

  /**
   * Enable raw mode
   */
  static enableRawMode(): void {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
    }
  }

  /**
   * Disable raw mode
   */
  static disableRawMode(): void {
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(false);
      process.stdin.pause();
    }
  }

  /**
   * Enable alternative screen buffer
   */
  static enableAltScreen(): void {
    process.stdout.write('\u001b[?1049h');
  }

  /**
   * Disable alternative screen buffer
   */
  static disableAltScreen(): void {
    process.stdout.write('\u001b[?1049l');
  }
}

/**
 * Key parsing utilities
 */
export class KeyParser {
  private static readonly KEY_MAPPINGS = new Map([
    ['\u0003', { name: 'c', ctrl: true }],
    ['\r', { name: 'return' }],
    ['\n', { name: 'return' }],
    ['\u001b[A', { name: 'up' }],
    ['\u001b[B', { name: 'down' }],
    ['\u001b[D', { name: 'left' }],
    ['\u001b[C', { name: 'right' }],
    [' ', { name: 'space' }],
    ['\u0020', { name: 'space' }],
    ['\u007f', { name: 'backspace' }],
    ['\u0008', { name: 'backspace' }],
    ['\u001b', { name: 'escape' }],
    ['\t', { name: 'tab' }],
    ['\u001b[Z', { name: 'tab', shift: true }],
    // Function keys
    ['\u001bOP', { name: 'f1' }],
    ['\u001bOQ', { name: 'f2' }],
    ['\u001bOR', { name: 'f3' }],
    ['\u001bOS', { name: 'f4' }],
    ['\u001b[15~', { name: 'f5' }],
    ['\u001b[17~', { name: 'f6' }],
    ['\u001b[18~', { name: 'f7' }],
    ['\u001b[19~', { name: 'f8' }],
    ['\u001b[20~', { name: 'f9' }],
    ['\u001b[21~', { name: 'f10' }],
    ['\u001b[23~', { name: 'f11' }],
    ['\u001b[24~', { name: 'f12' }],
    // Navigation keys
    ['\u001b[H', { name: 'home' }],
    ['\u001b[F', { name: 'end' }],
    ['\u001b[5~', { name: 'pageup' }],
    ['\u001b[6~', { name: 'pagedown' }],
    ['\u001b[2~', { name: 'insert' }],
    ['\u001b[3~', { name: 'delete' }],
  ]);

  /**
   * Parse key input from buffer
   */
  static parse(data: Buffer): KeyPress {
    const sequence = data.toString();
    const key: KeyPress = { sequence };
    
    const mapping = KeyParser.KEY_MAPPINGS.get(sequence);
    if (mapping) {
      Object.assign(key, mapping);
    } else {
      // Handle regular characters
      if (sequence.length === 1) {
        const code = sequence.charCodeAt(0);
        
        // Control characters
        if (code < 32) {
          key.ctrl = true;
          key.name = String.fromCharCode(code + 96); // Convert to letter
        } else {
          key.name = sequence;
        }
      } else {
        // Multi-character sequences
        key.name = sequence;
      }
    }

    return key;
  }

  /**
   * Check if key matches a pattern
   */
  static matches(key: KeyPress, pattern: Partial<KeyPress>): boolean {
    return Object.entries(pattern).every(([prop, value]) => {
      return (key as any)[prop] === value;
    });
  }
}

/**
 * Text formatting utilities
 */
export class TextFormatter {
  /**
   * Wrap text to specified width
   */
  static wrap(text: string, width: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Pad text to specified width
   */
  static pad(text: string, width: number, align: 'left' | 'center' | 'right' = 'left'): string {
    if (text.length >= width) {
      return text;
    }

    const padding = width - text.length;

    switch (align) {
      case 'left':
        return text + ' '.repeat(padding);
      case 'right':
        return ' '.repeat(padding) + text;
      case 'center':
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
      default:
        return text;
    }
  }

  /**
   * Truncate text with ellipsis
   */
  static truncate(text: string, maxLength: number, ellipsis: string = '...'): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength - ellipsis.length) + ellipsis;
  }

  /**
   * Create a horizontal line
   */
  static line(width: number, char: string = '─'): string {
    return char.repeat(width);
  }

  /**
   * Create a box around text
   */
  static box(text: string, options: {
    padding?: number;
    margin?: number;
    borderStyle?: 'single' | 'double' | 'rounded';
    title?: string;
  } = {}): string {
    const {
      padding = 1,
      margin = 0,
      borderStyle = 'single',
      title,
    } = options;

    const borders = {
      single: { h: '─', v: '│', tl: '┌', tr: '┐', bl: '└', br: '┘' },
      double: { h: '═', v: '║', tl: '╔', tr: '╗', bl: '╚', br: '╝' },
      rounded: { h: '─', v: '│', tl: '╭', tr: '╮', bl: '╰', br: '╯' },
    };

    const border = borders[borderStyle];
    const lines = text.split('\n');
    const maxLength = Math.max(...lines.map(line => line.length));
    const contentWidth = maxLength + padding * 2;
    const totalWidth = contentWidth + 2; // +2 for left and right borders

    const marginStr = ' '.repeat(margin);
    const result: string[] = [];

    // Add top margin
    for (let i = 0; i < margin; i++) {
      result.push('');
    }

    // Top border
    let topBorder = marginStr + border.tl + border.h.repeat(contentWidth);
    if (title) {
      const titleWithSpaces = ` ${title} `;
      const titleStart = Math.floor((contentWidth - titleWithSpaces.length) / 2);
      topBorder = marginStr + border.tl + 
        border.h.repeat(titleStart) + 
        titleWithSpaces + 
        border.h.repeat(contentWidth - titleStart - titleWithSpaces.length);
    }
    topBorder += border.tr;
    result.push(topBorder);

    // Top padding
    for (let i = 0; i < padding; i++) {
      result.push(marginStr + border.v + ' '.repeat(contentWidth) + border.v);
    }

    // Content
    for (const line of lines) {
      const paddedLine = ' '.repeat(padding) + 
        TextFormatter.pad(line, maxLength, 'left') + 
        ' '.repeat(padding);
      result.push(marginStr + border.v + paddedLine + border.v);
    }

    // Bottom padding
    for (let i = 0; i < padding; i++) {
      result.push(marginStr + border.v + ' '.repeat(contentWidth) + border.v);
    }

    // Bottom border
    result.push(marginStr + border.bl + border.h.repeat(contentWidth) + border.br);

    // Add bottom margin
    for (let i = 0; i < margin; i++) {
      result.push('');
    }

    return result.join('\n');
  }
}

/**
 * Progress indicators
 */
export class ProgressIndicators {
  /**
   * Create a simple progress bar
   */
  static progressBar(current: number, total: number, options: {
    width?: number;
    complete?: string;
    incomplete?: string;
    showPercentage?: boolean;
    showNumbers?: boolean;
  } = {}): string {
    const {
      width = 40,
      complete = '█',
      incomplete = '░',
      showPercentage = true,
      showNumbers = true,
    } = options;

    const percentage = Math.min(100, Math.max(0, (current / total) * 100));
    const filledWidth = Math.round((width * percentage) / 100);
    const emptyWidth = width - filledWidth;

    const bar = colorify.green(complete.repeat(filledWidth)) + 
                colorify.gray(incomplete.repeat(emptyWidth));

    let result = `[${bar}]`;

    if (showPercentage) {
      result += ` ${Math.round(percentage)}%`;
    }

    if (showNumbers) {
      result += ` (${current}/${total})`;
    }

    return result;
  }

  /**
   * Spinner frames
   */
  static readonly SPINNER_FRAMES = {
    dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    line: ['-', '\\', '|', '/'],
    arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
    bounce: ['⠁', '⠂', '⠄', '⠂'],
    clock: ['🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛'],
  };

  /**
   * Get spinner frame
   */
  static getSpinnerFrame(type: keyof typeof ProgressIndicators.SPINNER_FRAMES, index: number): string {
    const frames = ProgressIndicators.SPINNER_FRAMES[type];
    return frames[index % frames.length];
  }
}

/**
 * Table formatting utilities
 */
export class TableFormatter {
  /**
   * Create a formatted table
   */
  static table(data: Record<string, any>[], options: {
    headers?: string[];
    align?: ('left' | 'center' | 'right')[];
    padding?: number;
    border?: boolean;
    maxWidth?: number;
  } = {}): string {
    if (data.length === 0) {
      return '';
    }

    const {
      headers = Object.keys(data[0]),
      align = [],
      padding = 1,
      border = true,
      maxWidth,
    } = options;

    // Calculate column widths
    const columnWidths = headers.map((header, index) => {
      const headerWidth = header.length;
      const dataWidth = Math.max(
        ...data.map(row => String(row[header] || '').length)
      );
      let width = Math.max(headerWidth, dataWidth);
      
      if (maxWidth) {
        width = Math.min(width, Math.floor(maxWidth / headers.length) - padding * 2 - 1);
      }
      
      return width;
    });

    const totalWidth = columnWidths.reduce((sum, width) => sum + width + padding * 2, 0) + 
                      headers.length + 1;

    const result: string[] = [];

    // Top border
    if (border) {
      result.push('┌' + columnWidths.map(width => 
        '─'.repeat(width + padding * 2)
      ).join('┬') + '┐');
    }

    // Headers
    const headerRow = '│' + headers.map((header, index) => {
      const alignment = align[index] || 'left';
      const paddedHeader = TextFormatter.pad(header, columnWidths[index], alignment);
      return ' '.repeat(padding) + paddedHeader + ' '.repeat(padding);
    }).join('│') + '│';
    
    result.push(colorify.bold(headerRow));

    // Header separator
    if (border) {
      result.push('├' + columnWidths.map(width => 
        '─'.repeat(width + padding * 2)
      ).join('┼') + '┤');
    }

    // Data rows
    for (const row of data) {
      const dataRow = '│' + headers.map((header, index) => {
        const value = String(row[header] || '');
        const truncated = maxWidth ? 
          TextFormatter.truncate(value, columnWidths[index]) : 
          value;
        const alignment = align[index] || 'left';
        const paddedValue = TextFormatter.pad(truncated, columnWidths[index], alignment);
        return ' '.repeat(padding) + paddedValue + ' '.repeat(padding);
      }).join('│') + '│';
      
      result.push(dataRow);
    }

    // Bottom border
    if (border) {
      result.push('└' + columnWidths.map(width => 
        '─'.repeat(width + padding * 2)
      ).join('┴') + '┘');
    }

    return result.join('\n');
  }
}

/**
 * Input validation helpers
 */
export class InputValidation {
  /**
   * Validate input against multiple rules
   */
  static validate(input: string, rules: Array<(input: string) => boolean | string>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const rule of rules) {
      const result = rule(input);
      if (typeof result === 'string') {
        errors.push(result);
      } else if (!result) {
        errors.push('Invalid input');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Common validation rules
   */
  static rules = {
    required: (message = 'This field is required') => 
      (input: string) => input.trim().length > 0 || message,

    minLength: (min: number, message?: string) => 
      (input: string) => input.length >= min || 
        (message || `Must be at least ${min} characters`),

    maxLength: (max: number, message?: string) => 
      (input: string) => input.length <= max || 
        (message || `Must be no more than ${max} characters`),

    pattern: (regex: RegExp, message = 'Invalid format') => 
      (input: string) => regex.test(input) || message,

    email: (message = 'Invalid email address') => 
      (input: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || message,

    url: (message = 'Invalid URL') => 
      (input: string) => {
        try {
          new URL(input);
          return true;
        } catch {
          return message;
        }
      },

    number: (message = 'Must be a number') => 
      (input: string) => !isNaN(Number(input)) || message,

    integer: (message = 'Must be an integer') => 
      (input: string) => Number.isInteger(Number(input)) || message,

    positive: (message = 'Must be positive') => 
      (input: string) => Number(input) > 0 || message,

    range: (min: number, max: number, message?: string) => 
      (input: string) => {
        const num = Number(input);
        return (num >= min && num <= max) || 
          (message || `Must be between ${min} and ${max}`);
      },
  };
}