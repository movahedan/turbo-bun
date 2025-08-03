# 🤖 AI Development Assistant Guidelines

## 🎯 Core Principle
**You are an AI development assistant working within a DevContainer-first, documentation-driven development environment. You MUST follow these strict guidelines for all interactions.**

## 🚨 CRITICAL: Pre-Implementation Requirements

### **MANDATORY Documentation Review**
**BEFORE implementing ANY changes, you MUST:**

1. **ALWAYS** read `docs/AI_Prompt.md` first (this file)
2. **ALWAYS** review `docs/0_QUALITY_CHECKLIST.md` for structural requirements
3. **ALWAYS** examine `.cursor/rules/` directory for coding standards
4. **ALWAYS** check `docs/3_DEV_FLOWS.md` for development workflows
5. **ALWAYS** verify DevContainer implications in `docs/5_DOCKER.md`

### **Repository State Verification**
**NEVER assume anything not present in the repository:**
- **ALWAYS** examine actual files, scripts, and configurations
- **ALWAYS** verify file paths and script names exist
- **ALWAYS** check `package.json` scripts and `turbo.json` configuration
- **ALWAYS** ensure documentation matches current implementation exactly

## 🐳 DevContainer-First Development

### **CRITICAL DevContainer Rules:**
- **ALWAYS** remember that you are being run in a Docker container
- **ALWAYS** test implementations within DevContainer environment
- **ALWAYS** use DevContainer-specific commands: `bun run dev:*`
- **ALWAYS** verify DevContainer health: `bun run dev:check`
- **ALWAYS** ensure Docker/container compatibility for all changes
- **ALWAYS** test in isolated DevContainer environment before suggesting changes

## 📋 AI-Specific Implementation Process

### **Step 1: Documentation Analysis**
```bash
# Search for relevant documentation
find docs/ -name "*.md" -exec grep -l "keyword" {} \;
grep -r "feature_name" docs/
```

### **Step 2: Repository State Verification**
- Examine actual file structure and configurations
- Verify all referenced files, scripts, and paths exist
- Check current implementation against documentation

### **Step 3: Implementation Planning**
- Identify affected components and services
- Plan testing strategy based on `docs/TESTING.md`
- Consider impact on existing functionality
- Plan documentation updates

### **Step 4: Implementation Execution**
- Follow established patterns from `.cursor/rules/`
- Use DevContainer-specific commands and workflows
- Implement with strict adherence to quality standards
- Test thoroughly using established patterns

### **Step 5: Post-Implementation Validation**
- Run quality checks: `bun run check:quick`
- Test DevContainer setup: `bun run dev:setup`
- Test DevContainer health: `bun run dev:check`
- Update relevant documentation
- Follow conventional commit standards

## 🔍 Documentation Priority Order

1. **`docs/AI_Prompt.md`** - AI-specific guidelines (MANDATORY FIRST READ)
2. **`docs/0_QUALITY_CHECKLIST.md`** - Structural change requirements
3. **`.cursor/rules/`** - Development conventions and coding standards
4. **`docs/3_DEV_FLOWS.md`** - Development workflow and commands
5. **`docs/2_SETUP_FLOWS.md`** - Organized setup flows
6. **`docs/planning/`** - Architectural decisions and planning
7. **`README.md`** - Project overview and quick start

## 🚫 STRICT AI Behavior Rules

### **Documentation Update Process**
When updating documentation:
- **ALWAYS** compare documented flows with actual repository state
- **NEVER** assume anything not present in the repository
- **ALWAYS** examine actual files, scripts, and configurations
- **ALWAYS** update the document as a complete, legitimate summary
- **ALWAYS** link to actual repository files instead of explaining everything
- **ALWAYS** verify file paths and script names exist in the repository
- **ALWAYS** check `package.json` scripts, `turbo.json` config, and actual file structure
- **ALWAYS** ensure documentation matches the current implementation exactly
- **ALWAYS** check `.cursor/rules/` directory and update rules if needed
- **ALWAYS** verify that `.cursor/rules/` reflects current development patterns
- **ALWAYS** apply this process to ALL documentation in the `docs/` folder
- **ALWAYS** pay special attention to `README.md` as the primary entry point

### **Implementation Rules**
- **ALWAYS** read relevant documentation before implementing
- **ALWAYS** understand current architecture and patterns
- **ALWAYS** check for existing similar implementations
- **ALWAYS** review related planning documents
- **ALWAYS** understand the development workflow
- **ALWAYS** review DevContainer configuration and implications

### **Quality Assurance Rules**
- **ALWAYS** follow quality checklist requirements
- **ALWAYS** use established testing patterns
- **ALWAYS** ensure CI/CD pipeline compatibility
- **ALWAYS** follow conventional commit standards
- **ALWAYS** update documentation as part of implementation

## 🎯 AI Prompting Best Practices

### **Clear Instructions**
- Provide specific, actionable instructions
- Use numbered lists for sequential tasks
- Include expected outputs and formats
- Specify error handling requirements

### **Context Awareness**
- Reference specific files and line numbers
- Include relevant code snippets
- Provide background context when needed
- Explain the "why" behind requirements

### **Iterative Refinement**
- Start with high-level requirements
- Refine based on initial outputs
- Provide feedback for improvements
- Maintain consistency across iterations

### **Error Prevention**
- Anticipate common failure points
- Include validation steps
- Provide fallback options
- Specify debugging approaches

## 📝 Implementation Checklist

### ✅ **Pre-Implementation**
- [ ] Read all relevant documentation files
- [ ] Understand current architecture and patterns
- [ ] Check for existing similar implementations
- [ ] Review related planning documents
- [ ] Understand development workflow
- [ ] Review DevContainer configuration

### ✅ **Implementation**
- [ ] Follow established patterns from `.cursor/rules/`
- [ ] Use DevContainer-specific commands
- [ ] Implement with strict quality standards
- [ ] Test thoroughly using established patterns
- [ ] Update relevant documentation

### ✅ **Post-Implementation**
- [ ] Run quality checks: `bun run check:quick`
- [ ] Test DevContainer setup: `bun run dev:setup`
- [ ] Test DevContainer health: `bun run dev:check`
- [ ] Update documentation
- [ ] Follow conventional commit standards

## 🚫 Common AI Mistakes to Avoid

1. **Skipping Documentation Review** - Always read relevant docs first
2. **Making Assumptions** - Never assume anything not in repository
3. **Ignoring DevContainer Context** - Always consider container implications
4. **Not Following Quality Standards** - Always check structural requirements
5. **Missing Documentation Updates** - Always keep docs in sync
6. **Not Testing Thoroughly** - Always test in DevContainer environment

## 💡 AI Best Practices

1. **Start with AI_Prompt.md** for AI-specific guidance
2. **Use the quality checklist** for structural changes
3. **Follow the development workflow** for consistency
4. **Search documentation** before implementing similar features
5. **Update documentation** as part of implementation
6. **Test thoroughly** using established patterns
7. **Follow conventional commits** for version control

## 🔄 Continuous Improvement

- **Before each implementation**: Review relevant documentation
- **During implementation**: Check documentation for patterns and standards
- **After implementation**: Update documentation to reflect changes
- **For new features**: Create or update planning documentation

---

**CRITICAL REMINDER**: This project has extensive, well-organized documentation. Reading and following this documentation ensures consistency, quality, and successful implementation. The documentation is your primary source of truth for all development decisions.

**ALWAYS** read the docs and apply solutions according to your findings. The docs are inside `docs/*`.
