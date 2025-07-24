# 🔐 Environment Variables & Secrets Management

> Comprehensive environment variable convention and management system for secure, automated deployment

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Build-Time Variables](#-build-time-variables)
- [Runtime Variables](#-runtime-variables)
- [Security Framework](#-security-framework)
- [Automation Strategy](#-automation-strategy)
- [Implementation Guide](#-implementation-guide)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)

## 🎯 Overview

This document establishes a first-class environment variable management system that separates build-time and runtime variables, implements security best practices, and prepares for full automation where even developers won't have direct access to secrets.

### Key Principles

- **🔒 Zero Trust**: No secrets in code, no developer access to production secrets
- **⚡ Build vs Runtime**: Clear separation between build-time and runtime variables
- **🤖 Automation First**: Designed for complete automation without human intervention
- **🛡️ Security by Design**: Encryption, rotation, and audit trails
- **📊 Feature Flags**: Runtime variables connect to feature flag systems

## ��️ Architecture

### Environment Variable Categories

```typescript
// Build-time variables (available during build process)
interface BuildTimeEnv {
  // Build configuration
  NODE_ENV: 'development' | 'production' | 'test';
  BUILD_ID: string;
  COMMIT_SHA: string;
  BUILD_TIMESTAMP: string;
  
  // Feature flags (build-time)
  ENABLE_ANALYTICS: boolean;
  ENABLE_DEBUG_MODE: boolean;
  ENABLE_EXPERIMENTAL_FEATURES: boolean;
  
  // Public configuration
  PUBLIC_API_URL: string;
  PUBLIC_APP_NAME: string;
  PUBLIC_VERSION: string;
}

// Runtime variables (available at runtime, potentially encrypted)
interface RuntimeEnv {
  // Database & Storage
  DATABASE_URL: string;
  REDIS_URL: string;
  STORAGE_BUCKET: string;
  
  // Authentication & Security
  JWT_SECRET: string;
  SESSION_SECRET: string;
  ENCRYPTION_KEY: string;
  
  // External Services
  API_KEYS: Record<string, string>;
  WEBHOOK_SECRETS: Record<string, string>;
  
  // Feature flags (runtime)
  FEATURE_FLAGS: Record<string, boolean>;
  
  // Monitoring & Logging
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  SENTRY_DSN: string;
  DATADOG_API_KEY: string;
}
```

### Security Layers

```typescript
// Security architecture for environment variables
interface SecurityLayers {
  // Layer 1: Encryption at rest
  encryptedSecrets: {
    vault: 'dotenv-vault' | 'aws-secrets-manager' | 'azure-key-vault';
    encryptionKey: string;
    rotationPolicy: 'automatic' | 'manual';
  };
  
  // Layer 2: Access control
  accessControl: {
    roleBasedAccess: boolean;
    timeBasedAccess: boolean;
    auditLogging: boolean;
  };
  
  // Layer 3: Runtime protection
  runtimeProtection: {
    memoryScrubbing: boolean;
    processIsolation: boolean;
    networkIsolation: boolean;
  };
}
```

## 🔧 Build-Time Variables

### Definition & Usage

Build-time variables are embedded into the application during the build process and become part of the final bundle.

```typescript
// apps/storefront/next.config.ts
import { defineConfig } from 'next/config';

export default defineConfig({
  env: {
    // Public variables (exposed to client)
    NEXT_PUBLIC_API_URL: process.env.PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.PUBLIC_APP_NAME,
    NEXT_PUBLIC_VERSION: process.env.PUBLIC_VERSION,
    
    // Build-time feature flags
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
    ENABLE_DEBUG_MODE: process.env.ENABLE_DEBUG_MODE === 'true',
  },
  
  // Webpack configuration for build-time variables
  webpack: (config, { buildId, dev, isServer }) => {
    // Inject build-time variables
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.BUILD_ID': JSON.stringify(buildId),
        'process.env.BUILD_TIMESTAMP': JSON.stringify(Date.now()),
        'process.env.COMMIT_SHA': JSON.stringify(process.env.COMMIT_SHA),
      })
    );
    
    return config;
  },
});
```

### Build-Time Variable Management

```typescript
// scripts/env/build-time-validator.ts
import { z } from 'zod';

const BuildTimeEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PUBLIC_API_URL: z.string().url(),
  PUBLIC_APP_NAME: z.string().min(1),
  ENABLE_ANALYTICS: z.boolean(),
  ENABLE_DEBUG_MODE: z.boolean(),
});

export function validateBuildTimeEnv(): void {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    PUBLIC_API_URL: process.env.PUBLIC_API_URL,
    PUBLIC_APP_NAME: process.env.PUBLIC_APP_NAME,
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
    ENABLE_DEBUG_MODE: process.env.ENABLE_DEBUG_MODE === 'true',
  };
  
  const result = BuildTimeEnvSchema.safeParse(env);
  
  if (!result.success) {
    console.error('❌ Build-time environment validation failed:');
    console.error(result.error.errors);
    process.exit(1);
  }
  
  console.log('✅ Build-time environment validation passed');
}
```

## ⚡ Runtime Variables

### Definition & Usage

Runtime variables are loaded at application startup and can be updated without rebuilding the application.

```typescript
// packages/env/runtime-loader.ts
import { createClient } from '@aws-sdk/client-secrets-manager';
import { getSecret } from '@aws-sdk/client-secrets-manager';

interface RuntimeConfig {
  database: {
    url: string;
    poolSize: number;
  };
  auth: {
    jwtSecret: string;
    sessionSecret: string;
  };
  features: Record<string, boolean>;
  monitoring: {
    logLevel: string;
    sentryDsn?: string;
  };
}

export class RuntimeEnvLoader {
  private static instance: RuntimeEnvLoader;
  private config: RuntimeConfig | null = null;
  
  static getInstance(): RuntimeEnvLoader {
    if (!RuntimeEnvLoader.instance) {
      RuntimeEnvLoader.instance = new RuntimeEnvLoader();
    }
    return RuntimeEnvLoader.instance;
  }
  
  async load(): Promise<RuntimeConfig> {
    if (this.config) {
      return this.config;
    }
    
    // Load from encrypted vault or secrets manager
    const secrets = await this.loadSecrets();
    
    this.config = {
      database: {
        url: secrets.DATABASE_URL,
        poolSize: parseInt(secrets.DATABASE_POOL_SIZE || '10'),
      },
      auth: {
        jwtSecret: secrets.JWT_SECRET,
        sessionSecret: secrets.SESSION_SECRET,
      },
      features: JSON.parse(secrets.FEATURE_FLAGS || '{}'),
      monitoring: {
        logLevel: secrets.LOG_LEVEL || 'info',
        sentryDsn: secrets.SENTRY_DSN,
      },
    };
    
    return this.config;
  }
  
  private async loadSecrets(): Promise<Record<string, string>> {
    // Implementation depends on your secrets management solution
    // Examples: dotenv-vault, AWS Secrets Manager, Azure Key Vault
    if (process.env.DOTENV_KEY) {
      return this.loadFromDotenvVault();
    } else if (process.env.AWS_SECRETS_MANAGER_ARN) {
      return this.loadFromAwsSecretsManager();
    } else {
      return this.loadFromLocalEnv();
    }
  }
}
```

### Feature Flags Integration

```typescript
// packages/feature-flags/runtime-flags.ts
import { RuntimeEnvLoader } from '@repo/env';

export class FeatureFlags {
  private static instance: FeatureFlags;
  private flags: Record<string, boolean> = {};
  
  static getInstance(): FeatureFlags {
    if (!FeatureFlags.instance) {
      FeatureFlags.instance = new FeatureFlags();
    }
    return FeatureFlags.instance;
  }
  
  async initialize(): Promise<void> {
    const config = await RuntimeEnvLoader.getInstance().load();
    this.flags = config.features;
  }
  
  isEnabled(featureName: string): boolean {
    return this.flags[featureName] || false;
  }
  
  async refresh(): Promise<void> {
    await this.initialize();
  }
}

// Usage in components
export function useFeatureFlag(featureName: string): boolean {
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    const flags = FeatureFlags.getInstance();
    setIsEnabled(flags.isEnabled(featureName));
  }, [featureName]);
  
  return isEnabled;
}
```

## �� Security Framework

### Encryption & Storage

```typescript
// packages/env/security/encryption.ts
import { createCipher, createDecipher, randomBytes } from 'crypto';

export class SecretEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;
  
  static encrypt(text: string, key: string): string {
    const iv = randomBytes(this.IV_LENGTH);
    const cipher = createCipher(this.ALGORITHM, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }
  
  static decrypt(encryptedText: string, key: string): string {
    const [ivHex, tagHex, encrypted] = encryptedText.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = createDecipher(this.ALGORITHM, key);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### Access Control

```typescript
// packages/env/security/access-control.ts
interface AccessPolicy {
  role: string;
  permissions: string[];
  timeRestrictions?: {
    startTime: string;
    endTime: string;
  };
  ipRestrictions?: string[];
}

export class AccessControl {
  private policies: Map<string, AccessPolicy> = new Map();
  
  addPolicy(role: string, policy: AccessPolicy): void {
    this.policies.set(role, policy);
  }
  
  canAccess(role: string, permission: string, context: {
    timestamp: Date;
    ipAddress: string;
  }): boolean {
    const policy = this.policies.get(role);
    if (!policy) return false;
    
    // Check permissions
    if (!policy.permissions.includes(permission)) {
      return false;
    }
    
    // Check time restrictions
    if (policy.timeRestrictions) {
      const now = context.timestamp;
      const start = new Date(policy.timeRestrictions.startTime);
      const end = new Date(policy.timeRestrictions.endTime);
      
      if (now < start || now > end) {
        return false;
      }
    }
    
    // Check IP restrictions
    if (policy.ipRestrictions && !policy.ipRestrictions.includes(context.ipAddress)) {
      return false;
    }
    
    return true;
  }
}
```

### Audit Logging

```typescript
// packages/env/security/audit-logger.ts
interface AuditEvent {
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  success: boolean;
  metadata?: Record<string, any>;
}

export class AuditLogger {
  private static instance: AuditLogger;
  
  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }
  
  log(event: Omit<AuditEvent, 'timestamp'>): void {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date(),
    };
    
    // Log to secure audit system
    console.log('🔒 AUDIT:', JSON.stringify(auditEvent));
    
    // In production, send to secure audit service
    if (process.env.NODE_ENV === 'production') {
      this.sendToAuditService(auditEvent);
    }
  }
  
  private async sendToAuditService(event: AuditEvent): Promise<void> {
    // Implementation for production audit service
  }
}
```

## 🤖 Automation Strategy

### CI/CD Integration

```yaml
# .github/workflows/environment-setup.yml
name: Environment Setup

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate-env:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Validate Build-Time Variables
        run: |
          bun run env:validate:build-time
          
      - name: Validate Runtime Variables
        run: |
          bun run env:validate:runtime
          
      - name: Security Scan
        run: |
          bun run env:security:scan
```

### Automated Secret Rotation

```typescript
// scripts/env/rotate-secrets.ts
import { createScript } from '../utils/create-scripts';

const script = createScript(
  {
    name: 'Secret Rotation',
    description: 'Automatically rotate secrets and update all environments',
    usage: 'bun run env:rotate [--force] [--dry-run]',
    options: [
      {
        short: '-f',
        long: '--force',
        description: 'Force rotation even if not due',
        required: false,
      },
      {
        short: '-d',
        long: '--dry-run',
        description: 'Show what would be rotated without making changes',
        required: false,
      },
    ],
  },
  async (args: { force?: boolean; dryRun?: boolean }) => {
    const rotationManager = new SecretRotationManager();
    
    if (args.dryRun) {
      await rotationManager.dryRun();
    } else {
      await rotationManager.rotate(args.force);
    }
  },
);

script();
```

### Environment Synchronization

```typescript
// scripts/env/sync-environments.ts
import { createScript } from '../utils/create-scripts';

const script = createScript(
  {
    name: 'Environment Sync',
    description: 'Synchronize environment variables across all environments',
    usage: 'bun run env:sync [--environment <env>]',
    options: [
      {
        short: '-e',
        long: '--environment',
        description: 'Target environment (dev, staging, prod)',
        required: true,
        validator: (value) => ['dev', 'staging', 'prod'].includes(value),
      },
    ],
  },
  async (args: { environment: string }) => {
    const syncManager = new EnvironmentSyncManager();
    await syncManager.sync(args.environment);
  },
);

script();
```

## 🛠️ Implementation Guide

### Step 1: Setup Environment Structure

```bash
# Create environment management structure
mkdir -p scripts/env
mkdir -p packages/env
mkdir -p packages/feature-flags
mkdir -p .env-vault
```

### Step 2: Install Dependencies

```bash
# Install environment management tools
bun add -D dotenv-vault
bun add zod @aws-sdk/client-secrets-manager
```

### Step 3: Configure dotenv-vault

```bash
# Initialize dotenv-vault
bunx dotenv-vault new

# Create environments
bunx dotenv-vault push .env.development
bunx dotenv-vault push .env.staging
bunx dotenv-vault push .env.production
```

### Step 4: Setup Validation Scripts

```typescript
// scripts/env/validate.ts
import { createScript } from '../utils/create-scripts';
import { validateBuildTimeEnv } from './build-time-validator';
import { validateRuntimeEnv } from './runtime-validator';

const script = createScript(
  {
    name: 'Environment Validation',
    description: 'Validate all environment variables',
    usage: 'bun run env:validate [--type <build|runtime|all>]',
    options: [
      {
        short: '-t',
        long: '--type',
        description: 'Type of validation (build, runtime, all)',
        required: false,
        validator: (value) => ['build', 'runtime', 'all'].includes(value),
      },
    ],
  },
  async (args: { type?: string }) => {
    const type = args.type || 'all';
    
    if (type === 'build' || type === 'all') {
      validateBuildTimeEnv();
    }
    
    if (type === 'runtime' || type === 'all') {
      await validateRuntimeEnv();
    }
    
    console.log('✅ Environment validation completed');
  },
);

script();
```

### Step 5: Update Package Scripts

```json
{
  "scripts": {
    "env:validate": "bun run scripts/env/validate.ts",
    "env:validate:build-time": "bun run scripts/env/validate.ts --type build",
    "env:validate:runtime": "bun run scripts/env/validate.ts --type runtime",
    "env:sync": "bun run scripts/env/sync-environments.ts",
    "env:rotate": "bun run scripts/env/rotate-secrets.ts",
    "env:security:scan": "bun run scripts/env/security-scan.ts"
  }
}
```

## 📋 Best Practices

### 1. Naming Conventions

```typescript
// ✅ Good naming conventions
const env = {
  // Build-time (public)
  NEXT_PUBLIC_API_URL: process.env.PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.PUBLIC_APP_NAME,
  
  // Build-time (private)
  BUILD_ID: process.env.BUILD_ID,
  COMMIT_SHA: process.env.COMMIT_SHA,
  
  // Runtime (encrypted)
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Feature flags
  FEATURE_NEW_UI: process.env.FEATURE_NEW_UI === 'true',
  FEATURE_ANALYTICS: process.env.FEATURE_ANALYTICS === 'true',
};
```

### 2. Validation Patterns

```typescript
// Always validate environment variables
const validateRequiredEnv = (name: string, value?: string): string => {
  if (!value) {
    throw new Error(`Required environment variable ${name} is missing`);
  }
  return value;
};

const validateUrlEnv = (name: string, value?: string): string => {
  const url = validateRequiredEnv(name, value);
  try {
    new URL(url);
    return url;
  } catch {
    throw new Error(`Invalid URL in environment variable ${name}: ${url}`);
  }
};
```

### 3. Security Patterns

```typescript
// Never log sensitive environment variables
const logEnvSummary = (env: Record<string, string>): void => {
  const safeEnv = Object.entries(env).reduce((acc, [key, value]) => {
    if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('key')) {
      acc[key] = '[REDACTED]';
    } else {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);
  
  console.log('Environment summary:', safeEnv);
};
```

### 4. Feature Flag Patterns

```typescript
// Use feature flags for runtime configuration
const isFeatureEnabled = (featureName: string): boolean => {
  const flags = FeatureFlags.getInstance();
  return flags.isEnabled(featureName);
};

// Conditional rendering based on feature flags
const MyComponent = () => {
  const newUIEnabled = useFeatureFlag('NEW_UI');
  
  return newUIEnabled ? <NewUI /> : <OldUI />;
};
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Missing Environment Variables

**Symptoms**: Application fails to start with "Required environment variable is missing"

**Solutions**:
```bash
# Check current environment variables
bun run env:validate

# Sync environment variables
bun run env:sync --environment dev

# Check vault status
bunx dotenv-vault status
```

#### 2. Encryption Issues

**Symptoms**: "Failed to decrypt environment variables"

**Solutions**:
```bash
# Regenerate encryption keys
bunx dotenv-vault keys rotate

# Rebuild vault
bunx dotenv-vault build

# Push updated vault
bunx dotenv-vault push
```

#### 3. Feature Flag Issues

**Symptoms**: Feature flags not working or inconsistent

**Solutions**:
```bash
# Refresh feature flags
bun run env:refresh-flags

# Check feature flag status
bun run env:flags:status

# Update feature flags
bun run env:flags:update
```

### Debugging Commands

```bash
# Validate all environments
bun run env:validate

# Check security status
bun run env:security:status

# Test encryption
bun run env:test:encryption

# Audit access logs
bun run env:audit:logs
```

## 🔗 Related Documentation

- [Development Conventions](./4_DEVCONVENTIONS.md) - Coding standards and security guidelines
- [Docker Setup](./1_DOCKER.md) - Container environment configuration
- [DevContainer Guide](./2_DEVCONTAINER.md) - Development environment setup
- [Testing Guide](./TESTING.md) - Environment testing procedures

---

**Next Steps**: This environment variable management system provides a foundation for secure, automated deployment. The next phase involves implementing the automation layer where developers lose direct access to production secrets, and all environment management becomes fully automated through CI/CD pipelines. 