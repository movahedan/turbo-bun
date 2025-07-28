# Script Development Guide

A comprehensive guide to writing modular, type-safe scripts using our utility system.

## 🎯 Overview

Our script system provides a consistent, type-safe way to create command-line tools with automatic argument parsing, validation, error handling, and command finding.

## 🏗️ Architecture

### Core Components

```
scripts/utils/
├── arg-parser.ts      # Argument parsing and validation
├── command-finder.ts  # Command finding logic  
├── commands.ts        # Centralized command configurations
└── create-scripts.ts  # Script creation utilities
```

### Key Features

- ✅ **Type-safe argument parsing** with automatic validation
- ✅ **Centralized command management** for external tools
- ✅ **Automatic error handling** with consistent messaging
- ✅ **Modular utilities** for reuse across scripts
- ✅ **Intuitive API** with minimal boilerplate

## 📝 Writing a New Script

### 1. Basic Structure

```typescript
#!/usr/bin/env bun

import { validators } from "./utils/arg-parser";
import { findCommand } from "./utils/command-finder";
import { createScript } from "./utils/create-scripts";

// Create script with automatic error handling and type safety
const script = createScript(
  {
    name: "My Script",
    description: "What this script does",
    usage: "bun run my-script [options]",
    examples: [
      "bun run my-script --option value",
    ],
    options: [
      // Your options here
    ],
  } as const,
  // Type-safe function with inferred argument types and console wrapper
  async function main(args, xConsole) {
    // Your script logic here
    // Use xConsole.log() instead of console.log() for consistent output
  },
);

script();
```

### 2. Complete Example

```typescript
#!/usr/bin/env bun

import { validators } from "./utils/arg-parser";
import { findCommand } from "./utils/command-finder";
import { createScript } from "./utils/create-scripts";

const exampleScriptConfig = {
  name: "Example Script",
  description: "A simple example script demonstrating modular argument parsing",
  usage: "bun run example-script -f <file> -o <output> [--verbose]",
  examples: [
    "bun run example-script -f input.txt -o output.txt",
    "bun run example-script --file data.json --output result.json --verbose",
  ],
  options: [
    {
      short: "-f",
      long: "--file",
      description: "Input file to process",
      required: true,
      validator: validators.fileExists,
    },
    {
      short: "-o",
      long: "--output",
      description: "Output file path",
      required: true,
      validator: validators.nonEmpty,
    },
  ],
} as const;

export const exampleScript = createScript(
  exampleScriptConfig,
  async function main(args, xConsole) {
    xConsole.log("📁 Processing file:", args.file);
    xConsole.log("💾 Output will be saved to:", args.output);

    if (args.verbose) {
      xConsole.log("🔍 Verbose mode enabled");
    }

    // Example of using the centralized command system
    const gitCmd = await findCommand("git");
    xConsole.log(`✅ Found git at: ${gitCmd}`);

    // Your script logic here...
    xConsole.log("✅ Example script completed successfully!");
  },
);

if (import.meta.main) {
  exampleScript();
}
```

**Note:** The example script uses the export pattern for better modularity and testing capabilities.

## 🔧 Configuration Options

### Script Configuration

```typescript
{
  name: string;                    // Script name for help output
  description: string;             // What the script does
  usage: string;                  // Usage pattern
  examples: string[];             // Example commands
  options: ScriptOption[];        // Command-line options
}
```

### Option Configuration

```typescript
{
  short: string;                  // Short flag (-f)
  long: string;                   // Long flag (--file)
  description: string;            // Help text
  required: boolean;              // Is this option required?
  validator: ValidatorFunction;   // Validation function
}
```

## 🛠️ Available Validators

### Built-in Validators

```typescript
import { validators } from "./utils/arg-parser";

// File exists
validators.fileExists

// Non-empty string
validators.nonEmpty

// Boolean flag
validators.boolean()

// Enum values
validators.enum(["option1", "option2", "option3"])
```

### Custom Validators

```typescript
// Create a custom validator function
const customValidator = (value: string): boolean | string => {
  if (value.startsWith("http")) {
    return true;
  }
  return "Must be a valid URL";
};

// Use in option
{
  short: "-u",
  long: "--url",
  description: "URL to process",
  required: true,
  validator: customValidator,
}
```

## 🔍 Command Finding

### Using Centralized Commands

```typescript
// Find a predefined command
const gitCmd = await findCommand("git");
const dockerCmd = await findCommand("docker");
const actCmd = await findCommand("act");

// Available commands in scripts/utils/commands.ts:
// - act, docker, git, bun
```

## 📝 Console Output

### Using xConsole

The script function receives an `xConsole` parameter that provides consistent output formatting and error handling:

```typescript
async function main(args, xConsole) {
  // ✅ Use xConsole for all output
  xConsole.log("📁 Processing file:", args.file);
  xConsole.log("✅ Script completed successfully!");
  
  // ❌ Avoid direct console.log usage
  // console.log("Processing file:", args.file);
}
```

**Benefits of xConsole:**
- Consistent formatting across all scripts
- Automatic error handling and reporting
- Integration with the script system's logging
- Better debugging and monitoring capabilities

### Custom Command Paths

```typescript
// Override paths for specific use case
const customCmd = await findCommand("custom", ["/custom/path"], "Install instructions");
```

### Adding New Commands

To add a new command, edit `scripts/utils/commands.ts`:

```typescript
export const COMMANDS = {
  // ... existing commands
  myTool: {
    name: "myTool",
    paths: ["myTool", "./bin/myTool"],
    installInstructions: "Please install myTool: https://example.com",
  },
} as const;
```

## 🎨 Best Practices

### 1. Script Structure

```typescript
// ✅ Good: Clear separation of concerns
async function myScript(args, xConsole) {
  // 1. Validate inputs
  // 2. Find required commands
  // 3. Execute logic
  // 4. Handle results
}

// ✅ Good: Descriptive function names
async function processGitHubActions(args, xConsole)

// ❌ Avoid: Generic names
async function main(args: any): Promise<void>
```

### 2. Console Output

```typescript
// ✅ Good: Use xConsole for consistent output
async function myScript(args, xConsole) {
  xConsole.log("📁 Processing file:", args.file);
  xConsole.log("✅ Script completed successfully!");
}

// ❌ Avoid: Direct console.log usage
async function myScript(args) {
  console.log("Processing file:", args.file); // Inconsistent with script system
}
```

### 3. Export Pattern

```typescript
// ✅ Good: Export the script for modularity
export const myScript = createScript(config, async function main(args, xConsole) {
  // Script logic
});

if (import.meta.main) {
  myScript();
}

// ✅ Good: Import and use in other scripts
import { myScript } from "./my-script";
```

### 4. Error Handling

```typescript
// ✅ Good: Let createScript handle errors
const script = createScript(config, myFunction);

// ✅ Good: Use centralized command finding
const cmd = await findCommand("docker");

// ❌ Avoid: Manual try-catch for common patterns
try {
  // ... common patterns
} catch (error) {
  // ... error handling
}
```

### 5. Type Safety

```typescript
// ✅ Good: Use inferred types
async function myScript(args: InferArgs<typeof config>, xConsole)

// ❌ Avoid: Any types
async function myScript(args: any): Promise<void>
```

### 6. Command Finding

```typescript
// ✅ Good: Use centralized commands
const gitCmd = await findCommand("git");

// ✅ Good: Override when needed
const customCmd = await findCommand("custom", ["/path"], "Instructions");

// ❌ Avoid: Hardcoded paths
const cmd = "./bin/act"; // This might not exist
```

## 📚 Examples

### Real-world Examples

See these files for complete examples:

- `scripts/check-pipelines.ts` - GitHub Actions testing
- `scripts/example-script.ts` - Basic template

### Common Patterns

#### File Processing Script

```typescript
async function main(args: { input: string; output: string }, xConsole) {
  xConsole.log(`📁 Processing: ${args.input}`);
  
  const gitCmd = await findCommand("git");
  
  // Process files...
  xConsole.log("✅ Processing completed!");
}
```

#### Build Script

```typescript
async function main(args: { target: string; clean?: boolean }, xConsole) {
  xConsole.log(`🏗️ Building target: ${args.target}`);
  
  const bunCmd = await findCommand("bun");
  
  if (args.clean) {
    await $`${bunCmd} run clean`;
  }
  
  await $`${bunCmd} run build`;
  xConsole.log("✅ Build completed!");
}
```

#### Deployment Script

```typescript
async function main(args: { environment: string; dryRun?: boolean }, xConsole) {
  xConsole.log(`🚀 Deploying to: ${args.environment}`);
  
  const dockerCmd = await findCommand("docker");
  
  if (args.dryRun) {
    xConsole.log("🔍 Dry run mode - no actual deployment");
    return;
  }
  
  await $`${dockerCmd} build -t myapp .`;
  xConsole.log("✅ Deployment completed!");
}
```

## 🚀 Migration Guide

### From Old Style to New Style

#### Before (Old Style)

```typescript
#!/usr/bin/env bun

import { $ } from "bun";

// Manual argument parsing
const args = process.argv.slice(2);
const event = args.find(arg => arg.startsWith("-e"))?.split("=")[1];
const workflow = args.find(arg => arg.startsWith("-w"))?.split("=")[1];

if (!event || !workflow) {
  console.error("Missing required arguments");
  process.exit(1);
}

// Manual command finding
let actCmd = "act";
try {
  await $`which act`.quiet();
} catch {
  try {
    await $`test -f ./bin/act`.quiet();
    actCmd = "./bin/act";
  } catch {
    console.error("act not found");
    process.exit(1);
  }
}

// Manual error handling
try {
  await $`${actCmd} ${event} -W ${workflow}`;
} catch (error) {
  console.error("Script failed:", error);
  process.exit(1);
}
```

#### After (New Style)

```typescript
#!/usr/bin/env bun

import { validators } from "./utils/arg-parser";
import { findCommand } from "./utils/command-finder";
import { createScript } from "./utils/create-scripts";

const githubActionTest = createScript(
  {
    name: "GitHub Actions Test",
    options: [
      {
        short: "-e",
        long: "--event",
        required: true,
        validator: validators.enum(["pull_request", "push"]),
      },
      {
        short: "-w", 
        long: "--workflow",
        required: true,
        validator: validators.fileExists,
      },
    ],
  } as const,
  async function main(args: { event: string; workflow: string }, xConsole) {
    const actCmd = await findCommand("act");
    await $`${actCmd} ${args.event} -W ${args.workflow}`;
    xConsole.log("✅ GitHub Actions test completed!");
  },
);

githubActionTest();
```

## 🔧 Troubleshooting

### Common Issues

#### TypeScript Errors

```typescript
// ❌ Error: Type 'readonly string[]' is not assignable to 'string[]'
// Fix: Update CommandConfig interface to support readonly arrays
export interface CommandConfig {
  paths: readonly string[] | string[];
}
```

#### Command Not Found

```typescript
// ❌ Error: Command not found
// Fix: Add command to scripts/utils/commands.ts
export const COMMANDS = {
  myCommand: {
    name: "myCommand",
    paths: ["myCommand", "./bin/myCommand"],
    installInstructions: "Install myCommand: ...",
  },
}
```

#### Validation Errors

```typescript
// ❌ Error: Invalid argument
// Fix: Check validator and provide correct input
bun run my-script --input non-existent-file.txt
// Should use: bun run my-script --input existing-file.txt
```

## 📖 API Reference

### createScript

```typescript
function createScript<T extends ScriptConfig>(
  config: T,
  scriptFunction: (args: InferArgs<T>, xConsole: typeof console) => Promise<void>
): () => void
```

### findCommand

```typescript
function findCommand(
  commandName: CommandName | CommandConfig,
  paths?: string[],
  installInstructions?: string
): Promise<string>
```

### validators

```typescript
const validators = {
  fileExists: ValidatorFunction,
  nonEmpty: ValidatorFunction,
  boolean(): ValidatorFunction,
  enum(values: readonly string[]): ValidatorFunction,
  custom(validator: (value: string) => ValidationResult): ValidatorFunction,
}
```

## 🎉 Conclusion

This modular script system provides:

- **Consistency**: All scripts follow the same patterns
- **Type Safety**: Automatic type inference and validation
- **Maintainability**: Centralized configuration and utilities
- **Developer Experience**: Minimal boilerplate, maximum functionality

Start writing your scripts with confidence using this proven architecture! 🚀 