# Testing with Bun

This repository uses Bun for testing with a comprehensive setup that includes watch mode, coverage reporting, and seamless integration with Turbo.

## 🚀 Quick Start

### Run all tests
```bash
bun run test
```

### Run tests for affected packages
```bash
bun run test --affected
```

### Run tests with coverage
```bash
bun run test:coverage
```

## 📋 Available Test Commands

### Root Level Commands
- `bun run test` - Run all tests across all packages
- `bun run test --affected` - Run tests only for affected packages
- `bun run test:coverage` - Run all tests with coverage reporting
- `bun run test --clearCache` - Clear test cache and run tests
- `turbo run test --parallel` - Run tests in parallel mode

### Package-Specific Commands
- `turbo run test --filter=@repo/ui` - Run tests for UI package only
- `turbo run test --filter=@repo/utils` - Run tests for Utils package only
- `turbo run test --filter=admin` - Run tests for Admin app only
- `turbo run test --filter=storefront` - Run tests for Storefront app only
- `turbo run test --filter=api` - Run tests for API app only

## 🎯 Individual Package Testing

Each package has its own test scripts:

### Apps (React-based)
```bash
# Admin app
cd apps/admin
bun run test          # Run tests
bun run test:coverage # Run tests with coverage

# Storefront app
cd apps/storefront
bun run test          # Run tests
bun run test:coverage # Run tests with coverage

# API app
cd apps/api
bun run test          # Run tests
bun run test:coverage # Run tests with coverage
```

### Packages
```bash
# UI package (React components)
cd packages/ui
bun run test          # Run tests with DOM environment
bun run test:coverage # Run tests with coverage

# Utils package
cd packages/utils
bun run test          # Run tests
bun run test:coverage # Run tests with coverage

# Test preset package
cd packages/test-preset
bun run test          # Run tests
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
The project uses a centralized test configuration through the `@repo/test-preset` package:

```json
// packages/test-preset/package.json
{
  "name": "@repo/test-preset",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./jest.config.js",
    "./setup": "./setup.ts"
  },
  "devDependencies": {
    "@types/jest": "29.5.12",
    "jest": "29.7.0",
    "jest-environment-jsdom": "29.7.0"
  }
}
```

### Test Preset Configuration
```javascript
// packages/test-preset/jest.config.js
export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/setup.ts"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Package-Level Configuration
Each package extends the test preset:

```json
// packages/ui/package.json
{
  "devDependencies": {
    "@repo/test-preset": "workspace:*"
  },
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage"
  }
}
```

## 🧪 Test Types and Patterns

### Unit Tests
```typescript
// Example unit test
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Integration Tests
```typescript
// Example integration test
import { render, screen, waitFor } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile Integration', () => {
  it('loads and displays user data', async () => {
    render(<UserProfile userId="123" />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

### API Tests
```typescript
// Example API test
import request from 'supertest';
import { app } from '../src/app';

describe('API Endpoints', () => {
  it('GET /api/users returns user list', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });
});
```

## 📊 Coverage and Reporting

### Coverage Configuration
```toml
# bunfig.toml
[test]
coverage = true
coverage-reporter = ["text", "html", "lcov"]
coverage-directory = "coverage"
```

### Coverage Thresholds
```javascript
// jest.config.js
export default {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
```

### Coverage Reports
```bash
# Generate coverage reports
bun run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html

# Generate coverage for specific package
cd packages/ui && bun run test:coverage
```

## 🔄 Test Workflow

### Development Workflow
```bash
# 1. Make changes to code
# 2. Run tests for affected packages
bun run test --affected

# 3. Run full test suite before commit
bun run test

# 4. Check coverage
bun run test:coverage
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: bun run test

- name: Run Tests with Coverage
  run: bun run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

## 🚨 Troubleshooting

### Common Issues

#### **Test Cache Issues**
```bash
# Clear test cache
bun run test --clearCache
turbo run test --clearCache

# Force run tests
bun run test --force
```

#### **Coverage Issues**
```bash
# Regenerate coverage
rm -rf coverage/
bun run test:coverage

# Check coverage configuration
cat bunfig.toml | grep coverage
```

#### **Environment Issues**
```bash
# Check test environment
bun run test --verbose

# Debug test setup
NODE_ENV=test bun run test --debug
```

### Performance Optimization

#### **Parallel Testing**
```bash
# Run tests in parallel
turbo run test --parallel

# Parallel with specific packages
turbo run test --filter=@repo/ui --parallel
```

#### **Affected Testing**
```bash
# Test only changed packages
bun run test --affected

# Test specific affected packages
turbo run test --filter=@repo/ui --affected
```

## 📚 Best Practices

### **Test Organization**
- **Unit tests**: Test individual functions and components
- **Integration tests**: Test component interactions
- **E2E tests**: Test complete user workflows
- **API tests**: Test backend endpoints

### **Test Naming**
```typescript
// Good test names
describe('UserService', () => {
  it('should create a new user when valid data is provided', () => {});
  it('should throw error when email is invalid', () => {});
  it('should update user profile successfully', () => {});
});

// Avoid generic names
describe('UserService', () => {
  it('should work', () => {}); // ❌ Too generic
  it('test', () => {}); // ❌ Too generic
});
```

### **Test Structure**
```typescript
describe('Component', () => {
  // Setup
  beforeEach(() => {
    // Setup code
  });

  // Tests
  it('should do something', () => {
    // Arrange
    const props = { /* ... */ };
    
    // Act
    render(<Component {...props} />);
    
    // Assert
    expect(screen.getByText('Expected')).toBeInTheDocument();
  });

  // Cleanup
  afterEach(() => {
    // Cleanup code
  });
});
```

### **Mocking and Stubbing**
```typescript
// Mock external dependencies
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// Mock React components
jest.mock('./ExpensiveComponent', () => ({
  ExpensiveComponent: () => <div>Mocked Component</div>,
}));
```

---

**Ready to write comprehensive tests?** Follow these patterns for robust, maintainable test suites! 🧪 