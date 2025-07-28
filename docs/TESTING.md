# Testing with Bun

This repository uses Bun for testing with a comprehensive setup that includes watch mode, coverage reporting, and seamless integration with Turbo.

## 🚀 Quick Start

### Run all tests
```bash
bun run test
```

### Run tests in watch mode
```bash
bun run test:watch
```

### Run tests with coverage
```bash
bun run test:coverage
```

## 📋 Available Test Commands

### Root Level Commands
- `bun run test` - Run all tests across all packages
- `bun run test:watch` - Run all tests in watch mode
- `bun run test:coverage` - Run all tests with coverage reporting
- `bun run test:affected` - Run tests only for affected packages
- `bun run test:affected:watch` - Run affected tests in watch mode
- `bun run test:force` - Force run all tests (bypass cache)
- `bun run test:parallel` - Run tests in parallel mode

### Package-Specific Commands
- `turbo run test --filter=@repo/ui` - Run tests for UI package only
- `turbo run test --filter=@repo/utils` - Run tests for Utils package only
- `turbo run test --filter=@repo/logger` - Run tests for Logger package only
- `turbo run test --filter=@repo/api` - Run tests for API app only
- `turbo run test --filter=@repo/blog` - Run tests for Blog app only
- `turbo run test --filter=@repo/storefront` - Run tests for Storefront app only
- `turbo run test --filter=@repo/admin` - Run tests for Admin app only

## 🎯 Individual Package Testing

Each package has its own test scripts:

### Apps (React-based)
```bash
# Blog app
cd apps/blog
bun run test          # Run tests
bun run test:watch    # Run tests in watch mode
bun run test:coverage # Run tests with coverage
```

### Packages
```bash
# UI package (React components)
cd packages/ui
bun run test          # Run tests with DOM environment
bun run test:watch    # Run tests in watch mode
bun run test:coverage # Run tests with coverage

# Utils package
cd packages/utils
bun run test          # Run tests
bun run test:watch    # Run tests in watch mode
bun run test:coverage # Run tests with coverage

# Logger package
cd packages/logger
bun run test          # Run tests
bun run test:watch    # Run tests in watch mode
bun run test:coverage # Run tests with coverage
```

## 🔧 Advanced Testing

### Using the Test Configuration Script
We provide a flexible test configuration script for advanced scenarios:

```bash
# Run tests with custom configuration
bun run packages/test-preset/test-config.ts --watch --coverage --affected

# Available options
bun run packages/test-preset/test-config.ts --help
```

### Watch Mode Features
- **Automatic re-runs**: Tests automatically re-run when files change
- **Debounced execution**: Changes are debounced to prevent excessive re-runs
- **Clear console**: Console is cleared before each test run
- **Parallel execution**: Tests run in parallel for faster execution
- **File filtering**: Only watches test files and ignores build artifacts

### Coverage Reporting
- **HTML reports**: Coverage reports are generated in HTML format
- **Console output**: Coverage summary is displayed in console
- **Thresholds**: Configure coverage thresholds in `bunfig.toml`

## 🏗️ Test Configuration

### Centralized Setup
All tests use a centralized setup file: `packages/test-preset/test-setup.ts`

This file provides:
- DOM environment setup for React tests
- Testing Library configuration
- Global test utilities
- Environment variable configuration

### Bun Configuration
The `bunfig.toml` file contains:
- Test preload configuration
- Environment variables
- Timeout settings
- Coverage settings
- Watch mode configuration

### Turbo Configuration
The `turbo.json` file defines:
- Test task dependencies
- Input/output file patterns
- Caching strategies
- Parallel execution settings

## 📝 Writing Tests

### Basic Test Structure
```typescript
import { describe, expect, it } from "bun:test";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
```

### Using Test Utilities
```typescript
import { utils } from "../../packages/test-preset/test-setup";

describe("MyComponent", () => {
  it("waits for async operations", async () => {
    await utils.wait(100); // Wait for 100ms
    // ... test logic
  });
});
```

### React Component Testing
```typescript
import { describe, expect, it } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("handles click events", () => {
    const handleClick = mock();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🎨 Test Patterns

### Component Testing
- Use `@testing-library/react` for React component tests
- Test user interactions, not implementation details
- Use semantic queries (getByRole, getByLabelText, etc.)

### Utility Testing
- Test pure functions with simple assertions
- Mock external dependencies
- Test edge cases and error conditions

### Integration Testing
- Test component interactions
- Test API integrations
- Test user workflows

## 🔍 Debugging Tests

### Watch Mode Debugging
- Tests automatically re-run on file changes
- Console output shows test results in real-time
- Failed tests are highlighted

### Coverage Analysis
```bash
# Generate coverage report
bun run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Test Isolation
- Each test runs in isolation
- Global state is reset between tests
- DOM is cleaned up automatically

## 🚨 Troubleshooting

### Common Issues

1. **Tests not running in watch mode**
   - Ensure you're using `bun run test:watch`
   - Check that files are being watched (no .gitignore issues)

2. **DOM environment not available**
   - Ensure `--dom` flag is used for React component tests
   - Check that `@happy-dom/global-registrator` is installed

3. **Coverage not generating**
   - Ensure `--coverage` flag is used
   - Check that coverage directory is writable

4. **Tests running slowly**
   - Use `--parallel` flag for parallel execution
   - Consider using `--affected` to only run changed tests

### Performance Tips
- Use `bun run test:affected` for faster feedback during development
- Use `bun run test:parallel` for faster execution
- Use watch mode for continuous feedback
- Configure appropriate timeouts in `bunfig.toml`

## 📚 Additional Resources

- [Bun Test Documentation](https://bun.sh/docs/cli/test)
- [Testing Library Documentation](https://testing-library.com/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Turbo Test Configuration](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks#test)

## 🤝 Contributing

When adding new tests:
1. Follow the existing test patterns
2. Use the centralized test setup
3. Add appropriate test scripts to package.json
4. Update this documentation if needed
5. Ensure tests pass in both normal and watch modes 