# 🏢 Enterprise Environment Variables: Implementation Guide

> Complete implementation guide for enterprise-grade environment variable management in Turboobun monorepo

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture Integration](#-architecture-integration)
- [Implementation Strategy](#-implementation-strategy)
- [Vercel Integration](#-vercel-integration)
- [ZITADEL Integration](#-zitadel-integration)
- [Development Tools](#-development-tools)
- [CI/CD Integration](#-cicd-integration)
- [Security Implementation](#-security-implementation)
- [Migration Guide](#-migration-guide)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

This document provides a complete implementation guide for enterprise environment variable management in our Turboobun monorepo, integrating with Vercel, ZITADEL, and our existing development tools.

### Key Integration Points

- **Vercel Environment Management**: Based on [Antler Digital's Vercel + Bun approach](https://antler.digital/blog/using-bun-and-vercel-to-manage-envs-across-teams)
- **ZITADEL Identity Provider**: Unified authentication and authorization
- **Turboobun Monorepo**: Leveraging our existing Bun + Turbo infrastructure
- **DevContainer Integration**: Seamless development experience
- **CI/CD Pipeline**: Automated environment management

## 🏗️ Architecture Integration

### Current Monorepo Structure

```typescript
// Current Turboobun structure with environment management
interface TurboobunWithEnvManagement {
  applications: {
    admin: { port: 3001; framework: 'React + Vite' };
    storefront: { port: 3002; framework: 'Next.js 15' };
    api: { port: 3003; framework: 'Express + TypeScript' };
  };
  
  packages: {
    '@repo/ui': 'Shared UI components';
    '@repo/utils': 'Utility functions';
    '@repo/logger': 'Logging utilities';
    '@repo/test-preset': 'Testing configurations';
    '@repo/env-manager': 'NEW: Environment management';
    '@repo/auth-provider': 'NEW: Authentication provider';
  };
  
  tools: {
    bun: 'Package manager and runtime';
    turbo: 'Build system and task orchestration';
    biome: 'Code formatting and linting';
    jest: 'Testing framework';
    vercel: 'NEW: Environment management';
    zitadel: 'NEW: Identity provider';
  };
}
```

### Enhanced Architecture

```typescript
// Enhanced architecture with enterprise environment management
interface EnhancedTurboobunArchitecture {
  // Core Infrastructure
  infrastructure: {
    vercel: {
      environments: ['development', 'preview', 'production'];
      projects: ['admin', 'storefront', 'api'];
      teams: ['frontend', 'backend', 'devops'];
    };
    
    zitadel: {
      organizations: ['turboobun-dev', 'turboobun-staging', 'turboobun-prod'];
      projects: ['admin-app', 'storefront-app', 'api-service'];
      environments: ['dev', 'staging', 'production'];
    };
  };
  
  // Development Experience
  developerExperience: {
    authentication: 'Single sign-on with ZITADEL';
    environmentSelection: 'Visual environment picker';
    variableInjection: 'Automatic environment variable loading';
    featureFlags: 'Runtime feature flag management';
  };
  
  // Security & Compliance
  security: {
    zeroTrust: 'No direct access to production secrets';
    auditLogging: 'Comprehensive access logging';
    secretRotation: 'Automatic secret rotation';
    compliance: 'SOX, GDPR, HIPAA compliance';
  };
}
```

## 🚀 Implementation Strategy

### Phase 1: Vercel Environment Management

Based on [Antler Digital's approach](https://antler.digital/blog/using-bun-and-vercel-to-manage-envs-across-teams), implement Vercel CLI integration:

```typescript
// scripts/env/vercel-manager.ts
import { $ } from "bun";
import { parseArgs } from "util";

interface VercelEnvManager {
  // Pull environment variables from Vercel
  pull: (environment: string, file?: string) => Promise<void>;
  
  // Add environment variables to Vercel
  add: (variables: Record<string, string>, environment: string) => Promise<void>;
  
  // Remove environment variables from Vercel
  remove: (variables: string[], environment: string) => Promise<void>;
  
  // Remove all environment variables from Vercel
  removeAll: (environment: string) => Promise<void>;
  
  // Update environment variables in Vercel
  update: (variables: Record<string, string>, environment: string) => Promise<void>;
}

export class VercelEnvManager {
  async pull(environment: string = 'development', file?: string): Promise<void> {
    const outputFile = file || `.env.${environment}`;
    await $`vercel env pull --environment=${environment} ${outputFile}`;
  }
  
  async add(variables: Record<string, string>, environment: string = 'development'): Promise<void> {
    for (const [key, value] of Object.entries(variables)) {
      const tempFile = `temp-${key}.env`;
      await Bun.write(tempFile, `${key}=${value}`);
      await $`vercel env add ${key} ${environment} < ${tempFile}`;
      await Bun.remove(tempFile);
    }
  }
  
  async remove(variables: string[], environment: string = 'development'): Promise<void> {
    for (const variable of variables) {
      try {
        await $`vercel env rm ${variable} ${environment} --yes`;
      } catch (error) {
        console.error(`Error removing ${variable}: ${error}`);
      }
    }
  }
  
  async removeAll(environment: string = 'development'): Promise<void> {
    const tempFile = '.env.removing';
    await $`vercel env pull --environment=${environment} ${tempFile}`;
    
    const content = await Bun.file(tempFile).text();
    const lines = content.split('\n').filter(line => line.includes('='));
    
    const protectedVariables = ['NX_DAEMON', 'TURBO_', 'VERCEL_'];
    
    for (const line of lines) {
      const [key] = line.split('=');
      if (!protectedVariables.some(prefix => key.startsWith(prefix))) {
        try {
          await $`vercel env rm ${key} ${environment} --yes`;
          console.log(`Removed ${key} from ${environment}`);
        } catch (error) {
          console.error(`Error removing ${key}: ${error}`);
        }
      }
    }
    
    await Bun.remove(tempFile);
  }
}
```

### Phase 2: ZITADEL Integration

```typescript
// packages/auth-provider/src/zitadel-client.ts
import { ZitadelClient } from '@zitadel/nodejs-sdk';

interface ZitadelConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
}

export class ZitadelAuthProvider {
  private client: ZitadelClient;
  
  constructor(config: ZitadelConfig) {
    this.client = new ZitadelClient(config);
  }
  
  async authenticate(): Promise<AuthResult> {
    // Implement OIDC authentication flow
    const authResult = await this.client.authenticate();
    return authResult;
  }
  
  async getEnvironmentAccess(userId: string): Promise<EnvironmentAccess[]> {
    // Get user's environment access based on ZITADEL permissions
    const permissions = await this.client.getUserPermissions(userId);
    return this.mapPermissionsToEnvironments(permissions);
  }
  
  async getEnvironmentVariables(environment: string): Promise<Record<string, string>> {
    // Get environment variables from ZITADEL metadata
    const metadata = await this.client.getProjectMetadata(environment);
    return this.extractEnvironmentVariables(metadata);
  }
}
```

### Phase 3: Development Tools Integration

```typescript
// packages/env-manager/src/development-tools.ts
import { VercelEnvManager } from './vercel-manager';
import { ZitadelAuthProvider } from '@repo/auth-provider';

export class DevelopmentTools {
  private vercelManager: VercelEnvManager;
  private authProvider: ZitadelAuthProvider;
  
  constructor() {
    this.vercelManager = new VercelEnvManager();
    this.authProvider = new ZitadelAuthProvider({
      issuer: process.env.ZITADEL_ISSUER!,
      clientId: process.env.ZITADEL_CLIENT_ID!,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET!,
      scopes: ['openid', 'profile', 'email', 'custom:env-access'],
    });
  }
  
  async setupDevelopmentEnvironment(): Promise<void> {
    // 1. Authenticate with ZITADEL
    const authResult = await this.authProvider.authenticate();
    
    // 2. Get user's environment access
    const environments = await this.authProvider.getEnvironmentAccess(authResult.userId);
    
    // 3. Let user select environment
    const selectedEnv = await this.promptEnvironmentSelection(environments);
    
    // 4. Load environment variables
    const variables = await this.authProvider.getEnvironmentVariables(selectedEnv);
    
    // 5. Sync with Vercel
    await this.vercelManager.add(variables, selectedEnv);
    
    console.log(`✅ Environment ${selectedEnv} loaded successfully`);
  }
  
  private async promptEnvironmentSelection(environments: EnvironmentAccess[]): Promise<string> {
    // Implementation for environment selection UI
    return 'development'; // Placeholder
  }
}
```

## �� Vercel Integration

### Package.json Scripts

```json
{
  "scripts": {
    "env:pull": "bun run scripts/env/pull.vercel.ts",
    "env:add": "bun run scripts/env/add.vercel.ts",
    "env:remove": "bun run scripts/env/remove.vercel.ts",
    "env:remove-all": "bun run scripts/env/remove-all.vercel.ts",
    "env:sync": "bun run scripts/env/sync.vercel.ts",
    "env:validate": "bun run scripts/env/validate.ts",
    "env:setup": "bun run scripts/env/setup.ts"
  }
}
```

### Vercel Scripts Implementation

```typescript
// scripts/env/pull.vercel.ts
import { $ } from "bun";
import { parseArgs } from "util";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    env: {
      type: "string",
      default: "development",
      short: "e",
    },
    file: {
      type: "string",
      short: "f",
    },
  },
  strict: true,
  allowPositionals: true,
});

const ENV = values.env;
const TEMP_FILE = values.file || `.env.${ENV}`;

await $`vercel env pull --environment=${ENV} ${TEMP_FILE}`;
console.log(`✅ Environment variables pulled from ${ENV} to ${TEMP_FILE}`);
```

```typescript
// scripts/env/add.vercel.ts
import { $ } from "bun";
import { parseArgs } from "util";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    var: {
      type: "string",
      multiple: true,
      short: "v",
    },
    env: {
      type: "string",
      default: "development",
      short: "e",
    },
    update: {
      type: "boolean",
      default: false,
      short: "u",
    },
  },
  strict: true,
  allowPositionals: true,
});

const ENV = values.env;

if (values.var) {
  for (let i = 0; i < values.var.length; i++) {
    const [key, value] = values.var[i].split("=");
    const tempFile = `temp-${key}.env`;
    
    await Bun.write(tempFile, `${key}=${value}`);
    
    try {
      if (values.update) {
        await $`vercel env rm ${key} ${ENV} --yes`;
      }
      await $`vercel env add ${key} ${ENV} < ${tempFile}`;
      console.log(`✅ Added ${key} to ${ENV}`);
    } catch (error) {
      console.error(`❌ Error adding ${key}: ${error}`);
    } finally {
      await Bun.remove(tempFile);
    }
  }
} 