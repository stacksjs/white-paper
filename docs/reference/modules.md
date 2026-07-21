---
title: Module Reference
description: Complete reference of all Stacks.js protocol modules
---

# Module Reference

Stacks.js is split across first-party framework packages under the `@stacksjs/`
scope. The pinned source manifest inventories 90 versioned package manifests
across the repository; that count describes packaging scope, not protocol
conformance or production fitness. Framework packages generally:

- **Exposes a defined interface** — The TypeScript types serve as the specification
- **Is independently usable** — Use any module in any TypeScript project
- **Follows consistent patterns** — Shared conventions across all modules
- **Supports driver-based extensibility** — Implement custom backends where applicable

## Core Framework Modules

### Application & Configuration

| Module | Package | Purpose |
|--------|---------|---------|
| Actions | `@stacksjs/actions` | Business logic encapsulation pattern |
| Alias | `@stacksjs/alias` | Path and module aliasing |
| Config | `@stacksjs/config` | Configuration management |
| Env | `@stacksjs/env` | Environment variable handling |
| Enums | `@stacksjs/enums` | Enumeration utilities |
| Path | `@stacksjs/path` | Path manipulation utilities |
| Registry | `@stacksjs/registry` | Service and package registry |
| Types | `@stacksjs/types` | Shared type definitions |
| Utils | `@stacksjs/utils` | General utility functions |

### HTTP & Routing

| Module | Package | Purpose |
|--------|---------|---------|
| API | `@stacksjs/api` | API client and server utilities |
| HTTP | `@stacksjs/http` | HTTP client and utilities |
| Router | `@stacksjs/router` | HTTP routing and middleware |
| Server | `@stacksjs/server` | HTTP server (Bun-native) |
| Tunnel | `@stacksjs/tunnel` | Development tunneling (localtunnels) |

### Database & ORM

| Module | Package | Purpose |
|--------|---------|---------|
| Database | `@stacksjs/database` | Database connection layer |
| DB | `@stacksjs/db` | Database query utilities |
| ORM | `@stacksjs/orm` | Object-relational mapping |
| Query Builder | `@stacksjs/query-builder` | Fluent SQL query builder |

### Authentication & Security

| Module | Package | Purpose |
|--------|---------|---------|
| Auth | `@stacksjs/auth` | Authentication system |
| Security | `@stacksjs/security` | Security utilities (CSRF, XSS, encryption) |
| Validation | `@stacksjs/validation` | Input validation and sanitization |

### Caching & Performance

| Module | Package | Purpose |
|--------|---------|---------|
| Cache | `@stacksjs/cache` | Multi-driver caching layer |

### Queue & Background Jobs

| Module | Package | Purpose |
|--------|---------|---------|
| Cron | `@stacksjs/cron` | Cron expression parsing |
| Queue | `@stacksjs/queue` | Job queue system (inspired by BullMQ) |
| Scheduler | `@stacksjs/scheduler` | Task scheduling |

### Events & Real-Time

| Module | Package | Purpose |
|--------|---------|---------|
| Events | `@stacksjs/events` | Event dispatching and listeners |
| Realtime | `@stacksjs/realtime` | WebSocket server and real-time features |
| Broadcasting | `@stacksjs/broadcasting` | Event broadcasting to WebSocket channels |

### Email & Communication

| Module | Package | Purpose |
|--------|---------|---------|
| Email | `@stacksjs/email` | Email sending (multi-provider) |
| Mail Server | `@stacksjs/mail-server` | Full mail server (post) |
| Notifications | `@stacksjs/notifications` | Multi-channel notifications |
| Push | `@stacksjs/push` | Push notification support |
| SMS | `@stacksjs/sms` | SMS messaging |
| Communication | `@stacksjs/communication` | Unified communication layer |

### Storage & Files

| Module | Package | Purpose |
|--------|---------|---------|
| Storage | `@stacksjs/storage` | File storage (local, S3, GCS) |

### AI & Intelligence

| Module | Package | Purpose |
|--------|---------|---------|
| AI | `@stacksjs/ai` | AI provider integration (OpenAI, Anthropic, etc.) |
| Chat | `@stacksjs/chat` | Chat/conversation functionality |

### Frontend & UI

| Module | Package | Purpose |
|--------|---------|---------|
| Browser | `@stacksjs/browser` | Browser detection and utilities |
| Components | `@stacksjs/components` | STX UI components |
| UI | `@stacksjs/ui` | UI rendering engine |
| Vite Config | `@stacksjs/vite-config` | Vite configuration presets |
| Vite Plugin | `@stacksjs/vite-plugin` | Custom Vite plugins |

### CLI & Developer Tools

| Module | Package | Purpose |
|--------|---------|---------|
| Buddy | `@stacksjs/buddy` | CLI toolkit and commands |
| Bun Create | `@stacksjs/bun-create` | Project scaffolding |
| CLI | `@stacksjs/cli` | CLI creation utilities |
| Lint | `@stacksjs/lint` | Code linting and formatting |
| Repl | `@stacksjs/repl` | Read-eval-print loop |
| Shell | `@stacksjs/shell` | Shell command execution |
| Tinker | `@stacksjs/tinker` | Interactive REPL for Stacks |
| X-Ray | `@stacksjs/x-ray` | Debugging and inspection tools |

### Build & Deployment

| Module | Package | Purpose |
|--------|---------|---------|
| Build | `@stacksjs/build` | Build system and bundling |
| Cloud | `@stacksjs/cloud` | ts-cloud IaC integration |
| Deploy | `@stacksjs/deploy` | Deployment automation |

### Desktop & Mobile

| Module | Package | Purpose |
|--------|---------|---------|
| Desktop | `@stacksjs/desktop` | Desktop & mobile app support (Craft) |

### Dashboard & Admin

| Module | Package | Purpose |
|--------|---------|---------|
| Dashboard | `@stacksjs/dashboard` | Auto-generated admin UI with analytics |

### Content & Commerce

| Module | Package | Purpose |
|--------|---------|---------|
| CMS | `@stacksjs/cms` | Content management system |
| Commerce | `@stacksjs/commerce` | E-commerce functionality |

### Analytics & Monitoring

| Module | Package | Purpose |
|--------|---------|---------|
| Analytics | `@stacksjs/analytics` | Analytics tracking |
| Health | `@stacksjs/health` | Health checks and monitoring |
| Logging | `@stacksjs/logging` | Structured logging (Clarity) |

### Search & Discovery

| Module | Package | Purpose |
|--------|---------|---------|
| Search Engine | `@stacksjs/search-engine` | Full-text search integration |

### Date, Time & Formatting

| Module | Package | Purpose |
|--------|---------|---------|
| Calendar | `@stacksjs/calendar` | Calendar utilities |
| DateTime | `@stacksjs/datetime` | Date/time handling (ts-datetime) |

### Data Structures & Utilities

| Module | Package | Purpose |
|--------|---------|---------|
| Arrays | `@stacksjs/arrays` | Array manipulation utilities |
| Collections | `@stacksjs/collections` | Collection utilities (ts-collect) |
| Objects | `@stacksjs/objects` | Object manipulation utilities |
| Slug | `@stacksjs/slug` | URL slug generation |
| Strings | `@stacksjs/strings` | String manipulation utilities |

### Testing & Quality

| Module | Package | Purpose |
|--------|---------|---------|
| Faker | `@stacksjs/faker` | Fake data generation (ts-mocker) |
| Testing | `@stacksjs/testing` | Test utilities and helpers |

### Networking & DNS

| Module | Package | Purpose |
|--------|---------|---------|
| DNS | `@stacksjs/dns` | DNS management (dnsx) |
| Whois | `@stacksjs/whois` | WHOIS lookup utilities |

### Documentation

| Module | Package | Purpose |
|--------|---------|---------|
| Docs | `@stacksjs/docs` | Documentation generation |

### Error Handling

| Module | Package | Purpose |
|--------|---------|---------|
| Error Handling | `@stacksjs/error-handling` | Error management and reporting |

### Version Control

| Module | Package | Purpose |
|--------|---------|---------|
| Git | `@stacksjs/git` | Git integration utilities |

### Social & External Services

| Module | Package | Purpose |
|--------|---------|---------|
| Payments | `@stacksjs/payments` | Payment processing (Stripe, etc.) |
| Socials | `@stacksjs/socials` | Social media integration |

### Plugin System

| Module | Package | Purpose |
|--------|---------|---------|
| Plugins | `@stacksjs/plugins` | Plugin architecture and loading |

## Configuration Reference

All configuration files are located in `config/` and use TypeScript for type safety.

| Config File | Purpose | Key Options |
|-------------|---------|-------------|
| `app.ts` | Application settings | name, env, timezone, locale, key |
| `auth.ts` | Authentication | guards, providers, tokens, session |
| `database.ts` | Database connections | default, connections, migrations, seeders |
| `cache.ts` | Caching | default, stores, prefix, ttl |
| `queue.ts` | Job queue | default, connections, failed, retries |
| `email.ts` | Email | default, mailers, from, queue |
| `ai.ts` | AI providers | default, providers, models, streaming |
| `cloud.ts` | Cloud infrastructure | project, mode, infrastructure, region |
| `security.ts` | Security settings | cors, csp, rateLimit, encryption |
| `commerce.ts` | E-commerce | currency, products, checkout, tax |
| `storage.ts` | File storage | default, disks, visibility |
| `logging.ts` | Logging | default, channels, level |
| `notification.ts` | Notifications | channels, queue |
| `scheduler.ts` | Task scheduling | timezone, overlap |
| `server.ts` | HTTP server | port, host, ssl, compression |
| `seo.ts` | SEO settings | sitemap, robots, meta |
| `i18n.ts` | Internationalization | locale, fallback, locales |
| `search.ts` | Search configuration | default, drivers |
| `broadcasting.ts` | Real-time broadcasting | default, connections |
| `analytics.ts` | Analytics | providers, tracking |
| `cms.ts` | Content management | collections, media |
| `desktop.ts` | Desktop app settings | window, menu, tray |
| `dns.ts` | DNS configuration | provider, zone |
| `health.ts` | Health checks | checks, endpoints |
| `plugins.ts` | Plugin configuration | enabled, paths |

## CLI Command Reference

### Development

```bash
buddy dev                    # Start development server with hot reload
buddy dev --port 3001        # Use custom port
buddy dev --https            # Enable HTTPS
buddy serve                  # Start production server
buddy tinker                 # Interactive REPL
buddy repl                   # Alternative REPL command
```

### Building & Testing

```bash
buddy build                  # Build for production
buddy build --analyze        # Build with bundle analysis
buddy test                   # Run test suite
buddy test:watch             # Run tests in watch mode
buddy test:coverage          # Run with coverage report
buddy lint                   # Run linters
buddy lint:fix               # Fix linting issues
buddy typecheck              # Check TypeScript types
buddy types:generate         # Generate type definitions
```

### Database

```bash
buddy migrate                # Run pending migrations
buddy migrate:fresh          # Drop all and re-migrate
buddy migrate:rollback       # Rollback last batch
buddy migrate:status         # Show migration status
buddy seed                   # Run database seeders
buddy db:wipe                # Drop all tables
buddy db:backup              # Backup database
buddy make:migration         # Create migration file
buddy make:model             # Create model with migration
buddy make:seeder            # Create seeder file
```

### Code Generation

```bash
buddy make:controller        # Create controller
buddy make:model             # Create model
buddy make:action            # Create action
buddy make:middleware        # Create middleware
buddy make:event             # Create event
buddy make:listener          # Create listener
buddy make:job               # Create job
buddy make:notification      # Create notification
buddy make:component         # Create STX component
buddy make:command           # Create CLI command
```

### Cache & Queue

```bash
buddy cache:clear            # Clear application cache
buddy cache:table            # Create cache database table
buddy queue:work             # Start queue worker
buddy queue:listen           # Listen for jobs (dev)
buddy queue:restart          # Restart queue workers
buddy queue:failed           # List failed jobs
buddy queue:retry            # Retry failed jobs
buddy queue:flush            # Flush failed jobs
buddy schedule:run           # Run scheduled tasks
buddy schedule:list          # List scheduled tasks
```

### Broadcasting & Real-Time

```bash
buddy broadcast:serve        # Start WebSocket server
buddy broadcast:serve --host=0.0.0.0  # Bind to all interfaces
buddy broadcast:serve --port=6001     # Custom port
buddy broadcast:serve --tls           # Enable TLS
buddy broadcast:status       # Show WebSocket server status
buddy broadcast:channels     # List active channels
buddy broadcast:connections  # List active connections
```

### Cloud & Deployment

```bash
buddy deploy                 # Deploy application
buddy deploy --env=staging   # Deploy to staging
buddy cloud:up               # Provision infrastructure
buddy cloud:down             # Tear down infrastructure
buddy cloud:status           # Show infrastructure status
buddy cloud:ssh              # SSH into server
buddy cloud:logs             # View cloud logs
buddy cloud:secret           # Manage secrets
```

### Security & Keys

```bash
buddy key:generate           # Generate application key
buddy dev:cert               # Generate dev SSL certificate
buddy dev:cert --trust       # Trust the certificate
```

### Publishing & Release

```bash
buddy release                # Create new release
buddy release:patch          # Patch version bump
buddy release:minor          # Minor version bump
buddy release:major          # Major version bump
buddy publish                # Publish packages
buddy changelog              # Generate changelog
```

### AI Assistant

```bash
buddy ai                     # Start AI assistant
buddy ai:chat                # Interactive chat mode
buddy ai:generate            # Generate code with AI
buddy ai:review              # AI code review
```

### Utilities

```bash
buddy doctor                 # Check system health
buddy upgrade                # Upgrade Stacks
buddy config:show            # Show configuration
buddy config:validate        # Validate configuration
buddy route:list             # List all routes
buddy storage:link           # Create storage symlink
buddy profile                # Profile application
buddy profile:cpu            # CPU profiling
buddy profile:memory         # Memory profiling
```

### Search

```bash
buddy search:index           # Index searchable models
buddy search:flush           # Flush search index
buddy search:import          # Import data to search
```

### i18n

```bash
buddy i18n:extract           # Extract translatable strings
buddy i18n:check             # Check for missing translations
buddy i18n:sync              # Sync translation files
```

### SEO

```bash
buddy seo:sitemap            # Generate sitemap
buddy seo:check              # Check SEO configuration
```

## Module Usage Examples

### Actions Pattern

```typescript
import { Action } from '@stacksjs/actions'

export default new Action({
  name: 'CreateUser',
  description: 'Create a new user account',

  rules: {
    email: 'required|email|unique:users',
    password: 'required|min:8',
  },

  async handle({ email, password }) {
    return await User.create({ email, password })
  }
})
```

### Events & Listeners

```typescript
// Event definition
import { Event } from '@stacksjs/events'

export const UserRegistered = new Event({
  name: 'UserRegistered',
  listeners: ['SendWelcomeEmail', 'NotifyAdmins'],
})

// Dispatching
await UserRegistered.dispatch({ user })
```

### Scheduled Tasks

```typescript
// config/scheduler.ts
export default {
  tasks: [
    {
      command: 'cache:clear',
      schedule: '0 0 * * *', // Daily at midnight
    },
    {
      job: 'CleanupTempFiles',
      schedule: '*/30 * * * *', // Every 30 minutes
    },
  ]
}
```

### Health Checks

```typescript
// config/health.ts
export default {
  checks: [
    'database',
    'cache',
    'queue',
    'storage',
    {
      name: 'custom',
      check: async () => {
        // Custom health check logic
        return { healthy: true }
      }
    }
  ]
}
```

### Plugin System

```typescript
// plugins/my-plugin.ts
import { Plugin } from '@stacksjs/plugins'

export default new Plugin({
  name: 'my-plugin',

  boot() {
    // Plugin initialization
  },

  register() {
    // Register services
  }
})
```
