# 🚀 YAML Dependency Removal: Custom Parser Implementation

> **Complete planning guide to remove the `yaml` package dependency by building a custom YAML parser that passes the official test suite**

## 📋 Table of Contents

- [Overview](#-overview)
- [Why Build a Custom YAML Parser?](#-why-build-a-custom-yaml-parser)
- [YAML Test Suite Requirements](#yaml-test-suite-requirements)
- [Implementation Strategy](#implementation-strategy)
- [Core Parser Architecture](#core-parser-architecture)
- [Testing Against the Suite](#testing-against-the-suite)
- [Integration with Existing Code](#integration-with-existing-code)
- [Performance Considerations](#performance-considerations)
- [Migration Plan](#migration-plan)
- [Risk Assessment](#risk-assessment)

## 🎯 Overview

Instead of refactoring your YAML files to JSON, we'll build a custom YAML parser that:
- ✅ **Passes the [official YAML test suite](https://github.com/yaml/yaml-test-suite)**
- ✅ **Integrates seamlessly with your existing codebase**
- ✅ **Leverages Bun's native performance**
- ✅ **Eliminates the external `yaml` dependency**
- ✅ **Maintains full YAML functionality**

## 🔍 Why Build a Custom YAML Parser?

### **Current Situation**
```json
{
  "devDependencies": {
    "yaml": "2.8.1"  // ❌ External dependency we want to remove
  }
}
```

### **Benefits of Custom Parser**
- **No external dependencies**: Self-contained solution
- **Bun-optimized**: Leverage Bun's native performance
- **Customizable**: Add project-specific features
- **Learning opportunity**: Deep understanding of YAML specification
- **Full control**: No version conflicts or breaking changes

## 🧪 YAML Test Suite Requirements

Based on the [official YAML test suite](https://github.com/yaml/yaml-test-suite), our parser must handle:

### **Core YAML Features**
- **Scalars**: Strings, numbers, booleans, null
- **Collections**: Arrays and objects
- **Anchors & Aliases**: Reference handling
- **Tags**: Type system
- **Comments**: Inline and block comments
- **Multi-line strings**: Literal and folded styles

### **Advanced Features**
- **Flow vs Block styles**: Different collection representations
- **Quoted strings**: Single, double, and literal quotes
- **Special characters**: Unicode, escape sequences
- **Document separators**: Multiple YAML documents in one file
- **Directives**: YAML version and tag handling

### **Test Suite Structure**
```
📁 yaml-test-suite/
├── src/                    # YAML test definitions
├── data/                   # Generated test data
│   ├── AB3D/              # Individual test cases
│   │   ├── ===            # Test name/label
│   │   ├── in.yaml        # Input YAML
│   │   ├── test.event     # Expected event stream
│   │   ├── in.json        # Expected JSON output
│   │   ├── out.yaml       # Expected YAML output
│   │   └── error          # Expected error (if any)
│   └── ...
└── bin/                    # Test suite tools
```

## 🏗️ Implementation Strategy

### **Phase 1: Core Parser Foundation**
1. **Lexer/Tokenizer**: Convert YAML text to tokens
2. **Parser**: Build AST from tokens
3. **Emitter**: Generate JSON/JavaScript objects
4. **Basic test coverage**: Simple YAML documents

### **Phase 2: Advanced Features**
1. **Anchors & Aliases**: Reference resolution
2. **Tags**: Type system implementation
3. **Multi-document support**: Document separators
4. **Comments**: Preserve and handle comments

### **Phase 3: Test Suite Integration**
1. **Test runner**: Execute against official suite
2. **Result validation**: Compare outputs
3. **Performance optimization**: Bun-specific optimizations
4. **Edge case handling**: Complex YAML structures

## 🔧 Core Parser Architecture

### **1. Lexer (Tokenizer)**
```typescript
// packages/yaml-parser/src/lexer.ts
export class YAMLLexer {
  private input: string;
  private position: number;
  private tokens: Token[] = [];
  
  constructor(input: string) {
    this.input = input;
    this.position = 0;
  }
  
  tokenize(): Token[] {
    while (this.position < this.input.length) {
      const char = this.input[this.position];
      
      if (this.isWhitespace(char)) {
        this.consumeWhitespace();
      } else if (this.isComment(char)) {
        this.consumeComment();
      } else if (this.isQuote(char)) {
        this.consumeQuotedString();
      } else if (this.isDigit(char)) {
        this.consumeNumber();
      } else {
        this.consumeIdentifier();
      }
    }
    
    return this.tokens;
  }
  
  private isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }
  
  private isComment(char: string): boolean {
    return char === '#';
  }
  
  private isQuote(char: string): boolean {
    return char === '"' || char === "'";
  }
  
  private isDigit(char: string): boolean {
    return /\d/.test(char);
  }
}
```

### **2. Parser (AST Builder)**
```typescript
// packages/yaml-parser/src/parser.ts
export class YAMLParser {
  private tokens: Token[];
  private position: number;
  
  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.position = 0;
  }
  
  parse(): YAMLNode {
    const documents: YAMLNode[] = [];
    
    while (this.position < this.tokens.length) {
      const document = this.parseDocument();
      documents.push(document);
      
      // Handle document separators
      if (this.peek()?.type === 'DOCUMENT_SEPARATOR') {
        this.consume();
      }
    }
    
    return documents.length === 1 ? documents[0] : { type: 'stream', documents };
  }
  
  private parseDocument(): YAMLNode {
    // Skip document start marker
    if (this.peek()?.type === 'DOCUMENT_START') {
      this.consume();
    }
    
    // Parse document content
    const content = this.parseNode();
    
    // Skip document end marker
    if (this.peek()?.type === 'DOCUMENT_END') {
      this.consume();
    }
    
    return content;
  }
  
  private parseNode(): YAMLNode {
    const token = this.peek();
    
    switch (token?.type) {
      case 'MAPPING_START':
        return this.parseMapping();
      case 'SEQUENCE_START':
        return this.parseSequence();
      case 'SCALAR':
        return this.parseScalar();
      case 'ANCHOR':
        return this.parseAnchor();
      case 'ALIAS':
        return this.parseAlias();
      default:
        throw new Error(`Unexpected token: ${token?.type}`);
    }
  }
}
```

### **3. Emitter (Output Generator)**
```typescript
// packages/yaml-parser/src/emitter.ts
export class YAMLEmitter {
  emit(node: YAMLNode): any {
    switch (node.type) {
      case 'scalar':
        return this.emitScalar(node);
      case 'mapping':
        return this.emitMapping(node);
      case 'sequence':
        return this.emitSequence(node);
      case 'anchor':
        return this.emitAnchor(node);
      case 'alias':
        return this.emitAlias(node);
      case 'stream':
        return this.emitStream(node);
      default:
        throw new Error(`Unknown node type: ${(node as any).type}`);
    }
  }
  
  private emitScalar(node: ScalarNode): any {
    // Handle different scalar types
    switch (node.tag) {
      case '!null':
        return null;
      case '!bool':
        return node.value === 'true' || node.value === 'True';
      case '!int':
        return parseInt(node.value, 10);
      case '!float':
        return parseFloat(node.value);
      default:
        return node.value;
    }
  }
  
  private emitMapping(node: MappingNode): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of node.pairs) {
      const emittedKey = this.emit(key);
      const emittedValue = this.emit(value);
      result[emittedKey] = emittedValue;
    }
    
    return result;
  }
  
  private emitSequence(node: SequenceNode): any[] {
    return node.items.map(item => this.emit(item));
  }
}
```

## 🧪 Testing Against the Suite

### **Test Runner Implementation**
```typescript
// packages/yaml-parser/src/test-runner.ts
export class YAMLTestRunner {
  private parser: YAMLParser;
  private emitter: YAMLEmitter;
  
  constructor() {
    this.parser = new YAMLParser();
    this.emitter = new YAMLEmitter();
  }
  
  async runTestSuite(testSuitePath: string): Promise<TestResult[]> {
    const testCases = await this.loadTestCases(testSuitePath);
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      try {
        const result = await this.runTestCase(testCase);
        results.push(result);
      } catch (error) {
        results.push({
          name: testCase.name,
          status: 'error',
          error: error.message,
          duration: 0
        });
      }
    }
    
    return results;
  }
  
  private async runTestCase(testCase: TestCase): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      // Parse YAML input
      const ast = this.parser.parse(testCase.input);
      
      // Emit to JavaScript object
      const output = this.emitter.emit(ast);
      
      // Validate against expected output
      const isValid = this.validateOutput(output, testCase.expected);
      
      const duration = performance.now() - startTime;
      
      return {
        name: testCase.name,
        status: isValid ? 'pass' : 'fail',
        duration,
        output,
        expected: testCase.expected
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Check if error was expected
      if (testCase.expectError) {
        return {
          name: testCase.name,
          status: 'pass',
          duration,
          error: error.message
        };
      }
      
      return {
        name: testCase.name,
        status: 'fail',
        duration,
        error: error.message
      };
    }
  }
}
```

### **Test Case Loading**
```typescript
// packages/yaml-parser/src/test-loader.ts
export class TestCaseLoader {
  async loadTestCases(testSuitePath: string): Promise<TestCase[]> {
    const testCases: TestCase[] = [];
    
    // Read test suite directory structure
    const testDirs = await this.getTestDirectories(testSuitePath);
    
    for (const testDir of testDirs) {
      const testCase = await this.loadTestCase(testDir);
      if (testCase) {
        testCases.push(testCase);
      }
    }
    
    return testCases;
  }
  
  private async loadTestCase(testDir: string): Promise<TestCase | null> {
    try {
      const name = await this.readFile(`${testDir}/===`);
      const input = await this.readFile(`${testDir}/in.yaml`);
      const expected = await this.readFile(`${testDir}/in.json`);
      const expectError = await this.fileExists(`${testDir}/error`);
      
      return {
        name: name.trim(),
        input,
        expected: JSON.parse(expected),
        expectError
      };
    } catch (error) {
      console.warn(`Failed to load test case from ${testDir}:`, error);
      return null;
    }
  }
}
```

## 🔗 Integration with Existing Code

### **1. Package Structure**
```
📁 packages/
├── yaml-parser/           # NEW: Custom YAML parser
│   ├── src/
│   │   ├── lexer.ts       # Tokenizer
│   │   ├── parser.ts      # AST builder
│   │   ├── emitter.ts     # Output generator
│   │   ├── test-runner.ts # Test suite runner
│   │   └── index.ts       # Main exports
│   ├── tests/
│   │   ├── yaml-test-suite/ # Official test suite
│   │   └── unit/             # Unit tests
│   ├── package.json
│   └── tsconfig.json
```

### **2. Usage in Existing Scripts**
```typescript
// scripts/entities/compose.ts (updated)
import { parseYAML } from '@repo/yaml-parser';

export class EntityCompose {
  static async parse(mode: "dev" | "prod") {
    const composePath = this.composePaths[mode];
    const content = await Bun.file(composePath).text();
    
    // Use custom parser instead of yaml package
    const parsed = parseYAML(content);
    
    return this.parseServices(parsed);
  }
}
```

### **3. Migration Scripts**
```typescript
// scripts/migrate-yaml.ts
export const migrateYaml = createScript({
  name: "YAML Migration",
  description: "Migrate from yaml package to custom parser",
  usage: "bun run migrate:yaml",
  examples: ["bun run migrate:yaml"],
  options: []
}, async function main(args, xConsole) {
  // 1. Install custom parser package
  await $`bun add -D @repo/yaml-parser`;
  
  // 2. Remove yaml package
  await $`bun remove yaml`;
  
  // 3. Update imports across codebase
  await updateImports();
  
  // 4. Run test suite to validate
  await runTestSuite();
  
  xConsole.log("✅ YAML migration completed successfully!");
});
```

## ⚡ Performance Considerations

### **Bun-Specific Optimizations**
```typescript
// packages/yaml-parser/src/optimizations.ts
export class BunOptimizedParser {
  // Use Bun's native string operations
  private fastStringSlice(input: string, start: number, end: number): string {
    return input.slice(start, end);
  }
  
  // Use Bun's native regex engine
  private fastRegexMatch(input: string, pattern: RegExp): RegExpMatchArray | null {
    return input.match(pattern);
  }
  
  // Use Bun's native number parsing
  private fastNumberParse(value: string): number {
    return Bun.parseNumber(value);
  }
  
  // Use Bun's native JSON parsing for test validation
  private fastJSONParse(value: string): any {
    return Bun.parseJSON(value);
  }
}
```

### **Memory Management**
```typescript
// packages/yaml-parser/src/memory-manager.ts
export class MemoryManager {
  private nodePool: YAMLNode[] = [];
  private tokenPool: Token[] = [];
  
  // Object pooling for frequently allocated objects
  getNode(): YAMLNode {
    return this.nodePool.pop() || this.createNode();
  }
  
  returnNode(node: YAMLNode): void {
    this.nodePool.push(node);
  }
  
  // Lazy loading for large YAML files
  async parseLargeFile(filePath: string): Promise<AsyncIterable<YAMLNode>> {
    const file = Bun.file(filePath);
    const stream = file.stream();
    
    return this.parseStream(stream);
  }
}
```

## 📅 Migration Plan

### **Week 1: Foundation**
- [ ] Create `@repo/yaml-parser` package structure
- [ ] Implement basic lexer/tokenizer
- [ ] Add unit tests for core functionality
- [ ] Set up CI/CD for parser package

### **Week 2: Core Parser**
- [ ] Implement AST parser
- [ ] Add basic emitter
- [ ] Support simple YAML documents
- [ ] Test against basic test cases

### **Week 3: Advanced Features**
- [ ] Implement anchors and aliases
- [ ] Add tag support
- [ ] Handle multi-document files
- [ ] Support comments

### **Week 4: Test Suite Integration**
- [ ] Download official YAML test suite
- [ ] Implement test runner
- [ ] Validate against all test cases
- [ ] Performance optimization

### **Week 5: Integration**
- [ ] Update existing code to use custom parser
- [ ] Remove `yaml` package dependency
- [ ] Run full test suite
- [ ] Documentation and cleanup

## ⚠️ Risk Assessment

### **High Risk**
- **YAML specification complexity**: The YAML spec is extensive
- **Test suite coverage**: Need to pass hundreds of test cases
- **Performance requirements**: Must be competitive with existing solutions

### **Medium Risk**
- **Integration complexity**: Updating existing code
- **Edge case handling**: Complex YAML structures
- **Maintenance burden**: Custom parser requires ongoing maintenance

### **Low Risk**
- **Basic functionality**: Simple YAML parsing is straightforward
- **Bun integration**: Native Bun performance benefits
- **Testing framework**: Comprehensive test suite available

### **Mitigation Strategies**
1. **Start simple**: Begin with basic YAML features
2. **Test-driven**: Use official test suite from day one
3. **Incremental**: Add features one at a time
4. **Fallback plan**: Keep yaml package until custom parser is stable

## 🔗 Related Documentation

- [YAML Test Suite](https://github.com/yaml/yaml-test-suite) - Official test cases
- [YAML Specification](https://yaml.org/spec/) - Complete YAML spec
- [Package Development Standards](../planning/package-development-standards.md) - Package creation guidelines
- [Testing Guide](../TESTING.md) - Testing best practices

---

**Status**: 🎯 **READY TO START** - YAML Dependency Removal Phase 1

**Next Steps**: Create the `@repo/yaml-parser` package structure and begin implementing the basic lexer.
