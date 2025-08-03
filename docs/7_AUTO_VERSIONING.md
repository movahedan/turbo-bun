# 🏷️ Auto-Versioning System

> **Automated version management that respects existing changesets and creates new ones for affected packages**

## 👉 Before anything!
For regular development:
```
1. Create a PR 
2. Merge the PR
3. Trigger the `Version` workflow manually
  3.1. [auto] Patch the root package.json separately
  3.2. [auto] Patch all the affected package.json with changesets
  3.3. [auto] Commit all the CHANGELOGS and package.json
  3.4. [auto] Tag version to the commit
  4.5. [auto] Push everything to origin
  3.4. [auto] Attach affected packages for github actions!
```

## 🔄 Process Overview

The versioning system uses a single automated approach that:

1. **Respects existing changesets** - If users created manual changesets, they're used
2. **Creates automatic changesets** - For affected packages without existing changesets
3. **Runs versioning workflow** - Generates changelog, commits, and tags

### **Regular Development**
```bash
# 1. Make your changes
# 2. Create PR and merge it
git add .
git commit -m "feat(ui): add new component"
git push origin feature/new-feature
# Create PR on GitHub and merge it

# 3. Go to GitHub Actions → Version workflow
# 4. Click "Run workflow" to trigger versioning
```

### **With Manual Changesets**
```bash
# 1. Create manual changeset (optional)
bun run version:add
# Select packages and version bump types

# 2. Create PR and merge it
git add .
git commit -m "feat: add manual changeset"
git push origin feature/custom-versioning
# Create PR on GitHub and merge it

# 3. Go to GitHub Actions → Version workflow
# 4. Click "Run workflow" to trigger versioning
```

## ⚙️ GitHub Actions Workflow

### **Version.yml** - On-Demand Versioning
- **Trigger**: Manual via GitHub Actions button
- **What it does**:
  1. Analyzes affected packages from last version tag
  2. Uses existing changesets if available
  3. Creates automated changesets for packages without changesets
  4. Generates changelog and commits changes
  5. Creates Git tag for the new version
  6. Pushes to main branch

## 🔬 Technical Implementation: version-commit.ts

> **📁 Source Code**: [`scripts/version-commit.ts`](../../scripts/version-commit.ts)

The `version-commit.ts` script orchestrates the entire auto-versioning process through several key phases:

### **🔐 Git Authentication Setup**
The script first configures Git authentication for GitHub Actions, setting up the bot user credentials and remote URL with access token. This ensures the script can push changes and tags to the repository when running in CI/CD environments.

**Technical Details:**
- Uses `github-actions[bot]` as the Git user with `github-actions[bot]@users.noreply.github.com` email
- Constructs remote URL with format: `https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git`
- Masks sensitive tokens in logs for security
- Only configures authentication when running in GitHub Actions environment

### **📦 Affected Package Detection**
Using the last version tag SHA as the baseline, the script analyzes which packages have been modified since the last release. It leverages the monorepo's affected package detection to identify packages that need version bumps, ensuring only changed packages are versioned.

**Technical Details:**
- `getLastVersionTagSha()`: Retrieves the SHA of the most recent version tag (e.g., `v1.2.3`)
- Falls back to initial commit SHA if no version tags exist
- Uses `getAffectedPackages(lastVersionTagSha)` to detect packages changed since last release
- Filters packages based on monorepo dependency graph and file changes

### **📋 Changeset Management**
The script reads existing manual changesets from the `.changeset` directory and respects them. For packages without existing changesets, it automatically creates new changesets with "patch" version bumps. This hybrid approach allows developers to manually specify breaking changes while automating routine updates.

**Technical Details:**
- `readChangesets()`: Scans `.changeset/` directory for `.md` files (excluding `README.md`)
- `parseChangeset()`: Extracts package names and version types from changeset files
- `createChangeset()`: Generates automated changesets with format:
  ```yaml
  ---
  "package-name": patch
  ---
  
  Automated version bump for package-name and other affected packages on root version tag: v1.2.3.
  ```
- Uses timestamp-based filenames: `auto-${Date.now()}.md`

### **🏷️ Version Bumping & Tagging**
The root package.json version is incremented by one patch level, and a new Git tag is created with the version prefix. The script ensures no duplicate tags exist and handles the initial commit scenario gracefully by falling back to the repository's first commit.

**Technical Details:**
- Parses current version: `packageJson.version.split(".").map(Number)`
- Increments patch version: `${major}.${minor}.${patch + 1}`
- `tagVersion()`: Creates annotated Git tags with format `v${version}`
- Validates tag uniqueness before creation
- Uses `bun biome check --write` to format updated package.json

### **🚀 Git Operations & Output**
Finally, the script pushes the version tag and any pending commits to the main branch. It also attaches the list of affected packages to GitHub Actions outputs for downstream deployment workflows, enabling automated deployment of only the changed packages.

**Technical Details:**
- `git rev-list --count origin/main..HEAD`: Checks for unpushed commits
- `bunx @changesets/cli version`: Generates changelog and updates package versions
- GitHub Actions output format: `${outputId}<<EOF\n${JSON.stringify(affectedPackages)}\nEOF\n`
- Writes to `process.env.GITHUB_OUTPUT` for downstream workflow consumption
- Supports dry-run mode for testing without actual Git operations

### **🐛 Debugging Version Tags**

When debugging versioning issues, you may need to remove tags from origin to re-try the process:

**Remove Both Local and Remote Tags:**
```bash
# Remove local tag
git tag -d v1.2.3
# Remove remote tag
git push origin --delete v1.2.3

bun run version:commit --dry-run # try again github actions in cloud
```


**💡 Pro Tip**: Always remove both local and remote tags when debugging to ensure a clean slate for re-testing the versioning process.

---

**💡 Pro Tip**: [`read the source code!`](../scripts/version-commit.ts)