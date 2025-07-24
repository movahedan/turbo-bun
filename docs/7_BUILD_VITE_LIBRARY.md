# 🏗️ Build Vite Library Script

> Complete workflow for building TypeScript libraries with Vite: `tsc → generate entries → vite build → update package.json`

## 📋 Overview

The `build-vite-library.ts` script provides a complete build workflow for TypeScript libraries in the monorepo, with **Just-In-Time (JIT) package compilation** as its primary focus. It creates a **hybrid approach** that combines the benefits of both [Just-In-Time packages](https://turborepo.com/docs/core-concepts/internal-packages#just-in-time-packages) and [Compiled packages](https://turborepo.com/docs/core-concepts/internal-packages#compiled-packages). It's designed to handle complex build scenarios where you need to:

- Compile TypeScript with proper type definitions and source maps
- Generate Vite entries dynamically from compiled files
- Build optimized bundles with Vite while preserving JIT capabilities
- Update package.json exports automatically
- **Support Just-In-Time compilation with full source map and type preservation**

This script is particularly useful for packages that have:
- Complex TypeScript configurations
- Multiple entry points
- Dependencies on other workspace packages
- **Need for Just-In-Time compilation with source maps and types**
- Tree-shaking and optimization requirements
- **Requirement for Turborepo caching benefits while maintaining JIT flexibility**

## 🎯 Key Features

- **Hybrid JIT + Compiled Approach**: Combines benefits of [Just-In-Time packages](https://turborepo.com/docs/core-concepts/internal-packages#just-in-time-packages) and [Compiled packages](https://turborepo.com/docs/core-concepts/internal-packages#compiled-packages)
- **Just-In-Time Compilation**: Primary focus on JIT package compilation with full source map and type preservation
- **Complete Workflow**: Handles the entire build process from TypeScript compilation to final bundle
- **Dynamic Entry Generation**: Automatically generates Vite entries from compiled TypeScript files
- **Package.json Integration**: Updates exports automatically based on built files
- **Workspace Support**: Handles dependencies between workspace packages
- **TypeScript Source Maps**: Preserves source maps for debugging and JIT compilation
- **Type Definition Preservation**: Maintains `.d.ts` files for IDE support and JIT type checking
- **Turborepo Caching**: Benefits from compiled package caching while maintaining JIT flexibility
- **Dry Run Mode**: Preview changes without making them
- **Error Handling**: Comprehensive error reporting and cleanup

## 🔧 How It Works

### 1. TypeScript Compilation
```bash
tsc --project tsconfig.build.json
```
- Compiles TypeScript files according to the build configuration
- Generates `.d.ts` files for type definitions and JIT type checking
- Creates source maps for debugging and JIT compilation
- Preserves original source structure for JIT package loading

> **💡 Configuration Flexibility**: The script dynamically adapts to your TypeScript configuration. When you modify `rootDir`, `include`, or `exclude` in `tsconfig.build.json`, the script will automatically:
> - Generate Vite entries based on the compiled files from your specified `include` patterns
> - Respect your `exclude` patterns when scanning for files
> - Use your `rootDir` setting to map source files correctly
> - Create package.json exports that match your compilation structure

### 2. Entry Generation
The script analyzes the compiled JavaScript files and:
- Maps them back to their TypeScript source files
- Generates Vite entries for each compiled file
- Creates package.json exports for public API

### 3. Vite Build
```bash
vite build --emptyOutDir=false
```
- Uses the generated entries to build optimized bundles
- Supports multiple output formats (ESM, CommonJS)
- Preserves tree-shaking and dead code elimination
- **Maintains JIT compilation capabilities with source maps and types**

### 4. Package.json Updates
- Updates the `exports` field based on built files
- Ensures proper module resolution for consumers
- Maintains type definitions and source maps for JIT compilation
- Preserves source map references for debugging and JIT package loading

## 📦 Usage

### Basic Usage
```bash
# Build the UI package
bun run build-vite-library --package ui

# Build with custom tsconfig
bun run build-vite-library --package ui --config ./custom-tsconfig.json

# Preview changes without making them
bun run build-vite-library --package ui --dry-run
```

### Package Scripts
Packages can integrate this script into their build process:

```json
{
  "scripts": {
    "build": "bun run ../../scripts/build-vite-library.ts -p ui",
    "build:vite": "vite build"
  }
}
```

## 🏗️ Configuration

### Required Files

#### Configuration Flexibility
The script reads your TypeScript configuration and adapts accordingly:

- **`rootDir`**: Determines how source files are mapped back to their original locations
- **`include`**: Controls which files are compiled and included in the build
- **`exclude`**: Filters out files that shouldn't be part of the build
- **`outDir`**: Specifies where compiled files are placed

The script automatically:
- Scans the `outDir` for compiled JavaScript files
- Maps them back to TypeScript source files using your `rootDir` setting
- Generates Vite entries only for files that match your `include`/`exclude` patterns
- Creates package.json exports that reflect your compilation structure

#### `tsconfig.build.json`
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "noEmit": false,
    "sourceMap": true,
    "rootDir": "..",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "../utils/src/**/*"],
  "exclude": [
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "../utils/src/**/*.test.ts",
    "../utils/src/**/*.test.tsx"
  ]
}
```

#### `vite.config.ts`
```typescript
import { defineConfig } from "vite";
import viteEntries from "./vite-entries.generated.json";

export default defineConfig({
  build: {
    lib: {
      entry: viteEntries,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    sourcemap: true, // Essential for JIT compilation and debugging
  },
});
```

### Generated Files

#### `vite-entries.generated.json`
```json
{
  "ui/src/index": "/workspace/packages/ui/src/index.ts",
  "ui/src/button/button": "/workspace/packages/ui/src/button/button.tsx",
  "ui/src/link/link": "/workspace/packages/ui/src/link/link.tsx"
}
```

#### Updated `package.json` exports
```json
{
  "exports": {
    ".": {
      "types": "./dist/ui/src/index.d.ts",
      "import": "./dist/ui/src/index.js",
      "require": "./dist/ui/src/index.cjs"
    },
    "./button/button": {
      "types": "./dist/ui/src/button/button.d.ts",
      "import": "./dist/ui/src/button/button.js",
      "require": "./dist/ui/src/button/button.cjs"
    }
  }
}
```

## 🔄 Workflow Steps

### Step 0: Cleanup
- Removes previous build artifacts
- Cleans TypeScript build info files

### Step 1: TypeScript Build
- Compiles TypeScript files using `tsconfig.build.json`
- Generates `.d.ts` files and source maps for JIT compilation
- Preserves original source structure for JIT package loading

### Step 2: Entry Generation
- Scans compiled JavaScript files in `dist/`
- Maps them back to TypeScript source files
- Generates Vite entries and package.json exports

### Step 3: Save Vite Entries
- Writes `vite-entries.generated.json`
- Formats with Biome for consistency

### Step 4: Vite Build
- Removes old JavaScript files from dist
- Runs Vite build with generated entries
- Creates optimized bundles with JIT compilation support
- Preserves source maps and type definitions for JIT loading

### Step 5: Update Package.json
- Updates the `exports` field with JIT-compatible paths
- Formats with Biome for consistency
- Ensures source map and type definition references are preserved

## 🎯 Use Cases

### UI Component Libraries
Perfect for React component libraries that need:
- Multiple entry points for individual components
- TypeScript definitions for IDE support and JIT type checking
- Tree-shaking for optimal bundle sizes
- **JIT compilation with source maps for development and debugging**
- **Turborepo caching benefits** while maintaining [Just-In-Time package](https://turborepo.com/docs/core-concepts/internal-packages#just-in-time-packages) flexibility

### Utility Libraries
Ideal for utility packages that:
- Export multiple functions
- Need proper TypeScript support and JIT type checking
- Require workspace dependencies
- **Benefit from JIT compilation for faster development cycles**

### Monorepo Packages
Excellent for packages that:
- Depend on other workspace packages
- Need complex build configurations
- Require both ESM and CommonJS outputs
- **Require JIT compilation with full source map and type preservation**
- **Need [Compiled package](https://turborepo.com/docs/core-concepts/internal-packages#compiled-packages) benefits** while maintaining [Just-In-Time](https://turborepo.com/docs/core-concepts/internal-packages#just-in-time-packages) flexibility

## ⚡ Just-In-Time (JIT) Compilation

### What is JIT Compilation?
Just-In-Time compilation allows packages to be compiled on-demand during development and runtime, providing:

- **Faster Development Cycles**: No need to pre-compile everything
- **Better Debugging**: Source maps point to original TypeScript files
- **Type Safety**: Full TypeScript type checking during development
- **Hot Reload Support**: Changes reflect immediately without full rebuilds

### Hybrid Approach: JIT within Compiled Packages
Our build script creates a **hybrid approach** that combines the benefits of both [Just-In-Time packages](https://turborepo.com/docs/core-concepts/internal-packages#just-in-time-packages) and [Compiled packages](https://turborepo.com/docs/core-concepts/internal-packages#compiled-packages):

- **Compiled Package Structure**: Uses TypeScript compilation for type definitions and source maps
- **JIT Capabilities**: Preserves original source structure for on-demand compilation by consumer applications
- **Best of Both Worlds**: Gets Turborepo caching benefits while maintaining JIT compilation flexibility

### How the Script Supports JIT
The build script is specifically designed to support JIT compilation by:

1. **Preserving Source Structure**: Maintains original file paths and structure
2. **Generating Source Maps**: Creates accurate source maps for debugging
3. **Type Definition Preservation**: Keeps `.d.ts` files for IDE support
4. **Dynamic Entry Generation**: Allows Vite to compile files on-demand
5. **Package.json Integration**: Ensures proper module resolution for JIT loading

### JIT Benefits in the Monorepo
- **Workspace Dependencies**: Packages can be compiled JIT when imported
- **Development Speed**: Faster iteration cycles with hot reload
- **Debugging**: Source maps point to original TypeScript files
- **Type Safety**: Full TypeScript support during development and runtime
- **Turborepo Caching**: Benefits from compiled package caching while maintaining JIT flexibility

## 🚀 Examples

### UI Package Example
The `@repo/ui` package demonstrates a complete setup:

```typescript
// packages/ui/src/index.ts
export { Button } from "./button/button";
export { Link } from "./link/link";
export { CounterButton } from "./counter-button/counter-button";
```

```typescript
// packages/ui/src/button/button.tsx
import React from "react";
import { cn } from "@repo/utils";

export interface ButtonProps {
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, className }) => {
  return (
    <button className={cn("button", className)}>
      {children}
    </button>
  );
};
```

### Build Output
After running the build script:

```bash
# Generated vite-entries.generated.json
{
  "ui/src/index": "/workspace/packages/ui/src/index.ts",
  "ui/src/button/button": "/workspace/packages/ui/src/button/button.tsx",
  "ui/src/link/link": "/workspace/packages/ui/src/link/link.tsx",
  "ui/src/counter-button/counter-button": "/workspace/packages/ui/src/counter-button/counter-button.tsx",
  "utils/src/cn": "/workspace/packages/utils/src/cn.ts"
}

# Updated package.json exports
{
  "exports": {
    ".": {
      "types": "./dist/ui/src/index.d.ts",
      "import": "./dist/ui/src/index.js",
      "require": "./dist/ui/src/index.cjs"
    },
    "./button/button": {
      "types": "./dist/ui/src/button/button.d.ts",
      "import": "./dist/ui/src/button/button.js",
      "require": "./dist/ui/src/button/button.cjs"
    }
  }
}
```

This hybrid approach provides:
- **Compiled package benefits**: Type definitions, source maps, and Turborepo caching
- **JIT package benefits**: Original source structure preserved for on-demand compilation
- **Best of both worlds**: Fast builds with full development flexibility

### Configuration Examples

#### Example 1: Single Package
```json
{
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx"]
}
```
**Result**: Script generates entries for `src/` files only.

#### Example 2: Workspace Dependencies (Current UI Package)
```json
{
  "compilerOptions": {
    "rootDir": "..",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "../utils/src/**/*"],
  "exclude": ["src/**/*.test.ts", "../utils/src/**/*.test.ts"]
}
```
**Result**: Script generates entries for both UI and utils files, respecting the workspace structure.

#### Example 3: Custom Structure
```json
{
  "compilerOptions": {
    "rootDir": "../..",
    "outDir": "./dist"
  },
  "include": ["packages/ui/src/**/*", "packages/utils/src/**/*"],
  "exclude": ["**/*.test.ts", "**/*.test.tsx"]
}
```
**Result**: Script adapts to your custom monorepo structure and generates appropriate entries.

## 🔧 Troubleshooting

### Common Issues

#### TypeScript Build Fails
- Check `tsconfig.build.json` configuration
- Ensure all dependencies are properly installed
- Verify file paths in `include` and `exclude` arrays

#### Vite Build Errors
- Check `vite.config.ts` configuration
- Verify external dependencies are properly declared
- Ensure generated entries file exists and is valid

#### Package.json Export Issues
- Check that built files exist in the expected locations
- Verify the script has write permissions to package.json
- Ensure Biome is properly configured for formatting

### Debug Mode
Use the `--dry-run` flag to preview changes:
```bash
bun run build-vite-library --package ui --dry-run
```

This will show what would be generated without making actual changes.

## 📚 Related Documentation

- **[Development Workflow](./3_DEVFLOW.md)** - Daily development practices
- **[Script Development Guide](./5_SCRIPT_DEVELOPMENT_GUIDE.md)** - Creating custom scripts
- **[Development Conventions](./4_DEVCONVENTIONS.md)** - Coding standards
- **[Quality Checklist](./0_QUALITY_CHECKLIST.md)** - Testing before deployment

---

**Built with ❤️ for modern TypeScript library development.** 