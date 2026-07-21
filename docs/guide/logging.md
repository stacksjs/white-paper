---
title: Logging
description: Structured logging, log channels, log levels, and log viewers in Stacks.js
---

# Logging

Stacks.js includes Clarity, a powerful structured logging system that supports multiple channels, log levels, context enrichment, and integrations with external log management services.

> **Protocol context** — This guide covers the **Stacks.js reference implementation**. The behavior it relies on is specified by **the Observability contract** in the [Stacks Protocol white paper](/) (§7.6), so these concepts transfer to any conformant implementation — the specific APIs shown here are TypeScript/Bun.

## Configuration

### Logging Configuration

```typescript
// config/logging.ts
export default {
  // Default log channel
  default: 'stack',

  // Log channels
  channels: {
    // Write to multiple channels
    stack: {
      driver: 'stack',
      channels: ['daily', 'stderr'],
      ignoreExceptions: false,
    },

    // Single daily log file
    daily: {
      driver: 'daily',
      path: 'storage/logs/app.log',
      level: 'debug',
      days: 14, // Retention period
      permission: 0o644,
    },

    // Single log file
    single: {
      driver: 'single',
      path: 'storage/logs/app.log',
      level: 'debug',
    },

    // Standard error
    stderr: {
      driver: 'stderr',
      level: 'error',
      formatter: 'json',
    },

    // Syslog
    syslog: {
      driver: 'syslog',
      level: 'warning',
      facility: 'local6',
    },

    // Slack notifications
    slack: {
      driver: 'slack',
      url: process.env.LOG_SLACK_WEBHOOK_URL,
      channel: '#logs',
      username: 'Stacks Logger',
      level: 'critical',
    },

    // Papertrail
    papertrail: {
      driver: 'papertrail',
      host: process.env.PAPERTRAIL_HOST,
      port: process.env.PAPERTRAIL_PORT,
      level: 'info',
    },

    // Custom driver
    custom: {
      driver: 'custom',
      via: CustomLogger,
      level: 'debug',
    },
  },

  // Global context added to all logs
  context: {
    app: 'my-app',
    environment: process.env.APP_ENV,
  },
}
```

## Basic Logging

### Log Levels

```typescript
import { Log } from '@stacksjs/logging'

// Emergency: system is unusable
Log.emergency('System is down', { server: 'web-1' })

// Alert: action must be taken immediately
Log.alert('Database connection lost', { database: 'primary' })

// Critical: critical conditions
Log.critical('Payment gateway unavailable', { gateway: 'stripe' })

// Error: error conditions
Log.error('Failed to process order', { orderId: 123, error: 'timeout' })

// Warning: warning conditions
Log.warning('API rate limit approaching', { remaining: 10 })

// Notice: normal but significant
Log.notice('User registered', { userId: 456 })

// Info: informational messages
Log.info('Email sent', { to: 'user@example.com' })

// Debug: debug-level messages
Log.debug('Cache miss', { key: 'user:123' })
```

### Logging with Context

```typescript
// Pass context as second argument
Log.info('User logged in', {
  userId: user.id,
  email: user.email,
  ip: request.ip,
  userAgent: request.userAgent,
})

// Output (JSON format):
// {
//   "level": "info",
//   "message": "User logged in",
//   "context": {
//     "userId": 123,
//     "email": "user@example.com",
//     "ip": "192.168.1.1",
//     "userAgent": "Mozilla/5.0..."
//   },
//   "timestamp": "2024-01-15T10:30:00.000Z"
// }
```

### Using Specific Channels

```typescript
// Log to specific channel
Log.channel('slack').critical('Server is down!')

Log.channel('papertrail').info('Application deployed', {
  version: '1.2.3',
})

// Log to multiple channels
Log.stack(['daily', 'slack']).error('Payment failed', {
  orderId: 123,
})
```

## Contextual Logging

### Global Context

```typescript
// Add context to all subsequent logs
Log.withContext({
  requestId: request.id,
  userId: auth().id,
  sessionId: session().id,
})

// All logs now include this context
Log.info('Processing request') // Includes requestId, userId, sessionId
Log.info('Request complete')   // Includes requestId, userId, sessionId

// Clear context
Log.clearContext()
```

### Scoped Context

```typescript
// Context only for this log chain
Log.withContext({ orderId: order.id })
  .info('Processing order')
  .info('Validating items')
  .info('Charging payment')
  .info('Order complete')

// Or use scoped logger
const orderLog = Log.scope({ orderId: order.id })

orderLog.info('Processing order')
orderLog.info('Order shipped')
```

### Request Context Middleware

```typescript
// middleware/LogContext.ts
export class LogContextMiddleware extends Middleware {
  handle(request: Request, next: Function) {
    Log.withContext({
      requestId: request.id,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userId: request.user?.id,
    })

    return next()
  }
}
```

## Structured Logging

### JSON Formatting

```typescript
// config/logging.ts
export default {
  channels: {
    json: {
      driver: 'daily',
      path: 'storage/logs/app.log',
      formatter: 'json',
    },
  },
}

// Output:
// {"level":"info","message":"User created","context":{"userId":123},"timestamp":"2024-01-15T10:30:00.000Z"}
```

### Custom Formatters

```typescript
// app/Logging/CustomFormatter.ts
import { LogFormatter } from '@stacksjs/logging'

export default class CustomFormatter implements LogFormatter {
  format(level: string, message: string, context: object) {
    return JSON.stringify({
      severity: level.toUpperCase(),
      msg: message,
      data: context,
      time: new Date().toISOString(),
      service: config('app.name'),
      version: config('app.version'),
    })
  }
}

// config/logging.ts
export default {
  channels: {
    custom: {
      driver: 'daily',
      formatter: CustomFormatter,
    },
  },
}
```

## Log Channels

### File Logging

```typescript
// Daily rotating logs
channels: {
  daily: {
    driver: 'daily',
    path: 'storage/logs/app.log',
    level: 'debug',
    days: 14,
    // Creates: app-2024-01-15.log
  },
}

// Single file
channels: {
  single: {
    driver: 'single',
    path: 'storage/logs/app.log',
    level: 'debug',
  },
}
```

### Stack Channel

```typescript
// Write to multiple channels simultaneously
channels: {
  stack: {
    driver: 'stack',
    channels: ['daily', 'slack'],
    ignoreExceptions: false, // Stop if one fails
  },
}

// Only send errors to Slack
channels: {
  production: {
    driver: 'stack',
    channels: [
      { channel: 'daily', level: 'debug' },
      { channel: 'slack', level: 'error' },
    ],
  },
}
```

### External Services

```typescript
// Papertrail
channels: {
  papertrail: {
    driver: 'papertrail',
    host: 'logs.papertrailapp.com',
    port: 12345,
    level: 'info',
  },
}

// Loggly
channels: {
  loggly: {
    driver: 'loggly',
    token: process.env.LOGGLY_TOKEN,
    level: 'info',
  },
}

// Datadog
channels: {
  datadog: {
    driver: 'datadog',
    apiKey: process.env.DATADOG_API_KEY,
    level: 'info',
  },
}
```

### Slack Notifications

```typescript
channels: {
  slack: {
    driver: 'slack',
    url: process.env.LOG_SLACK_WEBHOOK_URL,
    channel: '#alerts',
    username: 'Log Bot',
    emoji: ':warning:',
    level: 'error',
  },
}

// Usage
Log.channel('slack').error('Payment gateway down', {
  gateway: 'stripe',
  error: error.message,
})
```

## Performance Logging

### Timing Operations

```typescript
// Time an operation
const timer = Log.time('database-query')
const users = await User.all()
timer.stop() // Logs: "database-query completed in 45ms"

// Time with context
const timer = Log.time('api-request', { endpoint: '/users' })
const response = await fetch(url)
timer.stop({ statusCode: response.status })

// Functional timing
const result = await Log.timeAsync('heavy-computation', async () => {
  return await heavyComputation()
})
```

### Memory Logging

```typescript
// Log memory usage
Log.memory('Before processing')
await processLargeDataset()
Log.memory('After processing')

// Output:
// [INFO] Before processing - Memory: 50MB heap, 80MB RSS
// [INFO] After processing - Memory: 150MB heap, 200MB RSS
```

### Performance Profiling

```typescript
import { Profiler } from '@stacksjs/logging'

// Profile code block
Profiler.start('request-handling')

await validateRequest()
Profiler.mark('validation-complete')

await processRequest()
Profiler.mark('processing-complete')

await sendResponse()
const profile = Profiler.stop('request-handling')

// {
//   name: 'request-handling',
//   duration: 150,
//   marks: [
//     { name: 'validation-complete', time: 20 },
//     { name: 'processing-complete', time: 120 },
//   ],
// }
```

## Log Viewing

### CLI Commands

```bash
# View recent logs
buddy logs

# Follow logs in real-time
buddy logs --follow

# Filter by level
buddy logs --level=error

# Filter by time
buddy logs --since="1 hour ago"
buddy logs --since="2024-01-15"

# Filter by content
buddy logs --search="payment"
buddy logs --grep="user:123"

# Specific log file
buddy logs --file=storage/logs/app-2024-01-15.log

# JSON output
buddy logs --json

# Tail specific number of lines
buddy logs --tail=100
```

### Log Dashboard

```typescript
// Access via Dashboard at /dashboard/logs

// Or via API
router.get('/api/logs', [
  'auth:admin',
], LogController.index)

// LogController.ts
async index(request: Request) {
  const logs = await Log.query({
    level: request.query('level'),
    search: request.query('search'),
    from: request.query('from'),
    to: request.query('to'),
    limit: request.query('limit', 100),
  })

  return response({ logs })
}
```

### Log Viewer Component

```stx
<!-- Dashboard log viewer -->
<template>
  <div class="log-viewer">
    <div class="filters">
      <x-select v-model="level" :options="levels" placeholder="Level" />
      <x-input v-model="search" placeholder="Search..." />
      <x-date-range v-model="dateRange" />
    </div>

    <div class="logs">
      <div
        v-for="log in logs"
        :key="log.id"
        class="log-entry"
        :class="log.level"
      >
        <span class="timestamp">{{ log.timestamp }}</span>
        <span class="level">{{ log.level }}</span>
        <span class="message">{{ log.message }}</span>
        <button @click="showDetails(log)">Details</button>
      </div>
    </div>
  </div>
</template>
```

## Error Logging

### Exception Logging

```typescript
try {
  await riskyOperation()
} catch (error) {
  Log.error('Operation failed', {
    exception: error.name,
    message: error.message,
    stack: error.stack,
    context: {
      userId: user.id,
      operation: 'riskyOperation',
    },
  })
}

// Shorthand
Log.exception(error, { userId: user.id })
```

### Error Aggregation

```typescript
// Group similar errors
import { ErrorAggregator } from '@stacksjs/logging'

ErrorAggregator.track(error, {
  userId: user.id,
  url: request.url,
})

// Get error statistics
const stats = await ErrorAggregator.stats('24h')
// {
//   total: 150,
//   unique: 23,
//   mostCommon: [
//     { message: 'Connection timeout', count: 45 },
//     { message: 'Validation failed', count: 30 },
//   ],
// }
```

## Query Logging

### Database Query Logging

```typescript
import { DB } from '@stacksjs/database'

// Enable query logging
DB.enableQueryLog()

// Execute queries
const users = await User.where('active', true).get()
const orders = await Order.where('user_id', user.id).get()

// Get query log
const queries = DB.getQueryLog()
// [
//   { sql: 'SELECT * FROM users WHERE active = ?', bindings: [true], time: 2.5 },
//   { sql: 'SELECT * FROM orders WHERE user_id = ?', bindings: [123], time: 1.2 },
// ]

// Log slow queries automatically
DB.listen((query) => {
  if (query.time > 100) {
    Log.warning('Slow query detected', {
      sql: query.sql,
      time: query.time,
      bindings: query.bindings,
    })
  }
})
```

## Request Logging

### HTTP Request Logging

```typescript
// middleware/RequestLogger.ts
export class RequestLoggerMiddleware extends Middleware {
  async handle(request: Request, next: Function) {
    const start = performance.now()

    const response = await next()

    const duration = performance.now() - start

    Log.info('HTTP Request', {
      method: request.method,
      url: request.url,
      status: response.status,
      duration: `${duration.toFixed(2)}ms`,
      ip: request.ip,
      userAgent: request.userAgent,
      userId: request.user?.id,
    })

    return response
  }
}
```

### API Request/Response Logging

```typescript
// Log full request/response for debugging
Log.debug('API Request', {
  method: request.method,
  url: request.url,
  headers: request.headers,
  body: request.body,
})

Log.debug('API Response', {
  status: response.status,
  headers: response.headers,
  body: response.body,
})
```

## Testing Logging

```typescript
import { Log } from '@stacksjs/logging'

describe('Logging', () => {
  beforeEach(() => {
    Log.fake() // Capture logs without writing
  })

  afterEach(() => {
    Log.restore()
  })

  it('logs user creation', async () => {
    await UserService.create({ name: 'John' })

    Log.assertLogged('info', 'User created')
    Log.assertLogged('info', (message, context) => {
      return context.name === 'John'
    })
  })

  it('logs errors on failure', async () => {
    await expect(UserService.create({})).rejects.toThrow()

    Log.assertLogged('error')
    Log.assertLoggedTimes('error', 1)
  })

  it('does not log sensitive data', async () => {
    await UserService.create({ password: 'secret' })

    Log.assertNotLogged((message, context) => {
      return JSON.stringify(context).includes('secret')
    })
  })
})
```

## Best Practices

### What to Log

```typescript
// DO log:
// - User actions (login, logout, important operations)
// - Errors and exceptions with context
// - Performance metrics (slow queries, API latency)
// - Security events (failed logins, permission changes)
// - Business events (orders, payments, signups)

Log.info('Order placed', {
  orderId: order.id,
  userId: user.id,
  total: order.total,
  items: order.items.length,
})

// DON'T log:
// - Sensitive data (passwords, tokens, PII)
// - High-volume routine operations
// - Full request/response bodies in production
```

### Log Levels Guide

```typescript
// Emergency: System unusable
Log.emergency('Database cluster completely down')

// Alert: Immediate action needed
Log.alert('Primary server unresponsive')

// Critical: Critical failure
Log.critical('Payment processing unavailable')

// Error: Runtime errors, exceptions
Log.error('Failed to send email', { error })

// Warning: Unusual but not critical
Log.warning('Cache miss rate high', { rate: 0.8 })

// Notice: Significant normal events
Log.notice('Deployment completed', { version })

// Info: General information
Log.info('User signed up', { userId })

// Debug: Detailed debugging info
Log.debug('Cache lookup', { key, hit: false })
```

### Structured Context

```typescript
// Use consistent context keys
Log.info('Payment processed', {
  // Identifiers
  userId: user.id,
  orderId: order.id,
  transactionId: transaction.id,

  // Metrics
  amount: order.total,
  currency: order.currency,

  // Metadata
  paymentMethod: 'credit_card',
  gateway: 'stripe',
})
```
