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

## 🚀 Quick Start

### Basic Template

```typescript
#!/usr/bin/env bun

import { validators } from "./utils/create-scripts";
import { createScript } from "./utils/create-scripts";

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
    xConsole.log("✅ Script completed successfully!");
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
import { validators } from "./utils/create-scripts";
import { createScript } from "./utils/create-scripts";

// 2. Configuration
const scriptConfig = {
  name: "Script Name",
  description: "What the script does",
  usage: "bun run script-name [options]",
  examples: ["bun run script-name --option value"],
  options: [
    // Define your options here
  ],
} as const;

// 3. Script Implementation
export const scriptName = createScript(
  scriptConfig,
  async function main(args, xConsole) {
    // Script logic here
  },
);

// 4. Entry point
if (import.meta.main) {
  scriptName();
}
```

### Configuration Options

```typescript
interface ScriptConfig {
  name: string;                    // Script name for help output
  description: string;             // What the script does
  usage: string;                  // Usage pattern
  examples: readonly string[];    // Example commands
  options: readonly ArgOption[];  // Command-line options
}

interface ArgOption {
  short: string;                  // Short flag (-f)
  long: string;                   // Long flag (--file)
  description: string;            // Help text
  required?: boolean;             // Is this option required?
  defaultValue?: string | boolean | number;  // Default value
  validator?: ValidatorFunction;  // Validation function
}
```

## 🛠️ Validators & Console

### Built-in Validators

```typescript
import { validators } from "./utils/create-scripts";

// File validation
validators.fileExists        // File must exist
validators.nonEmpty         // String must not be empty

// Type validation
validators.boolean()        // Boolean flag
validators.enum(["a", "b", "c"])  // Must be one of the values

// Custom validation
validators.custom((value) => {
  if (value.startsWith("http")) return true;
  return "Must be a valid URL";
})
```

### Console Output

Use `xConsole` for consistent output with automatic verbosity control:

```typescript
async function main(args, xConsole) {
  // ✅ Use xConsole for all output
  xConsole.log("📁 Processing file:", args.file);
  xConsole.log("✅ Script completed successfully!");
  
  // Verbose output (only shown when --verbose is true)
  xConsole.log("🔍 Debug information");
  
  // Quiet output (hidden when --quiet is true)
  xConsole.warn("⚠️ Warning message");
  
  // ❌ Avoid direct console.log usage
  // console.log("Processing file:", args.file);
}
```

### Command Execution

```typescript
import { $ } from "bun";

// Execute commands directly
const result = await $`git status`;
const dockerPs = await $`docker ps`;

// With error handling
try {
  await $`docker build -t myapp .`;
  xConsole.log("✅ Build completed!");
} catch (error) {
  xConsole.error("❌ Build failed:", error.message);
}
```

## 🎨 Best Practices

### 1. Script Organization

```typescript
// ✅ Good: Clear separation of concerns
async function processFiles(args, xConsole) {
  // 1. Validate inputs
  // 2. Find required commands
  // 3. Execute logic
  // 4. Handle results
}

// ✅ Good: Descriptive function names
async function processGitHubActions(args, xConsole)
async function setupLocalEnvironment(args, xConsole)

// ❌ Avoid: Generic names
async function main(args: any): Promise<void>
```

### 2. Error Handling

```typescript
// ✅ Good: Let createScript handle common errors
const script = createScript(config, myFunction);

// ✅ Good: Use try-catch for specific operations
try {
  await $`docker build -t myapp .`;
  xConsole.log("✅ Build successful");
} catch (error) {
  xConsole.error("❌ Build failed:", error.message);
  process.exit(1);
}
```

### 3. Type Safety

```typescript
// ✅ Good: Use inferred types
async function myScript(args: InferArgs<typeof config>, xConsole)

// ❌ Avoid: Any types
async function myScript(args: any): Promise<void>
```

### 4. Modular Design

```typescript
// ✅ Good: Export for modularity and testing
export const myScript = createScript(config, async function main(args, xConsole) {
  // Script logic
});

if (import.meta.main) {
  myScript();
}
```

## 📚 Examples

### Real-world Scripts

#### CI Check Script

```typescript
#!/usr/bin/env bun

import { validators } from "./utils/create-scripts";
import { createScript } from "./utils/create-scripts";
import { $ } from "bun";

const ciCheckConfig = {
  name: "CI Check",
  description: "Run CI checks locally",
  usage: "bun run ci-check [--workflow <workflow>]",
  examples: [
    "bun run ci-check",
    "bun run ci-check --workflow .github/workflows/test.yml",
  ],
  options: [
    {
      short: "-w",
      long: "--workflow",
      description: "Workflow file to test",
      required: false,
      defaultValue: ".github/workflows/ci.yml",
      validator: validators.fileExists,
    },
  ],
} as const;

export const ciCheck = createScript(
  ciCheckConfig,
  async function main(args, xConsole) {
    xConsole.log("🔍 Running CI checks...");
    
    // Check if act is available
    try {
      await $`which act`.quiet();
    } catch {
      xConsole.error("❌ 'act' not found. Install it to run GitHub Actions locally.");
      process.exit(1);
    }
    
    // Run the workflow
    await $`act --list`;
    xConsole.log("✅ CI checks completed!");
  },
);

if (import.meta.main) {
  ciCheck();
}
```

#### Local Setup Script

```typescript
#!/usr/bin/env bun

import { validators } from "./utils/create-scripts";
import { createScript } from "./utils/create-scripts";
import { $ } from "bun";

const localSetupConfig = {
  name: "Local Setup",
  description: "Setup local development environment",
  usage: "bun run local-setup [--clean]",
  examples: [
    "bun run local-setup",
    "bun run local-setup --clean",
  ],
  options: [
    {
      short: "-c",
      long: "--clean",
      description: "Clean existing setup",
      required: false,
      validator: validators.boolean,
    },
  ],
} as const;

export const localSetup = createScript(
  localSetupConfig,
  async function main(args, xConsole) {
    xConsole.log("🚀 Setting up local environment...");
    
    if (args.clean) {
      xConsole.log("🧹 Cleaning existing setup...");
      await $`rm -rf node_modules`;
      await $`rm -rf dist`;
    }
    
    // Install dependencies
    xConsole.log("📦 Installing dependencies...");
    await $`bun install`;
    
    // Setup git hooks
    xConsole.log("🔧 Setting up git hooks...");
    await $`bun run husky install`;
    
    xConsole.log("✅ Local setup completed!");
  },
);

if (import.meta.main) {
  localSetup();
}
```

### Common Patterns

#### File Processing

```typescript
async function processFile(args: { input: string; output: string }, xConsole) {
  xConsole.log(`📁 Processing: ${args.input}`);
  
  const file = Bun.file(args.input);
  const content = await file.text();
  
  // Process content
  const processed = content.toUpperCase();
  
  // Write output
  await Bun.write(args.output, processed);
  xConsole.log("✅ Processing completed!");
}
```

#### Build Script

```typescript
async function buildProject(args: { target: string; clean?: boolean }, xConsole) {
  xConsole.log(`🏗️ Building target: ${args.target}`);
  
  if (args.clean) {
    xConsole.log("🧹 Cleaning build artifacts...");
    await $`bun run clean`;
  }
  
  await $`bun run build`;
  xConsole.log("✅ Build completed!");
}
```

## 📖 API Reference

### createScript

```typescript
function createScript<T extends ScriptConfig>(
  config: T,
  scriptFunction: (args: InferArgs<T>, xConsole: typeof console) => Promise<void>,
  options?: {
    exitOnError?: boolean;
    showStack?: boolean;
  }
): (passedArgs?: InferArgs<T>) => Promise<void>
```

### validators

```typescript
const validators = {
  fileExists: (value: string) => boolean | string,
  nonEmpty: (value: string) => boolean | string,
  boolean: () => (value: string) => boolean | string,
  enum: (values: readonly string[]) => (value: string) => boolean | string,
  custom: (validator: (value: string) => boolean | string) => (value: string) => boolean | string,
}
```

### Types

```typescript
interface ScriptConfig {
  name: string;
  description: string;
  usage: string;
  examples: readonly string[];
  options: readonly ArgOption[];
}

interface ArgOption {
  short: string;
  long: string;
  description: string;
  required?: boolean;
  defaultValue?: string | boolean | number;
  validator?: (value: string) => boolean | string;
}

type InferArgs<T extends ScriptConfig> = // Inferred argument types
```

## 🎉 Conclusion

This modular script system provides consistency, type safety, and maintainability with minimal boilerplate. Start writing your scripts with confidence using this proven architecture! 🚀

### Next Steps

1. **Explore existing scripts** in the `scripts/` directory
2. **Use the example template** in `scripts/example-script.ts`
3. **Follow the patterns** established in `ci-*` and `local-*` scripts

For more information, see:
- [Development Flows](./3_DEV_FLOWS.md) - Development workflow
- [Quality Checklist](./0_QUALITY_CHECKLIST.md) - Code quality standards 