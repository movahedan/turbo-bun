---
description: Follow modular script development patterns with type-safe utilities
globs: ["scripts/**/*.ts", "scripts/**/*.js", "**/*.script.ts", "**/*.script.js"]
alwaysApply: true
---

Use the modular script development system for command-line tools with automatic argument parsing, validation, error handling, and command finding.

## Script Structure

```ts
#!/usr/bin/env bun

import { createScript, validators } from "./scripting-utils/create-scripts";
import { colorify } from "./scripting-utils/colorify";

export const descriptiveNameForScript = createScript(
  // keep the config inline, it's better
  {
    name: "Script Name",
    description: "What this script does",
    usage: "bun run script-name [options]",
    examples: ["bun run script-name --option value"],
    options: [
      {
        short: "-i",
        long: "--input",
        description: "Input file",
        required: true,
        validator: validators.fileExists,
      },
    ],
  } as const,
  // You don't need to add any type, they are automatically assigned
  async (args, xConsole): Promise<void> => {
    // Script logic here
    xConsole.info("🚀 Starting script...");
    
    // Use colorify for colored output
    xConsole.log(colorify.green("✅ Success!"));
    xConsole.log(colorify.red("❌ Error!"));
    xConsole.log(colorify.yellow("⚠️ Warning!"));
  },
);

if(import.meta.main) {
  descriptiveNameForScript();
}
```

## Best Practices

### ✅ Good: Let createScript handle errors
```ts
const script = createScript(config, myFunction);
// No manual try-catch needed
```

### ✅ Good: Use inferred types
```ts
async function myScript(args: InferArgs<typeof config>, xConsole: XConsole): Promise<void>
```

### ✅ Good: Descriptive function names
```ts
async function processGitHubActions(args: { event: string; workflow: string }): Promise<void>
```

### ✅ Good: Use colorify for output styling
```ts
import { colorify } from "./scripting-utils/colorify";

xConsole.log(colorify.green("✅ Success message"));
xConsole.log(colorify.red("❌ Error message"));
xConsole.log(colorify.yellow("⚠️ Warning message"));
xConsole.log(colorify.blue("ℹ️ Info message"));
```

### ❌ Avoid: Manual argument parsing
```ts
// Don't do this
const args = process.argv.slice(2);
const input = args.find(arg => arg.startsWith("-i"))?.split("=")[1];
```

### ❌ Avoid: Hardcoded command paths
```ts
// Don't do this
const cmd = "./bin/act"; // This might not exist
```

### ❌ Avoid: Generic function names
```ts
// Don't do this
async function main(args: any): Promise<void>
```

### ❌ Avoid: Direct console usage
```ts
// Don't do this
console.log("Processing...");
console.error("Error occurred");

// Do this instead
xConsole.log("Processing...");
xConsole.error("Error occurred");
```

## Available Validators

```ts
import { validators } from "./scripting-utils/create-scripts";

// String validation
validators.string("input")           // Validates string input
validators.boolean("true")           // Validates boolean input
validators.number("123")             // Validates number input
validators.fileExists("./file.txt")  // Validates file exists
validators.directoryExists("./dir")  // Validates directory exists
```

## Available Utilities

### Colorify Utility
```ts
import { colorify } from "./scripting-utils/colorify";

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

### Directory Utilities
```ts
import { getAllDirectories, getAllDirectoryNames } from "./scripting-utils/get-all-directories";

// Get all package directories
const directories = await getAllDirectories();

// Get directory names for commitlint scopes
const scopes = await getAllDirectoryNames();
```

### Docker Compose Parser
```ts
import { parseDockerCompose } from "./scripting-utils/docker-compose-parser";

// Parse docker-compose.yml
const services = await parseDockerCompose("docker-compose.yml");
```

### Changeset Parser
```ts
import { parseChangesets } from "./scripting-utils/changeset-parser";

// Parse changeset files
const changesets = await parseChangesets();
```

## Console Output

```ts
// Console methods available in main function
xConsole.log("Info message");
xConsole.info("Info message");
xConsole.warn("Warning message");
xConsole.error("Error message");
xConsole.debug("Debug message"); // Only shown with --verbose
```

## Error Handling

```ts
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

## Progress Reporting

```ts
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

## Verbose Output

```ts
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