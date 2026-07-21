---
title: Framework & Protocol Comparison
description: How the Stacks.js protocol and framework compare to other solutions
---

# Framework & Protocol Comparison

This page provides an honest comparison of Stacks.js with other popular frameworks, helping you understand when Stacks is the right choice. Unlike most JavaScript frameworks, Stacks is both a **protocol** (open specifications) and a **framework** (reference implementation).

## Philosophy Comparison

| Aspect | Stacks.js | Next.js | Nuxt | Remix | Laravel |
|--------|-----------|---------|------|-------|---------|
| **Nature** | Protocol + Framework | Framework | Framework | Framework | Framework |
| **Paradigm** | Full-stack, batteries-included | React-focused, incrementally adoptable | Vue-focused, full-stack | React-focused, web standards | Full-stack, batteries-included |
| **Runtime** | Bun-native | Node.js | Node.js | Node.js | PHP |
| **Language** | TypeScript-first | JS/TS | JS/TS | JS/TS | PHP |
| **Configuration** | Convention over config | Config-heavy | Convention + config | Config-moderate | Convention over config |
| **Interoperability** | Modules work independently | Tightly coupled | Modular | Tightly coupled | Ecosystem-based |
| **Learning Curve** | Moderate (familiar to Laravel/Rails devs) | Moderate | Moderate | Moderate | Low-Moderate |

## Stacks.js vs Laravel: The Cost of "Batteries Included"

While Stacks draws significant inspiration from Laravel's developer experience and conventions, there's a fundamental difference in philosophy regarding how features are delivered.

### Laravel's Service-Oriented Model

Laravel is an excellent open-source framework, but its ecosystem has evolved toward a paid service model. Many features that developers expect from a "batteries-included" framework require separate paid subscriptions:

| Feature | Laravel | Stacks.js |
|---------|---------|-----------|
| **Server Management** | Forge ($12-199/mo) | ts-cloud (free, built-in) |
| **Serverless Deployment** | Vapor ($39/mo + AWS) | ts-cloud (free, built-in) |
| **Admin Panels** | Nova ($99-299/license) | Dashboard (free, built-in) |
| **Real-time/WebSockets** | Reverb (self-host) or Pusher ($$$) | Built-in WebSockets (free) |
| **Application Monitoring** | Pulse (free) or paid services | Analytics (free, built-in) |
| **Feature Flags** | Pennant (free) or paid services | Built-in (free) |
| **Search** | Scout + Algolia/Meilisearch | Built-in search (free) |
| **Queues** | Free (self-managed) or Horizon | Built-in (free) |
| **CI/CD** | Envoyer ($12-79/mo) | GitHub Actions templates (free) |

### Stacks: Truly Free & Complete

Stacks takes a fundamentally different approach:

- **Everything is built-in**: Authentication, real-time WebSockets, job queues, email, payments, cloud deployment, admin dashboards, analytics, search, and more—all included from day one
- **No subscription tiers**: The complete framework is MIT-licensed with no feature gates
- **No vendor lock-in**: Deploy anywhere—self-hosted, AWS, GCP, or any cloud provider
- **Production-ready out of the box**: Features aren't just "available"—they're configured and ready to use

This means a solo developer or startup can build and deploy a full-featured production application without any recurring framework-related costs beyond hosting.

### Stacks' Sustainable Business Model

Stacks sustains development through an optional **Stacks Dashboard**—a management UI that streamlines deployment, monitoring, and team collaboration:

| Plan | Price | Target |
|------|-------|--------|
| Individual | $19/month | Solo developers, indie hackers |
| Business | $59/month | Teams and companies |

The dashboard is purely optional. The framework, CLI, all 77 modules, and every feature described in this documentation remain completely free and open-source (MIT-licensed). You can build and deploy production applications without ever paying for Stacks—the dashboard simply provides a streamlined UI for those who prefer it over CLI-based workflows.

## Feature Comparison

### Core Features

| Feature | Stacks.js | Next.js | Nuxt | Remix | SvelteKit |
|---------|-----------|---------|------|-------|-----------|
| Server-Side Rendering | ✅ | ✅ | ✅ | ✅ | ✅ |
| Static Site Generation | ✅ | ✅ | ✅ | ✅ | ✅ |
| API Routes | ✅ | ✅ | ✅ | ✅ | ✅ |
| File-based Routing | ✅ | ✅ | ✅ | ✅ | ✅ |
| Built-in ORM | ✅ | ❌ | ❌ | ❌ | ❌ |
| Database Migrations | ✅ | ❌ | ❌ | ❌ | ❌ |
| Authentication | ✅ Built-in | 🔶 NextAuth | 🔶 Auth module | ❌ | ❌ |
| Job Queues | ✅ Built-in | ❌ | ❌ | ❌ | ❌ |
| Email | ✅ Built-in | ❌ | ❌ | ❌ | ❌ |
| Real-time | ✅ Built-in | ❌ | 🔶 Module | ❌ | ❌ |
| Cloud Deployment | ✅ ts-cloud | 🔶 Vercel | 🔶 Nuxt Hub | 🔶 Various | ❌ |
| CLI Tools | ✅ Buddy | ❌ | ✅ Nuxi | ❌ | ❌ |
| Desktop Apps | ✅ Craft | ❌ | ❌ | ❌ | ❌ |

✅ = Built-in | 🔶 = Available via add-on | ❌ = Not included

### Backend Features

| Feature | Stacks.js | Express | Fastify | Hono | Elysia |
|---------|-----------|---------|---------|------|--------|
| Runtime | Bun | Node | Node | Multi | Bun |
| Type Safety | Full | Partial | Partial | Full | Full |
| ORM | Built-in | ❌ | ❌ | ❌ | ❌ |
| Validation | Built-in | ❌ | ❌ | 🔶 | ✅ |
| Auth | Built-in | ❌ | ❌ | ❌ | 🔶 |
| Queue | Built-in | ❌ | ❌ | ❌ | ❌ |
| Cache | Built-in | ❌ | ❌ | ❌ | ❌ |
| Rate Limiting | Built-in | 🔶 | 🔶 | 🔶 | 🔶 |
| WebSockets | Built-in | 🔶 | 🔶 | 🔶 | ✅ |

### Performance Comparison

| Metric | Stacks.js (Bun) | Next.js (Node) | Express (Node) | Elysia (Bun) |
|--------|-----------------|----------------|----------------|--------------|
| Cold Start | ~15ms | ~150ms | ~100ms | ~10ms |
| Requests/sec (JSON) | ~100k | ~30k | ~15k | ~120k |
| Memory Usage | Low | Medium | Low | Low |
| Bundle Size | Minimal | Medium | Minimal | Minimal |

*Benchmarks are approximate and depend on workload*

## When to Choose Stacks.js

### Choose Stacks.js When:

**You want both specification and implementation:**
- Use the full framework for new projects
- Adopt individual modules in existing TypeScript projects
- Build on open specifications rather than opaque abstractions

**You want a complete solution:**
- Full-stack TypeScript with one cohesive framework
- Don't want to piece together ORM, auth, queue, email, etc.
- Prefer conventions over endless configuration

**You're coming from Laravel/Rails:**
- Familiar patterns: MVC, Eloquent-like ORM, Artisan-like CLI
- Convention-over-configuration approach
- Batteries-included philosophy

**Performance matters:**
- Native Bun performance (3-10x faster than Node.js)
- Optimized for modern hardware and workloads
- Built-in caching, queue processing, connection pooling

**You need AI integration:**
- First-class AI provider support (Claude, OpenAI, Ollama)
- AI-assisted development with Buddy
- Easy to add AI features to applications

**Cloud deployment is important:**
- Zero-dependency infrastructure as code (ts-cloud)
- Multiple deployment targets (serverless, containers, VMs)
- Built-in CI/CD patterns

**You're building an ecosystem:**
- Create packages that work with any Stacks-compatible project
- Implement custom drivers for the protocol's interfaces
- Build tooling that leverages Stacks conventions

### Consider Alternatives When:

**You need React/Vue ecosystem:**
- Next.js if deeply invested in React ecosystem
- Nuxt if deeply invested in Vue ecosystem
- Stacks uses STX (Blade-inspired), not React/Vue

**Your team knows Node.js inside-out:**
- Stacks runs on Bun, which has some differences
- Bun is highly compatible, but not 100%

**You only need a simple API:**
- Hono or Elysia might be lighter choices
- Stacks is best for full applications, not microservices

**You're building a static site:**
- Astro or similar might be simpler
- Stacks can do SSG but isn't optimized for it

## Migration Paths

### From Express/Fastify

```typescript
// Express
app.get('/users', async (req, res) => {
  const users = await db.query('SELECT * FROM users')
  res.json(users)
})

// Stacks.js
Router.get('/users', async () => {
  const users = await User.all()
  return Response.json(users)
})
```

### From Next.js API Routes

```typescript
// Next.js API Route
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const user = await prisma.user.create({ data: req.body })
    res.status(201).json(user)
  }
}

// Stacks.js
Router.post('/users', async (request: Request) => {
  const user = await User.create(request.validated())
  return Response.json(user, 201)
})
```

### From Laravel

```php
// Laravel Controller
public function store(Request $request)
{
    $user = User::create($request->validated());
    return response()->json($user, 201);
}
```

```typescript
// Stacks.js Controller
async store(request: Request): Promise<Response> {
  const user = await User.create(request.validated())
  return Response.json(user, 201)
}
```

The patterns are intentionally similar to Laravel.

## Integration Comparison

### Database & ORM

| Feature | Stacks.js (bun-query-builder) | Prisma | Drizzle | TypeORM | Kysely |
|---------|------------------------------|--------|---------|---------|--------|
| **Type Inference** | Excellent (phantom types) | Good | Very Good | Basic | Excellent |
| **Dynamic Where Methods** | ✅ Auto-generated | ❌ | ❌ | ❌ | ❌ |
| **Model-Driven Schema** | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Query Scopes** | ✅ | Via extensions | ❌ | ❌ | ❌ |
| **Built-in Caching** | ✅ LRU + TTL | ❌ | ❌ | ❌ | ❌ |
| **Soft Deletes** | ✅ Built-in | Via extension | Via extension | Manual | Manual |
| **Model Hooks** | ✅ 6 lifecycle events | ✅ | ❌ | ✅ | ❌ |
| **Relationship Loading** | ✅ with/has/whereHas | ✅ | ❌ | ✅ | ❌ |
| **Cursor Pagination** | ✅ | Via extension | ❌ | ❌ | ❌ |
| **Transaction Retry** | ✅ Exponential backoff | Manual | ❌ | ❌ | Manual |
| **Bun Native** | ✅ Direct SQL API | Via adapter | Via adapter | Via adapter | Via adapter |

**Performance (vs Prisma):**
- 29x faster DELETE operations
- 16x faster SELECT with LIMIT
- 14x faster SELECT by ID
- 81% overall win rate

**Database Support:**

| Database | Stacks.js | Prisma | Drizzle | TypeORM |
|----------|-----------|--------|---------|---------|
| PostgreSQL | ✅ | ✅ | ✅ | ✅ |
| MySQL | ✅ | ✅ | ✅ | ✅ |
| SQLite | ✅ | ✅ | ✅ | ✅ |
| MongoDB | 🔜 | ✅ | ❌ | ✅ |
| DynamoDB | ✅ | ❌ | ❌ | ❌ |
| Migrations | ✅ Auto-generated | ✅ | ✅ | ✅ |
| Seeders | ✅ | ✅ | 🔶 | 🔶 |
| Factories | ✅ | ❌ | ❌ | ❌ |

### Cloud Providers

| Provider | Stacks.js (ts-cloud) | Pulumi | Terraform | SST |
|----------|----------------------|--------|-----------|-----|
| AWS | ✅ Stable | ✅ | ✅ | ✅ |
| GCP | 🔜 Planned | ✅ | ✅ | 🔶 |
| Azure | 🔜 Planned | ✅ | ✅ | ❌ |
| Cloudflare | 🔜 Planned | ✅ | ✅ | ✅ |
| Zero Dependencies | ✅ | ❌ | ❌ | ❌ |
| TypeScript Native | ✅ | ✅ | ❌ | ✅ |

## Ecosystem Size

| Framework | npm Downloads/week | GitHub Stars | Age |
|-----------|-------------------|--------------|-----|
| Next.js | ~5M | ~120k | 8 years |
| Nuxt | ~500k | ~50k | 8 years |
| Remix | ~200k | ~27k | 3 years |
| SvelteKit | ~300k | ~17k | 3 years |
| Stacks.js | Growing | Growing | 2 years |

**Note:** Stacks.js is newer but growing rapidly. The smaller community means fewer third-party packages, but the batteries-included approach means you need fewer external packages.

## Summary

**Stacks.js is ideal for:**
- Teams wanting a Laravel/Rails-like experience in TypeScript
- Projects that benefit from open specifications and defined interfaces
- Full-stack applications needing auth, queues, email, etc.
- Projects prioritizing performance (Bun runtime)
- Applications requiring AI integration
- Self-hosted cloud infrastructure needs
- Building ecosystems of interoperable packages

**Consider alternatives for:**
- React-specific projects (Next.js)
- Vue-specific projects (Nuxt)
- Simple APIs or microservices (Hono, Elysia)
- Static sites (Astro)
- Large teams heavily invested in another ecosystem

## The Protocol Advantage

What sets Stacks apart from other frameworks is its dual nature:

| Aspect | Traditional Frameworks | Stacks.js |
|--------|----------------------|-----------|
| Code reuse | Framework-specific | Interface-based, portable |
| Extensibility | Plugin systems | Implement standard interfaces |
| Adoption | All-or-nothing | Use any module independently |
| Ecosystem | Closed | Open specifications |

The protocol approach means your knowledge transfers, your packages are portable, and your code isn't locked into a single implementation.
