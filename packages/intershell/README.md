# 🚀 InterShell - Next Generation CLI Framework

> **Interactive CLI applications made simple with page-based navigation and state management**

InterShell is a modern, type-safe CLI framework for building interactive command-line applications. It provides a clean separation between I/O handling and application logic through an event-driven architecture with page-based navigation.

## ✨ Features

- **🎮 Page-Based Navigation** - Structure your CLI as pages with clean transitions
- **📊 State Management** - Redux-like state management with reducers and actions
- **🎨 Enhanced Colors** - Rich color support with RGB, HSL, and gradient effects
- **🔧 Type Safety** - Full TypeScript support with strict type checking
- **⚡ Event-Driven** - Clean event system for better testability and extensibility
- **🎯 Zero Dependencies** - Built from the ground up for Bun with no external deps
- **🧪 Testable** - Clean architecture makes testing individual components easy

## 📦 Packages

InterShell is organized as a monorepo with multiple packages:

### `@intershell/core`
Foundation utilities and types for the InterShell framework:
- Enhanced colorify system with RGB, HSL, and gradient support
- WrapShell script creation framework with type-safe argument parsing
- CLI utility functions for common operations
- Comprehensive type definitions

### `@intershell/interactive`
Interactive CLI framework with page-based navigation:
- Main InterShell framework orchestrator
- Event-based InteractiveCLI implementation
- Page system with builders and common page types
- State management with reducers and actions

## 🚀 Quick Start

### Installation

```bash
# Install the packages you need
bun add @intershell/core @intershell/interactive

# Or with npm
npm install @intershell/core @intershell/interactive
```

### Basic Example

```typescript
import { InterShellFramework, PageBuilder } from '@intershell/interactive';
import { colorify } from '@intershell/core';

// Define your application state
interface AppState {
  name: string;
  confirmed: boolean;
}

// Create pages with the PageBuilder
const pages = [
  PageBuilder.create<AppState>('input', 'Enter Name')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(colorify.bold('👤 What is your name?'));
      
      const name = await cli.prompt('Name:', {
        clearScreen: false,
        allowEmpty: false,
      });
      
      // Update state directly (or use actions/reducers for complex apps)
      state.name = name;
    })
    .handleKey(() => null)
    .getNextAction((state) => ({ type: 'NEXT_PAGE' }))
    .build(),
    
  PageBuilder.create<AppState>('confirm', 'Confirm')
    .render(async (cli, state) => {
      cli.clearScreen();
      console.log(colorify.bold('✅ Confirmation'));
      
      const confirmed = await cli.confirm(`Hello ${state.name}, continue?`);
      state.confirmed = confirmed;
    })
    .handleKey(() => null)
    .getNextAction((state) => 
      state.confirmed ? { type: 'EXIT' } : { type: 'PREV_PAGE' }
    )
    .build(),
];

// Create and run the framework
const framework = new InterShellFramework(
  { name: '', confirmed: false }, // Initial state
  pages,
  {} // Reducers (empty for simple state updates)
);

const finalState = await framework.run();
console.log('Final state:', finalState);
```

## 🎯 Core Concepts

### Pages
Pages are the building blocks of your CLI application. Each page handles a specific part of your workflow:

```typescript
const page = PageBuilder.create<State>('page-id', 'Page Title')
  .description('What this page does')
  .render(async (cli, state) => {
    // Render the page content
    // Use cli.prompt(), cli.select(), cli.confirm() for user input
  })
  .handleKey((key, state) => {
    // Handle raw key presses (optional)
    return null; // or return an action
  })
  .getNextAction((state) => {
    // Determine what happens next
    return { type: 'NEXT_PAGE' }; // or other actions
  })
  .build();
```

### State Management
For complex applications, use actions and reducers:

```typescript
type Action = 
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_AGE'; payload: number };

const reducers = {
  SET_NAME: (state: State, action: Action): State => ({
    ...state,
    name: (action as any).payload,
  }),
  SET_AGE: (state: State, action: Action): State => ({
    ...state,
    age: (action as any).payload,
  }),
};

// In your page render function:
return { type: 'SET_NAME', payload: name };
```

### Navigation Actions
Control page flow with navigation actions:

- `{ type: 'NEXT_PAGE' }` - Go to the next page
- `{ type: 'PREV_PAGE' }` - Go to the previous page  
- `{ type: 'CHANGE_PAGE'; payload: 'page-id' }` - Go to a specific page
- `{ type: 'RE_RENDER' }` - Re-render the current page
- `{ type: 'EXIT' }` - Exit the application
- `{ type: 'CUSTOM'; payload: action }` - Dispatch a custom action

## 🎨 Enhanced Colors

InterShell includes a powerful color system:

```typescript
import { colorify } from '@intershell/core';

// Basic colors
console.log(colorify.red('Error message'));
console.log(colorify.green('Success message'));
console.log(colorify.blue('Info message'));

// Styles
console.log(colorify.bold('Bold text'));
console.log(colorify.italic('Italic text'));
console.log(colorify.underline('Underlined text'));

// Advanced colors
console.log(colorify.rgb(255, 128, 0)('Custom RGB color'));
console.log(colorify.hex('#ff8000')('Hex color'));
console.log(colorify.hsl(30, 1, 0.5)('HSL color'));

// Effects
console.log(colorify.gradient(['#ff0000', '#00ff00', '#0000ff'])('Gradient text'));
console.log(colorify.rainbow('Rainbow text'));
```

## 🔧 Script Creation

Create type-safe CLI scripts with WrapShell:

```typescript
import { WrapShell, validators } from '@intershell/core';

const script = WrapShell.createScript({
  name: 'My CLI Tool',
  description: 'A sample CLI application',
  usage: 'my-tool [options]',
  examples: ['my-tool --name John --age 25'],
  options: [
    {
      short: '-n',
      long: '--name',
      description: 'Your name',
      required: true,
      validator: validators.nonEmpty,
    },
    {
      short: '-a',
      long: '--age',
      description: 'Your age',
      required: false,
      defaultValue: '0',
      validator: validators.integer,
    }
  ]
}, async (args, console) => {
  console.log(`Hello, ${args.name}! You are ${args.age} years old.`);
});

await script.run();
```

## 🧪 Testing

InterShell's architecture makes testing easy:

```typescript
import { PageBuilder } from '@intershell/interactive';
import { describe, it, expect } from 'vitest';

describe('My Page', () => {
  it('should update state correctly', () => {
    const page = PageBuilder.create('test', 'Test Page')
      .render(async (cli, state) => {
        state.value = 'updated';
      })
      .handleKey(() => null)
      .getNextAction(() => ({ type: 'NEXT_PAGE' }))
      .build();
      
    const state = { value: 'initial' };
    const mockCli = createMockCLI();
    
    await page.render(mockCli, state);
    expect(state.value).toBe('updated');
  });
});
```

## 🚀 Examples

Check out the examples in the `examples/` directory:

- **Simple Demo** - Basic page navigation and state management
- **Complex Form** - Multi-step form with validation
- **File Manager** - Interactive file browser
- **Git Helper** - Interactive git workflow tool

## 🏗️ Architecture

InterShell follows a clean architecture with clear separation of concerns:

```
┌─────────────────────┐
│   CLI Application   │
├─────────────────────┤
│  InterShell Framework │
├─────────────────────┤
│    Page System     │
├─────────────────────┤
│  Interactive CLI    │
├─────────────────────┤
│   Core Utilities    │
└─────────────────────┘
```

### Key Principles

1. **Event-Driven** - Clean event system for extensibility
2. **Immutable State** - Predictable state management
3. **Composable Pages** - Mix and match pages for different workflows
4. **Type Safety** - Full TypeScript support throughout
5. **Testability** - Easy to test individual components

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

InterShell is inspired by modern web frameworks and CLI tools, bringing the best patterns to interactive command-line applications.

---

**Built with ❤️ by the Monobun team**