---
title: Production & Operations
description: Production deployment checklist, monitoring, error handling, and operational best practices
---

# Production & Operations

This guide covers everything needed to run Stacks.js applications in production.

## Production Deployment Checklist

### Pre-Deployment

```bash
# 1. Environment configuration
cp .env.example .env.production
# Edit .env.production with production values

# 2. Generate production app key
buddy key:generate --env=production

# 3. Run production build
buddy build --production

# 4. Run all tests
buddy test

# 5. Run type checking
buddy typecheck

# 6. Verify security headers
buddy security:check
```

### Environment Configuration

```bash
# .env.production
APP_ENV=production
APP_DEBUG=false
APP_URL=https://myapp.com

# Security
APP_KEY=base64:your-secure-key-here
FORCE_HTTPS=true

# Database
DB_CONNECTION=postgres
DB_HOST=db.internal
DB_PORT=5432
DB_DATABASE=myapp_production
DB_USERNAME=myapp
DB_PASSWORD=secure-password

# Cache & Sessions
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=redis.internal

# Mail
MAIL_MAILER=ses
MAIL_FROM_ADDRESS=noreply@myapp.com

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=warning

# Rate Limiting
RATE_LIMIT_ENABLED=true
```

### Security Checklist

- [ ] **HTTPS enabled** - Force HTTPS in production
- [ ] **App debug disabled** - `APP_DEBUG=false`
- [ ] **Secure app key** - Unique, randomly generated
- [ ] **Database credentials** - Not using defaults
- [ ] **CORS configured** - Restricted to known origins
- [ ] **CSP headers** - Content Security Policy enabled
- [ ] **Rate limiting** - Enabled on all endpoints
- [ ] **CSRF protection** - Enabled for state-changing requests
- [ ] **SQL injection** - Using parameterized queries (ORM)
- [ ] **XSS protection** - Output escaping enabled
- [ ] **Sensitive data** - No secrets in version control
- [ ] **Dependencies** - No known vulnerabilities (`buddy security:audit`)

### Performance Checklist

- [ ] **Assets minified** - CSS, JS compressed
- [ ] **Images optimized** - WebP/AVIF formats, proper sizing
- [ ] **Caching enabled** - Redis/Memcached for frequently accessed data
- [ ] **Database indexed** - Proper indexes on queried columns
- [ ] **N+1 queries fixed** - Eager loading relationships
- [ ] **CDN configured** - Static assets served via CDN
- [ ] **Gzip/Brotli** - Response compression enabled
- [ ] **HTTP/2 or HTTP/3** - Modern protocols enabled

### Infrastructure Checklist

- [ ] **Load balancer** - For high availability
- [ ] **Auto-scaling** - Scale based on demand
- [ ] **Health checks** - `/health` endpoint configured
- [ ] **Backups** - Database and file backups automated
- [ ] **Disaster recovery** - Tested restore procedures
- [ ] **Monitoring** - APM and error tracking enabled
- [ ] **Logging** - Centralized log aggregation
- [ ] **Alerting** - Critical error notifications

## Error Handling

### Global Error Handler

```typescript
// app/Exceptions/Handler.ts
import { ExceptionHandler, HttpException, ValidationException } from '@stacksjs/exceptions'

export default class Handler extends ExceptionHandler {
  /**
   * Exceptions that should not be reported.
   */
  protected dontReport: Array<new (...args: any[]) => Error> = [
    ValidationException,
    AuthenticationException,
    ModelNotFoundException,
  ]

  /**
   * Report or log an exception.
   */
  async report(error: Error): Promise<void> {
    // Log to error tracking service
    if (this.shouldReport(error)) {
      await errorTracker.capture(error, {
        user: request.user?.id,
        url: request.url,
        method: request.method,
      })
    }

    // Call parent for default logging
    await super.report(error)
  }

  /**
   * Render an exception into an HTTP response.
   */
  async render(request: Request, error: Error): Promise<Response> {
    // API error response
    if (request.expectsJson()) {
      return this.renderJsonError(request, error)
    }

    // Web error page
    return this.renderHtmlError(request, error)
  }

  private renderJsonError(request: Request, error: Error): Response {
    const status = error instanceof HttpException ? error.status : 500

    return Response.json({
      error: {
        message: this.getErrorMessage(error),
        code: error.code ?? 'INTERNAL_ERROR',
        ...(config.app.debug && {
          stack: error.stack,
          details: error.details,
        }),
      },
    }, status)
  }

  private renderHtmlError(request: Request, error: Error): Response {
    const status = error instanceof HttpException ? error.status : 500

    // Show detailed error in development
    if (config.app.debug) {
      return Response.view('errors/debug', { error, request })
    }

    // Show friendly error page in production
    return Response.view(`errors/${status}`, { error }, status)
  }
}
```

### Custom Exceptions

```typescript
// app/Exceptions/InsufficientFundsException.ts
import { HttpException } from '@stacksjs/exceptions'

export class InsufficientFundsException extends HttpException {
  status = 402

  constructor(
    public required: number,
    public available: number,
  ) {
    super(`Insufficient funds: required ${required}, available ${available}`)
    this.code = 'INSUFFICIENT_FUNDS'
  }

  context(): object {
    return {
      required: this.required,
      available: this.available,
      shortfall: this.required - this.available,
    }
  }
}

// Usage
if (user.balance < order.total) {
  throw new InsufficientFundsException(order.total, user.balance)
}
```

### Error Handling Patterns

```typescript
// Result type pattern (no exceptions)
import { Result, ok, err } from '@stacksjs/error-handling'

async function transferFunds(
  from: Account,
  to: Account,
  amount: number,
): Promise<Result<Transfer, TransferError>> {
  if (from.balance < amount) {
    return err({ code: 'INSUFFICIENT_FUNDS', balance: from.balance })
  }

  if (amount <= 0) {
    return err({ code: 'INVALID_AMOUNT', amount })
  }

  const transfer = await Transfer.create({ from, to, amount })
  return ok(transfer)
}

// Usage
const result = await transferFunds(fromAccount, toAccount, 100)

if (result.isErr()) {
  switch (result.error.code) {
    case 'INSUFFICIENT_FUNDS':
      return Response.json({ error: 'Not enough balance' }, 400)
    case 'INVALID_AMOUNT':
      return Response.json({ error: 'Invalid amount' }, 400)
  }
}

const transfer = result.value
```

### Retry Pattern

```typescript
import { retry, RetryConfig } from '@stacksjs/error-handling'

// Retry with exponential backoff
const result = await retry(
  async () => {
    return await externalApi.fetch('/data')
  },
  {
    attempts: 3,
    delay: 1000,
    backoff: 'exponential', // 1s, 2s, 4s
    retryIf: (error) => error.status >= 500,
    onRetry: (error, attempt) => {
      log.warn(`Retry attempt ${attempt}`, { error })
    },
  },
)
```

## Monitoring & Observability

### Health Checks

```typescript
// routes/api.ts
Router.get('/health', async () => {
  const checks = await healthCheck.run()

  const status = checks.every(c => c.healthy) ? 200 : 503

  return Response.json({
    status: status === 200 ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  }, status)
})

// config/health.ts
export default {
  checks: [
    {
      name: 'database',
      check: async () => {
        await DB.raw('SELECT 1')
        return { healthy: true }
      },
    },
    {
      name: 'redis',
      check: async () => {
        await Redis.ping()
        return { healthy: true }
      },
    },
    {
      name: 'storage',
      check: async () => {
        await Storage.exists('health-check.txt')
        return { healthy: true }
      },
    },
    {
      name: 'queue',
      check: async () => {
        const size = await Queue.size()
        return {
          healthy: size < 10000,
          meta: { queueSize: size },
        }
      },
    },
  ],

  // Disk space check
  disk: {
    threshold: 0.9, // Alert at 90% usage
  },

  // Memory check
  memory: {
    threshold: 0.85, // Alert at 85% usage
  },
}
```

### Application Metrics

```typescript
// config/metrics.ts
export default {
  enabled: true,

  // Prometheus-compatible metrics endpoint
  endpoint: '/metrics',

  // Default metrics
  collect: {
    http: true,        // Request count, duration, status codes
    database: true,    // Query count, duration
    cache: true,       // Hit/miss ratio
    queue: true,       // Job count, processing time
    memory: true,      // Heap usage
    cpu: true,         // CPU utilization
  },

  // Custom metrics
  custom: [
    {
      name: 'orders_total',
      type: 'counter',
      help: 'Total number of orders',
    },
    {
      name: 'order_value',
      type: 'histogram',
      help: 'Order value distribution',
      buckets: [10, 50, 100, 500, 1000],
    },
  ],
}

// Recording custom metrics
import { metrics } from '@stacksjs/metrics'

// Counter
metrics.increment('orders_total', { status: 'completed' })

// Histogram
metrics.observe('order_value', order.total)

// Gauge
metrics.set('active_users', await User.where('online', true).count())
```

### Structured Logging

```typescript
import { log } from '@stacksjs/clarity'

// Structured log entries
log.info('Order placed', {
  orderId: order.id,
  userId: user.id,
  total: order.total,
  items: order.items.length,
})

log.error('Payment failed', {
  orderId: order.id,
  error: error.message,
  gateway: 'stripe',
  amount: order.total,
})

// Log levels
log.debug('Detailed debugging info')
log.info('General information')
log.notice('Normal but significant')
log.warning('Warning conditions')
log.error('Error conditions')
log.critical('Critical conditions')
log.alert('Action must be taken')
log.emergency('System is unusable')

// Contextual logging
const orderLog = log.withContext({
  orderId: order.id,
  userId: user.id,
})

orderLog.info('Processing started')
orderLog.info('Payment processed')
orderLog.info('Order completed')
```

### Distributed Tracing

```typescript
// config/tracing.ts
export default {
  enabled: true,
  service: 'my-app',
  version: '1.0.0',

  exporter: {
    type: 'otlp',
    endpoint: 'http://jaeger:4318',
  },

  sampling: {
    rate: 0.1, // Sample 10% of requests
  },

  // Auto-instrument
  instrumentation: {
    http: true,
    database: true,
    redis: true,
    fetch: true,
  },
}

// Manual spans
import { trace, span } from '@stacksjs/tracing'

async function processOrder(order: Order) {
  return span('process-order', async (span) => {
    span.setAttribute('order.id', order.id)
    span.setAttribute('order.total', order.total)

    await span.child('validate-inventory', async () => {
      await validateInventory(order.items)
    })

    await span.child('process-payment', async () => {
      await processPayment(order)
    })

    await span.child('send-confirmation', async () => {
      await sendConfirmation(order)
    })
  })
}
```

### Alerting

```typescript
// config/alerts.ts
export default {
  channels: {
    slack: {
      webhook: process.env.SLACK_WEBHOOK_URL,
      channel: '#alerts',
    },
    pagerduty: {
      serviceKey: process.env.PAGERDUTY_KEY,
    },
    email: {
      to: ['ops@example.com'],
    },
  },

  rules: [
    {
      name: 'High Error Rate',
      condition: 'error_rate > 0.05',
      duration: '5m',
      severity: 'critical',
      channels: ['slack', 'pagerduty'],
    },
    {
      name: 'Slow Response Time',
      condition: 'p95_latency > 2000',
      duration: '10m',
      severity: 'warning',
      channels: ['slack'],
    },
    {
      name: 'Queue Backlog',
      condition: 'queue_size > 10000',
      duration: '5m',
      severity: 'warning',
      channels: ['slack'],
    },
    {
      name: 'Low Disk Space',
      condition: 'disk_usage > 0.9',
      duration: '1m',
      severity: 'critical',
      channels: ['slack', 'pagerduty', 'email'],
    },
  ],
}
```

## Scaling Strategies

### Horizontal Scaling

```typescript
// config/cloud.ts
export default {
  compute: {
    // Auto-scaling configuration
    autoscaling: {
      enabled: true,
      min: 2,
      max: 20,
      metrics: [
        { type: 'cpu', target: 70 },
        { type: 'memory', target: 80 },
        { type: 'requests', target: 1000 },
      ],
      cooldown: {
        scaleUp: 60,
        scaleDown: 300,
      },
    },
  },
}
```

### Database Scaling

```typescript
// config/database.ts
export default {
  connections: {
    postgres: {
      // Read replicas for scaling reads
      read: {
        host: ['replica1.db', 'replica2.db', 'replica3.db'],
        // Load balancing strategy
        strategy: 'round-robin', // or 'random', 'least-connections'
      },
      write: {
        host: 'primary.db',
      },

      // Connection pooling
      pool: {
        min: 5,
        max: 50,
        acquireTimeout: 30000,
        idleTimeout: 10000,
      },
    },
  },
}
```

### Caching Strategy

```typescript
// Multi-layer caching
const user = await cache.remember(`user:${id}`, 3600, async () => {
  // L1: Memory cache (fastest, limited size)
  // L2: Redis cache (fast, shared across instances)
  // L3: Database (source of truth)
  return await User.find(id)
})

// Cache invalidation patterns
class User extends Model {
  protected static booted() {
    this.saved((user) => {
      cache.forget(`user:${user.id}`)
      cache.tags(['users']).flush()
    })
  }
}
```

## Maintenance Mode

```typescript
// Enable maintenance mode
await buddy maintenance:on --secret="bypass-token"

// Custom maintenance page
// resources/views/maintenance.stx
@extends('layouts.minimal')

@section('content')
  <div class="maintenance">
    <h1>We'll be right back</h1>
    <p>We're performing scheduled maintenance. Please check back soon.</p>
    <p>Expected completion: {{ $estimatedTime }}</p>
  </div>
@endsection

// Allow certain IPs or tokens to bypass
// config/app.ts
export default {
  maintenance: {
    driver: 'file',
    secret: process.env.MAINTENANCE_SECRET,
    allow: [
      '192.168.1.0/24', // Office IP range
    ],
  },
}
```
