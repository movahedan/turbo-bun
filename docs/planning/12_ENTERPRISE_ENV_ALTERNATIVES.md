# 🏢 Enterprise Environment Variables: Alternative Solutions

> Complete implementation guide for enterprise environment variable management without Vercel

## 📋 Table of Contents

- [Overview](#-overview)
- [Alternative Solutions](#-alternative-solutions)
- [AWS Secrets Manager Integration](#-aws-secrets-manager-integration)
- [Azure Key Vault Integration](#-azure-key-vault-integration)
- [HashiCorp Vault Integration](#-hashicorp-vault-integration)
- [Self-Hosted Solutions](#-self-hosted-solutions)
- [Hybrid Approaches](#-hybrid-approaches)
- [Implementation Guide](#-implementation-guide)
- [Comparison Matrix](#-comparison-matrix)

## 🎯 Overview

This document provides alternative enterprise environment variable management solutions that don't require Vercel, focusing on cloud-native secrets management and self-hosted options.

### Why Skip Vercel?

- **Vendor Lock-in**: Avoid dependency on Vercel's ecosystem
- **Cost Control**: Self-hosted solutions can be more cost-effective
- **Customization**: More control over features and integrations
- **Compliance**: Better control over data residency and compliance
- **Flexibility**: Choose the best solution for your specific needs

## 🔧 Alternative Solutions

### 1. **AWS Secrets Manager + ZITADEL**

```typescript
// packages/env-manager/src/aws-secrets-manager.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

export class AWSSecretsManager {
  private client: SecretsManagerClient;
  
  constructor() {
    this.client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }
  
  async getEnvironmentVariables(environment: string): Promise<Record<string, string>> {
    const secretName = `monobun-${environment}-env`;
    
    try {
      const command = new GetSecretValueCommand({ SecretId: secretName });
      const response = await this.client.send(command);
      
      if (response.SecretString) {
        return JSON.parse(response.SecretString);
      }
      
      throw new Error('No secret string found');
    } catch (error) {
      console.error(`Failed to get secret ${secretName}:`, error);
      throw error;
    }
  }
  
  async updateEnvironmentVariables(environment: string, variables: Record<string, string>): Promise<void> {
    const secretName = `monobun-${environment}-env`;
    
    try {
      await this.client.send(new UpdateSecretCommand({
        SecretId: secretName,
        SecretString: JSON.stringify(variables),
      }));
      
      console.log(`✅ Updated environment variables for ${environment}`);
    } catch (error) {
      console.error(`Failed to update secret ${secretName}:`, error);
      throw error;
    }
  }
}
```

### 2. **Azure Key Vault + ZITADEL**

```typescript
// packages/env-manager/src/azure-key-vault.ts
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';

export class AzureKeyVault {
  private client: SecretClient;
  
  constructor() {
    const credential = new DefaultAzureCredential();
    const vaultUrl = process.env.AZURE_KEY_VAULT_URL!;
    
    this.client = new SecretClient(vaultUrl, credential);
  }
  
  async getEnvironmentVariables(environment: string): Promise<Record<string, string>> {
    const variables: Record<string, string> = {};
    
    try {
      // List all secrets for the environment
      const secrets = this.client.listPropertiesOfSecrets();
      
      for await (const secret of secrets) {
        if (secret.name?.startsWith(`${environment}-`)) {
          const secretValue = await this.client.getSecret(secret.name);
          const key = secret.name.replace(`${environment}-`, '');
          variables[key] = secretValue.value!;
        }
      }
      
      return variables;
    } catch (error) {
      console.error(`Failed to get secrets for ${environment}:`, error);
      throw error;
    }
  }
  
  async setEnvironmentVariable(environment: string, key: string, value: string): Promise<void> {
    const secretName = `${environment}-${key}`;
    
    try {
      await this.client.setSecret(secretName, value);
      console.log(`✅ Set ${key} for ${environment}`);
    } catch (error) {
      console.error(`Failed to set secret ${secretName}:`, error);
      throw error;
    }
  }
}
```

### 3. **HashiCorp Vault + ZITADEL**

```typescript
// packages/env-manager/src/hashicorp-vault.ts
import { Client } from 'node-vault';

export class HashiCorpVault {
  private client: Client;
  
  constructor() {
    this.client = new Client({
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR!,
      token: process.env.VAULT_TOKEN!,
    });
  }
  
  async getEnvironmentVariables(environment: string): Promise<Record<string, string>> {
    try {
      const response = await this.client.read(`secret/data/monobun/${environment}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to get secrets for ${environment}:`, error);
      throw error;
    }
  }
  
  async setEnvironmentVariables(environment: string, variables: Record<string, string>): Promise<void> {
    try {
      await this.client.write(`secret/data/monobun/${environment}`, { data: variables });
      console.log(`✅ Updated environment variables for ${environment}`);
    } catch (error) {
      console.error(`Failed to set secrets for ${environment}:`, error);
      throw error;
    }
  }
}
```

### 4. **Self-Hosted Solution: PostgreSQL + Encryption**

```typescript
// packages/env-manager/src/self-hosted-storage.ts
import { Pool } from 'pg';
import { createCipher, createDecipher, randomBytes } from 'crypto';

export class SelfHostedStorage {
  private pool: Pool;
  private encryptionKey: string;
  
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    this.encryptionKey = process.env.ENCRYPTION_KEY!;
  }
  
  async getEnvironmentVariables(environment: string): Promise<Record<string, string>> {
    const query = `
      SELECT key, encrypted_value 
      FROM environment_variables 
      WHERE environment = $1
    `;
    
    const result = await this.pool.query(query, [environment]);
    const variables: Record<string, string> = {};
    
    for (const row of result.rows) {
      variables[row.key] = this.decrypt(row.encrypted_value);
    }
    
    return variables;
  }
  
  async setEnvironmentVariable(environment: string, key: string, value: string): Promise<void> {
    const encryptedValue = this.encrypt(value);
    
    const query = `
      INSERT INTO environment_variables (environment, key, encrypted_value)
      VALUES ($1, $2, $3)
      ON CONFLICT (environment, key) 
      DO UPDATE SET encrypted_value = $3
    `;
    
    await this.pool.query(query, [environment, key, encryptedValue]);
  }
  
  private encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipher('aes-256-gcm', this.encryptionKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }
  
  private decrypt(encryptedText: string): string {
    const [ivHex, tagHex, encrypted] = encryptedText.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = createDecipher('aes-256-gcm', this.encryptionKey);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## 🔄 Hybrid Approaches

### 1. **Multi-Cloud Strategy**

```typescript
// packages/env-manager/src/hybrid-manager.ts
import { AWSSecretsManager } from './aws-secrets-manager';
import { AzureKeyVault } from './azure-key-vault';
import { HashiCorpVault } from './hashicorp-vault';

export class HybridEnvironmentManager {
  private providers: Map<string, any> = new Map();
  
  constructor() {
    // Configure multiple providers
    if (process.env.AWS_REGION) {
      this.providers.set('aws', new AWSSecretsManager());
    }
    
    if (process.env.AZURE_KEY_VAULT_URL) {
      this.providers.set('azure', new AzureKeyVault());
    }
    
    if (process.env.VAULT_ADDR) {
      this.providers.set('vault', new HashiCorpVault());
    }
  }
  
  async getEnvironmentVariables(environment: string, provider?: string): Promise<Record<string, string>> {
    if (provider && this.providers.has(provider)) {
      return await this.providers.get(provider).getEnvironmentVariables(environment);
    }
    
    // Try all providers in order
    for (const [name, providerInstance] of this.providers) {
      try {
        return await providerInstance.getEnvironmentVariables(environment);
      } catch (error) {
        console.warn(`Provider ${name} failed, trying next...`);
      }
    }
    
    throw new Error('No available providers');
  }
  
  async syncAcrossProviders(environment: string): Promise<void> {
    const variables = await this.getEnvironmentVariables(environment);
    
    for (const [name, providerInstance] of this.providers) {
      try {
        await providerInstance.setEnvironmentVariables(environment, variables);
        console.log(`✅ Synced to ${name}`);
      } catch (error) {
        console.error(`Failed to sync to ${name}:`, error);
      }
    }
  }
}
```

### 2. **Fallback Strategy**

```typescript
// packages/env-manager/src/fallback-manager.ts
export class FallbackEnvironmentManager {
  private primaryProvider: any;
  private fallbackProvider: any;
  
  constructor() {
    // Primary: Cloud provider (AWS/Azure)
    this.primaryProvider = new AWSSecretsManager();
    
    // Fallback: Self-hosted solution
    this.fallbackProvider = new SelfHostedStorage();
  }
  
  async getEnvironmentVariables(environment: string): Promise<Record<string, string>> {
    try {
      // Try primary provider first
      return await this.primaryProvider.getEnvironmentVariables(environment);
    } catch (error) {
      console.warn('Primary provider failed, using fallback');
      
      try {
        // Use fallback provider
        return await this.fallbackProvider.getEnvironmentVariables(environment);
      } catch (fallbackError) {
        console.error('Both providers failed');
        throw new Error('No environment variables available');
      }
    }
  }
}
```

## 🛠️ Implementation Guide

### 1. **AWS Secrets Manager Setup**

```bash
# Install AWS SDK
bun add @aws-sdk/client-secrets-manager

# Configure AWS credentials
aws configure

# Create secrets for each environment
aws secretsmanager create-secret \
  --name "monobun-development-env" \
  --description "Development environment variables" \
  --secret-string '{"DATABASE_URL":"dev-db-url","API_KEY":"dev-key"}'

aws secretsmanager create-secret \
  --name "monobun-production-env" \
  --description "Production environment variables" \
  --secret-string '{"DATABASE_URL":"prod-db-url","API_KEY":"prod-key"}'
```

### 2. **Azure Key Vault Setup**

```bash
# Install Azure SDK
bun add @azure/identity @azure/keyvault-secrets

# Create Key Vault
az keyvault create --name "monobun-vault" --resource-group "monobun-rg"

# Create secrets
az keyvault secret set --vault-name "monobun-vault" --name "development-DATABASE_URL" --value "dev-db-url"
az keyvault secret set --vault-name "monobun-vault" --name "production-DATABASE_URL" --value "prod-db-url"
```

### 3. **HashiCorp Vault Setup**

```bash
# Install Vault
brew install vault

# Start Vault server
vault server -dev

# Enable secrets engine
vault secrets enable -path=secret kv

# Create secrets
vault kv put secret/monobun/development DATABASE_URL="dev-db-url" API_KEY="dev-key"
vault kv put secret/monobun/production DATABASE_URL="prod-db-url" API_KEY="prod-key"
```

### 4. **Self-Hosted PostgreSQL Setup**

```sql
-- Create environment variables table
CREATE TABLE environment_variables (
  id SERIAL PRIMARY KEY,
  environment VARCHAR(50) NOT NULL,
  key VARCHAR(255) NOT NULL,
  encrypted_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(environment, key)
);

-- Create indexes
CREATE INDEX idx_env_vars_environment ON environment_variables(environment);
CREATE INDEX idx_env_vars_key ON environment_variables(key);
```

## 📊 Comparison Matrix

| Solution | Pros | Cons | Best For |
|----------|------|------|----------|
| **AWS Secrets Manager** | • Native AWS integration<br>• Automatic rotation<br>• Audit logging | • AWS lock-in<br>• Cost per secret<br>• Limited customization | AWS-heavy environments |
| **Azure Key Vault** | • Native Azure integration<br>• Hardware security modules<br>• Compliance features | • Azure lock-in<br>• Complex pricing<br>• Learning curve | Azure-heavy environments |
| **HashiCorp Vault** | • Multi-cloud support<br>• Rich feature set<br>• Self-hosted option | • Complex setup<br>• Operational overhead<br>• Learning curve | Multi-cloud or self-hosted |
| **Self-Hosted** | • Complete control<br>• No vendor lock-in<br>• Cost control | • Security responsibility<br>• Operational overhead<br>• Limited features | Full control needed |

## 🔧 Development Tools Integration

### 1. **CLI Tools for All Providers**

```typescript
// packages/env-cli/src/providers.ts
import { Command } from 'commander';
import { AWSSecretsManager } from '@repo/env-manager/aws';
import { AzureKeyVault } from '@repo/env-manager/azure';
import { HashiCorpVault } from '@repo/env-manager/vault';

const program = new Command();

program
  .command('aws')
  .description('AWS Secrets Manager commands')
  .option('-e, --environment <env>', 'Environment name')
  .option('-k, --key <key>', 'Secret key')
  .option('-v, --value <value>', 'Secret value')
  .action(async (options) => {
    const manager = new AWSSecretsManager();
    
    if (options.key && options.value) {
      await manager.setEnvironmentVariable(options.environment, options.key, options.value);
    } else {
      const variables = await manager.getEnvironmentVariables(options.environment);
      console.log(JSON.stringify(variables, null, 2));
    }
  });

program
  .command('azure')
  .description('Azure Key Vault commands')
  .option('-e, --environment <env>', 'Environment name')
  .option('-k, --key <key>', 'Secret key')
  .option('-v, --value <value>', 'Secret value')
  .action(async (options) => {
    const manager = new AzureKeyVault();
    
    if (options.key && options.value) {
      await manager.setEnvironmentVariable(options.environment, options.key, options.value);
    } else {
      const variables = await manager.getEnvironmentVariables(options.environment);
      console.log(JSON.stringify(variables, null, 2));
    }
  });

program.parse();
```

### 2. **VS Code Extension for All Providers**

```typescript
// packages/vscode-env-extension/src/providers.ts
import * as vscode from 'vscode';
import { HybridEnvironmentManager } from '@repo/env-manager';

export class ProviderManager {
  private envManager: HybridEnvironmentManager;
  
  constructor() {
    this.envManager = new HybridEnvironmentManager();
  }
  
  async selectProvider(): Promise<string> {
    const providers = ['aws', 'azure', 'vault', 'self-hosted'];
    
    const selected = await vscode.window.showQuickPick(providers, {
      placeHolder: 'Select environment provider',
    });
    
    return selected || 'aws';
  }
  
  async getEnvironmentVariables(environment: string, provider?: string): Promise<Record<string, string>> {
    return await this.envManager.getEnvironmentVariables(environment, provider);
  }
  
  async setEnvironmentVariable(environment: string, key: string, value: string, provider?: string): Promise<void> {
    const manager = this.envManager.getProvider(provider);
    await manager.setEnvironmentVariable(environment, key, value);
  }
}
```

## 🔒 Security Considerations

### 1. **Encryption at Rest**

```typescript
// packages/security/encryption.ts
export class EncryptionManager {
  private algorithm = 'aes-256-gcm';
  private keyLength = 32;
  private ivLength = 16;
  
  encrypt(text: string, key: string): string {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipher(this.algorithm, key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }
  
  decrypt(encryptedText: string, key: string): string {
    const [ivHex, tagHex, encrypted] = encryptedText.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = createDecipher(this.algorithm, key);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 2. **Access Control**

```typescript
// packages/security/access-control.ts
export class AccessControl {
  async validateAccess(userId: string, environment: string, action: string): Promise<boolean> {
    // Check user permissions
    const permissions = await this.getUserPermissions(userId);
    
    // Check environment access
    const hasEnvironmentAccess = permissions.some(p => 
      p.resource === environment && p.action === action
    );
    
    // Check time restrictions
    const timeRestrictions = await this.getTimeRestrictions(environment);
    const isWithinTimeWindow = this.checkTimeWindow(timeRestrictions);
    
    // Check IP restrictions
    const ipRestrictions = await this.getIpRestrictions(environment);
    const isAllowedIp = this.checkIpAddress(ipRestrictions);
    
    return hasEnvironmentAccess && isWithinTimeWindow && isAllowedIp;
  }
}
```

## 🔗 Related Documentation

- [Environment Variables Management](./9_ENVIRONMENT_VARIABLES.md) - Core environment variable system
- [Enterprise Developer Experience](./10_ENTERPRISE_ENV_DEVELOPER_EXPERIENCE.md) - Developer experience design
- [Enterprise Implementation](./11_ENTERPRISE_ENV_IMPLEMENTATION.md) - Vercel-based implementation

---

**Alternative Solutions**: This guide provides comprehensive alternatives to Vercel for enterprise environment variable management, giving you the flexibility to choose the best solution for your specific needs and infrastructure. 