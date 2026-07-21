---
title: Cloud & Infrastructure
description: Deploying and managing Stacks.js applications with ts-cloud
---

# Cloud & Infrastructure

## ts-cloud: Zero-Dependency Infrastructure as Code

Stacks uses **ts-cloud**, a modern Infrastructure-as-Code framework that enables developers to define and deploy cloud infrastructure using TypeScript configuration files. Built on a **driver-based architecture**, ts-cloud currently ships with full AWS support integrating **47 AWS services** across compute, storage, networking, databases, AI/ML, and communication domains. Additional cloud providers (GCP, Azure, Cloudflare, DigitalOcean, Hetzner) are planned for future releases.

Unlike AWS CDK, ts-cloud requires zero external dependencies—no AWS SDK, no AWS CLI, just TypeScript and Bun. It implements direct HTTPS calls to AWS APIs with custom Signature V4 authentication.

### Driver-Based Architecture

ts-cloud is built on a driver-based architecture that abstracts cloud provider specifics behind a unified configuration interface. Currently, only the **AWS driver** is available:

```typescript
export default {
  driver: 'aws', // Currently: 'aws' only | Coming soon: 'gcp', 'azure', 'cloudflare', 'digitalocean', 'hetzner'
  project: { name: 'my-app', slug: 'my-app', region: 'us-east-1' },
}
```

| Driver | Status | Key Services |
|--------|--------|--------------|
| **AWS** | **Production Ready** | EC2, ECS, Lambda, S3, RDS, DynamoDB, CloudFront, SES, SNS, and 40+ more |
| **GCP** | Planned | Compute Engine, Cloud Run, Cloud Storage, Cloud SQL |
| **Azure** | Planned | VMs, Container Apps, Blob Storage, Azure SQL |
| **Cloudflare** | Planned | Workers, R2, D1, Pages |
| **DigitalOcean** | Planned | Droplets, App Platform, Spaces |
| **Hetzner** | Planned | Compute Instances, Object Storage, Volumes |

> **Note:** The driver-based design means your infrastructure configuration will be portable across cloud providers once additional drivers are released. Write once, deploy anywhere.

### Key Advantages

| Aspect | ts-cloud | AWS CDK |
|--------|----------|---------|
| **Dependencies** | Zero (no AWS SDK) | Full AWS SDK (~100MB+) |
| **Startup Time** | Milliseconds | Seconds (SDK initialization) |
| **Bundle Size** | ~5MB compiled | Much larger with SDK |
| **Configuration** | Declarative config objects | Imperative code |
| **Security** | No supply chain risk | Depends on SDK updates |

### How It Works

ts-cloud implements direct HTTPS calls to AWS APIs with custom Signature V4 authentication—no AWS SDK required:

1. **Configuration** → Define infrastructure in `cloud.config.ts`
2. **Generation** → Convert to CloudFormation templates
3. **Deployment** → Direct AWS API calls to deploy

## Configuration

Define your cloud infrastructure in TypeScript:

```typescript
// cloud.config.ts
import type { CloudConfig } from '@stacksjs/cloud'

export default {
  project: {
    name: 'my-app',
    slug: 'my-app',
    region: 'us-east-1',
  },

  mode: 'serverless', // or 'server', 'hybrid'

  environments: {
    production: {
      type: 'production',
      region: 'us-east-1',
      variables: { NODE_ENV: 'production', LOG_LEVEL: 'info' },
    },
    staging: {
      type: 'staging',
      region: 'us-east-1',
      variables: { NODE_ENV: 'staging', LOG_LEVEL: 'debug' },
    },
  },

  infrastructure: {
    // VPC configuration
    vpc: {
      cidr: '10.0.0.0/16',
      zones: 2,
      natGateway: true,
    },

    // Storage
    storage: {
      frontend: {
        public: true,
        website: true,
        encryption: true,
      },
      uploads: {
        public: false,
        encryption: true,
        versioning: true,
      },
    },

    // Compute
    compute: {
      mode: 'serverless',
      server: {
        instanceType: 't3.small',
        autoScaling: { min: 1, max: 5, desired: 2 },
      },
    },

    // Database
    databases: {
      main: {
        engine: 'postgres',
        instanceClass: 'db.t3.micro',
        storage: 20,
      },
    },

    // Cache
    cache: {
      type: 'redis',
      nodeType: 'cache.t3.micro',
    },

    // CDN
    cdn: {
      frontend: {
        origin: 's3-bucket-name',
        customDomain: 'example.com',
      },
    },

    // Security
    security: {
      waf: {
        enabled: true,
        blockCountries: ['CN', 'RU'],
        rateLimit: 2000,
      },
      kms: true,
    },

    // Monitoring
    monitoring: {
      dashboards: true,
      alarms: [
        { name: 'HighCPU', metric: 'CPUUtilization', threshold: 80 },
        { name: 'HighMemory', metric: 'MemoryUtilization', threshold: 80 },
      ],
    },
  },
} satisfies CloudConfig
```

## Production-Ready Presets

ts-cloud includes 13 production-ready presets for common architectures:

```typescript
import { createStaticSitePreset } from '@stacksjs/cloud/presets'

// Simple: S3 + CloudFront + Route53 + ACM
export default createStaticSitePreset({
  name: 'My Website',
  slug: 'my-website',
  domain: 'example.com',
})
```

Available presets:

| Preset | Infrastructure |
|--------|---------------|
| **Static Sites** | S3 + CloudFront |
| **Node.js Servers** | EC2 + ALB + RDS + Redis |
| **Serverless Apps** | ECS Fargate + ALB + DynamoDB |
| **Full-Stack Apps** | Frontend + Backend + Database |
| **API Backends** | API Gateway + Lambda + DynamoDB |
| **Microservices** | Multi-service with discovery |
| **Real-time Apps** | WebSocket API + Lambda + DynamoDB Streams |
| **Data Pipelines** | Kinesis + Lambda + S3 + Athena |
| **ML APIs** | SageMaker + API Gateway |

### Extending Presets

```typescript
import { createFullStackAppPreset, extendPreset } from '@stacksjs/cloud/presets'

export default extendPreset(
  createFullStackAppPreset({
    name: 'My App',
    slug: 'my-app',
    domain: 'app.example.com',
  }),
  {
    infrastructure: {
      compute: {
        fargate: {
          taskDefinition: {
            cpu: '1024',
            memory: '2048',
          },
        },
      },
      databases: {
        postgres: {
          storage: 100,
          multiAZ: true,
        },
      },
    },
  }
)
```

## CLI Commands

```bash
# Initialize project
cloud init
cloud init:serverless
cloud init:server

# Configuration
cloud config                    # Show current config
cloud config:validate           # Validate config

# Generate CloudFormation templates
cloud generate                  # Generate templates
cloud generate --format yaml    # YAML output

# Deployment
cloud deploy                    # Deploy infrastructure
cloud deploy --dry-run         # Preview changes
cloud deploy --env production  # Deploy to environment

# Stack management
cloud stacks                    # List stacks
cloud stacks:delete <name>      # Delete stack
cloud stacks:update <name>      # Update stack
cloud stacks:events <name>      # View stack events

# Resource management
cloud resources                 # List resources
cloud resources:outputs         # Show stack outputs
```

## Deployment Options

### Serverless (ECS Fargate)

```bash
buddy deploy:serverless
# - ECS Fargate containers
# - Application Load Balancer
# - DynamoDB for sessions/cache
# - Automatic scaling
```

### Container (ECS)

```bash
buddy deploy:container
# - Docker image building
# - ECS task definitions
# - Load balancer configuration
# - Auto-scaling groups
```

### Traditional (EC2)

```bash
buddy deploy:server
# - EC2 instances
# - Auto-scaling groups
# - Rolling deployments
# - Load balancing
```

### Edge (CloudFront)

```bash
buddy deploy:edge
# - CloudFront distribution
# - Lambda@Edge functions
# - Global distribution
# - Edge caching
```

## Advanced Features

### Multi-Region Deployment

```typescript
export default {
  infrastructure: {
    multiRegion: {
      enabled: true,
      regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
      replication: true,
      failover: 'automatic',
    },
  },
}
```

### Environment-Specific Overrides

```typescript
export default {
  infrastructure: {
    compute: {
      server: { instanceType: 't3.small' }, // default
    },
  },
  environments: {
    production: {
      infrastructure: {
        compute: {
          server: {
            instanceType: 't3.xlarge', // production override
            autoScaling: { min: 3, max: 20 },
          },
        },
      },
    },
  },
}
```

### Security & Compliance

```typescript
export default {
  infrastructure: {
    security: {
      waf: {
        enabled: true,
        rateLimit: 2000,
        blockCountries: ['CN', 'RU'],
      },
      kms: true, // Encryption at rest
      guardDuty: true, // Threat detection
      cloudTrail: true, // Audit logging
      securityHub: true, // Compliance monitoring
    },
  },
}
```

### Observability

```typescript
export default {
  infrastructure: {
    monitoring: {
      dashboards: true,
      synthetics: true, // Canary monitoring
      alarms: [
        { name: 'HighCPU', metric: 'CPUUtilization', threshold: 80 },
        { name: 'HighLatency', metric: 'Latency', threshold: 1000 },
        { name: 'ErrorRate', metric: '5xxErrors', threshold: 1 },
      ],
      notifications: {
        slack: 'https://hooks.slack.com/...',
        email: ['ops@example.com'],
      },
    },
  },
}
```

## Driver-Based Architecture

ts-cloud is built on a driver-based architecture, allowing the same configuration to target different cloud providers:

```typescript
// cloud.config.ts
export default {
  // Driver determines the cloud provider
  driver: 'aws', // Currently supported: 'aws'
                 // Coming soon: 'gcp', 'azure', 'cloudflare', 'digitalocean', 'hetzner'

  project: {
    name: 'my-app',
    slug: 'my-app',
    region: 'us-east-1',
  },

  // Infrastructure config remains consistent across drivers
  infrastructure: {
    compute: { /* ... */ },
    storage: { /* ... */ },
    database: { /* ... */ },
  },
}
```

### Why Driver-Based?

- **Portability**: Same configuration syntax across cloud providers
- **Migration**: Switch providers without rewriting infrastructure code
- **Multi-Cloud**: Deploy to multiple providers from one config
- **Future-Proof**: Add new providers without changing your code

### Supported Drivers

| Driver | Status | Services |
|--------|--------|----------|
| **AWS** | Stable | EC2, ECS, Lambda, S3, RDS, DynamoDB, CloudFront, etc. |
| **GCP** | Planned | Compute Engine, Cloud Run, Cloud Storage, Cloud SQL |
| **Azure** | Planned | VMs, Container Apps, Blob Storage, Azure SQL |
| **Cloudflare** | Planned | Workers, R2, D1, Pages |
| **DigitalOcean** | Planned | Droplets, App Platform, Spaces |
| **Hetzner** | Planned | Compute Instances, Object Storage, Volumes |

## Infrastructure Modules

ts-cloud provides 23+ infrastructure components (AWS driver):

- **Network** - VPC, subnets, NAT gateways, security groups
- **Compute** - EC2, ECS Fargate, Lambda, Auto Scaling
- **Storage** - S3 buckets, EFS, encryption, lifecycle
- **Database** - RDS (PostgreSQL/MySQL), DynamoDB
- **Cache** - ElastiCache (Redis/Memcached)
- **CDN** - CloudFront, custom domains, Lambda@Edge
- **API** - API Gateway (HTTP, REST, WebSocket)
- **Queue** - SQS with dead-letter queues
- **Messaging** - SNS, EventBridge
- **AI/ML** - Bedrock, SageMaker integration
- **Monitoring** - CloudWatch dashboards & alarms
- **Security** - ACM, WAF, KMS, GuardDuty
- **Secrets** - Secrets Manager, Parameter Store
- **Workflow** - Step Functions, state machines
