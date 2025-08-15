# 🚀 Shell v2 & Entities v2 Planning: Next Generation CLI Framework

> **Comprehensive planning document for the next generation of shell utilities and entity management systems**

## 📋 Table of Contents

- [Overview](#-overview)
- [Current State Analysis](#-current-state-analysis)
- [Shell v2 Architecture](#-shell-v2-architecture)
- [Entities v2 Architecture](#-entities-v2-architecture)
- [Migration Strategy](#-migration-strategy)
- [Implementation Phases](#-implementation-phases)
- [Technical Specifications](#-technical-specifications)
- [Testing Strategy](#-testing-strategy)
- [Success Criteria](#-success-criteria)

## 🎯 Overview

This document outlines the comprehensive plan for upgrading our shell utilities and entity management systems to version 2. The new architecture will provide a more robust, type-safe, and extensible foundation for CLI applications while maintaining backward compatibility and improving developer experience.

### **Key Objectives**

1. **🎮 Enhanced Interactive CLI Framework**: Create a generic, reusable CLI framework
2. **🔧 Improved TypeScript Configuration System**: Better type inference and validation
3. **🏗️ Modular Entity Architecture**: Cleaner separation of concerns and better reusability
4. **📊 Advanced Changelog Management**: Flexible templating and custom generation
5. **🚀 Performance Improvements**: Optimized parsing and processing
6. **🧪 Comprehensive Testing**: Full test coverage with mocking support

### **System Architecture Goals**

```typescript
interface ShellV2Architecture {
  core: {
    colorify: 'enhanced-terminal-colors';
    wrapshell: 'improved-script-framework';
    intershell: 'generic-interactive-framework';
  };
  
  entities: {
    commit: 'enhanced-commit-management';
    branch: 'branch-validation-rules';
    pr: 'pull-request-analysis';
    tag: 'flexible-tag-management';
    compose: 'docker-compose-parsing';
    packages: 'unified-package-management';
    changelog: 'flexible-changelog-generation';
    affected: 'intelligent-change-detection';
  };
  
  features: {
    typeSafety: '100%';
    testCoverage: '95%+';
    performance: '2x-improvement';
    extensibility: 'plugin-architecture';
  };
}
```

## 🔍 Current State Analysis

### **Shell System (Current)**

#### **Strengths**
- ✅ **`create-scripts.ts`**: Provides consistent CLI argument parsing and validation
- ✅ **`interactive-cli.ts`**: Basic interactive functionality with Promise-based methods
- ✅ **`colorify.ts`**: Simple but effective terminal color utilities
- ✅ **`cli-tools.ts`**: Page-aware step system with navigation state

#### **Weaknesses**
- ❌ **Complex State Management**: `runEnhancedInteractiveMode` function is hard to maintain
- ❌ **Tight Coupling**: I/O handling and application logic are mixed
- ❌ **Limited Reusability**: Each CLI app requires custom implementation
- ❌ **Type Safety Issues**: Some areas lack proper TypeScript constraints
- ❌ **Testing Complexity**: Interactive components are difficult to test

### **Entities System (Current)**

#### **Strengths**
- ✅ **Modular Design**: Well-separated concerns with clear interfaces
- ✅ **Type Safety**: Good TypeScript usage with proper interfaces
- ✅ **Comprehensive Coverage**: Handles most common use cases
- ✅ **Error Handling**: Robust error handling and validation

#### **Weaknesses**
- ❌ **Duplicate Functionality**: `workspace.ts` and `package-json.ts` have overlapping concerns
- ❌ **Limited Flexibility**: Some entities are too rigid for different use cases
- ❌ **Performance Issues**: Some operations could be optimized
- ❌ **Testing Gaps**: Some entities lack comprehensive test coverage
- ❌ **Changelog Limitations**: Changelog generator lacks custom range generation capabilities and doesn't integrate with git's tagging system, relying solely on package.json version information

## 🏗️ Shell v2 Architecture

### **Core Components**



#### **1. wrapshell (Improved Script Framework)**

```typescript
// Enhanced script creation with better type inference
export class WrapShell<TConfig extends ScriptConfig> {
  constructor(config: TConfig);
  
  // Improved type inference
  static createScript<TConfig extends ScriptConfig>(
    config: TConfig,
    handler: ScriptHandler<TConfig>
  ): ScriptInstance<TConfig>;
  
  // Enhanced validation system
  static validators: {
    fileExists: (path: string) => ValidationResult<string>;
    directoryExists: (path: string) => ValidationResult<string>;
    enum: <T extends string>(values: T[]) => (value: string) => ValidationResult<T>;
    regex: (pattern: RegExp, message?: string) => (value: string) => ValidationResult<string>;
    custom: <T>(validator: (value: string) => T | ValidationError) => (value: string) => ValidationResult<T>;
  };
  
  // New features
  static hooks: {
    beforeRun: (script: ScriptInstance) => Promise<void>;
    afterRun: (script: ScriptInstance, result: any) => Promise<void>;
    onError: (script: ScriptInstance, error: Error) => Promise<void>;
  };
}
```

#### **2. intershell (Generic Interactive Framework)**

```typescript
// Generic CLI framework for any interactive application
export class InterShell<TState, TAction> {
  constructor(
    initialState: TState,
    pages: Page<TState, TAction>[],
    reducers: ReducerMap<TState, TAction>
  );
  
  // Core framework methods
  async run(): Promise<TState>;
  navigateTo(pageId: string): void;
  dispatch(action: TAction): void;
  
  // Event system
  on(event: string, handler: EventHandler): void;
  off(event: string, handler: EventHandler): void;
  
  // State management
  getState(): TState;
  subscribe(listener: StateListener<TState>): () => void;
}

// Page configuration interface
export interface Page<TState, TAction> {
  id: string;
  title: string;
  description?: string;
  
  // Page logic
  render(cli: InteractiveCLI, state: TState): Promise<void>;
  handleKey(key: KeyPress, state: TState): TAction | null;
  getNextAction(state: TState): PageAction;
  
  // Navigation
  canNavigateTo(targetPage: string, state: TState): boolean;
  onEnter(state: TState): void;
  onExit(state: TState): void;
}

// Reducer system
export type Reducer<TState, TAction> = (state: TState, action: TAction) => TState;
export type ReducerMap<TState, TAction> = Record<string, Reducer<TState, TAction>>;
```

### **Architecture Benefits**

1. **🎯 Separation of Concerns**: Clear boundaries between I/O, state management, and business logic
2. **🔄 Event-Driven**: Clean event system for better testability and extensibility
3. **🧩 Composable**: Pages and reducers can be mixed and matched
4. **📱 Framework Agnostic**: Can be used for any CLI application
5. **⚡ Performance**: Optimized rendering and state updates

## 🏛️ Entities v2 Architecture

### **Core Entity System**

#### **1. commit (Enhanced Commit Management)**

```typescript
export class EntityCommit {
  // Enhanced parsing with better error handling
  static parseByMessage(message: string): CommitMessageData;
  static parseByHash(hash: string): Promise<ParsedCommitData>;
  
  // New features
  static analyzeCommitPattern(commits: ParsedCommitData[]): CommitPatternAnalysis;
  
  // Performance improvements
  static parseBatch(hashes: string[]): Promise<ParsedCommitData[]>;
  static createParser(options: CommitParserOptions): CommitParser;
}

export interface CommitSeriesValidation {
  isValid: boolean;
  errors: CommitValidationError[];
  warnings: CommitValidationWarning[];
  suggestions: CommitSuggestion[];
}
```

#### **2. commit.rules (Commit Rule Engine)**

```typescript
export class CommitRuleEngine {
  constructor(rules: CommitRule[]);
  
  // Rule evaluation
  evaluate(commit: ParsedCommitData): RuleEvaluationResult;
  evaluateSeries(commits: ParsedCommitData[]): SeriesEvaluationResult;
  
  // Rule management
  addRule(rule: CommitRule): void;
  removeRule(ruleId: string): void;
  updateRule(ruleId: string, rule: Partial<CommitRule>): void;
  
  // Rule validation
  validateRule(rule: CommitRule): RuleValidationResult;
}

export interface CommitRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  condition: (commit: ParsedCommitData) => boolean;
  message: string | ((commit: ParsedCommitData) => string);
}
```

#### **3. branch (Branch Management)**

```typescript
export class EntityBranch {
  // Branch operations
  static getCurrentBranch(): Promise<string>;
  static getBranchInfo(branchName: string): Promise<BranchInfo>;
  static validateBranchName(name: string): BranchValidationResult;
  
  // Branch rules
  static applyBranchRules(branchName: string): BranchRuleResult;
  
  // Branch analysis
  static analyzeBranch(branchName: string): BranchAnalysis;
  static getBranchDependencies(branchName: string): string[];
}

export interface BranchInfo {
  name: string;
  type: BranchType;
  lastCommit: string;
  lastCommitDate: Date;
  isProtected: boolean;
  requiresReview: boolean;
}
```

#### **4. branch.rules (Branch Validation Rules)**

```typescript
export class BranchRuleEngine {
  constructor(rules: BranchRule[]);
  
  // Rule evaluation
  evaluate(branchName: string): BranchRuleResult;
  
  // Rule management
  addRule(rule: BranchRule): void;
  removeRule(ruleId: string): void;
}

export interface BranchRule {
  id: string;
  name: string;
  pattern: RegExp;
  message: string;
  severity: 'error' | 'warning';
  examples: string[];
}
```

#### **5. pr (Pull Request Analysis)**

```typescript
export class EntityPR {
  // PR analysis
  static analyzePR(prNumber: number): Promise<PRAnalysis>;
  static validatePR(pr: PRAnalysis): PRValidationResult;
  
  // Commit series analysis
  static analyzeCommitSeries(commits: ParsedCommitData[]): CommitSeriesAnalysis;
  static validateCommitSeries(commits: ParsedCommitData[]): CommitSeriesValidation;
  
  // PR categorization
  static categorizePR(pr: PRAnalysis): PRCategory;
}

export interface PRAnalysis {
  number: number;
  title: string;
  description: string;
  commits: ParsedCommitData[];
  files: ChangedFile[];
  category: PRCategory;
  validation: PRValidationResult;
}
```

#### **6. pr.rules (PR Validation Rules)**

```typescript
export class PRRuleEngine {
  constructor(rules: PRRule[]);
  
  // Rule evaluation
  evaluate(pr: PRAnalysis): PRRuleResult;
  validateCommitSeries(commits: ParsedCommitData[]): CommitSeriesValidation;
  
  // Custom rules
  addCommitSeriesRule(rule: CommitSeriesRule): void;
  addPRRule(rule: PRRule): void;
}

export interface CommitSeriesRule {
  id: string;
  name: string;
  description: string;
  validate: (commits: ParsedCommitData[]) => CommitSeriesValidation;
}
```

#### **7. tag (Flexible Tag Management)**

```typescript
export class EntityTag {
  // Enhanced tag operations
  static createTag(operation: TagOperation): Promise<void>;
  static deleteTag(tagName: string, options?: TagDeleteOptions): Promise<void>;
  
  // Multiple prefix/postfix support
  static getTagPrefixes(): string[];
  static getTagPostfixes(): string[];
  static createTagName(version: string, options?: TagNameOptions): string;
  
  // Tag analysis
  static analyzeTag(tagName: string): TagAnalysis;
  static getTagHistory(prefix?: string): TagHistory[];
  
  // Version management
  static extractVersion(tagName: string): string | null;
}

export interface TagNameOptions {
  prefix?: string;
  postfix?: string;
  format?: 'semver' | 'calver' | 'custom';
  separator?: string;
}
```

#### **8. tag.rules (Tag Validation Rules)**

```typescript
export class TagRuleEngine {
  constructor(rules: TagRule[]);
  
  // Rule evaluation
  evaluate(tagName: string): TagRuleResult;
  
  // Rule management
  addRule(rule: TagRule): void;
  removeRule(ruleId: string): void;
}

export interface TagRule {
  id: string;
  name: string;
  pattern: RegExp;
  message: string;
  severity: 'error' | 'warning';
  examples: string[];
}
```

#### **9. composes (Docker Compose Parser)**

```typescript
export class EntityCompose {
  // Enhanced parsing without external dependencies
  static parse(composePath: string): Promise<ComposeData>;
  static parseMultiple(paths: string[]): Promise<ComposeData[]>;
  
  // Service analysis
  static getServices(compose: ComposeData): ServiceInfo[];
  static getServiceHealth(compose: ComposeData): Promise<ServiceHealth[]>;
  static getServiceDependencies(compose: ComposeData): ServiceDependencyGraph;
  
  // Port management
  static getPortMappings(compose: ComposeData): PortMapping[];
  static findPortConflicts(composes: ComposeData[]): PortConflict[];
  
  // Validation
  static validate(compose: ComposeData): ComposeValidationResult;
  
  // Affected service detection
  static getAffectedServices(
    baseSha?: string, 
    to?: string, 
    composeMode?: "dev" | "prod" | "all"
  ): Promise<EntityAffectedService[]>;
  
  // Service dependency analysis
  static getServiceDependencies(serviceName: string): string[];
  static getServiceHealth(serviceName: string): Promise<ServiceHealth>;
  
  // Compose-specific enhancements
  static getPortConflicts(services: EntityAffectedService[]): PortConflict[];
  static getEnvironmentImpact(services: EntityAffectedService[]): EnvironmentImpact>;
}

export interface EntityAffectedService {
  readonly name: string;
  readonly environment: "dev" | "prod";
  readonly port?: number;
}

export interface ComposeData {
  version: string;
  services: Record<string, ServiceDefinition>;
  networks: Record<string, NetworkDefinition>;
  volumes: Record<string, VolumeDefinition>;
  validation: ComposeValidationResult;
}
```

#### **10. packages (Unified Package Management)**

```typescript
export class EntityPackages {
  // Unified package operations
  static getAllPackages(): Promise<PackageInfo[]>;
  static getPackageInfo(packageName: string): Promise<PackageInfo | null>;
  static validatePackage(packageName: string): Promise<PackageValidationResult>;
  
  // Workspace operations
  static getWorkspaceInfo(): WorkspaceInfo;
  static getPackageGraph(): PackageDependencyGraph;
  
  // Package.json operations
  static readPackageJson(packageName: string): Promise<PackageJson>;
  static writePackageJson(packageName: string, data: PackageJson): Promise<void>;
  
  // Version operations
  static readVersion(packageName: string): Promise<string>;
  static writeVersion(packageName: string, version: string): Promise<void>;
  
  // Changelog operations
  static readChangelog(packageName: string): Promise<string>;
  static writeChangelog(packageName: string, content: string): Promise<void>;
  
  // Affected package detection
  static getAffectedPackages(baseSha?: string, to?: string): Promise<string[]>;
  static getAffectedFiles(baseSha?: string, to?: string): Promise<string[]>;
}

export interface PackageInfo {
  name: string;
  version: string;
  path: string;
  changelogPath: string;
  type: 'app' | 'package' | 'root';
  dependencies: string[];
  devDependencies: string[];
  peerDependencies: string[];
}
```

#### **11. changelog (Flexible Changelog Generation)**

```typescript
export class EntityChangelog {
  // Core changelog operations
  static generateChangelog(packageName: string, template: ChangelogTemplate, options: ChangelogOptions): Promise<string>;
  static updateChangelog(packageName: string, content: string, template: ChangelogTemplate): Promise<void>;
  
  // Version management
  static getLatestVersion(packageName: string): string | null;
  static isVersionUpToDate(packageName: string, version: string): boolean;
}

export interface TemplateRenderOptions {
  groupBy: 'type' | 'scope' | 'author' | 'pr';
  mode: 'pr' | 'commit';
}

export interface ChangelogOptions extends TemplateRenderOptions {
  baseSha?: string;
  to?: string;
  includeUnreleased?: boolean;
}
```

#### **12. changelog.template (Template System)**

```typescript
export class ChangelogTemplate {
  constructor(template: TemplateDefinition);
  
  // Template rendering with options
  render(data: ChangelogData, options: TemplateRenderOptions): string;
  renderSection(section: string, data: any, options: TemplateRenderOptions): string;
  
  // Data preprocessing
  preprocess(data: ChangelogData, options: TemplateRenderOptions): ChangelogData;
  
  // Template validation
  validate(): TemplateValidationResult;
}

export interface TemplateDefinition {
  name: string;
  version: string;
  sections: TemplateSection[];
}
```

#### **13. changelog.custom (Custom Changelog Generation)**

```typescript
export class CustomChangelogGenerator {
  constructor(template: TemplateDefinition);
  
  // Template rendering with options
  render(data: ChangelogData, template: ChangelogTemplate, options: ChangelogOptions): string;
  renderSection(section: string, data: any, template: ChangelogTemplate, options: ChangelogOptions): string;
  
  // Data preprocessing
  preprocess(data: ChangelogData, options: ChangelogOptions): ChangelogData;
  
  // Template validation
  validate(): TemplateValidationResult;
}

```

## 🔄 Migration Strategy

### **Phase 1: Foundation (Weeks 1-2)**

1. **Create new shell structure**
   - Set up `@shell/` directory
   - Implement enhanced `colorify`
   - Create new `wrapshell` with improved types

2. **Implement core intershell framework**
   - Basic event system
   - State management
   - Page rendering system

### **Phase 2: Core Entities (Weeks 3-4)**

1. **Migrate and enhance core entities**
   - `commit` and `commit.rules`
   - `branch` and `branch.rules`
   - `pr` and `pr.rules`

2. **Implement new entity features**
   - Enhanced validation systems
   - Rule engines
   - Performance optimizations

### **Phase 3: Advanced Entities (Weeks 5-6)**

1. **Complete entity migration**
   - `tag` and `tag.rules`
   - `composes` (dependency-free)
   - `packages` (unified)

2. **Implement changelog system**
   - `changelog` core
   - `changelog.template`
   - `changelog.custom`

### **Phase 4: Integration & Testing (Weeks 7-8)**

1. **Complete integration**
   - Affected functionality integrated into packages and compose entities
   - Full system testing
   - Performance optimization

2. **Documentation and examples**
   - API documentation
   - Migration guides
   - Example applications

## 🧪 Testing Strategy

### **Unit Testing**

```typescript
// Example test structure
describe('EntityCommit', () => {
  describe('parseByMessage', () => {
    it('should parse conventional commit messages', () => {
      const result = EntityCommit.parseByMessage('feat: add new feature');
      expect(result.type).toBe('feat');
      expect(result.description).toBe('add new feature');
    });
    
    it('should handle breaking changes', () => {
      const result = EntityCommit.parseByMessage('feat!: breaking change');
      expect(result.isBreaking).toBe(true);
    });
  });
  
  describe('validateCommitSeries', () => {
    it('should validate commit series consistency', () => {
      const commits = [/* test commits */];
      const result = EntityCommit.validateCommitSeries(commits);
      expect(result.isValid).toBe(true);
    });
  });
});
```

### **Integration Testing**

```typescript
// Test complete workflows
describe('Changelog Generation Workflow', () => {
  it('should generate complete changelog from commits', async () => {
    const commits = await getTestCommits();
    const changelog = await EntityChangelog.generateChangelog('test-package', {
      baseSha: commits[0].hash,
      to: commits[commits.length - 1].hash
    });
    
    expect(changelog).toContain('## v1.0.0');
    expect(changelog).toContain('feat: new feature');
  });
});
```

### **Performance Testing**

```typescript
// Test performance improvements
describe('Performance Tests', () => {
  it('should parse large commit sets efficiently', async () => {
    const startTime = performance.now();
    const commits = await EntityCommit.parseBatch(largeCommitSet);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(1000); // Under 1 second
    expect(commits).toHaveLength(largeCommitSet.length);
  });
});
```

## ✅ Success Criteria

### **Functional Requirements**

- [ ] **100% Type Safety**: All components have proper TypeScript types
- [ ] **95% Test Coverage**: Comprehensive test coverage for all new components
- [ ] **2x Performance**: Significant performance improvements over current system
- [ ] **Zero Breaking Changes**: Maintain backward compatibility where possible
- [ ] **Full Feature Parity**: All current functionality preserved and enhanced

### **Technical Requirements**

- [ ] **Modular Architecture**: Clean separation of concerns
- [ ] **Event-Driven Design**: Proper event system for extensibility
- [ ] **Plugin Support**: Ability to extend functionality through plugins
- [ ] **Performance Optimization**: Efficient parsing and processing
- [ ] **Memory Management**: Proper resource cleanup and memory usage

### **Developer Experience**

- [ ] **Clear API**: Intuitive and well-documented APIs
- [ ] **Error Handling**: Comprehensive error messages and debugging
- [ ] **Development Tools**: Good debugging and development support
- [ ] **Documentation**: Complete API documentation and examples
- [ ] **Migration Guide**: Clear path for existing code migration

## 🚀 Next Steps

1. **Review and Approve**: Team review of this planning document
2. **Resource Allocation**: Assign developers to specific phases
3. **Timeline Confirmation**: Finalize implementation timeline
4. **Development Start**: Begin Phase 1 implementation
5. **Regular Reviews**: Weekly progress reviews and adjustments

---

*This planning document provides a comprehensive roadmap for upgrading our shell utilities and entity management systems. The new architecture will significantly improve developer experience, performance, and maintainability while preserving all existing functionality.*
