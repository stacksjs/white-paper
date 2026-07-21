---
title: Debugging with X-Ray
description: Debug and inspect Stacks.js applications with X-Ray tools
---

# Debugging with X-Ray

Stacks.js X-Ray provides powerful debugging, profiling, and inspection tools for development and production troubleshooting.

## Configuration

### X-Ray Configuration

```typescript
// config/xray.ts
export default {
  // Enable X-Ray (usually only in development)
  enabled: process.env.NODE_ENV === 'development',

  // Debug bar
  debugBar: {
    enabled: true,
    position: 'bottom', // 'bottom' | 'top' | 'right'
    collapsed: false,
  },

  // Request logging
  requests: {
    enabled: true,
    logBody: true,
    logHeaders: true,
    maxBodySize: 10000, // chars
  },

  // Query logging
  queries: {
    enabled: true,
    slowThreshold: 100, // ms
    explain: true,
  },

  // View debugging
  views: {
    enabled: true,
    showVariables: true,
  },

  // Performance profiling
  profiling: {
    enabled: true,
    sampleRate: 0.1, // 10% of requests in production
  },

  // Error tracking
  errors: {
    enabled: true,
    stackTraceLines: 20,
    captureContext: true,
  },

  // Memory tracking
  memory: {
    enabled: true,
    warnThreshold: 100 * 1024 * 1024, // 100MB
  },
}
```

## Debug Bar

### Enable Debug Bar

```stx
<!-- layouts/app.stx -->
<html>
<body>
  <x-slot name="content" />

  <!-- Debug bar (only shown in development) -->
  @if(config('xray.debugBar.enabled'))
    <x-debug-bar />
  @endif
</body>
</html>
```

### Debug Bar Panels

The debug bar shows:

- **Request Info**: Method, URL, status, duration
- **Database Queries**: All queries with timing and bindings
- **Views**: Rendered views and their data
- **Cache**: Cache hits, misses, and operations
- **Session**: Session data
- **Logs**: Log entries for this request
- **Timeline**: Request lifecycle events
- **Memory**: Memory usage

### Custom Debug Bar Panels

```typescript
import { DebugBar } from '@stacksjs/xray'

// Register custom panel
DebugBar.addPanel({
  name: 'Custom',
  icon: 'cog',
  render: (data) => {
    return `
      <div class="panel-content">
        <h3>Custom Data</h3>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>
    `
  },
  collect: async (request) => {
    return {
      customField: 'custom value',
    }
  },
})
```

## Dump & Die

### dd() Function

```typescript
import { dd, dump } from '@stacksjs/xray'

// Dump and die (stops execution)
dd(variable)

// Dump multiple variables
dd(user, request, config)

// Dump without stopping
dump(variable)

// Dump to log instead of output
dumpToLog(variable)
```

### Dump in Views

```stx
<!-- Dump variable in template -->
<x-dump :data="user" />

<!-- Dump and die -->
<x-dd :data="user" />

<!-- Conditional dump -->
@dump($user)

<!-- Dump with label -->
<x-dump :data="user" label="Current User" />
```

### Pretty Dump Output

```typescript
// Configure dump appearance
import { Dumper } from '@stacksjs/xray'

Dumper.configure({
  maxDepth: 10,
  maxItems: 100,
  theme: 'dark', // 'dark' | 'light'
  showMethods: false,
  showPrivate: true,
})
```

## Query Debugging

### Query Logging

```typescript
import { DB, QueryLog } from '@stacksjs/database'

// Enable query logging
DB.enableQueryLog()

// Run queries...
const users = await User.where('active', true).get()

// Get logged queries
const queries = DB.getQueryLog()
// [
//   { sql: 'SELECT * FROM users WHERE active = ?', bindings: [true], time: 2.5 },
//   ...
// ]

// Listen to queries in real-time
DB.listen((query) => {
  console.log(query.sql, query.bindings, `${query.time}ms`)
})

// Log slow queries
DB.listen((query) => {
  if (query.time > 100) {
    Log.warning('Slow query', { sql: query.sql, time: query.time })
  }
})
```

### Query Explain

```typescript
import { XRay } from '@stacksjs/xray'

// Explain query
const explanation = await XRay.explainQuery(
  'SELECT * FROM users WHERE email = ?',
  ['test@example.com']
)

// {
//   plan: '...',
//   indexUsed: 'users_email_index',
//   rowsExamined: 1,
//   possibleKeys: ['users_email_index'],
// }

// Explain model query
const users = User.where('email', 'test@example.com')
const plan = await XRay.explain(users)
```

### N+1 Detection

```typescript
import { XRay } from '@stacksjs/xray'

// Enable N+1 detection
XRay.detectNPlusOne()

// This will trigger a warning:
const posts = await Post.all()
for (const post of posts) {
  console.log(post.author.name) // N+1 query!
}

// Warning: N+1 query detected: Post -> Author (50 queries)
// Solution: Use Post.with('author').all()
```

## Request Inspection

### Request Logging

```typescript
import { XRay } from '@stacksjs/xray'

// Log full request
XRay.logRequest(request)

// Log response
XRay.logResponse(response)

// Get request timeline
const timeline = XRay.getTimeline()
// [
//   { event: 'request_start', time: 0 },
//   { event: 'middleware_auth', time: 5 },
//   { event: 'controller_start', time: 10 },
//   { event: 'query_1', time: 15 },
//   { event: 'query_2', time: 25 },
//   { event: 'view_render', time: 50 },
//   { event: 'response_sent', time: 75 },
// ]
```

### Request Replay

```typescript
// Save request for replay
await XRay.saveRequest(request, 'debug-request-1')

// Replay saved request
const response = await XRay.replayRequest('debug-request-1')

// Export request as cURL
const curl = XRay.toCurl(request)
// curl -X POST http://localhost:3000/api/users -H 'Content-Type: application/json' -d '{"name":"John"}'
```

## Profiling

### Performance Profiling

```typescript
import { Profiler } from '@stacksjs/xray'

// Start profiling
Profiler.start('user-creation')

// ... code to profile ...

// Stop and get results
const result = Profiler.stop('user-creation')
// { name: 'user-creation', duration: 45.2, memory: 1024 }

// Profile a function
const result = await Profiler.profile('expensive-operation', async () => {
  return await expensiveOperation()
})

// Profile with segments
Profiler.start('process')
await step1()
Profiler.segment('step1-complete')
await step2()
Profiler.segment('step2-complete')
await step3()
const profile = Profiler.stop('process')
// Includes timing for each segment
```

### CPU Profiling

```bash
# Start CPU profile
buddy xray:profile:cpu --duration=30

# Output: cpu-profile-2024-01-15.cpuprofile
# Open in Chrome DevTools for analysis
```

### Memory Profiling

```typescript
import { MemoryProfiler } from '@stacksjs/xray'

// Take heap snapshot
await MemoryProfiler.snapshot('before-operation')

// ... operation ...

await MemoryProfiler.snapshot('after-operation')

// Compare snapshots
const diff = await MemoryProfiler.compare('before-operation', 'after-operation')
// Shows memory growth, leaked objects, etc.

// Track memory over time
MemoryProfiler.track({
  interval: 1000, // Check every second
  duration: 60000, // For 1 minute
  onData: (stats) => {
    console.log(stats.heapUsed, stats.heapTotal)
  },
})
```

## Error Tracking

### Error Inspection

```typescript
import { XRay } from '@stacksjs/xray'

try {
  await riskyOperation()
} catch (error) {
  // Enhanced error with context
  const enhanced = XRay.enhanceError(error, {
    request,
    user: request.user,
    input: request.body,
  })

  // Log with full context
  XRay.logError(enhanced)

  // Get pretty stack trace
  const prettyTrace = XRay.formatStackTrace(error)
}
```

### Error Context

```typescript
// Add context to errors
XRay.addContext('user', { id: user.id, email: user.email })
XRay.addContext('request', { url: request.url, method: request.method })

// Context is automatically included in error reports
throw new Error('Something went wrong')
// Error includes user and request context
```

### Error Replay

```typescript
// Capture error state for reproduction
const errorState = await XRay.captureErrorState(error)

// Save for later debugging
await XRay.saveErrorState(errorState, 'error-123')

// Restore state in REPL for debugging
// buddy tinker
// > XRay.loadErrorState('error-123')
```

## Logging

### Structured Logging

```typescript
import { Log } from '@stacksjs/xray'

// Basic logging
Log.info('User logged in', { userId: user.id })
Log.warning('Rate limit approaching', { remaining: 10 })
Log.error('Payment failed', { orderId: order.id, error: error.message })

// With context
Log.withContext({ requestId: request.id }).info('Processing request')

// Timed operations
const timer = Log.time('database-query')
await query()
timer.end() // Logs duration automatically
```

### Log Viewer

```bash
# View logs in terminal
buddy xray:logs

# Filter by level
buddy xray:logs --level=error

# Filter by time
buddy xray:logs --since="1 hour ago"

# Follow logs
buddy xray:logs --follow

# Search logs
buddy xray:logs --search="payment"
```

### Log Dashboard

```typescript
// routes/admin.ts
router.get('/xray/logs', XRayController.logs)

// Access at /xray/logs
// Shows searchable, filterable log viewer
```

## Tracing

### Distributed Tracing

```typescript
import { Tracer } from '@stacksjs/xray'

// Start trace
const trace = Tracer.start('api-request')

// Add spans
const dbSpan = trace.startSpan('database-query')
await db.query()
dbSpan.end()

const cacheSpan = trace.startSpan('cache-lookup')
await cache.get()
cacheSpan.end()

// End trace
trace.end()

// Export for visualization (Jaeger, Zipkin compatible)
const traceData = trace.export()
```

### Request Tracing

```typescript
// Automatically trace requests
import { TraceMiddleware } from '@stacksjs/xray'

router.use(TraceMiddleware)

// Traces are automatically created for each request
// Include: route, controller, queries, cache, external calls
```

## CLI Tools

### Debug Commands

```bash
# Interactive REPL with app context
buddy tinker

# Inspect a specific model
buddy xray:model User

# Show all routes
buddy xray:routes

# Show configuration
buddy xray:config

# Show environment
buddy xray:env

# Database inspection
buddy xray:tables
buddy xray:table users

# Cache inspection
buddy xray:cache
buddy xray:cache:clear
```

### Debugging Sessions

```bash
# Start debug session
buddy xray:debug

# Opens interactive debugger with:
# - Breakpoint support
# - Variable inspection
# - Step through code
# - REPL at any point
```

## Production Debugging

### Safe Production Debugging

```typescript
// Enable temporarily for specific request
router.get('/debug/:token', async (request) => {
  const { token } = request.params

  // Verify debug token
  if (token !== process.env.DEBUG_TOKEN) {
    return response(403)
  }

  // Enable debugging for this request
  XRay.enable()

  // ... handle request ...

  return {
    queries: DB.getQueryLog(),
    timeline: XRay.getTimeline(),
    memory: process.memoryUsage(),
  }
})
```

### Health Checks

```typescript
import { HealthCheck } from '@stacksjs/xray'

// Define health checks
HealthCheck.register('database', async () => {
  await DB.raw('SELECT 1')
  return { healthy: true }
})

HealthCheck.register('cache', async () => {
  await cache.ping()
  return { healthy: true }
})

HealthCheck.register('queue', async () => {
  const pending = await Queue.pending()
  return {
    healthy: pending < 10000,
    pending,
  }
})

// Health endpoint
router.get('/health', async () => {
  return await HealthCheck.run()
})

// {
//   status: 'healthy',
//   checks: {
//     database: { healthy: true, time: 5 },
//     cache: { healthy: true, time: 2 },
//     queue: { healthy: true, pending: 50 },
//   },
// }
```

## VS Code Integration

### Launch Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Stacks App",
      "type": "bun",
      "request": "launch",
      "program": "${workspaceFolder}/app/server.ts",
      "cwd": "${workspaceFolder}",
      "stopOnEntry": false
    }
  ]
}
```

### Breakpoints

```typescript
// Set breakpoint in code
debugger // Execution stops here when debugging

// Conditional breakpoint (in VS Code)
// Right-click line number -> Add Conditional Breakpoint
// Condition: user.role === 'admin'
```

## Best Practices

### Development Debugging

```typescript
// Only in development
if (process.env.NODE_ENV === 'development') {
  XRay.enable()
  DB.enableQueryLog()
}
```

### Performance Impact

```typescript
// Minimal production overhead
export default {
  enabled: process.env.NODE_ENV !== 'production',

  // Or sample in production
  profiling: {
    enabled: true,
    sampleRate: 0.01, // 1% of requests
  },
}
```

### Security

```typescript
// Never expose debug endpoints in production
if (process.env.NODE_ENV === 'production') {
  // Disable debug bar
  // Require authentication for any debug endpoints
  // Use time-limited debug tokens
}
```
