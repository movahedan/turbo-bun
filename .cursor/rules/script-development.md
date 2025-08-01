---
description: Follow modular script development patterns with type-safe utilities
globs: ["scripts/**/*.ts", "scripts/**/*.js", "**/*.script.ts", "**/*.script.js"]
alwaysApply: true
---

Use the modular script development system for command-line tools with automatic argument parsing, validation, error handling, and command finding.

## Script Structure

```ts
#!/usr/bin/env bun

import { createScript, validators } from "./utils/create-scripts";

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
  async (args): Promise<void> => {
    // Script logic here

    // Always use console.info during the script to give the user proper logging
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
async function myScript(args: InferArgs<typeof config>): Promise<void>
```

### ✅ Good: Descriptive function names
```ts
async function processGitHubActions(args: { event: string; workflow: string }): Promise<void>
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

## Available Validators

```ts
import { validators } from "./utils/create-scripts";

// File exists
validators.fileExists

// Non-empty string
validators.nonEmpty

// Boolean flag
validators.boolean()

// Enum values
validators.enum(["option1", "option2", "option3"])

// Custom validator
const customValidator = (value: string): boolean | string => {
  if (value.startsWith("http")) return true;
  return "Must be a valid URL";
};
```

## Command Finding

Use direct command execution using Bun's $ or Node.js exec:

```ts
// Predefined commands
const gitCmd = Bun.spawnSync(["git", "version"]);
const dockerCmd = Bun.spawnSync(["docker", "--version"]);
const actCmd = Bun.spawnSync(["act", "--version"]);

// Custom paths
const customCmd = Bun.spawnSync(["custom", "version"]);
```

## Script Configuration

```ts
{
  name: string;                    // Script name for help output
  description: string;             // What the script does
  usage: string;                  // Usage pattern
  examples: string[];             // Example commands
  options: ScriptOption[];        // Command-line options
}
```

## Option Configuration

```ts
{
  short: string;                  // Short flag (-f)
  long: string;                   // Long flag (--file)
  description: string;            // Help text
  required: boolean;              // Is this option required?
  validator: ValidatorFunction;   // Validation function
}
``` 