/**
 * Enhanced terminal color utility for InterShell
 * Provides ANSI color codes with advanced features like RGB, HSL, gradients
 */

import type { ColorFunction, ColorSystem } from './types.js';

// Basic ANSI color codes
const colors = {
  // Standard colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  
  // Bright colors
  brightBlack: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  
  // Text formatting
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  strikethrough: '\x1b[9m',
  
  // Reset
  reset: '\x1b[0m',
} as const;

// Background colors
const backgrounds = {
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
  bgGray: '\x1b[100m',
} as const;

/**
 * Create a color function that wraps text with ANSI codes
 */
const createColorFunction = (colorCode: string): ColorFunction => {
  return (text: string): string => {
    if (!colorSupported) return text;
    return `${colorCode}${text}${colors.reset}`;
  };
};

/**
 * Create an RGB color function
 */
const createRgbFunction = (r: number, g: number, b: number): ColorFunction => {
  const colorCode = `\x1b[38;2;${Math.round(r)};${Math.round(g)};${Math.round(b)}m`;
  return createColorFunction(colorCode);
};

/**
 * Create an HSL color function
 */
const createHslFunction = (h: number, s: number, l: number): ColorFunction => {
  // Convert HSL to RGB
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  
  return createRgbFunction(
    (r + m) * 255,
    (g + m) * 255,
    (b + m) * 255
  );
};

/**
 * Check if color is supported in the current environment
 */
let colorSupported = (() => {
  // Check environment variables
  if (process.env.NO_COLOR === '1' || process.env.NO_COLOR === 'true') {
    return false;
  }
  
  if (process.env.FORCE_COLOR === '1' || process.env.FORCE_COLOR === 'true') {
    return true;
  }
  
  // Check if we're in a TTY
  if (!process.stdout.isTTY) {
    return false;
  }
  
  // Check terminal capabilities
  const term = process.env.TERM || '';
  if (term === 'dumb') {
    return false;
  }
  
  // Check for common color-supporting terminals
  const colorTerms = [
    'color', '256', 'truecolor', 'xterm', 'screen', 'tmux'
  ];
  
  return colorTerms.some(colorTerm => term.includes(colorTerm));
})();

/**
 * Enhanced colorify system with advanced features
 */
export const colorify: ColorSystem = {
  // Basic colors
  red: createColorFunction(colors.red),
  green: createColorFunction(colors.green),
  yellow: createColorFunction(colors.yellow),
  blue: createColorFunction(colors.blue),
  cyan: createColorFunction(colors.cyan),
  magenta: createColorFunction(colors.magenta),
  white: createColorFunction(colors.white),
  gray: createColorFunction(colors.gray),
  black: createColorFunction(colors.black),
  
  // Text formatting
  bold: createColorFunction(colors.bold),
  italic: createColorFunction(colors.italic),
  underline: createColorFunction(colors.underline),
  strikethrough: createColorFunction(colors.strikethrough),
  dim: createColorFunction(colors.dim),
  
  // Reset
  reset: colors.reset,
  
  // Utility methods
  supportsColor(): boolean {
    return colorSupported;
  },
  
  enable(): void {
    colorSupported = true;
  },
  
  disable(): void {
    colorSupported = false;
  },
};

/**
 * Extended colorify with advanced features
 */
export class EnhancedColorify {
  /**
   * Check if colors are supported
   */
  static supportsColor(): boolean {
    return colorSupported;
  }
  
  /**
   * Enable color output
   */
  static enable(): void {
    colorSupported = true;
  }
  
  /**
   * Disable color output
   */
  static disable(): void {
    colorSupported = false;
  }
  
  /**
   * Create RGB color function
   */
  static rgb(r: number, g: number, b: number): ColorFunction {
    return createRgbFunction(r, g, b);
  }
  
  /**
   * Create HSL color function
   */
  static hsl(h: number, s: number, l: number): ColorFunction {
    return createHslFunction(h, s, l);
  }
  
  /**
   * Create a gradient effect
   */
  static gradient(text: string, colors: string[]): string {
    if (!colorSupported || colors.length === 0) return text;
    
    const chars = text.split('');
    const colorFunctions = colors.map(color => {
      // Simple hex to RGB conversion for basic gradients
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return createRgbFunction(r, g, b);
      }
      // Fallback to basic colors
      return (colorify as any)[color] || colorify.white;
    });
    
    if (chars.length === 0 || colorFunctions.length === 0) return text;
    
    const step = Math.max(1, Math.floor(chars.length / colorFunctions.length));
    let result = '';
    
    for (let i = 0; i < chars.length; i++) {
      const colorIndex = Math.min(
        colorFunctions.length - 1,
        Math.floor(i / step)
      );
      result += colorFunctions[colorIndex](chars[i]);
    }
    
    return result;
  }
  
  /**
   * Create a rainbow effect
   */
  static rainbow(text: string): string {
    if (!colorSupported) return text;
    
    const rainbowColors = [
      '#ff0000', // red
      '#ff8000', // orange
      '#ffff00', // yellow
      '#80ff00', // lime
      '#00ff00', // green
      '#00ff80', // spring green
      '#00ffff', // cyan
      '#0080ff', // sky blue
      '#0000ff', // blue
      '#8000ff', // violet
      '#ff00ff', // magenta
      '#ff0080', // rose
    ];
    
    return EnhancedColorify.gradient(text, rainbowColors);
  }
  
  /**
   * Create a shimmer effect (basic implementation)
   */
  static shimmer(text: string): string {
    if (!colorSupported) return text;
    
    // Simple shimmer using alternating bright and dim
    const chars = text.split('');
    let result = '';
    
    for (let i = 0; i < chars.length; i++) {
      if (i % 2 === 0) {
        result += colorify.bold(colorify.white(chars[i]));
      } else {
        result += colorify.dim(colorify.gray(chars[i]));
      }
    }
    
    return result;
  }
  
  /**
   * Create hex color function
   */
  static hex(hexColor: string): ColorFunction {
    if (!hexColor.startsWith('#') || hexColor.length !== 7) {
      throw new Error('Invalid hex color format. Expected #RRGGBB');
    }
    
    const hex = hexColor.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    return createRgbFunction(r, g, b);
  }
  
  /**
   * Background color functions
   */
  static bg = {
    black: createColorFunction(backgrounds.bgBlack),
    red: createColorFunction(backgrounds.bgRed),
    green: createColorFunction(backgrounds.bgGreen),
    yellow: createColorFunction(backgrounds.bgYellow),
    blue: createColorFunction(backgrounds.bgBlue),
    magenta: createColorFunction(backgrounds.bgMagenta),
    cyan: createColorFunction(backgrounds.bgCyan),
    white: createColorFunction(backgrounds.bgWhite),
    gray: createColorFunction(backgrounds.bgGray),
  };
  
  /**
   * Bright color variants
   */
  static bright = {
    black: createColorFunction(colors.brightBlack),
    red: createColorFunction(colors.brightRed),
    green: createColorFunction(colors.brightGreen),
    yellow: createColorFunction(colors.brightYellow),
    blue: createColorFunction(colors.brightBlue),
    magenta: createColorFunction(colors.brightMagenta),
    cyan: createColorFunction(colors.brightCyan),
    white: createColorFunction(colors.brightWhite),
  };
}