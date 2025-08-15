/**
 * Enhanced console coloring utility for the InterShell framework
 * Provides ANSI color codes, styles, and advanced color features
 */

import type { ColorFunction, ColorSystem } from './types.js';

// ANSI color codes
const colors = {
  // Basic colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  grey: '\x1b[90m',
  
  // Bright colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
  
  // Styles
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  strikethrough: '\x1b[9m',
  
  // Reset
  reset: '\x1b[0m',
} as const;

// Color support detection
let colorSupport = true;
let enabled = true;

function detectColorSupport(): boolean {
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
  const term = process.env.TERM?.toLowerCase() || '';
  const colorterm = process.env.COLORTERM?.toLowerCase() || '';
  
  if (colorterm === 'truecolor' || colorterm === '24bit') {
    return true;
  }
  
  if (term.includes('color') || term.includes('xterm') || term.includes('screen')) {
    return true;
  }
  
  return false;
}

// Initialize color support
colorSupport = detectColorSupport();

// Create color function factory
function createColorFunction(colorCode: string): ColorFunction {
  return (text: string): string => {
    if (!enabled || !colorSupport) {
      return text;
    }
    return `${colorCode}${text}${colors.reset}`;
  };
}

// Create RGB color function
function createRgbColorFunction(r: number, g: number, b: number): ColorFunction {
  const colorCode = `\x1b[38;2;${Math.round(r)};${Math.round(g)};${Math.round(b)}m`;
  return createColorFunction(colorCode);
}

// Create HSL color function
function createHslColorFunction(h: number, s: number, l: number): ColorFunction {
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
  
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  
  return createRgbColorFunction(r, g, b);
}

// Create hex color function
function createHexColorFunction(hex: string): ColorFunction {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  return createRgbColorFunction(r, g, b);
}

// Create gradient function
function createGradientFunction(colors: string[]): ColorFunction {
  return (text: string): string => {
    if (!enabled || !colorSupport || colors.length === 0) {
      return text;
    }
    
    if (colors.length === 1) {
      return createHexColorFunction(colors[0])(text);
    }
    
    const chars = text.split('');
    const step = (colors.length - 1) / Math.max(chars.length - 1, 1);
    
    return chars.map((char, i) => {
      const colorIndex = Math.min(Math.floor(i * step), colors.length - 1);
      const nextColorIndex = Math.min(colorIndex + 1, colors.length - 1);
      
      if (colorIndex === nextColorIndex) {
        return createHexColorFunction(colors[colorIndex])(char);
      }
      
      // Interpolate between colors
      const t = (i * step) - colorIndex;
      const color1 = colors[colorIndex].replace(/^#/, '');
      const color2 = colors[nextColorIndex].replace(/^#/, '');
      
      const r1 = parseInt(color1.slice(0, 2), 16);
      const g1 = parseInt(color1.slice(2, 4), 16);
      const b1 = parseInt(color1.slice(4, 6), 16);
      
      const r2 = parseInt(color2.slice(0, 2), 16);
      const g2 = parseInt(color2.slice(2, 4), 16);
      const b2 = parseInt(color2.slice(4, 6), 16);
      
      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);
      
      return createRgbColorFunction(r, g, b)(char);
    }).join('');
  };
}

// Create rainbow function
function createRainbowFunction(): ColorFunction {
  const rainbowColors = [
    '#ff0000', // Red
    '#ff8000', // Orange
    '#ffff00', // Yellow
    '#80ff00', // Lime
    '#00ff00', // Green
    '#00ff80', // Spring green
    '#00ffff', // Cyan
    '#0080ff', // Azure
    '#0000ff', // Blue
    '#8000ff', // Violet
    '#ff00ff', // Magenta
    '#ff0080', // Rose
  ];
  
  return createGradientFunction(rainbowColors);
}

// Strip ANSI codes function
function stripAnsiCodes(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

// Main colorify object
export const colorify: ColorSystem = {
  // Basic colors
  red: createColorFunction(colors.red),
  green: createColorFunction(colors.green),
  blue: createColorFunction(colors.blue),
  yellow: createColorFunction(colors.yellow),
  cyan: createColorFunction(colors.cyan),
  magenta: createColorFunction(colors.magenta),
  white: createColorFunction(colors.white),
  black: createColorFunction(colors.black),
  gray: createColorFunction(colors.gray),
  grey: createColorFunction(colors.grey),
  
  // Styles
  bold: createColorFunction(colors.bold),
  italic: createColorFunction(colors.italic),
  underline: createColorFunction(colors.underline),
  strikethrough: createColorFunction(colors.strikethrough),
  
  // Advanced colors
  rgb: createRgbColorFunction,
  hsl: createHslColorFunction,
  hex: createHexColorFunction,
  
  // Effects
  gradient: createGradientFunction,
  rainbow: createRainbowFunction(),
  
  // Utilities
  strip: stripAnsiCodes,
  supportsColor: () => colorSupport,
  enable: () => {
    enabled = true;
  },
  disable: () => {
    enabled = false;
  },
};

// Auto-disable if no color support
if (!colorSupport) {
  colorify.disable();
}

export default colorify;