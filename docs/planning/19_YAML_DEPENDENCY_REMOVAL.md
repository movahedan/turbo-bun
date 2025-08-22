# 🐳 Docker Compose YAML Parser: Remove External Dependency

> **Simple plan to replace the `yaml` package with a custom parser for docker-compose files only**

## 📋 Table of Contents

- [Overview](#-overview)
- [Current Usage](#-current-usage)
- [Simple Parser Requirements](#simple-parser-requirements)
- [Implementation Plan](#implementation-plan)
- [Migration Steps](#migration-steps)

## 🎯 Overview

Replace the external `yaml` package with a minimal custom parser that only handles docker-compose YAML files. This eliminates the dependency while keeping the solution focused and maintainable.

## 🔍 Current Usage

The `yaml` package is used in one place:
```typescript
// packages/intershell/src/entities/compose/compose.ts
import { parse as yaml } from "yaml";

async read(): Promise<ComposeData> {
  return yaml(await Bun.file(this.composePath).text()) as ComposeData;
}
```

## 📝 Simple Parser Requirements

### **Docker Compose YAML Features Only**
- Basic YAML structure (indentation-based)
- Key-value pairs
- Arrays
- Nested objects
- String values (no complex types needed)

### **What We DON'T Need**
- Anchors and aliases
- Tags
- Multi-document support
- Complex scalar types
- Comments preservation

## 🏗️ Implementation Plan

### **Phase 1: Basic Parser (Week 1)**
1. Create `@repo/yaml-parser` package
2. Implement simple indentation-based parser
3. Handle basic YAML structures
4. Add unit tests for docker-compose examples

### **Phase 2: Integration (Week 2)**
1. Update compose entity to use custom parser
2. Remove `yaml` package dependency
3. Test with existing docker-compose files
4. Validate parser output matches expected types

## 🔄 Migration Steps

### **1. Create Parser Package**
```bash
mkdir packages/yaml-parser
cd packages/yaml-parser
bun init
```

### **2. Implement Simple Parser**
```typescript
// packages/yaml-parser/src/parser.ts
export function parseYAML(input: string): any {
  const lines = input.split('\n');
  const result: any = {};
  const stack: Array<{ obj: any; indent: number }> = [];
  
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    
    const indent = line.search(/\S/);
    const [key, ...valueParts] = line.trim().split(':');
    const value = valueParts.join(':').trim();
    
    // Handle indentation and nesting
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    
    const currentObj = stack.length > 0 ? stack[stack.length - 1].obj : result;
    
    if (value === '') {
      // Start new object
      currentObj[key] = {};
      stack.push({ obj: currentObj[key], indent });
    } else if (value.startsWith('-')) {
      // Array item
      if (!Array.isArray(currentObj[key])) {
        currentObj[key] = [];
      }
      currentObj[key].push(value.substring(1).trim());
    } else {
      // Simple key-value
      currentObj[key] = value;
    }
  }
  
  return result;
}
```

### **3. Update Compose Entity**
```typescript
// packages/intershell/src/entities/compose/compose.ts
import { parseYAML } from '@repo/yaml-parser';

async read(): Promise<ComposeData> {
  return parseYAML(await Bun.file(this.composePath).text()) as ComposeData;
}
```

### **4. Remove Dependency**
```bash
bun remove yaml
```

## ✅ Success Criteria

- [ ] Custom parser handles all existing docker-compose files
- [ ] No external YAML dependencies
- [ ] Parser output matches `ComposeData` type
- [ ] All existing tests pass
- [ ] Performance is acceptable for compose files

## 🔗 Related Documentation

- [Package Development Standards](../planning/package-development-standards.md)
- [Testing Guide](../TESTING.md)

---

**Status**: 🎯 **READY TO START** - Simple Docker Compose YAML Parser

**Next Steps**: Create the `@repo/yaml-parser` package and implement the basic parser.
