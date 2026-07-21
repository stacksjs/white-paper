---
title: Configuration Reference
description: Complete reference of all Stacks.js configuration files and their defaults
---

# Configuration Reference

Stacks uses a convention-over-configuration approach. All configuration files live in the `config/` directory and use TypeScript for full type safety.

## App Configuration

```typescript
// config/app.ts
export default {
  // Application name
  name: 'My App',

  // Environment (development, staging, production)
  env: process.env.APP_ENV ?? 'development',

  // Debug mode (enables detailed error pages, logging)
  debug: process.env.APP_DEBUG === 'true',

  // Application URL
  url: process.env.APP_URL ?? 'http://localhost',

  // Timezone
  timezone: 'UTC',

  // Locale settings
  locale: 'en',
  fallbackLocale: 'en',

  // Encryption key (auto-generated on install)
  key: process.env.APP_KEY,

  // Cipher for encryption
  cipher: 'aes-256-gcm',

  // Maintenance mode
  maintenance: {
    driver: 'file',
    secret: process.env.MAINTENANCE_SECRET,
    refresh: 60,
  },

  // Service providers (auto-discovered by default)
  providers: [
    // '@stacksjs/database',
    // '@stacksjs/auth',
    // '@stacksjs/queue',
  ],
}
```

## Server Configuration

```typescript
// config/server.ts
export default {
  // Server host
  host: process.env.HOST ?? 'localhost',

  // Server port
  port: Number(process.env.PORT ?? 3000),

  // HTTPS configuration
  https: {
    enabled: process.env.HTTPS === 'true',
    cert: process.env.SSL_CERT,
    key: process.env.SSL_KEY,

    // Auto-generate development certificates
    autoGenerate: true,
  },

  // Maximum request body size
  maxBodySize: '10mb',

  // Request timeout (ms)
  timeout: 30_000,

  // Keep-alive timeout (ms)
  keepAliveTimeout: 5_000,

  // Headers timeout (ms)
  headersTimeout: 60_000,

  // Compression
  compression: {
    enabled: true,
    threshold: 1024, // Minimum size to compress
    level: 6,
  },

  // Static file serving
  static: {
    enabled: true,
    path: './public',
    maxAge: 86400, // 1 day cache
    index: ['index.html'],
    etag: true,
    lastModified: true,
  },

  // Hot module replacement (development)
  hmr: {
    enabled: true,
    port: 24678,
  },
}
```

## Database Configuration

```typescript
// config/database.ts
export default {
  // Default connection
  default: process.env.DB_CONNECTION ?? 'sqlite',

  // Available connections
  connections: {
    sqlite: {
      driver: 'sqlite',
      database: process.env.DB_DATABASE ?? './storage/database.sqlite',
      foreignKeys: true,
      busyTimeout: 5000,
      journal: 'wal',
    },

    mysql: {
      driver: 'mysql',
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_DATABASE ?? 'stacks',
      username: process.env.DB_USERNAME ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
      pool: {
        min: 2,
        max: 10,
        acquireTimeout: 60_000,
        idleTimeout: 10_000,
      },
    },

    postgres: {
      driver: 'postgres',
      host: process.env.DB_HOST ?? '127.0.0.1',
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_DATABASE ?? 'stacks',
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? '',
      schema: 'public',
      sslMode: process.env.DB_SSL ?? 'prefer',
      pool: {
        min: 2,
        max: 10,
      },
    },

    dynamodb: {
      driver: 'dynamodb',
      region: process.env.AWS_REGION ?? 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT,
      table: process.env.DYNAMODB_TABLE ?? 'stacks',
      // Single Table Design enabled by default
      singleTable: true,
    },
  },

  // Migration settings
  migrations: {
    path: './database/migrations',
    table: 'migrations',
    autoRun: false,
  },

  // Seeder settings
  seeders: {
    path: './database/seeders',
  },
}
```

## Authentication Configuration

```typescript
// config/auth.ts
export default {
  // Default guard
  defaults: {
    guard: 'web',
    passwords: 'users',
  },

  // Authentication guards
  guards: {
    web: {
      driver: 'session',
      provider: 'users',
    },

    api: {
      driver: 'token',
      provider: 'users',
      hash: true,
      inputKey: 'api_token',
      storageKey: 'api_token',
    },

    sanctum: {
      driver: 'sanctum',
      provider: 'users',
    },
  },

  // User providers
  providers: {
    users: {
      driver: 'database',
      model: 'User',
      table: 'users',
    },
  },

  // Password reset settings
  passwords: {
    users: {
      provider: 'users',
      table: 'password_resets',
      expire: 60, // minutes
      throttle: 60, // seconds
    },
  },

  // Session configuration
  session: {
    driver: process.env.SESSION_DRIVER ?? 'file',
    lifetime: 120, // minutes
    expireOnClose: false,
    encrypt: true,
    cookie: 'stacks_session',
    path: '/',
    domain: null,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
  },

  // Token settings
  tokens: {
    expiry: '7d',
    refresh: true,
    refreshExpiry: '30d',
  },

  // OAuth providers
  oauth: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      redirectUri: '/auth/github/callback',
      scopes: ['user:email'],
    },

    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: '/auth/google/callback',
      scopes: ['email', 'profile'],
    },
  },

  // Two-factor authentication
  twoFactor: {
    enabled: true,
    issuer: 'Stacks',
    algorithm: 'sha1',
    digits: 6,
    period: 30,
  },
}
```

## Cache Configuration

```typescript
// config/cache.ts
export default {
  // Default cache driver
  default: process.env.CACHE_DRIVER ?? 'file',

  // Cache stores
  stores: {
    file: {
      driver: 'file',
      path: './storage/cache',
    },

    memory: {
      driver: 'memory',
      maxSize: 100_000_000, // 100MB
    },

    redis: {
      driver: 'redis',
      connection: 'cache',
      lockConnection: 'default',
    },

    dynamodb: {
      driver: 'dynamodb',
      table: 'cache',
      ttlAttribute: 'expires_at',
    },
  },

  // Cache key prefix
  prefix: process.env.CACHE_PREFIX ?? 'stacks_cache_',

  // Default TTL (seconds)
  ttl: 3600,
}
```

## Queue Configuration

```typescript
// config/queue.ts
export default {
  // Default queue connection
  default: process.env.QUEUE_CONNECTION ?? 'redis',

  // Queue connections
  connections: {
    sync: {
      driver: 'sync',
    },

    redis: {
      driver: 'redis',
      connection: 'default',
      queue: 'default',
      retry_after: 90,
      block_for: 5,
    },

    sqs: {
      driver: 'sqs',
      key: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION ?? 'us-east-1',
      prefix: process.env.SQS_PREFIX,
      queue: process.env.SQS_QUEUE ?? 'default',
    },
  },

  // Failed job settings
  failed: {
    driver: 'database',
    table: 'failed_jobs',
    maxRetries: 3,
  },

  // Default job options
  defaults: {
    attempts: 3,
    timeout: 60,
    backoff: [10, 30, 60], // Retry delays in seconds
  },

  // Named queues with priorities
  queues: {
    high: { priority: 1 },
    default: { priority: 5 },
    low: { priority: 10 },
  },
}
```

## Mail Configuration

```typescript
// config/mail.ts
export default {
  // Default mailer
  default: process.env.MAIL_MAILER ?? 'smtp',

  // Mailer configurations
  mailers: {
    smtp: {
      driver: 'smtp',
      host: process.env.MAIL_HOST ?? 'localhost',
      port: Number(process.env.MAIL_PORT ?? 587),
      encryption: process.env.MAIL_ENCRYPTION ?? 'tls',
      username: process.env.MAIL_USERNAME,
      password: process.env.MAIL_PASSWORD,
      timeout: 30,
    },

    ses: {
      driver: 'ses',
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        key: process.env.AWS_ACCESS_KEY_ID,
        secret: process.env.AWS_SECRET_ACCESS_KEY,
      },
    },

    resend: {
      driver: 'resend',
      apiKey: process.env.RESEND_API_KEY,
    },

    log: {
      driver: 'log',
      channel: 'mail',
    },
  },

  // Global "From" address
  from: {
    address: process.env.MAIL_FROM_ADDRESS ?? 'noreply@example.com',
    name: process.env.MAIL_FROM_NAME ?? 'Stacks',
  },

  // Markdown mail settings
  markdown: {
    theme: 'default',
    paths: ['./resources/views/emails'],
  },
}
```

## Storage Configuration

```typescript
// config/storage.ts
export default {
  // Default disk
  default: process.env.FILESYSTEM_DISK ?? 'local',

  // Storage disks
  disks: {
    local: {
      driver: 'local',
      root: './storage/app',
      visibility: 'private',
    },

    public: {
      driver: 'local',
      root: './storage/app/public',
      url: '/storage',
      visibility: 'public',
    },

    s3: {
      driver: 's3',
      bucket: process.env.AWS_BUCKET,
      region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        key: process.env.AWS_ACCESS_KEY_ID,
        secret: process.env.AWS_SECRET_ACCESS_KEY,
      },
      url: process.env.AWS_URL,
      endpoint: process.env.AWS_ENDPOINT,
      visibility: 'private',
      cacheControl: 'max-age=31536000',
    },
  },

  // Symbolic links
  links: {
    './public/storage': './storage/app/public',
  },

  // Upload settings
  uploads: {
    maxSize: '100mb',
    allowedMimeTypes: ['image/*', 'application/pdf', 'video/*'],
    hashFilenames: true,
  },
}
```

## Logging Configuration

```typescript
// config/logging.ts
export default {
  // Default log channel
  default: process.env.LOG_CHANNEL ?? 'stack',

  // Log channels
  channels: {
    stack: {
      driver: 'stack',
      channels: ['daily', 'stderr'],
      ignoreExceptions: false,
    },

    single: {
      driver: 'single',
      path: './storage/logs/stacks.log',
      level: 'debug',
    },

    daily: {
      driver: 'daily',
      path: './storage/logs/stacks.log',
      level: 'debug',
      days: 14,
    },

    stderr: {
      driver: 'stderr',
      level: 'warning',
      formatter: process.env.LOG_STDERR_FORMATTER ?? 'pretty',
    },

    syslog: {
      driver: 'syslog',
      level: 'debug',
      facility: 'local0',
    },
  },

  // Log levels: emergency, alert, critical, error, warning, notice, info, debug
  level: process.env.LOG_LEVEL ?? 'debug',

  // Deprecation logging
  deprecations: {
    channel: 'stderr',
    trace: true,
  },
}
```

## Security Configuration

```typescript
// config/security.ts
export default {
  // HTTPS settings
  https: {
    enabled: process.env.FORCE_HTTPS === 'true',
    autoGenerate: true,
    hsts: {
      enabled: true,
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },

  // CSRF protection
  csrf: {
    enabled: true,
    cookie: 'XSRF-TOKEN',
    header: 'X-XSRF-TOKEN',
    except: ['/api/webhooks/*'],
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    driver: 'redis',

    limits: {
      api: { max: 60, window: 60 },
      auth: { max: 5, window: 300 },
      global: { max: 1000, window: 60 },
    },

    headers: {
      limit: 'X-RateLimit-Limit',
      remaining: 'X-RateLimit-Remaining',
      reset: 'X-RateLimit-Reset',
    },
  },

  // Content Security Policy
  csp: {
    enabled: true,
    reportOnly: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'strict-dynamic'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'", 'wss:', 'https:'],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: true,
    },
    reportUri: '/csp-report',
  },

  // Other security headers
  headers: {
    xContentTypeOptions: 'nosniff',
    xFrameOptions: 'DENY',
    xXssProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'geolocation=(), microphone=(), camera=()',
  },

  // CORS settings
  cors: {
    enabled: true,
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['*'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    credentials: true,
    maxAge: 86400,
  },

  // Cookie settings
  cookies: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    encrypt: true,
    path: '/',
    domain: null,
  },

  // Request validation
  validation: {
    sanitize: true,
    stripUnknown: true,
  },
}
```

## Cloud Configuration (ts-cloud)

```typescript
// config/cloud.ts
export default {
  // Cloud driver
  driver: process.env.CLOUD_DRIVER ?? 'aws',

  // Project settings
  project: {
    name: 'my-app',
    slug: 'my-app',
    region: process.env.AWS_REGION ?? 'us-east-1',
    environment: process.env.APP_ENV ?? 'development',
  },

  // Deployment settings
  deploy: {
    type: 'serverless', // or 'server', 'containers'
    domain: process.env.APP_DOMAIN,
    certificateArn: process.env.AWS_CERTIFICATE_ARN,
  },

  // Infrastructure
  infrastructure: {
    // API Gateway / Load Balancer
    api: {
      type: 'http-api',
      cors: true,
      throttling: {
        rateLimit: 10000,
        burstLimit: 5000,
      },
    },

    // Lambda / Compute
    compute: {
      runtime: 'provided.al2023',
      architecture: 'arm64',
      memory: 1024,
      timeout: 30,
      reservedConcurrency: 100,
    },

    // Database
    database: {
      type: 'dynamodb',
      billingMode: 'PAY_PER_REQUEST',
    },

    // Storage
    storage: {
      type: 's3',
      versioning: true,
      encryption: true,
    },

    // CDN
    cdn: {
      enabled: true,
      priceClass: 'PriceClass_100',
      compress: true,
    },

    // Caching
    cache: {
      type: 'elasticache',
      engine: 'redis',
      nodeType: 'cache.t3.micro',
    },
  },

  // CI/CD
  pipeline: {
    enabled: true,
    repository: 'github.com/org/repo',
    branch: 'main',
    autoDeploy: true,
  },
}
```

## Broadcasting Configuration

```typescript
// config/broadcasting.ts
export default {
  // Default broadcaster
  default: process.env.BROADCAST_DRIVER ?? 'stacks',

  // Broadcaster configurations
  connections: {
    // Stacks native WebSocket server (recommended - like Laravel Reverb)
    stacks: {
      driver: 'stacks',
      host: process.env.BROADCAST_HOST ?? 'localhost',
      port: Number(process.env.BROADCAST_PORT ?? 6001),

      // TLS configuration
      tls: {
        enabled: process.env.BROADCAST_TLS === 'true',
        cert: process.env.BROADCAST_TLS_CERT,
        key: process.env.BROADCAST_TLS_KEY,
      },

      // Scaling with Redis (for multi-server deployments)
      scaling: {
        enabled: false,
        redis: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: Number(process.env.REDIS_PORT ?? 6379),
        },
      },

      // App credentials (for channel authentication)
      app: {
        id: process.env.BROADCAST_APP_ID ?? 'stacks',
        key: process.env.BROADCAST_APP_KEY ?? 'stacks-key',
        secret: process.env.BROADCAST_APP_SECRET ?? 'stacks-secret',
      },

      // Connection limits
      maxConnections: 10000,
      maxChannelsPerConnection: 100,
      maxPayloadSize: 64 * 1024, // 64KB
    },

    // Pusher-compatible broadcaster (third-party)
    pusher: {
      driver: 'pusher',
      key: process.env.PUSHER_APP_KEY,
      secret: process.env.PUSHER_APP_SECRET,
      appId: process.env.PUSHER_APP_ID,
      cluster: process.env.PUSHER_CLUSTER ?? 'us2',
      useTLS: true,
    },

    // Redis pub/sub broadcaster
    redis: {
      driver: 'redis',
      connection: 'default',
      queue: 'broadcasts',
    },

    // Null driver (for testing)
    null: {
      driver: 'null',
    },
  },

  // Channel authorization endpoint
  authEndpoint: '/broadcasting/auth',
}
```

## Notification Configuration

```typescript
// config/notifications.ts
export default {
  // Default channels
  defaults: ['database', 'email'],

  // Channel configurations
  channels: {
    database: {
      driver: 'database',
      table: 'notifications',
      model: 'Notification',
    },

    email: {
      driver: 'mail',
      mailer: 'default',
      queue: true,
    },

    sms: {
      driver: 'twilio',
      sid: process.env.TWILIO_SID,
      token: process.env.TWILIO_TOKEN,
      from: process.env.TWILIO_FROM,
    },

    slack: {
      driver: 'slack',
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: '#notifications',
    },

    push: {
      driver: 'fcm',
      credentials: process.env.FCM_CREDENTIALS,
    },
  },

  // Queueing
  queue: {
    enabled: true,
    connection: 'redis',
    queue: 'notifications',
  },
}
```

## Scheduler Configuration

```typescript
// config/scheduler.ts
export default {
  // Timezone for scheduled jobs
  timezone: 'UTC',

  // Scheduled jobs
  jobs: [
    {
      job: 'PruneExpiredTokensJob',
      cron: '0 0 * * *', // Daily at midnight
      withoutOverlapping: true,
    },
    {
      job: 'SendScheduledNotificationsJob',
      cron: '* * * * *', // Every minute
      runInBackground: true,
    },
    {
      job: 'GenerateDailyReportsJob',
      cron: '0 6 * * *', // Daily at 6 AM
      onOneServer: true, // Only run on one server in cluster
    },
    {
      job: 'CleanupTempFilesJob',
      cron: '0 3 * * *', // Daily at 3 AM
      evenInMaintenanceMode: true,
    },
  ],

  // Maintenance
  maintenance: {
    logOutput: true,
    emailOnFailure: 'admin@example.com',
  },
}
```

## Frontend Configuration

```typescript
// config/frontend.ts
export default {
  // Build settings
  build: {
    outDir: './dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: process.env.NODE_ENV === 'production',
  },

  // Dev server
  dev: {
    port: 5173,
    open: false,
    hmr: true,
  },

  // Assets
  assets: {
    hashFilenames: true,
    publicPath: '/',
  },

  // CSS
  css: {
    preprocessor: 'headwind',
    modules: true,
    sourceMap: true,
  },

  // TypeScript
  typescript: {
    strict: true,
    noEmit: true,
  },
}
```

## Complete stacks.config.ts

The main configuration file that ties everything together:

```typescript
// stacks.config.ts
export default {
  // Application identity
  name: 'My Stacks App',
  description: 'A modern full-stack application',
  version: '1.0.0',

  // Import all config files
  app: './config/app',
  server: './config/server',
  database: './config/database',
  auth: './config/auth',
  cache: './config/cache',
  queue: './config/queue',
  mail: './config/mail',
  storage: './config/storage',
  logging: './config/logging',
  security: './config/security',
  cloud: './config/cloud',
  notifications: './config/notifications',
  scheduler: './config/scheduler',
  frontend: './config/frontend',

  // Path aliases
  paths: {
    '@': './app',
    '@models': './app/Models',
    '@controllers': './app/Controllers',
    '@middleware': './app/Middleware',
    '@components': './resources/components',
  },

  // Auto-discovery
  autoload: {
    models: './app/Models',
    controllers: './app/Controllers',
    middleware: './app/Middleware',
    jobs: './app/Jobs',
    events: './app/Events',
    listeners: './app/Listeners',
  },
}
```
