# 📚 Documentation-First Implementation Rule

## 🎯 Core Principle
**ALWAYS read and understand the project documentation before implementing any changes.** This project has extensive documentation that must be consulted to ensure consistency, avoid conflicts, and follow established patterns.

## 🐳 DevContainer-First Development
**CRITICAL**: This project is primarily developed and run within DevContainers. Always consider DevContainer implications for any implementation:

- [ ] **ALWAYS** test implementations within DevContainer environment
- [ ] **ALWAYS** use DevContainer-specific commands and workflows
- [ ] **ALWAYS** consider Docker/container compatibility for any changes
- [ ] **ALWAYS** verify that changes work in the isolated DevContainer environment
- [ ] **ALWAYS** use `bun run dev:*` commands for development workflows
- [ ] **ALWAYS** check DevContainer health: `bun run dev:check`

## 📋 Mandatory Documentation Review Process

### 1. **Project Structure Understanding**
Before any implementation:
- [ ] Read `README.md` for project overview and setup
- [ ] Review `package.json` for available scripts and dependencies
- [ ] Understand the monorepo structure (`apps/*`, `packages/*`, `scripts/*`)
- [ ] Check `turbo.json` for build pipeline configuration
- [ ] Review `biome.json` for code quality rules
- [ ] **CRITICAL**: Review DevContainer configuration in `.devcontainer/`

### 2. **Development Environment Documentation**
For environment-related changes:
- [ ] Review `docs/2_SETUP_FLOWS.md` for organized setup flows
- [ ] Check `docs/3_DEV_FLOWS.md` for development commands and processes
- [ ] Read `docs/5_DOCKER.md` for Docker setup and configuration
- [ ] Understand `.cursor/rules/` for coding standards and conventions

### 3. **Quality and Testing Documentation**
For code quality and testing changes:
- [ ] Review `docs/0_QUALITY_CHECKLIST.md` for structural change requirements
- [ ] Read `docs/TESTING.md` for testing strategies and patterns
- [ ] Check `docs/7_BUILD_VITE_LIBRARY.md` for build system details
- [ ] Review CI/CD processes in `docs/3_DEV_FLOWS.md`

### 4. **Planning and Architecture Documentation**
For architectural or planning decisions:
- [ ] Review `docs/planning/` directory for architectural decisions
- [ ] Check `docs/planning/16_TODO_ROADMAP_PLANNING.md` for current roadmap
- [ ] Review environment planning docs for infrastructure decisions
- [ ] Check authentication and security planning documents

### 5. **AI-Specific Documentation**
For AI-assisted development:
- [ ] **CRITICAL**: Read `.cursor/rules` directory for AI-specific guidelines
- [ ] Follow AI-specific patterns and constraints

## 🔍 Documentation Search Strategy

### Priority Order for Documentation Review:
1. **`docs/AI_Prompt.md`** - AI-specific guidelines (MANDATORY)
2. **`docs/0_QUALITY_CHECKLIST.md`** - Structural change requirements
3. **`docs/2_SETUP_FLOWS.md`** - Organized setup flows
4. **`docs/3_DEV_FLOWS.md`** - Development workflow and commands
5. **`.cursor/rules/`** - Development conventions and coding standards
6. **Relevant planning docs** - For architectural decisions
7. **Specific feature docs** - For feature-specific implementations
8. **`README.md`** - Project overview and quick start

### Documentation Search Commands:
```bash
# Search for specific topics in documentation
grep -r "keyword" docs/
# Find documentation about specific features
find docs/ -name "*.md" -exec grep -l "feature_name" {} \;
# Check for recent documentation updates
git log --oneline -- docs/
```

## 🚨 Critical Rules

### 1. **DevContainer-First Development**
- **ALWAYS** consider DevContainer implications for any implementation
- **ALWAYS** test changes within the DevContainer environment
- **ALWAYS** use DevContainer-specific commands: `bun run dev:*`
- **ALWAYS** verify DevContainer health: `bun run dev:check`
- **ALWAYS** ensure Docker/container compatibility for all changes

### 2. **AI Documentation Priority**
- **ALWAYS** check `docs/AI_Prompt.md` first for AI-specific guidelines
- Follow AI-specific patterns and constraints
- Use AI_Prompt.md as the primary reference for AI interactions

### 3. **Quality Checklist Compliance**
- **ALWAYS** review `docs/0_QUALITY_CHECKLIST.md` for structural changes
- Ensure all checklist items are addressed before implementation
- Follow the checklist for testing and validation

### 4. **Development Workflow Compliance**
- **ALWAYS** follow the workflow in `docs/3_DEV_FLOWS.md`
- Use the correct commands and processes
- Follow the established development patterns

### 5. **Documentation Updates**
- **ALWAYS** update relevant documentation when making changes
- Follow the development conventions in `.cursor/rules/`
- Ensure documentation reflects current implementation

### 6. **Documentation Update Process**
When asked to update documentation:
- **ALWAYS** compare documented flows with actual repository state
- **NEVER** assume anything not present in the repository
- **ALWAYS** examine actual files, scripts, and configurations
- **ALWAYS** update the document as a complete, legitimate summary
- **ALWAYS** link to actual repository files instead of explaining everything
- **ALWAYS** verify file paths and script names exist in the repository
- **ALWAYS** check `package.json` scripts, `turbo.json` config, and actual file structure
- **ALWAYS** ensure documentation matches the current implementation exactly
- **ALWAYS** check `.cursor/rules/` directory and update rules if needed to keep them synced
- **ALWAYS** verify that `.cursor/rules/` reflects current development patterns and conventions
- **ALWAYS** apply this process to ALL documentation in the `docs/` folder, not just specific files
- **ALWAYS** pay special attention to `README.md` in the root of the project as the primary entry point

## 📝 Implementation Checklist

Before implementing any change:

### ✅ **Pre-Implementation Review**
- [ ] Read all relevant documentation files
- [ ] Understand the current architecture and patterns
- [ ] Check for existing similar implementations
- [ ] Review related planning documents
- [ ] Understand the development workflow
- [ ] **CRITICAL**: Review DevContainer configuration and implications

### ✅ **Implementation Planning**
- [ ] Identify affected components and services
- [ ] Plan testing strategy based on `docs/TESTING.md`
- [ ] Consider impact on existing functionality
- [ ] Plan documentation updates
- [ ] Review quality checklist requirements
- [ ] **CRITICAL**: Plan DevContainer testing and validation

### ✅ **Post-Implementation Validation**
- [ ] Run quality checks: `bun run check:quick`
- [ ] Test local setup: `bun run local:setup`
- [ ] Test DevContainer setup: `bun run dev:setup`
- [ ] Test DevContainer health: `bun run dev:check`
- [ ] **CRITICAL**: Verify DevContainer functionality: `bun run dev:health`
- [ ] **CRITICAL**: Test in isolated DevContainer environment
- [ ] Update relevant documentation
- [ ] Follow conventional commit standards
- [ ] Ensure CI/CD pipeline compatibility

## 🎯 Documentation Categories

### **Core Development**
- `docs/3_DEV_FLOWS.md` - Development workflow and commands
- `docs/2_SETUP_FLOWS.md` - Organized setup flows
- `.cursor/rules/` - Development conventions and coding standards
- `docs/TESTING.md` - Testing strategies and patterns

### **Infrastructure & Environment**
- `docs/5_DOCKER.md` - Docker setup and configuration
- `docs/3_DEV_FLOWS.md` - CI/CD processes
- `docs/4_SCRIPTING.md` - Script development patterns

### **Quality & Build System**
- `docs/0_QUALITY_CHECKLIST.md` - Structural change requirements
- `docs/3_DEV_FLOWS.md` - Development workflow and commands
- `docs/7_BUILD_VITE_LIBRARY.md` - Build system details

### **Planning & Architecture**
- `docs/planning/` - Architectural decisions and planning
- `docs/AI_Prompt.md` - AI-specific guidelines (CRITICAL)

## 🚫 Common Mistakes to Avoid

1. **Skipping Documentation Review** - Always read relevant docs first
2. **Ignoring AI_Prompt.md** - This is the primary AI reference
3. **Not Following Quality Checklist** - Always check structural requirements
4. **Missing Development Workflow** - Follow established patterns
5. **Not Updating Documentation** - Keep docs in sync with implementation

## 💡 Best Practices

1. **Start with AI_Prompt.md** for AI-specific guidance
2. **Use the quality checklist** for structural changes
3. **Follow the development workflow** for consistency
4. **Search documentation** before implementing similar features
5. **Update documentation** as part of implementation
6. **Test thoroughly** using established patterns
7. **Follow conventional commits** for version control

## 🔄 Continuous Documentation Review

- **Before each implementation**: Review relevant documentation
- **During implementation**: Check documentation for patterns and standards
- **After implementation**: Update documentation to reflect changes
- **For new features**: Create or update planning documentation

---

**Remember**: This project has extensive, well-organized documentation. Reading and following this documentation ensures consistency, quality, and successful implementation. The documentation is your primary source of truth for all development decisions.

Read the all the docs and apply the solution according to your finding

the docs are inside docs/*
