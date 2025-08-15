# 🚀 InterShell: Next Generation CLI Framework

> **A comprehensive, type-safe, and extensible framework for building interactive command-line applications**

InterShell provides a modern, event-driven foundation for creating sophisticated CLI applications with page-based navigation, state management, and beautiful terminal output.

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Packages](#-packages)
- [Quick Start](#-quick-start)
- [Example](#-example)
- [Documentation](#-documentation)
- [Development Status](#-development-status)

## 🎯 Overview

InterShell represents the next evolution of CLI framework systems, designed to replace complex Promise-based interactive CLI implementations with a clean, event-driven architecture that separates concerns and improves maintainability.

### **Key Objectives**

1. **🎮 Generic Interactive Framework**: Reusable framework for any CLI application
2. **🔧 Enhanced Script Development**: Improved script creation and management
3. **🏗️ Modular Architecture**: Clean separation of concerns and better reusability
4. **📊 Advanced State Management**: Predictable state transitions and data flow
5. **🚀 Performance Optimization**: Bun-optimized with no external dependencies
6. **🧪 Comprehensive Testing**: Full test coverage with mocking support

## ✨ Features

### **Core Features**
- ✅ **Enhanced Color System** - Advanced terminal colors with RGB, HSL, gradients, and effects
- ✅ **Improved Script Framework** - Type-safe script creation with enhanced validation
- ✅ **Advanced CLI Tools** - Terminal control, key parsing, text formatting, and progress indicators
- ✅ **Event-Driven Architecture** - Clean separation between I/O handling and application logic
- ✅ **Page-Based Navigation** - Intuitive page system for complex workflows
- ✅ **State Management** - Predictable state updates with reducer pattern
- ✅ **Plugin System** - Extensible architecture for adding functionality

### **Developer Experience**
- ✅ **100% TypeScript** - Full type safety and excellent IDE support
- ✅ **Zero Dependencies** - No external dependencies, optimized for Bun
- ✅ **Fluent API** - Intuitive builder pattern for framework configuration
- ✅ **Comprehensive Examples** - Working examples and documentation
- ✅ **Hot Reloading** - Fast development with instant feedback

## 🏗️ Architecture

InterShell follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLI Applications                          │
├─────────────────────────────────────────────────────────────┤
│                @intershell/interactive                      │
│            (Framework, Pages, Navigation)                   │
├─────────────────────────────────────────────────────────────┤
│                   @intershell/core                          │
│         (Colorify, WrapShell, CLI Tools, Types)            │
└─────────────────────────────────────────────────────────────┘
```

### **Design Principles**

1. **🎯 Separation of Concerns** - Clear boundaries between I/O, logic, and presentation
2. **🔄 Event-Driven** - Clean event system for better testability and extensibility
3. **🧩 Composable** - Components can be mixed and matched for different use cases
4. **📱 Framework Agnostic** - Can be used for any CLI application or framework
5. **⚡ Performance First** - Optimized for Bun with minimal overhead
6. **🔒 Type Safe** - Full TypeScript support with strict type checking

## 📦 Packages

### **@intershell/core**
Foundation utilities for building CLI applications:

- **Enhanced Colorify** - Advanced terminal colors with RGB, HSL, gradients
- **WrapShell** - Improved script creation with better type inference
- **CLI Tools** - Terminal control, key parsing, text formatting
- **Types** - Comprehensive type definitions

### **@intershell/interactive** 
Interactive CLI framework with page-based navigation:

- **Framework** - Core interactive CLI framework
- **Pages** - Page-based navigation system  
- **Events** - Event system and middleware
- **Builder** - Fluent API for framework configuration

### **Coming Soon**
- **@intershell/command** - Advanced command parsing and routing
- **@intershell/plugin** - Plugin system for extensibility

## 🚀 Quick Start

### Installation

```bash
# Add to your project
bun add @intershell/core @intershell/interactive

# Or with npm
npm install @intershell/core @intershell/interactive
```

### Basic Usage

```typescript
import { colorify } from '@intershell/core';
import { createFramework, type Page, type InteractiveCLI } from '@intershell/interactive';

// Define your application state
interface AppState {
  step: number;
  name: string;
}

// Create a page
const welcomePage: Page<AppState> = {
  id: 'welcome',
  title: 'Welcome',
  
  async render(cli: InteractiveCLI, state: AppState) {
    cli.writeLine(colorify.bold('Welcome to your CLI app!'));
    cli.writeLine('Press Enter to continue...');
  },
  
  handleKey(key, state) {
    if (key.name === 'return') {
      return { type: 'NEXT_STEP' };
    }
    return null;
  },
  
  getNextAction(state) {
    return state.step > 0 
      ? { type: 'CHANGE_PAGE', payload: 'next-page' }
      : { type: 'RE_RENDER' };
  }
};

// Create and run your application
const app = createFramework()
  .withInitialState({ step: 0, name: '' })
  .withPage(welcomePage)
  .withReducer('main', (state, action) => {
    switch (action.type) {
      case 'NEXT_STEP':
        return { ...state, step: state.step + 1 };
      default:
        return state;
    }
  })
  .build();

await app.run();
```

## 📖 Example

See the complete working example in [`packages/intershell/interactive/example.ts`](./interactive/example.ts) which demonstrates:

- Page-based navigation
- State management with reducers
- Interactive key handling
- Beautiful terminal output
- Event system usage

To run the example:

```bash
cd packages/intershell/interactive
bun run example.ts
```

## 📚 Documentation

### **Core Concepts**

#### **Pages**
Pages represent different screens or steps in your CLI application:

```typescript
const myPage: Page<AppState, AppAction> = {
  id: 'unique-id',
  title: 'Page Title',
  description: 'Optional description',
  
  async render(cli, state) {
    // Render the page content
  },
  
  handleKey(key, state) {
    // Handle key presses and return actions
    return null;
  },
  
  getNextAction(state) {
    // Determine navigation based on state
    return { type: 'RE_RENDER' };
  }
};
```

#### **State Management**
Use reducers to manage application state:

```typescript
const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'UPDATE_NAME':
      return { ...state, name: action.payload };
    default:
      return state;
  }
};
```

#### **Framework Configuration**
Use the fluent builder API:

```typescript
const framework = createFramework<AppState, AppAction>()
  .withInitialState(initialState)
  .withPages([page1, page2, page3])
  .withReducers({ main: reducer })
  .withDebug(true)
  .withHotkeys(true)
  .build();
```

## 🚧 Development Status

### **✅ Completed (Phase 1)**

- ✅ **@intershell/core** - Foundation utilities with enhanced colorify, wrapshell, and CLI tools
- ✅ **@intershell/interactive** - Complete interactive framework with page-based navigation
- ✅ **Event-Driven Architecture** - Clean separation of I/O and application logic
- ✅ **State Management** - Reducer pattern with middleware support
- ✅ **Plugin System** - Extensible architecture for adding functionality
- ✅ **Working Example** - Complete demonstration application

### **🔄 In Progress (Phase 2)**

- 🔄 **@intershell/command** - Advanced command parsing and routing system
- 🔄 **@intershell/plugin** - Plugin manager with loader and registry
- 🔄 **Migration Tools** - Migrate existing commit workflow to new framework

### **📋 Planned (Phase 3+)**

- 📋 **Framework Integrations** - React, Vue, Svelte integrations
- 📋 **Advanced Renderers** - HTML, JSON, and other output formats
- 📋 **Performance Monitoring** - Built-in performance tracking
- 📋 **Documentation Site** - Comprehensive documentation website

## 🤝 Contributing

InterShell is part of the Monobun monorepo development workflow. See the main project documentation for contribution guidelines.

## 📄 License

This project is licensed under the same terms as the parent Monobun project.

---

**InterShell Framework**: Building the future of interactive CLI applications with modern architecture, type safety, and developer experience.