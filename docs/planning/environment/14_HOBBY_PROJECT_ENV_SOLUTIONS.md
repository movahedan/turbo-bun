# 🎯 Hobby Project Environment Variables: Simple Solutions

> Simple, free, and effective environment variable management for hobby projects and small teams

## 📋 Table of Contents

- [Overview](#-overview)
- [Solution Comparison](#-solution-comparison)
- [Bitwarden + Bun Scripts](#-bitwarden--bun-scripts)
- [GitHub Secrets](#-github-secrets)
- [Local .env Files](#-local-env-files)
- [Implementation Guides](#-implementation-guides)
- [Development Tools](#-development-tools)
- [Best Practices](#-best-practices)

## 🎯 Overview

This document provides simple, free, and effective solutions for environment variable management in hobby projects and small teams. These solutions prioritize ease of use, cost-effectiveness, and security without the complexity of enterprise systems.

### Why Simple Solutions for Hobby Projects?

- **💰 Free**: No ongoing costs or subscription fees
- **⚡ Fast Setup**: Get started in minutes, not hours
- **🔒 Secure**: Adequate security for most hobby projects
- **🛠️ Simple**: Minimal learning curve
- **📈 Scalable**: Can grow with your project
- **🔓 No Lock-in**: Easy to migrate to other solutions later

## 📊 Solution Comparison

| Solution | Setup Time | Cost | Security | Complexity | Best For |
|----------|------------|------|----------|------------|----------|
| **Bitwarden + Bun** | 10 minutes | Free | High | Low | Personal projects |
| **GitHub Secrets** | 5 minutes | Free | High | Low | Open source projects |
| **Local .env Files** | 2 minutes | Free | Medium | None | Solo development |
| **NordPass** | 15 minutes | Free | High | Low | Team collaboration |

## 🔐 Bitwarden + Bun Scripts

### Overview

Based on the [Bitwarden approach from the web search](https://dev.to/stevengonsalvez/password-manage-your-environment-and-secrets-with-bitwarden-13n5), this solution uses Bitwarden's secure vault to store environment variables and Bun scripts to manage them.

### Why Bitwarden?

- **✅ Completely Free**: Generous free tier for personal use
- **✅ Secure**: Military-grade encryption
- **✅ Familiar**: Password manager interface
- **✅ Cross-platform**: Works on all devices
- **✅ CLI Support**: Command-line interface available

### Implementation

```typescript
// packages/bitwarden-env/src/bitwarden-manager.ts
import { $ } from "bun";

export class BitwardenEnvManager {
  async getEnvironmentVariables(environment: string): Promise<Record<string, string>> {
    try {
      // Get secure note from Bitwarden
      const result = await $`bw get item ${environment}-env`.text();
      const item = JSON.parse(result);
      
      // Parse environment variables from secure note
      const envContent = item.notes;
      const variables: Record<string, string> = {};
      
      envContent.split('\n').forEach(line => {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=', 2);
          variables[key.trim()] = value.trim();
        }
      });
      
      return variables;
    } catch (error) {
      console.error(`Failed to get environment variables for ${environment}:`, error);
      throw error;
    }
  }
  
  async setEnvironmentVariables(environment: string, variables: Record<string, string>): Promise<void> {
    // Convert variables to env format
    const envContent = Object.entries(variables)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    try {
      // Create or update secure note in Bitwarden
      await $`bw create item --type=secure-note --name="${environment}-env" --notes="${envContent}"`;
      console.log(`✅ Set environment variables for ${environment}`);
    } catch (error) {
      console.error(`Failed to set environment variables for ${environment}:`, error);
      throw error;
    }
  }
  
  async listEnvironments(): Promise<string[]> {
    try {
      const result = await $`bw list items --search="-env"`.text();
      const items = JSON.parse(result);
      
      return items
        .filter((item: any) => item.name.endsWith('-env'))
        .map((item: any) => item.name.replace('-env', ''));
    } catch (error) {
      console.error('Failed to list environments:', error);
      return [];
    }
  }
  
  async deleteEnvironment(environment: string): Promise<void> {
    try {
      const result = await $`bw get item "${environment}-env"`.text();
      const item = JSON.parse(result);
      
      await $`bw delete item ${item.id}`;
      console.log(`✅ Deleted environment ${environment}`);
    } catch (error) {
      console.error(`Failed to delete environment ${environment}:`, error);
      throw error;
    }
  }
}
```

### CLI Tools

```typescript
// packages/bitwarden-env-cli/src/cli.ts
import { Command } from 'commander';
import { BitwardenEnvManager } from '@repo/bitwarden-env';

const program = new Command();
const bitwardenEnv = new BitwardenEnvManager();

program
  .name('bitwarden-env')
  .description('Bitwarden environment variable management')
  .version('1.0.0');

program
  .command('login')
  .description('Login to Bitwarden')
  .action(async () => {
    try {
      await $`bw login`;
      console.log('✅ Logged in to Bitwarden');
    } catch (error) {
      console.error('❌ Login failed:', error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available environments')
  .action(async () => {
    try {
      const environments = await bitwardenEnv.listEnvironments();
      console.table(environments.map(env => ({ environment: env })));
    } catch (error) {
      console.error('❌ Failed to list environments:', error);
      process.exit(1);
    }
  });

program
  .command('get <environment>')
  .description('Get environment variables from Bitwarden')
  .option('-f, --format <format>', 'Output format', 'json')
  .action(async (environment, options) => {
    try {
      const variables = await bitwardenEnv.getEnvironmentVariables(environment);
      
      if (options.format === 'env') {
        Object.entries(variables).forEach(([key, value]) => {
          console.log(`${key}=${value}`);
        });
      } else {
        console.log(JSON.stringify(variables, null, 2));
      }
    } catch (error) {
      console.error(`❌ Failed to get variables for ${environment}:`, error);
      process.exit(1);
    }
  });

program
  .command('set <environment> <file>')
  .description('Set environment variables from file to Bitwarden')
  .action(async (environment, file) => {
    try {
      const fileContent = await Bun.file(file).text();
      const variables: Record<string, string> = {};
      
      fileContent.split('\n').forEach(line => {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=', 2);
          variables[key.trim()] = value.trim();
        }
      });
      
      await bitwardenEnv.setEnvironmentVariables(environment, variables);
      console.log(`✅ Set ${Object.keys(variables).length} variables for ${environment}`);
    } catch (error) {
      console.error(`❌ Failed to set variables for ${environment}:`, error);
      process.exit(1);
    }
  });

program
  .command('delete <environment>')
  .description('Delete environment from Bitwarden')
  .action(async (environment) => {
    try {
      await bitwardenEnv.deleteEnvironment(environment);
      console.log(`✅ Deleted environment ${environment}`);
    } catch (error) {
      console.error(`❌ Failed to delete environment ${environment}:`, error);
      process.exit(1);
    }
  });

program.parse();
```

### Setup Guide

```bash
# 1. Install Bitwarden CLI
brew install bitwarden-cli

# 2. Login to Bitwarden
bw login

# 3. Create your first environment
echo "DATABASE_URL=localhost:5432/dev
API_KEY=my-dev-key
DEBUG=true" > .env.development

# 4. Store in Bitwarden
bw create item --type=secure-note --name="development-env" --notes="$(cat .env.development)"

# 5. Use in your project
bun run bitwarden-env get development
```

### CI/CD Integration

Bitwarden + Bun is **fully compatible with CI/CD pipelines** and works excellently in production environments.

#### GitHub Actions Example

```yaml
# .github/workflows/bitwarden-env.yml
name: Bitwarden Environment Sync

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  sync-environments:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Setup Bitwarden CLI
        run: |
          curl -L -o bw.zip "https://vault.bitwarden.com/download/?platform=cli&app=cli"
          unzip bw.zip
          sudo mv bw /usr/local/bin/
          
      - name: Login to Bitwarden
        run: |
          echo ${{ secrets.BW_CLIENT_SECRET }} | bw login --apikey
          bw unlock --passwordenv BW_MASTER_PASSWORD
        env:
          BW_CLIENT_ID: ${{ secrets.BW_CLIENT_ID }}
          BW_CLIENT_SECRET: ${{ secrets.BW_CLIENT_SECRET }}
          BW_MASTER_PASSWORD: ${{ secrets.BW_MASTER_PASSWORD }}
          
      - name: Load Environment Variables
        run: |
          bw get item development-env | jq -r '.notes' > .env.development
          bw get item production-env | jq -r '.notes' > .env.production
          
      - name: Run Tests
        run: |
          bun run test
        env:
          NODE_ENV: test
          
      - name: Deploy
        run: |
          bun run build
          bun run deploy
        env:
          NODE_ENV: production
```

#### Required CI/CD Secrets

```bash
# Add these secrets to your CI/CD platform
BW_CLIENT_ID=your-client-id
BW_CLIENT_SECRET=your-client-secret
BW_MASTER_PASSWORD=your-master-password
```

#### Key CI/CD Benefits

- **🔐 Secure**: Secrets never touch disk in plain text
- **⚡ Fast**: Bun + Bitwarden CLI is very fast
- **🔄 Reliable**: Bitwarden has excellent uptime
- **📊 Audit Trail**: All access is logged
- **🛡️ Zero Trust**: No permanent credentials needed
- **🌐 Cross-Platform**: Works on any CI/CD platform

#### Other CI/CD Platforms

**GitLab CI**:
```yaml
variables:
  BW_CLIENT_ID: $BW_CLIENT_ID
  BW_CLIENT_SECRET: $BW_CLIENT_SECRET
  BW_MASTER_PASSWORD: $BW_MASTER_PASSWORD

before_script:
  - curl -L -o bw.zip "https://vault.bitwarden.com/download/?platform=cli&app=cli"
  - unzip bw.zip
  - echo $BW_CLIENT_SECRET | ./bw login --apikey
  - echo $BW_MASTER_PASSWORD | ./bw unlock
```

**CircleCI**:
```yaml
steps:
  - run:
      name: Setup Bitwarden
      command: |
        curl -L -o bw.zip "https://vault.bitwarden.com/download/?platform=cli&app=cli"
        unzip bw.zip
        echo $BW_CLIENT_SECRET | ./bw login --apikey
        echo $BW_MASTER_PASSWORD | ./bw unlock
```

**Azure DevOps**:
```yaml
steps:
- script: |
    curl -L -o bw.zip "https://vault.bitwarden.com/download/?platform=cli&app=cli"
    unzip bw.zip
    echo $(BW_CLIENT_SECRET) | ./bw login --apikey
    echo $(BW_MASTER_PASSWORD) | ./bw unlock
  env:
    BW_CLIENT_ID: $(BW_CLIENT_ID)
    BW_CLIENT_SECRET: $(BW_CLIENT_SECRET)
    BW_MASTER_PASSWORD: $(BW_MASTER_PASSWORD)
```

## 🔑 GitHub Secrets

### Overview

GitHub Secrets provides a simple way to store environment variables for your projects, especially useful for open source projects and CI/CD pipelines.

### Why GitHub Secrets?

- **✅ Free for Public Repos**: No cost for public repositories
- **✅ Built into GitHub**: No external services needed
- **✅ Version Controlled**: Changes are tracked
- **✅ Team Friendly**: Easy to share with collaborators
- **✅ CI/CD Integration**: Works seamlessly with GitHub Actions

### Implementation

```typescript
// packages/github-secrets/src/github-secrets-manager.ts
import { $ } from "bun";

export class GitHubSecretsManager {
  async getEnvironmentVariables(): Promise<Record<string, string>> {
    try {
      // Note: GitHub Secrets are only available in CI/CD
      // This is for local development simulation
      const variables: Record<string, string> = {};
      
      // Read from local .env file for development
      const envFile = await Bun.file('.env.local').text();
      
      envFile.split('\n').forEach(line => {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=', 2);
          variables[key.trim()] = value.trim();
        }
      });
      
      return variables;
    } catch (error) {
      console.error('Failed to get environment variables:', error);
      throw error;
    }
  }
  
  async setSecret(name: string, value: string): Promise<void> {
    try {
      await $`gh secret set ${name} --body "${value}"`;
      console.log(`✅ Set secret ${name}`);
    } catch (error) {
      console.error(`Failed to set secret ${name}:`, error);
      throw error;
    }
  }
  
  async listSecrets(): Promise<string[]> {
    try {
      const result = await $`gh secret list`.text();
      const lines = result.split('\n').filter(line => line.trim());
      
      return lines.map(line => {
        const parts = line.split('\t');
        return parts[0];
      });
    } catch (error) {
      console.error('Failed to list secrets:', error);
      return [];
    }
  }
  
  async deleteSecret(name: string): Promise<void> {
    try {
      await $`gh secret delete ${name} --yes`;
      console.log(`✅ Deleted secret ${name}`);
    } catch (error) {
      console.error(`Failed to delete secret ${name}:`, error);
      throw error;
    }
  }
}
```

### GitHub Actions Integration

```yaml
# .github/workflows/env-sync.yml
name: Environment Sync

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  sync-environments:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Load environment variables
        run: |
          bun run env:github:load
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Run tests
        run: |
          bun run test
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          API_KEY: ${{ secrets.API_KEY }}
```

### Setup Guide

```bash
# 1. Install GitHub CLI
brew install gh

# 2. Login to GitHub
gh auth login

# 3. Set secrets
gh secret set DATABASE_URL --body "localhost:5432/dev"
gh secret set API_KEY --body "my-dev-key"

# 4. List secrets
gh secret list

# 5. Use in your project
bun run env:github:load
```

## 📁 Local .env Files

### Overview

The simplest solution - just use local `.env` files with proper `.gitignore` configuration. Perfect for solo development and simple projects.

### Why Local Files?

- **✅ Zero Setup**: Just create files
- **✅ No Dependencies**: No external services
- **✅ Fast**: No network calls
- **✅ Familiar**: Standard approach
- **✅ Free**: No costs whatsoever

### Implementation

```typescript
// packages/local-env/src/local-env-manager.ts
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export class LocalEnvManager {
  private envDir: string;
  
  constructor(envDir: string = '.') {
    this.envDir = envDir;
  }
  
  async getEnvironmentVariables(environment: string): Promise<Record<string, string>> {
    const envFile = join(this.envDir, `.env.${environment}`);
    
    if (!existsSync(envFile)) {
      console.warn(`Environment file ${envFile} not found`);
      return {};
    }
    
    try {
      const content = readFileSync(envFile, 'utf8');
      const variables: Record<string, string> = {};
      
      content.split('\n').forEach(line => {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=', 2);
          variables[key.trim()] = value.trim();
        }
      });
      
      return variables;
    } catch (error) {
      console.error(`Failed to read environment file ${envFile}:`, error);
      throw error;
    }
  }
  
  async setEnvironmentVariables(environment: string, variables: Record<string, string>): Promise<void> {
    const envFile = join(this.envDir, `.env.${environment}`);
    
    try {
      const content = Object.entries(variables)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');
      
      writeFileSync(envFile, content, 'utf8');
      console.log(`✅ Set environment variables for ${environment}`);
    } catch (error) {
      console.error(`Failed to write environment file ${envFile}:`, error);
      throw error;
    }
  }
  
  async listEnvironments(): Promise<string[]> {
    try {
      const files = await Bun.file(this.envDir).list();
      return files
        .filter(file => file.startsWith('.env.') && !file.endsWith('.example'))
        .map(file => file.replace('.env.', ''));
    } catch (error) {
      console.error('Failed to list environments:', error);
      return [];
    }
  }
  
  async createEnvironment(environment: string, variables: Record<string, string> = {}): Promise<void> {
    await this.setEnvironmentVariables(environment, variables);
  }
  
  async deleteEnvironment(environment: string): Promise<void> {
    const envFile = join(this.envDir, `.env.${environment}`);
    
    try {
      await Bun.remove(envFile);
      console.log(`✅ Deleted environment ${environment}`);
    } catch (error) {
      console.error(`Failed to delete environment ${environment}:`, error);
      throw error;
    }
  }
}
```

### CLI Tools

```typescript
// packages/local-env-cli/src/cli.ts
import { Command } from 'commander';
import { LocalEnvManager } from '@repo/local-env';

const program = new Command();
const localEnv = new LocalEnvManager();

program
  .name('local-env')
  .description('Local environment file management')
  .version('1.0.0');

program
  .command('list')
  .description('List available environments')
  .action(async () => {
    try {
      const environments = await localEnv.listEnvironments();
      console.table(environments.map(env => ({ environment: env })));
    } catch (error) {
      console.error('❌ Failed to list environments:', error);
      process.exit(1);
    }
  });

program
  .command('get <environment>')
  .description('Get environment variables from local file')
  .option('-f, --format <format>', 'Output format', 'json')
  .action(async (environment, options) => {
    try {
      const variables = await localEnv.getEnvironmentVariables(environment);
      
      if (options.format === 'env') {
        Object.entries(variables).forEach(([key, value]) => {
          console.log(`${key}=${value}`);
        });
      } else {
        console.log(JSON.stringify(variables, null, 2));
      }
    } catch (error) {
      console.error(`❌ Failed to get variables for ${environment}:`, error);
      process.exit(1);
    }
  });

program
  .command('set <environment> <file>')
  .description('Set environment variables from file')
  .action(async (environment, file) => {
    try {
      const fileContent = await Bun.file(file).text();
      const variables: Record<string, string> = {};
      
      fileContent.split('\n').forEach(line => {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=', 2);
          variables[key.trim()] = value.trim();
        }
      });
      
      await localEnv.setEnvironmentVariables(environment, variables);
      console.log(`✅ Set ${Object.keys(variables).length} variables for ${environment}`);
    } catch (error) {
      console.error(`❌ Failed to set variables for ${environment}:`, error);
      process.exit(1);
    }
  });

program
  .command('create <environment>')
  .description('Create new environment')
  .action(async (environment) => {
    try {
      await localEnv.createEnvironment(environment);
      console.log(`✅ Created environment ${environment}`);
    } catch (error) {
      console.error(`❌ Failed to create environment ${environment}:`, error);
      process.exit(1);
    }
  });

program
  .command('delete <environment>')
  .description('Delete environment')
  .action(async (environment) => {
    try {
      await localEnv.deleteEnvironment(environment);
      console.log(`✅ Deleted environment ${environment}`);
    } catch (error) {
      console.error(`❌ Failed to delete environment ${environment}:`, error);
      process.exit(1);
    }
  });

program.parse();
```

### Setup Guide

```bash
# 1. Create environment files
echo "DATABASE_URL=localhost:5432/dev" > .env.development
echo "API_KEY=my-dev-key" >> .env.development

echo "DATABASE_URL=localhost:5432/prod" > .env.production
echo "API_KEY=my-prod-key" >> .env.production

# 2. Add to .gitignore
echo ".env*" >> .gitignore
echo "!.env.example" >> .gitignore

# 3. Create example file
cp .env.development .env.example

# 4. Use in your project
bun run local-env get development
```

## 🛠️ Implementation Guides

### Quick Start: Choose Your Solution

#### For Personal Projects → **Bitwarden + Bun**

```bash
# Install Bitwarden CLI
brew install bitwarden-cli

# Login and setup
bw login
bun run bitwarden-env setup

# Use in your project
bun run bitwarden-env get development
```

#### For Open Source Projects → **GitHub Secrets**

```bash
# Install GitHub CLI
brew install gh

# Login and setup
gh auth login
gh secret set DATABASE_URL --body "localhost:5432/dev"

# Use in CI/CD
# Secrets are automatically available in GitHub Actions
```

#### For Solo Development → **Local .env Files**

```bash
# Create environment files
echo "DATABASE_URL=localhost:5432/dev" > .env.development
echo "API_KEY=my-dev-key" >> .env.development

# Use in your project
bun run local-env get development
```

### Integration with Your Project

```typescript
// packages/env-loader/src/env-loader.ts
import { BitwardenEnvManager } from '@repo/bitwarden-env';
import { GitHubSecretsManager } from '@repo/github-secrets';
import { LocalEnvManager } from '@repo/local-env';

export class EnvironmentLoader {
  private bitwardenEnv: BitwardenEnvManager;
  private githubSecrets: GitHubSecretsManager;
  private localEnv: LocalEnvManager;
  
  constructor() {
    this.bitwardenEnv = new BitwardenEnvManager();
    this.githubSecrets = new GitHubSecretsManager();
    this.localEnv = new LocalEnvManager();
  }
  
  async loadEnvironment(environment: string, provider: 'bitwarden' | 'github' | 'local' = 'local'): Promise<Record<string, string>> {
    try {
      let variables: Record<string, string>;
      
      switch (provider) {
        case 'bitwarden':
          variables = await this.bitwardenEnv.getEnvironmentVariables(environment);
          break;
        case 'github':
          variables = await this.githubSecrets.getEnvironmentVariables();
          break;
        case 'local':
        default:
          variables = await this.localEnv.getEnvironmentVariables(environment);
          break;
      }
      
      // Set environment variables
      Object.entries(variables).forEach(([key, value]) => {
        process.env[key] = value;
      });
      
      console.log(`✅ Loaded ${Object.keys(variables).length} variables for ${environment} using ${provider}`);
      return variables;
    } catch (error) {
      console.error(`❌ Failed to load environment variables:`, error);
      throw error;
    }
  }
}
```

## 🛠️ Development Tools

### VS Code Extension for All Solutions

```typescript
// packages/vscode-env-extension/src/extension.ts
import * as vscode from 'vscode';
import { EnvironmentLoader } from '@repo/env-loader';

export class EnvExtension {
  private envLoader: EnvironmentLoader;
  
  constructor() {
    this.envLoader = new EnvironmentLoader();
  }
  
  activate(context: vscode.ExtensionContext) {
    // Register commands
    context.subscriptions.push(
      vscode.commands.registerCommand('env.load', this.loadEnvironment.bind(this)),
      vscode.commands.registerCommand('env.list', this.listEnvironments.bind(this)),
      vscode.commands.registerCommand('env.create', this.createEnvironment.bind(this)),
    );
    
    // Register status bar
    this.registerStatusBarItem();
  }
  
  private async loadEnvironment(): Promise<void> {
    const provider = await vscode.window.showQuickPick(['local', 'bitwarden', 'github'], {
      placeHolder: 'Select environment provider'
    });
    
    if (!provider) return;
    
    const environment = await vscode.window.showInputBox({
      prompt: 'Environment name',
      value: 'development'
    });
    
    if (!environment) return;
    
    try {
      const variables = await this.envLoader.loadEnvironment(environment, provider as any);
      
      // Show variables in a new document
      const document = await vscode.workspace.openTextDocument({
        content: JSON.stringify(variables, null, 2),
        language: 'json',
      });
      
      await vscode.window.showTextDocument(document);
      vscode.window.showInformationMessage(`✅ Loaded ${Object.keys(variables).length} variables`);
    } catch (error) {
      vscode.window.showErrorMessage(`❌ Failed to load environment: ${error}`);
    }
  }
  
  private registerStatusBarItem(): void {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.text = '$(gear) Environment: local';
    statusBarItem.command = 'env.load';
    statusBarItem.show();
  }
}
```

### Package.json Scripts

```json
{
  "scripts": {
    "env:bitwarden:setup": "bun run packages/bitwarden-env-cli/src/cli.ts setup",
    "env:bitwarden:get": "bun run packages/bitwarden-env-cli/src/cli.ts get",
    "env:bitwarden:set": "bun run packages/bitwarden-env-cli/src/cli.ts set",
    
    "env:github:setup": "bun run packages/github-secrets-cli/src/cli.ts setup",
    "env:github:get": "bun run packages/github-secrets-cli/src/cli.ts get",
    "env:github:set": "bun run packages/github-secrets-cli/src/cli.ts set",
    
    "env:local:setup": "bun run packages/local-env-cli/src/cli.ts setup",
    "env:local:get": "bun run packages/local-env-cli/src/cli.ts get",
    "env:local:set": "bun run packages/local-env-cli/src/cli.ts set",
    
    "env:load": "bun run packages/env-loader/src/loader.ts"
  }
}
```

## 📋 Best Practices

### 1. Security Best Practices

```typescript
const securityBestPractices = {
  // Never commit secrets
  gitignore: [
    '.env*',
    '!.env.example',
    'secrets.json',
    '*.key',
    '*.pem'
  ],
  
  // Use environment-specific files
  naming: {
    development: '.env.development',
    staging: '.env.staging',
    production: '.env.production',
    test: '.env.test'
  },
  
  // Validate environment variables
  validation: {
    required: ['DATABASE_URL', 'API_KEY'],
    optional: ['DEBUG', 'LOG_LEVEL'],
    sensitive: ['API_KEY', 'SECRET_KEY', 'PASSWORD']
  }
};
```

### 2. Development Best Practices

```typescript
const developmentBestPractices = {
  // Use TypeScript for type safety
  typescript: {
    strict: true,
    noImplicitAny: true,
    strictNullChecks: true
  },
  
  // Error handling
  errorHandling: {
    graceful: true,
    logging: true,
    fallbacks: true
  },
  
  // Testing
  testing: {
    unitTests: true,
    integrationTests: true,
    environmentTests: true
  }
};
```

### 3. Operational Best Practices

```typescript
const operationalBestPractices = {
  // Documentation
  documentation: {
    readme: true,
    setupGuide: true,
    troubleshooting: true
  },
  
  // Monitoring
  monitoring: {
    healthChecks: true,
    logging: true,
    alerts: false  // Not needed for hobby projects
  },
  
  // Backup
  backup: {
    regularBackups: true,
    versionControl: true,
    disasterRecovery: false  // Not needed for hobby projects
  }
};
```

### 4. Migration Strategy

```typescript
const migrationStrategy = {
  // Start simple
  phase1: {
    solution: 'local-env-files',
    duration: '1-2 weeks',
    goal: 'Get started quickly'
  },
  
  // Add security
  phase2: {
    solution: 'bitwarden-or-github',
    duration: '1-2 weeks',
    goal: 'Improve security'
  },
  
  // Scale up
  phase3: {
    solution: 'enterprise-solution',
    duration: '1-2 months',
    goal: 'Enterprise features'
  }
};
```

## 🚀 Quick Start Checklist

### For Personal Projects

- [ ] Install Bitwarden CLI: `brew install bitwarden-cli`
- [ ] Login to Bitwarden: `bw login`
- [ ] Create environment: `bw create item --type=secure-note --name="dev-env" --notes="DATABASE_URL=localhost:5432/dev"`
- [ ] Use in project: `bun run bitwarden-env get dev`

### For Open Source Projects

- [ ] Install GitHub CLI: `brew install gh`
- [ ] Login to GitHub: `gh auth login`
- [ ] Set secrets: `gh secret set DATABASE_URL --body "localhost:5432/dev"`
- [ ] Use in CI/CD: Secrets are automatically available

### For Solo Development

- [ ] Create environment files: `echo "DATABASE_URL=localhost:5432/dev" > .env.development`
- [ ] Add to .gitignore: `echo ".env*" >> .gitignore`
- [ ] Create example: `cp .env.development .env.example`
- [ ] Use in project: `bun run local-env get development`

## 🔗 Related Documentation

- [Environment Variables Management](./9_ENVIRONMENT_VARIABLES.md) - Core environment variable system
- [Enterprise Developer Experience](./10_ENTERPRISE_ENV_DEVELOPER_EXPERIENCE.md) - Developer experience design
- [Enterprise Implementation](./11_ENTERPRISE_ENV_IMPLEMENTATION.md) - Vercel-based implementation
- [HashiCorp Vault Implementation](./13_HASHICORP_VAULT_ZITADEL_IMPLEMENTATION.md) - Enterprise Vault + ZITADEL

---

**Hobby Project Solutions**: This guide provides simple, free, and effective solutions for environment variable management in hobby projects and small teams, prioritizing ease of use and cost-effectiveness. 