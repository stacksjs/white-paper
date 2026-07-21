---
title: Technical Architecture
description: Understanding the Stacks.js protocol specifications and module system
---

# Technical Architecture

Stacks' architecture reflects its dual nature as both a protocol and framework. The protocol defines interfaces and specifications; the monorepo provides the reference implementation.

## Protocol Specifications

The Stacks protocol defines standardized interfaces at multiple layers:

### Type Contracts

Every module exposes TypeScript interfaces that serve as specifications:

```typescript
// Model contract example
interface StacksModel {
  fields: Record<string, FieldDefinition>
  relationships?: Record<string, RelationshipDefinition>
  scopes?: Record<string, ScopeFunction>
  hooks?: ModelHooks
}

// Driver contract example
interface CacheDriver {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<boolean>
  flush(): Promise<void>
}
```

Alternative implementations can conform to these interfaces, enabling:
- Custom database drivers
- Alternative cache backends
- Third-party authentication providers
- Custom queue implementations

### Convention Specifications

The protocol documents file structures and naming conventions:

| Convention | Specification |
|-----------|---------------|
| Models | `app/Models/{Name}.ts` - PascalCase, singular |
| Controllers | `app/Controllers/{Name}Controller.ts` |
| Migrations | `database/migrations/{timestamp}_{name}.ts` |
| Components | `resources/components/{Name}.stx` |
| Routes | `routes/{web,api}.ts` |

These conventions enable auto-discovery, code generation, and consistent tooling.

## Monorepo Structure

The reference implementation is organized as a monorepo using Bun workspaces. This structure enables:

- **Shared Types**: Type definitions are centralized and imported across packages
- **Coordinated Versions**: All packages release together with synchronized versions
- **Development Efficiency**: Changes propagate instantly across the codebase
- **Selective Publishing**: Each package is independently publishable to npm
- **Protocol Compliance**: All modules implement the defined specifications

```
stacks/
├── storage/framework/
│   ├── core/                    # 77 framework modules
│   │   ├── router/
│   │   ├── database/
│   │   ├── orm/
│   │   ├── auth/
│   │   ├── ai/
│   │   ├── buddy/               # CLI
│   │   ├── types/               # 87+ type definition files
│   │   └── ... (85+ more)
│   ├── api/                     # API server
│   ├── server/                  # Development server
│   ├── cloud/                   # ts-cloud integration
│   ├── orm/                     # ORM layer
│   └── ts-auth/                 # Authentication library
├── app/                         # Application code
├── config/                      # Configuration files
├── database/                    # Migrations & seeders
├── resources/                   # Frontend resources
├── routes/                      # Route definitions
└── tests/                       # Test suite
```

## Module System (77 Packages)

The protocol is implemented through 77 specialized modules, each published independently under the `@stacksjs/` npm scope. Every module:

- Exposes a defined TypeScript interface (the specification)
- Provides a reference implementation
- Can be used independently or as part of the full stack
- Accepts alternative implementations through driver patterns

Modules are categorized by domain:

### Frontend Modules

| Module | Purpose |
|--------|---------|
| `ui` | Core UI engine and component rendering |
| `components` | STX & Web Component abstractions |
| `validation` | Client-side validation (mirrors server) |
| `strings` | String manipulation utilities |
| `arrays` | Array utilities with chainable API |
| `objects` | Object manipulation helpers |
| `datetime` | Date/time formatting and parsing |
| `collections` | Laravel-style collection operations |

### Backend Modules

| Module | Purpose |
|--------|---------|
| `router` | HTTP routing (extends bun-router) |
| `server` | HTTP server with middleware |
| `api` | API client and server utilities |
| `actions` | Business logic pattern |
| `validation` | Request validation |
| `error-handling` | Type-safe error management |

### Database Modules

| Module | Purpose |
|--------|---------|
| `database` | Database connections and drivers |
| `orm` | Object-relational mapping |
| `query-builder` | Type-safe SQL construction |

### Service Modules

| Module | Purpose |
|--------|---------|
| `auth` | Authentication & authorization |
| `cache` | Multi-backend caching |
| `queue` | Background job processing |
| `scheduler` | Cron job scheduling |
| `email` | Email sending |
| `notifications` | Multi-channel notifications |
| `payments` | Stripe integration |
| `storage` | File storage (S3-compatible) |
| `realtime` | WebSocket support |

### Infrastructure Modules

| Module | Purpose |
|--------|---------|
| `cloud` | ts-cloud integration (zero-dependency IaC) |
| `deploy` | Deployment automation |
| `dns` | Domain management |
| `security` | Security utilities |
| `health` | Health checks |
| `tunnel` | Development tunneling |

### AI Modules

| Module | Purpose |
|--------|---------|
| `ai` | Multi-provider AI client |
| `buddy` | AI assistant for development |
| `chat` | Chat interfaces |

### Development Modules

| Module | Purpose |
|--------|---------|
| `buddy` | CLI toolkit |
| `cli` | CLI creation utilities |
| `build` | Build system |
| `lint` | Code quality tools |
| `testing` | Test utilities |
| `git` | Git integration |
| `docs` | Documentation generation |
| `desktop` | Desktop app support |
