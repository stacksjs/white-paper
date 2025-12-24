---
title: Performance Tuning
description: Optimize your Stacks.js application for maximum performance
---

# Performance Tuning

Stacks.js on Bun is inherently fast, but proper optimization can push performance even further. This guide covers techniques for maximizing your application's speed.

## Benchmarking Baseline

### Measuring Performance

```bash
# Built-in profiler
buddy profile --duration=60

# HTTP benchmarking with bombardier
bombardier -c 100 -n 10000 http://localhost:3000/api/health

# Or with wrk
wrk -t12 -c400 -d30s http://localhost:3000/api/health
```

### Key Metrics

| Metric | Target | Excellent |
|--------|--------|-----------|
| Response time (p50) | <50ms | <10ms |
| Response time (p99) | <200ms | <50ms |
| Requests/second | >5000 | >50000 |
| Memory usage | <512MB | <256MB |
| CPU utilization | <70% | <40% |

## Database Optimization

### Query Optimization

```typescript
// BAD: N+1 query problem
const posts = await Post.all()
for (const post of posts) {
  const author = await post.author() // Query per post!
}

// GOOD: Eager loading
const posts = await Post.with('author').all()

// BETTER: Select only needed fields
const posts = await Post
  .select('id', 'title', 'author_id')
  .with('author:id,name')
  .all()
```

### Indexing Strategy

```typescript
// database/migrations/add_indexes.ts
export default {
  async up() {
    await DB.schema.table('posts', (table) => {
      table.index('author_id')
      table.index('created_at')
      table.index(['status', 'published_at']) // Composite index
      table.unique('slug')
    })
  }
}
```

### Query Logging

```typescript
// config/database.ts
export default {
  logging: {
    queries: true,
    slowQueryThreshold: 100, // Log queries slower than 100ms
  }
}

// In application
DB.enableQueryLog()

// ... run queries ...

const queries = DB.getQueryLog()
console.log(queries.filter(q => q.duration > 50))
```

### Connection Pooling

```typescript
// config/database.ts
export default {
  connections: {
    default: {
      driver: 'postgres',
      pool: {
        min: 5,
        max: 20,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 10000,
      }
    }
  }
}
```

## Caching Strategies

### Response Caching

```typescript
// Cache entire responses
router.get('/api/products', async (request) => {
  return cache.remember('products:all', 3600, async () => {
    return await Product.with('category').all()
  })
})

// Cache with tags for invalidation
router.get('/api/products/:id', async (request) => {
  const { id } = request.params

  return cache.tags(['products', `product:${id}`])
    .remember(`product:${id}`, 3600, async () => {
      return await Product.find(id)
    })
})
```

### Query Result Caching

```typescript
// Model-level caching
class Product extends Model {
  static cache = {
    ttl: 3600,
    tags: ['products'],
  }

  static async featured() {
    return cache.remember('products:featured', 3600, async () => {
      return this.where('featured', true).limit(10).get()
    })
  }
}
```

### Cache Warming

```typescript
// app/Console/Commands/WarmCache.ts
export default {
  signature: 'cache:warm',

  async handle() {
    // Pre-populate frequently accessed data
    const products = await Product.all()
    await cache.put('products:all', products, 3600)

    const categories = await Category.with('products').all()
    await cache.put('categories:all', categories, 3600)

    console.log('Cache warmed successfully')
  }
}
```

### Cache Configuration

```typescript
// config/cache.ts
export default {
  default: 'redis',

  stores: {
    redis: {
      driver: 'redis',
      connection: 'cache',
      prefix: 'app:cache:',
    },

    memory: {
      driver: 'memory',
      maxSize: 100 * 1024 * 1024, // 100MB
    }
  }
}
```

## HTTP Optimization

### Response Compression

```typescript
// config/server.ts
export default {
  compression: {
    enabled: true,
    threshold: 1024, // Only compress > 1KB
    level: 6, // Compression level (1-9)
  }
}
```

### HTTP/2 and Keep-Alive

```typescript
// config/server.ts
export default {
  http2: true,
  keepAlive: {
    timeout: 5000,
    maxRequests: 1000,
  }
}
```

### Static Asset Optimization

```typescript
// config/server.ts
export default {
  static: {
    maxAge: 31536000, // 1 year for hashed assets
    etag: true,
    lastModified: true,
    immutable: true, // For fingerprinted assets
  }
}
```

### Request Batching

```typescript
// Batch multiple API calls
router.post('/api/batch', async (request) => {
  const { requests } = request.body

  const results = await Promise.all(
    requests.map(req => processRequest(req))
  )

  return { results }
})
```

## Frontend Performance

### Code Splitting

```typescript
// config/build.ts
export default {
  build: {
    splitting: true,
    minify: true,
    target: 'esnext',
  }
}
```

### Asset Optimization

```typescript
// config/build.ts
export default {
  assets: {
    images: {
      optimize: true,
      formats: ['webp', 'avif'],
      quality: 80,
    },
    fonts: {
      preload: true,
      display: 'swap',
    }
  }
}
```

### Critical CSS

```stx
<head>
  <!-- Inline critical CSS -->
  <style>
    {!! await Vite.criticalCss() !!}
  </style>

  <!-- Defer non-critical CSS -->
  <link rel="preload" href="/css/app.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
</head>
```

### Lazy Loading

```stx
<!-- Lazy load images -->
<img src="/placeholder.jpg"
     data-src="/images/hero.jpg"
     loading="lazy"
     decoding="async" />

<!-- Lazy load components -->
<x-lazy component="HeavyChart" :props="chartData" />
```

## Memory Management

### Streaming Large Datasets

```typescript
// BAD: Load all into memory
const users = await User.all() // 1M users = memory issues

// GOOD: Stream processing
const stream = User.cursor()
for await (const user of stream) {
  await processUser(user)
}

// GOOD: Chunked processing
await User.chunk(1000, async (users) => {
  await processUsers(users)
})
```

### Memory Limits

```typescript
// config/server.ts
export default {
  limits: {
    bodySize: '10mb',
    jsonDepth: 20,
    parameterLimit: 1000,
  }
}
```

### Garbage Collection

```bash
# Run with explicit GC
bun --smol run start

# Monitor memory
buddy monitor --memory
```

## Queue Optimization

### Concurrent Processing

```typescript
// config/queue.ts
export default {
  connections: {
    default: {
      driver: 'redis',
      concurrency: 10, // Process 10 jobs simultaneously
    }
  }
}
```

### Job Batching

```typescript
// Batch similar operations
const batch = Queue.batch([
  new SendEmailJob(user1),
  new SendEmailJob(user2),
  new SendEmailJob(user3),
])

batch.dispatch()
```

### Priority Queues

```typescript
// config/queue.ts
export default {
  queues: {
    high: { concurrency: 20 },
    default: { concurrency: 10 },
    low: { concurrency: 5 },
  }
}

// Dispatch to specific queue
HighPriorityJob.dispatch().onQueue('high')
```

## Server Configuration

### Bun Runtime Options

```bash
# Optimize for production
bun run --smol start  # Reduced memory mode

# Custom memory limit
BUN_JSC_forceRAMSize=4294967296 bun run start  # 4GB limit
```

### Process Management

```typescript
// ecosystem.config.js (for PM2)
module.exports = {
  apps: [{
    name: 'stacks-app',
    script: 'bun',
    args: 'run start',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
    }
  }]
}
```

### Load Balancing

```nginx
# nginx.conf
upstream stacks_app {
    least_conn;
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
    keepalive 64;
}

server {
    location / {
        proxy_pass http://stacks_app;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

## Monitoring & Profiling

### Built-in Profiler

```bash
# CPU profiling
buddy profile:cpu --duration=30

# Memory profiling
buddy profile:memory

# Request tracing
buddy profile:requests --sample=100
```

### Query Analysis

```typescript
// Enable slow query logging
DB.listen('query', (query) => {
  if (query.duration > 100) {
    Log.warning('Slow query', {
      sql: query.sql,
      duration: query.duration,
      bindings: query.bindings,
    })
  }
})
```

### Performance Dashboard

```bash
# Start monitoring dashboard
buddy monitor

# View in browser
# http://localhost:3001/monitor
```

## Optimization Checklist

### Database
- [ ] Added indexes for frequently queried columns
- [ ] Using eager loading to avoid N+1
- [ ] Selecting only needed columns
- [ ] Connection pooling configured
- [ ] Slow query logging enabled

### Caching
- [ ] Response caching for expensive queries
- [ ] Cache warming for critical paths
- [ ] Tag-based invalidation strategy
- [ ] Appropriate TTLs set

### HTTP
- [ ] Compression enabled
- [ ] HTTP/2 enabled
- [ ] Static asset caching configured
- [ ] Keep-alive enabled

### Frontend
- [ ] Code splitting enabled
- [ ] Images optimized
- [ ] Critical CSS inlined
- [ ] Lazy loading implemented

### Server
- [ ] Production mode enabled
- [ ] Process manager configured
- [ ] Load balancer in place
- [ ] Health checks configured

## Performance Targets by Scale

### Small (< 1K RPM)
- Single server
- SQLite/PostgreSQL
- Memory caching
- Simple deployment

### Medium (1K - 100K RPM)
- Load balanced servers
- PostgreSQL with read replicas
- Redis caching
- CDN for assets

### Large (> 100K RPM)
- Auto-scaling clusters
- Database sharding
- Distributed caching
- Edge deployment
- Message queues for decoupling
