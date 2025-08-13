# 🛠️ Scripting Guide

> Quick guide to writing modular, type-safe scripts using our utility system

## 📋 Table of Contents

- [Overview](#-overview)
- [Quick Start](#-quick-start)
- [Script Development](#-script-development)
- [Validators & Console](#-validators--console)
- [Best Practices](#-best-practices)
- [Examples](#-examples)
- [API Reference](#-api-reference)

## 🎯 Overview

Our script system provides type-safe command-line tools with automatic argument parsing, validation, and error handling. Built on Bun's performance and TypeScript's type safety.

### Key Features

- ✅ **Type-safe argument parsing** with automatic validation
- ✅ **Automatic error handling** with consistent messaging
- ✅ **Built-in help system** with usage examples
- ✅ **Console output management** with verbosity controls
- ✅ **Custom colorify utility** for terminal output styling

## 🚀 Quick Start

### Basic Template

```typescript
#!/usr/bin/env bun

import { validators } from "./shell/create-scripts";
import { createScript } from "./shell/create-scripts";
import { colorify } from "./shell/colorify";

const scriptConfig = {
  name: "My Script",
  description: "What this script does",
  usage: "bun run my-script [options]",
  examples: [
    "bun run my-script --input file.txt",
    "bun run my-script --input data.json --verbose",
  ],
  options: [
    {
      short: "-i",
      long: "--input",
      description: "Input file to process",
      required: true,
      validator: validators.fileExists,
    },
  ],
} as const;

export const myScript = createScript(
  scriptConfig,
  async function main(args, xConsole) {
    xConsole.log("📁 Processing:", args.input);
    
    // Your script logic here
    xConsole.log(colorify.green("✅ Script completed successfully!"));
  },
);

if (import.meta.main) {
  myScript();
}
```

### Running Scripts

```bash
# Run with help
bun run my-script --help

# Run with arguments
bun run my-script --input data.txt --verbose

# Run with short flags
bun run my-script -i data.txt -v
```

## 📝 Script Development

### Script Structure

Every script follows this pattern:

```typescript
#!/usr/bin/env bun

// 1. Imports
import { validators } from "./shell/create-scripts";
import { createScript } from "./shell/create-scripts";
import { colorify } from "./shell/colorify";

// 2. Configuration
const scriptConfig = {
  name: "Script Name",
  description: "What the script does",
  usage: "bun run script-name [options]",
  examples: [
    "bun run script-name --option value",
  ],
  options: [
    {
      short: "-o",
      long: "--option",
      description: "Option description",
      required: false,
      defaultValue: "default",
      validator: validators.string,
    },
  ],
} as const;

// 3. Main function
export const myScript = createScript(
  scriptConfig,
  async function main(args, xConsole) {
    // Script logic here
    xConsole.log(colorify.blue("Processing..."));
    
    // Use colorify for colored output
    xConsole.log(colorify.green("Success!"));
    xConsole.log(colorify.red("Error!"));
    xConsole.log(colorify.yellow("Warning!"));
  },
);

// 4. Main execution
if (import.meta.main) {
  myScript();
}
```

### Available Utilities

#### **Colorify Utility**
```typescript
import { colorify } from "./shell/colorify";

// Available colors
colorify.red("Error message");
colorify.green("Success message");
colorify.yellow("Warning message");
colorify.blue("Info message");
colorify.cyan("Debug message");
colorify.gray("Muted message");

// Color support detection
if (colorify.supportsColor()) {
  // Terminal supports colors
}

// Disable colors
colorify.disable();

// Re-enable colors
colorify.enable();
```

#### **Directory Utilities**
```typescript
import { getAllDirectories, getAllDirectoryNames } from "./shell/get-all-directories";

// Get all package directories
const directories = await getAllDirectories();

// Get directory names for commitlint scopes
const scopes = await getAllDirectoryNames();
```

#### **Docker Compose Parser**
```typescript
import { parseDockerCompose } from "./shell/docker-compose-parser";

// Parse docker-compose.yml
const services = await parseDockerCompose("docker-compose.yml");
```

#### **Changeset Parser**
```typescript
import { parseChangesets } from "./shell/changeset-parser";

// Parse changeset files
const changesets = await parseChangesets();
```

## 🔧 Validators & Console

### Built-in Validators

```typescript
import { validators } from "./shell/create-scripts";

// String validation
validators.string("input")           // Validates string input
validators.boolean("true")           // Validates boolean input
validators.number("123")             // Validates number input
validators.fileExists("./file.txt")  // Validates file exists
validators.directoryExists("./dir")  // Validates directory exists
```

### Console Output

```typescript
// Console methods available in main function
xConsole.log("Info message");
xConsole.info("Info message");
xConsole.warn("Warning message");
xConsole.error("Error message");
xConsole.debug("Debug message"); // Only shown with --verbose
```

## 📋 Best Practices

### 1. **Error Handling**
```typescript
export const myScript = createScript(
  scriptConfig,
  async function main(args, xConsole) {
    try {
      // Your logic here
      xConsole.log(colorify.green("✅ Success!"));
    } catch (error) {
      xConsole.error(colorify.red(`❌ Error: ${error.message}`));
      process.exit(1);
    }
  },
);
```

### 2. **Progress Reporting**
```typescript
export const myScript = createScript(
  scriptConfig,
  async function main(args, xConsole) {
    xConsole.info("🚀 Starting process...");
    
    // Process items
    for (const item of items) {
      xConsole.log(`Processing: ${item}`);
      // ... processing logic
    }
    
    xConsole.log(colorify.green("✅ All items processed!"));
  },
);
```

### 3. **Verbose Output**
```typescript
export const myScript = createScript(
  scriptConfig,
  async function main(args, xConsole) {
    xConsole.log("Basic output");
    
    if (args.verbose) {
      xConsole.debug("Detailed debug information");
      xConsole.log("Additional verbose output");
    }
  },
);
```

## 📚 Examples

### **File Processing Script**
```typescript
#!/usr/bin/env bun

import { validators } from "./shell/create-scripts";
import { createScript } from "./shell/create-scripts";
import { colorify } from "./shell/colorify";
import { readFileSync, writeFileSync } from "node:fs";

const scriptConfig = {
  name: "File Processor",
  description: "Process files with custom logic",
  usage: "bun run process-files --input file.txt --output result.txt",
  examples: [
    "bun run process-files --input data.txt --output processed.txt",
    "bun run process-files --input data.txt --output processed.txt --verbose",
  ],
  options: [
    {
      short: "-i",
      long: "--input",
      description: "Input file path",
      required: true,
      validator: validators.fileExists,
    },
    {
      short: "-o",
      long: "--output",
      description: "Output file path",
      required: true,
    },
    {
      short: "-v",
      long: "--verbose",
      description: "Enable verbose output",
      required: false,
      defaultValue: false,
      validator: validators.boolean,
    },
  ],
} as const;

export const processFiles = createScript(
  scriptConfig,
  async function main(args, xConsole) {
    xConsole.info("📁 Processing file...");
    
    try {
      const content = readFileSync(args.input, "utf-8");
      xConsole.log(`Read ${content.length} characters`);
      
      // Process content
      const processed = content.toUpperCase();
      
      writeFileSync(args.output, processed);
      xConsole.log(colorify.green(`✅ File processed and saved to ${args.output}`));
      
      if (args.verbose) {
        xConsole.debug(`Input: ${args.input}`);
        xConsole.debug(`Output: ${args.output}`);
        xConsole.debug(`Processed content length: ${processed.length}`);
      }
    } catch (error) {
      xConsole.error(colorify.red(`❌ Error processing file: ${error.message}`));
      process.exit(1);
    }
  },
);

if (import.meta.main) {
  processFiles();
}
```

### **Directory Analysis Script**
```typescript
#!/usr/bin/env bun

import { validators } from "./shell/create-scripts";
import { createScript } from "./shell/create-scripts";
import { colorify } from "./shell/colorify";
import { getAllDirectories } from "./shell/get-all-directories";

const scriptConfig = {
  name: "Directory Analyzer",
  description: "Analyze project directory structure",
  usage: "bun run analyze-dirs [options]",
  examples: [
    "bun run analyze-dirs",
    "bun run analyze-dirs --verbose",
  ],
  options: [
    {
      short: "-v",
      long: "--verbose",
      description: "Enable verbose output",
      required: false,
      defaultValue: false,
      validator: validators.boolean,
    },
  ],
} as const;

export const analyzeDirs = createScript(
  scriptConfig,
  async function main(args, xConsole) {
    xConsole.info("🔍 Analyzing project directories...");
    
    try {
      const directories = await getAllDirectories();
      
      xConsole.log(colorify.blue(`Found ${directories.length} directories:`));
      
      for (const dir of directories) {
        xConsole.log(`  📁 ${dir}`);
        
        if (args.verbose) {
          // Additional analysis for verbose mode
          xConsole.debug(`    Path: ${dir}`);
        }
      }
      
      xConsole.log(colorify.green("✅ Directory analysis complete!"));
    } catch (error) {
      xConsole.error(colorify.red(`❌ Error analyzing directories: ${error.message}`));
      process.exit(1);
    }
  },
);

if (import.meta.main) {
  analyzeDirs();
}
```

## 📖 API Reference

### **createScript Function**
```typescript
function createScript<T extends ScriptConfig>(
  config: T,
  mainFunction: (args: InferArgs<T>, console: XConsole) => Promise<void>
): () => Promise<void>
```

### **ScriptConfig Interface**
```typescript
interface ScriptConfig {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  options: Option[];
}
```

### **Option Interface**
```typescript
interface Option {
  short: string;
  long: string;
  description: string;
  required: boolean;
  defaultValue?: any;
  validator?: (value: any) => boolean | string;
}
```

### **XConsole Interface**
```typescript
interface XConsole {
  log(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
}
```

### **Colorify Interface**
```typescript
interface Colorify {
  red(text: string): string;
  green(text: string): string;
  yellow(text: string): string;
  blue(text: string): string;
  cyan(text: string): string;
  gray(text: string): string;
  reset: string;
  supportsColor(): boolean;
  disable(): void;
  enable(): void;
}
```

---

**Ready to build powerful, type-safe scripts?** Start with the examples above and explore the utility functions in `scripts/shell/` for more advanced features! 