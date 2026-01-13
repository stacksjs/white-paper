# Stacks.js

## A Full-Stack Framework & Protocol for TypeScript & Bun

**Version 0.70.23 | Closed Beta**

---

### White Paper

**Author**: Stacks.js Core Team

**Published**: January 2026

**Framework Repository**: https://github.com/stacksjs/stacks

---

## Abstract

Stacks.js is both an **open protocol** and its **reference implementation** for building full-stack TypeScript applications. As a protocol, it defines conventions, interfaces, and specifications that standardize how TypeScript applications handle routing, data modeling, validation, authentication, and more. As a framework, it provides a batteries-included implementation of this protocol, built from the ground up for the Bun runtime.

This white paper presents the architectural foundations, design philosophy, and technical capabilities of Stacks.js. We examine how the protocol addresses the fragmentation and complexity inherent in modern JavaScript/TypeScript development by establishing consistent conventions, shared type contracts, and interoperable module specifications comprising 77 specialized packages.

**Keywords**: TypeScript, Bun, Full-Stack Framework, Protocol, AI Integration, Developer Experience, Convention over Configuration

---

## Executive Summary

Modern web development has become increasingly fragmented. Developers must orchestrate dozens of tools, libraries, and frameworks—each with its own configuration, conventions, and learning curve. The JavaScript ecosystem, while rich, lacks both the cohesive frameworks and the **standardized protocols** that have made platforms like Laravel (PHP) and Ruby on Rails paradigmatically successful.

**Stacks.js is built by developers, for developers.** Born from years of experience building production applications and the frustration of juggling disparate tools, Stacks addresses this gap as both a protocol and framework:

### As a Protocol

Stacks defines open specifications for:
- **Type Contracts**: Standardized interfaces for models, requests, responses, and services
- **Convention Patterns**: File structures, naming conventions, and architectural patterns
- **Module Interfaces**: APIs that allow any compliant implementation to integrate
- **Driver Patterns**: Pluggable backends for databases, caches, queues, and cloud providers

### As a Framework

The reference implementation provides:

1. **Unified Full-Stack Architecture**: A single framework encompassing frontend UI, backend APIs, database ORM, cloud infrastructure, real-time communication, authentication, payments, and more—all working in concert with shared conventions and types.

2. **Bun-Native Performance**: Built exclusively for Bun, Stacks leverages the runtime's exceptional speed for both development and production, achieving startup times and request throughput that surpass traditional Node.js frameworks.

3. **AI-First Development**: Deep integration with leading AI providers (Anthropic Claude, OpenAI, Ollama) enables AI-powered code generation, natural language codebase modification, and intelligent development assistance through the "Buddy" AI system.

The protocol is structured around 77 focused modules, each with a defined interface that can be implemented independently. This enables developers to adopt Stacks incrementally—using individual packages with any TypeScript project, or the complete framework for new applications.

Stacks is currently in Closed Beta (January 2026), with active development supported by sponsors including JetBrains and the Solana Foundation. Both the protocol specifications and reference implementation are open-source, licensed under MIT, and designed for indie developers, enterprise teams, and framework authors building on the Stacks protocol.

---

# Part I: Introduction & Vision

## 1. Introduction

### 1.1 The Problem: Modern Web Development Complexity

The contemporary JavaScript/TypeScript ecosystem presents developers with an unprecedented paradox: more tools than ever, yet more friction than ever. Building a production-ready web application requires decisions across dozens of categories:

- **Runtime**: Node.js, Deno, or Bun?
- **Framework**: Next.js, Nuxt, Remix, SvelteKit, or Astro?
- **API Layer**: REST, GraphQL, tRPC, or gRPC?
- **Database**: PostgreSQL, MySQL, SQLite, MongoDB, or serverless options?
- **ORM**: Prisma, Drizzle, TypeORM, or Kysely?
- **Authentication**: Auth0, Clerk, NextAuth, or custom implementation?
- **Styling**: Tailwind, CSS Modules, styled-components, or vanilla CSS?
- **State Management**: Redux, Zustand, Jotai, or signals?
- **Testing**: Jest, Vitest, Playwright, or Cypress?
- **Deployment**: Vercel, Cloudflare, AWS, or self-hosted?

Each decision cascades into further choices, configuration requirements, and integration challenges. The result is "JavaScript fatigue"—a state where developers spend more time configuring tools than building features.

**Contrast this with the Laravel or Rails experience**: a single installation provides routing, templating, ORM, migrations, authentication, queues, mail, and more. Conventions replace configuration. Documentation is unified. The community speaks a common language.

**However, Laravel's ecosystem has evolved toward a service-oriented model.** While Laravel itself is open-source, many essential features require paid first-party services: Forge for server management, Vapor for serverless deployment, Nova for admin panels, Pulse for monitoring, Reverb for WebSockets, and more. What begins as a "free" framework often requires significant subscription costs to unlock its full potential in production.

**Stacks takes a different approach: everything is built-in and free.** Authentication, real-time WebSockets, job queues, email, payments integration, cloud deployment (ts-cloud), admin dashboards, analytics, and more—all included out of the box, fully configured, and ready to use. No subscription tiers. No feature gates. No vendor lock-in. The complete framework is MIT-licensed and designed to be self-hosted or deployed anywhere.

Stacks sustains development through an optional **Stacks Dashboard**—a management UI that streamlines deployment, monitoring, and team collaboration ($19/month for individuals, $59/month for businesses). The dashboard is purely optional; the framework and all its features remain completely free and open-source.

### 1.2 The Solution: Stacks.js

Stacks.js reimagines the full-stack TypeScript experience by providing:

**A Complete Framework**: Everything needed to build modern applications—from UI components to cloud infrastructure—in one cohesive package.

**Convention Over Configuration**: Sensible defaults that work out of the box, with escape hatches for customization when needed.

**Type Safety Throughout**: End-to-end TypeScript, with types flowing seamlessly from database schemas to API responses to frontend components.

**Modern Runtime**: Built for Bun, leveraging its speed, native TypeScript support, and unified tooling (runtime, package manager, bundler, test runner).

**AI Integration**: First-class support for AI providers, enabling intelligent code generation, natural language development, and AI-powered features in applications.

### 1.3 Design Philosophy

Stacks is built on six foundational principles:

#### Principle 1: Developer Joy

Every API decision, every default configuration, every error message is evaluated against a simple question: Does this bring joy to developers? Stacks optimizes for the developer experience, recognizing that productive developers build better software.

#### Principle 2: Progressive Disclosure

Simple things should be simple; complex things should be possible. Stacks provides zero-configuration defaults for common patterns while exposing full control when needed. A beginner can build their first application in minutes; an expert can customize every aspect.

#### Principle 3: Type-Driven Development

TypeScript is not an afterthought but the foundation. Types are generated, inferred, and validated at every layer. The compiler catches errors before runtime. IDE integration provides intelligent completions. Types are documentation.

#### Principle 4: Batteries Included, Batteries Removable

Stacks ships with solutions for common requirements—authentication, payments, email, queues—but none are mandatory. Each module is independently usable and replaceable. The framework adapts to the project, not vice versa.

#### Principle 5: Protocol-First Design

Every module exposes well-defined interfaces that serve as specifications. Third parties can implement alternative backends, extend functionality, or integrate individual packages. The protocol enables an ecosystem; the framework is one implementation of it.

#### Principle 6: AI as Collaborator

AI capabilities are woven throughout the framework, not bolted on. From code generation to codebase exploration to application features, AI assistance is available at every level—for developers and end users alike.

---

## 2. Framework Overview

### 2.1 What is Stacks?

Stacks is a **rapid full-stack development framework** built with TypeScript and optimized for the Bun runtime. It provides:

- **Frontend**: STX components, Web Components, templating engine, CSS framework
- **Backend**: HTTP routing, middleware, validation, business logic patterns
- **Database**: Multi-dialect ORM, query builder, migrations, seeders
- **Infrastructure**: ts-cloud integration (zero-dependency IaC), serverless support, deployment automation
- **Services**: Authentication, payments, email, SMS, notifications, queues
- **AI**: Multi-provider AI integration, voice assistant, code generation
- **CLI**: Comprehensive command-line toolkit with 50+ command categories
- **Desktop**: Craft-based desktop application support
- **Libraries**: Tools for publishing npm packages and component libraries

### 2.2 Core Principles

#### Convention Over Configuration

Stacks follows established conventions inspired by Laravel and Rails:

```
app/
├── Actions/          # Business logic handlers
├── Models/           # Database models
├── Middleware/       # Request middleware
├── Jobs/             # Queue jobs
└── Notifications/    # Notification classes

config/               # 40+ configuration files
database/
├── migrations/       # Database migrations
└── seeders/          # Data seeders
resources/
├── components/       # UI components
├── views/            # Page templates
└── functions/        # Utility functions
routes/               # Route definitions
```

Files in these directories are auto-discovered. Models are automatically mapped to database tables. Components are auto-imported. Routes are file-based or explicitly defined.

#### Zero-Config Development

Starting a new project requires no configuration:

```bash
bunx stacks new my-app
cd my-app
buddy dev
```

The development server starts with hot reloading, TypeScript compilation, and all framework features enabled.

#### Explicit Over Implicit (When It Matters)

While conventions reduce boilerplate, Stacks favors explicitness for business logic:

```typescript
// Actions are explicit about their inputs and outputs
export default async function CreateUser(request: CreateUserRequest): Promise<User> {
  const validated = await validate(request, CreateUserSchema)
  const user = await User.create(validated)
  await SendWelcomeEmail.dispatch(user)
  return user
}
```

### 2.3 Target Audience

Stacks serves three primary audiences:

#### Indie Developers & Startups

Stacks enables solo developers and small teams to build production-ready applications quickly. The integrated feature set (auth, payments, email, etc.) eliminates the need to evaluate and integrate third-party services for common requirements.

#### Enterprise Teams

Large organizations benefit from Stacks' consistency and type safety. The framework's conventions reduce onboarding time, while its modularity allows teams to adopt components incrementally within existing systems.

#### Library Authors

Stacks' publishing tools support developers creating and distributing:
- STX component libraries
- Web Component packages
- Utility function libraries
- CLI applications

### 2.4 Extending Projects with Stacks

Stacks projects can be extended with pre-built functionality packages called **Stacks**. A Stack is a community or first-party package that adds features to your project by merging its contents directly into your codebase.

```bash
# Install a Stack by name
buddy add blog

# Install from a GitHub repository
buddy add github:stacksjs/commerce-stack

# Install from npm
buddy add @stacksjs/admin-stack
```

When you run `buddy add stack-name`, the CLI:

1. **Resolves the package** - Finds the Stack from the registry, GitHub, or npm
2. **Downloads the contents** - Fetches the Stack's files
3. **Merges into your project** - Copies the folder structure directly into your project

This means a Stack can include models, migrations, components, actions, routes, and more—all instantly integrated into your project following Stacks conventions.

```bash
# Example: Adding a blog Stack adds these files to your project:
buddy add blog

# app/Models/Post.ts
# app/Models/Category.ts
# app/Actions/CreatePostAction.ts
# database/migrations/create_posts_table.ts
# resources/components/BlogList.stx
# routes/blog.ts
```

Any Stacks project can be published as a Stack for others to use, creating a rich ecosystem of shareable, composable functionality.

---

# Part II: Architecture

## 3. Technical Architecture

### 3.1 Monorepo Structure

Stacks is organized as a monorepo using Bun workspaces. This structure enables:

- **Shared Types**: Type definitions are centralized and imported across packages
- **Coordinated Versions**: All packages release together with synchronized versions
- **Development Efficiency**: Changes propagate instantly across the codebase
- **Selective Publishing**: Each package is independently publishable to npm

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

### 3.2 Module System (77 Packages)

The framework comprises 77 specialized modules, each published independently under the `@stacksjs/` npm scope. Modules are categorized by domain:

#### Frontend Modules
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

#### Backend Modules
| Module | Purpose |
|--------|---------|
| `router` | HTTP routing (extends bun-router) |
| `server` | HTTP server with middleware |
| `api` | API client and server utilities |
| `actions` | Business logic pattern |
| `validation` | Request validation |
| `error-handling` | Type-safe error management |

#### Database Modules
| Module | Purpose |
|--------|---------|
| `database` | Database connections and drivers |
| `orm` | Object-relational mapping |
| `query-builder` | Type-safe SQL construction |

#### Service Modules
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

#### Infrastructure Modules
| Module | Purpose |
|--------|---------|
| `cloud` | ts-cloud integration (zero-dependency IaC) |
| `deploy` | Deployment automation |
| `dns` | Domain management |
| `security` | Security utilities |
| `health` | Health checks |
| `tunnel` | Development tunneling |

#### AI Modules
| Module | Purpose |
|--------|---------|
| `ai` | Multi-provider AI client |
| `buddy` | AI assistant for development |
| `chat` | Chat interfaces |

#### Development Modules
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

### 3.3 Request Lifecycle

A typical HTTP request flows through the following stages:

```
Request
   │
   ▼
┌─────────────────────┐
│    Bun HTTP Server  │
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│   Global Middleware │  (CORS, logging, security headers)
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│      Router         │  (Match URL to handler)
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│  Route Middleware   │  (Auth, rate limiting)
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│    Validation       │  (Request schema validation)
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│   Action/Handler    │  (Business logic execution)
└─────────────────────┘
   │
   ▼
┌─────────────────────┐
│    Response         │  (Serialization, headers)
└─────────────────────┘
   │
   ▼
Response
```

#### Router Integration

The router extends `bun-router` with framework-specific enhancements:

```typescript
// routes/api.ts
import { router } from '@stacksjs/router'

router.get('/users', 'Actions/UserIndexAction')
router.post('/users', 'Actions/CreateUserAction')
router.get('/users/{id}', 'Actions/ShowUserAction')
router.put('/users/{id}', 'Actions/UpdateUserAction')
router.delete('/users/{id}', 'Actions/DeleteUserAction')

// Resource shorthand
router.resource('/posts', 'Actions/PostActions')

// Route groups with middleware
router.group({ middleware: ['auth'] }, () => {
  router.get('/dashboard', 'Actions/DashboardAction')
  router.get('/settings', 'Actions/SettingsAction')
})
```

### 3.4 Configuration System

Stacks provides 40+ configuration files, each fully typed with inline documentation:

```typescript
// config/database.ts
import type { DatabaseConfig } from '@stacksjs/types'

export default {
  default: 'sqlite',

  connections: {
    sqlite: {
      driver: 'sqlite',
      database: 'storage/database.sqlite',
      prefix: '',
    },

    mysql: {
      driver: 'mysql',
      host: env('DB_HOST', 'localhost'),
      port: env('DB_PORT', 3306),
      database: env('DB_DATABASE', 'stacks'),
      username: env('DB_USERNAME', 'root'),
      password: env('DB_PASSWORD', ''),
    },

    postgres: {
      driver: 'postgres',
      host: env('DB_HOST', 'localhost'),
      port: env('DB_PORT', 5432),
      database: env('DB_DATABASE', 'stacks'),
      username: env('DB_USERNAME', 'postgres'),
      password: env('DB_PASSWORD', ''),
    },
  },

  migrations: {
    table: 'migrations',
    path: 'database/migrations',
  },
} satisfies DatabaseConfig
```

Configuration benefits:
- **Type Safety**: IDE autocomplete for all options
- **Documentation**: Inline comments explain each setting
- **Environment Variables**: Seamless `.env` integration
- **Defaults**: Sensible values work out of the box

---

## 4. Runtime & Performance

### 4.1 Bun Runtime Optimization

Stacks is built exclusively for Bun, leveraging its unique performance characteristics:

#### Native TypeScript Execution

Bun executes TypeScript directly without a separate compilation step. This eliminates:
- Build watch processes during development
- Source map complexity
- Type stripping overhead

#### Unified Tooling

Bun provides runtime, package manager, bundler, and test runner in one binary:

```bash
bun install          # Package management (faster than npm/yarn/pnpm)
bun run              # Script execution
bun test             # Test runner
bun build            # Production bundling
```

#### Performance Characteristics

Bun's V8-alternative JavaScriptCore engine delivers:
- **Startup Time**: ~3x faster than Node.js
- **HTTP Throughput**: Higher requests/second for API workloads
- **Memory Usage**: Lower baseline memory footprint

### 4.2 Zero-Config Defaults

Stacks ships with production-ready defaults:

```typescript
// Development server starts with one command
buddy dev

// Includes:
// - Hot module replacement
// - TypeScript compilation
// - API server
// - File watching
// - Error overlay
// - Request logging
```

Production builds require no additional configuration:

```bash
buddy build
# Outputs optimized bundles for deployment
```

### 4.3 Build System

The build system supports multiple output targets:

#### Web Applications
```bash
buddy build:web
# - STX component compilation
# - Asset optimization
# - Code splitting
# - Tree shaking
```

#### API/Server
```bash
buddy build:api
# - Server bundle
# - Dependency bundling
# - Environment handling
```

#### Desktop Applications
```bash
buddy build:desktop
# - Craft application packaging
# - Cross-platform binaries
# - Native integrations
```

#### Library Publishing
```bash
buddy build:lib
# - ESM and CJS outputs
# - Type declarations
# - Package.json generation
```

---

# Part III: Core Modules

## 5. Frontend Development

### 5.1 UI Components (STX & Web Components)

Stacks provides a component system powered by STX that outputs standard Web Components:

```stx
<!-- resources/components/Button.stx -->
@ts
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}
@endts

@component('Button', {
  props: {
    variant: 'primary',
    size: 'md',
    disabled: false
  }
})
  <button
    class="btn btn-{{ variant }} btn-{{ size }}"
    :disabled="disabled"
  >
    <slot />
  </button>

  <style>
    .btn {
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    .btn-primary {
      background: #2563eb;
      color: white;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
    .btn-secondary {
      background: #e5e7eb;
      color: #1f2937;
    }
    .btn-danger {
      background: #dc2626;
      color: white;
    }
  </style>
@endcomponent
```

Components are automatically:
- **Registered**: No import statements needed in templates
- **Typed**: TypeScript props are enforced
- **Documented**: Types generate documentation
- **Publishable**: Export as npm packages

### 5.2 STX Templating Engine

STX is a modern, Laravel Blade-inspired templating engine that combines Vue-like Single File Components with server-side rendering capabilities. It's built for Bun and provides 40+ directives out of the box.

**Single File Component Structure:**

```html
<!-- resources/views/dashboard.stx -->
<script server>
  // Server-only code - extracted and stripped from output
  const user = await User.find(userId)
  const notifications = await Notification.where('user_id', userId).get()
</script>

<script client>
  // Client-only code - preserved for browser
  function toggleMenu() { ... }
</script>

<template>
  <x-layout title="Dashboard">
    <x-slot:header>
      <h1>Welcome, {{ user.name }}</h1>
    </x-slot:header>

    @if(notifications.length > 0)
      <x-notification-list :notifications="notifications" />
    @else
      <p>No new notifications</p>
    @endif

    @foreach(projects as project)
      <x-project-card :project="project" :key="project.id" />
    @endforeach

    @auth
      <x-admin-panel />
    @endauth

    @markdown
      ## Help Section
      Need assistance? Contact support.
    @endmarkdown
  </x-layout>
</template>

<style>
  .dashboard { padding: 2rem; }
</style>
```

**Available Directives (40+):**

| Category | Directives |
|----------|------------|
| **Conditionals** | `@if`, `@elseif`, `@else`, `@endif`, `@unless`, `@isset`, `@empty`, `@switch`, `@case`, `@default` |
| **Loops** | `@foreach`, `@for`, `@while`, `@forelse`, `@break`, `@continue` |
| **Layouts** | `@layout`, `@extends`, `@section`, `@yield`, `@slot`, `@stack`, `@push`, `@prepend` |
| **Includes** | `@include`, `@partial`, `@includeIf`, `@includeWhen`, `@includeFirst`, `@once` |
| **Auth** | `@auth`, `@guest`, `@can`, `@cannot` |
| **Forms** | `@csrf`, `@method`, `@error` |
| **SEO** | `@meta`, `@seo`, `@structuredData` |
| **Content** | `@markdown`, `@json`, `@translate`, `@t` |
| **Accessibility** | `@a11y`, `@screenReader` |
| **Environment** | `@env`, `@production`, `@development` |

**Auto-Imported Components:**

Components in the `components/` directory are automatically available:

```html
<!-- No import needed - auto-discovered -->
<UserCard name="John" role="Admin" />
<FormsInput type="email" placeholder="Email" />
```

**Two-Way Binding (Alpine.js-style):**

```html
<div x-data="{ count: 0, message: '' }">
  <input x-model="message" placeholder="Type..." />
  <span x-text="message"></span>
  <button @click="count++">Count: {{ count }}</button>
  <div x-show="count > 5">High count!</div>
</div>
```

STX features:
- **Vue-like SFC**: `<script>`, `<template>`, `<style>` structure with server/client variants
- **40+ Blade Directives**: Full Laravel Blade compatibility
- **Auto-Import Components**: PascalCase components from `components/` directory
- **Scoped Slots**: Named and scoped slots with data passing
- **Expression Filters**: `{{ value | uppercase }}`, `{{ date | format:'YYYY-MM-DD' }}`
- **Safe Evaluation**: Sandboxed expression execution preventing XSS
- **200K+ Icons**: Built-in Iconify integration
- **SSR Support**: Full server-side rendering with hydration
- **Hot Reload**: Development mode with state preservation

### 5.3 Headwind CSS Framework

Headwind is a utility-first CSS framework optimized for Stacks:

```html
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <div class="flex items-center gap-3">
    <img class="w-12 h-12 rounded-full" :src="user.avatar" />
    <div>
      <h3 class="font-semibold text-gray-900">{{ user.name }}</h3>
      <p class="text-sm text-gray-500">{{ user.email }}</p>
    </div>
  </div>
  <x-button variant="primary">Follow</x-button>
</div>
```

Key features:
- **JIT Compilation**: Only used classes are included
- **Design Tokens**: Consistent spacing, colors, typography
- **Dark Mode**: Built-in dark mode support
- **Responsive**: Mobile-first responsive utilities

### 5.4 Client-Side Utilities

Stacks provides utility modules for common frontend operations:

#### Strings
```typescript
import { Str } from '@stacksjs/strings'

Str.slug('Hello World')           // 'hello-world'
Str.camel('hello_world')          // 'helloWorld'
Str.plural('post')                // 'posts'
Str.limit('Long text...', 10)     // 'Long te...'
Str.random(16)                    // Random string
```

#### Arrays
```typescript
import { Arr } from '@stacksjs/arrays'

Arr.shuffle([1, 2, 3, 4, 5])
Arr.chunk([1, 2, 3, 4, 5], 2)     // [[1, 2], [3, 4], [5]]
Arr.unique([1, 1, 2, 2, 3])       // [1, 2, 3]
Arr.pluck(users, 'name')          // ['Alice', 'Bob']
```

#### Collections
```typescript
import { collect } from '@stacksjs/collections'

collect(users)
  .where('active', true)
  .sortBy('name')
  .pluck('email')
  .toArray()
```

---

## 6. Backend Development

### 6.1 Routing System

Stacks routing extends `bun-router` with Laravel-inspired patterns:

```typescript
// routes/api.ts
import { router } from '@stacksjs/router'

// Basic routes
router.get('/', () => ({ message: 'Welcome to Stacks' }))
router.post('/contact', 'Actions/ContactAction')

// Route parameters
router.get('/users/{id}', 'Actions/ShowUserAction')
router.get('/posts/{post}/comments/{comment}', 'Actions/ShowCommentAction')

// Route constraints
router.get('/users/{id}', 'Actions/ShowUserAction').where('id', '[0-9]+')

// Named routes
router.get('/dashboard', 'Actions/DashboardAction').name('dashboard')

// Resource routes (RESTful)
router.resource('/articles', 'Actions/ArticleActions')
// Creates: GET /articles, GET /articles/{id}, POST /articles,
//          PUT /articles/{id}, DELETE /articles/{id}

// API resource (excludes create/edit forms)
router.apiResource('/api/products', 'Actions/ProductActions')

// Route groups
router.group({ prefix: '/admin', middleware: ['auth', 'admin'] }, () => {
  router.get('/dashboard', 'Actions/Admin/DashboardAction')
  router.resource('/users', 'Actions/Admin/UserActions')
})
```

### 6.2 Actions Pattern

Actions encapsulate business logic in single-responsibility classes:

```typescript
// app/Actions/CreatePostAction.ts
import { Action } from '@stacksjs/actions'
import { Post } from '@stacksjs/orm'
import type { CreatePostRequest } from '@stacksjs/types'

export default class CreatePostAction extends Action {
  async handle(request: CreatePostRequest) {
    // Validation is handled by the schema
    const post = await Post.create({
      title: request.title,
      content: request.content,
      author_id: request.user.id,
      published_at: request.publish ? new Date() : null,
    })

    // Dispatch events
    await this.dispatch('PostCreated', post)

    return post
  }

  rules() {
    return {
      title: 'required|string|max:255',
      content: 'required|string',
      publish: 'boolean',
    }
  }

  authorize() {
    return this.user?.can('create', Post)
  }
}
```

Actions provide:
- **Single Responsibility**: One action, one purpose
- **Validation**: Built-in request validation
- **Authorization**: Access control checks
- **Testability**: Easy to unit test in isolation
- **Reusability**: Call from routes, CLI, queues, or other actions

### 6.3 Middleware

Middleware intercepts requests and responses:

```typescript
// app/Middleware/AuthMiddleware.ts
import { Middleware } from '@stacksjs/middleware'
import type { Request, Response, Next } from '@stacksjs/types'

export default class AuthMiddleware extends Middleware {
  async handle(request: Request, next: Next): Promise<Response> {
    const token = request.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return Response.unauthorized('Authentication required')
    }

    const user = await this.auth.validateToken(token)

    if (!user) {
      return Response.unauthorized('Invalid token')
    }

    request.user = user
    return next(request)
  }
}
```

Built-in middleware includes:
- **CORS**: Cross-origin resource sharing
- **RateLimit**: Request throttling
- **Logger**: Request/response logging
- **Compress**: Response compression
- **SecurityHeaders**: HSTS, CSP, etc.

### 6.4 Validation Framework

Stacks validation (powered by `ts-validation`) runs on both client and server with a fluent, chainable API and 90+ built-in validators:

```typescript
import { v } from '@stacksjs/validation'

// Object schema with type inference
const CreateUserSchema = v.object({
  name: v.string().min(2).max(100).required(),
  email: v.string().email().required(),
  password: v.password()
    .min(8)
    .hasUppercase()
    .hasLowercase()
    .hasNumbers()
    .hasSpecialCharacters()
    .required(),
  role: v.enum(['user', 'admin', 'moderator']).required(),
  age: v.integer().min(18).max(120).required(),
  website: v.string().url({ require_protocol: true }).optional(),
  preferences: v.object({
    newsletter: v.boolean().default(true),
    theme: v.enum(['light', 'dark']).default('light'),
  }).optional(),
})

// Validate data
const result = CreateUserSchema.validate(userData)
if (result.valid) {
  // result.data is typed and validated
} else {
  // Nested error structure
  // { 'name': [...], 'preferences.theme': [...] }
}

// Quick validation check
if (CreateUserSchema.test(userData)) {
  // Valid!
}
```

**Available Validators:**

| Category | Validators |
|----------|------------|
| **Primitives** | `string()`, `number()`, `integer()`, `float()`, `decimal()`, `bigint()`, `boolean()` |
| **Complex** | `array()`, `object()`, `enum()`, `json()` |
| **Date/Time** | `date()`, `datetime()`, `time()`, `timestamp()`, `unix()` |
| **Specialized** | `password()`, `email()`, `url()`, `uuid()`, `ip()`, `creditCard()`, `iban()` |

**String Validators (90+):**
- Formats: `isEmail`, `isURL`, `isUUID`, `isIP`, `isMACAddress`, `isJWT`
- Localized: `isMobilePhone`, `isPostalCode`, `isPassportNumber`
- Financial: `isCreditCard`, `isIBAN`, `isBIC`, `isEthereumAddress`
- Content: `isJSON`, `isBase64`, `isHexColor`, `isRgbColor`

**Custom Error Messages:**

```typescript
import { setCustomMessages, MessageProvider } from '@stacksjs/validation'

setCustomMessages(new MessageProvider({
  'required': '{field} is required',
  'email.email': 'Please enter a valid email address',
  'password.min': 'Password must be at least {min} characters',
}))
```

Features:
- **Type Inference**: `Infer<typeof schema>` extracts TypeScript types
- **Fluent API**: Chainable methods for readable validation rules
- **90+ Built-in Validators**: Comprehensive string, number, and format validation
- **Custom Rules**: Extend with `.custom(fn, message)` for specialized logic
- **Strict Mode**: `v.object().strict()` rejects extra properties
- **Nested Objects**: Deep validation with dot-notation error paths
- **Client Sharing**: Same schema validates forms on frontend and backend

---

## 7. Database & ORM

### 7.1 Multi-Dialect Support

Stacks supports multiple database systems:

| Database | Status | Use Case |
|----------|--------|----------|
| SQLite | Full Support | Development, small apps |
| MySQL | Full Support | Traditional web apps |
| PostgreSQL | Full Support | Enterprise applications |
| DynamoDB | Supported | Serverless, NoSQL needs |

Connection configuration:

```typescript
// config/database.ts
export default {
  default: env('DB_CONNECTION', 'sqlite'),

  connections: {
    sqlite: {
      driver: 'sqlite',
      database: 'storage/database.sqlite',
    },
    mysql: {
      driver: 'mysql',
      host: env('DB_HOST', 'localhost'),
      database: env('DB_DATABASE', 'stacks'),
      username: env('DB_USERNAME', 'root'),
      password: env('DB_PASSWORD', ''),
    },
    postgres: {
      driver: 'postgres',
      url: env('DATABASE_URL'),
    },
  },
}
```

### 7.2 Type-Safe Query Builder

The query builder (`bun-query-builder`) provides fluent, type-safe SQL construction:

```typescript
import { DB } from '@stacksjs/database'

// Select queries
const users = await DB.table('users')
  .select('id', 'name', 'email')
  .where('active', true)
  .whereNotNull('email_verified_at')
  .orderBy('created_at', 'desc')
  .limit(10)
  .get()

// Joins
const posts = await DB.table('posts')
  .join('users', 'posts.author_id', '=', 'users.id')
  .select('posts.*', 'users.name as author_name')
  .where('posts.published', true)
  .get()

// Aggregates
const stats = await DB.table('orders')
  .selectRaw('DATE(created_at) as date, SUM(total) as revenue')
  .where('status', 'completed')
  .groupBy('date')
  .get()

// Inserts
await DB.table('users').insert({
  name: 'John Doe',
  email: 'john@example.com',
})

// Updates
await DB.table('users')
  .where('id', userId)
  .update({ last_login: new Date() })

// Transactions
await DB.transaction(async (trx) => {
  const order = await trx.table('orders').insert(orderData)
  await trx.table('order_items').insert(items)
  await trx.table('inventory').decrement('quantity', ordered)
})
```

### 7.3 ORM & Migrations

Models provide an ActiveRecord-style interface:

```typescript
// app/Models/User.ts
import { Model } from '@stacksjs/orm'
import type { HasMany, BelongsTo } from '@stacksjs/types'

export default class User extends Model {
  static table = 'users'

  static fields = {
    name: { type: 'string', required: true },
    email: { type: 'string', unique: true, required: true },
    password: { type: 'string', hidden: true },
    role: { type: 'enum', values: ['user', 'admin'], default: 'user' },
    email_verified_at: { type: 'datetime', nullable: true },
  }

  // Relationships
  posts(): HasMany<Post> {
    return this.hasMany(Post)
  }

  team(): BelongsTo<Team> {
    return this.belongsTo(Team)
  }

  // Accessors
  get isAdmin(): boolean {
    return this.role === 'admin'
  }

  // Methods
  async verifyEmail(): Promise<void> {
    this.email_verified_at = new Date()
    await this.save()
  }
}
```

Migrations:

```typescript
// database/migrations/2024_01_01_000000_create_users_table.ts
import { Migration } from '@stacksjs/database'

export default class CreateUsersTable extends Migration {
  async up() {
    await this.schema.create('users', (table) => {
      table.id()
      table.string('name')
      table.string('email').unique()
      table.string('password')
      table.enum('role', ['user', 'admin']).default('user')
      table.timestamp('email_verified_at').nullable()
      table.timestamps()
    })
  }

  async down() {
    await this.schema.drop('users')
  }
}
```

### 7.4 Model Relationships

Stacks supports all common relationship types:

```typescript
// One-to-One
user.profile()           // User has one Profile

// One-to-Many
user.posts()             // User has many Posts

// Many-to-Many
user.roles()             // User belongs to many Roles

// Has-Through
country.posts()          // Country has many Posts through Users

// Polymorphic
comment.commentable()    // Comment belongs to Post or Video
```

Eager loading prevents N+1 queries:

```typescript
const users = await User.query()
  .with('posts', 'team', 'profile')
  .where('active', true)
  .get()

// Nested eager loading
const posts = await Post.query()
  .with('author.team', 'comments.user')
  .get()
```

---

## 8. Authentication & Security

### 8.1 ts-auth Integration

Stacks authentication is powered by `ts-auth`, a modern authentication library focused on **passwordless authentication** using WebAuthn (Passkeys) and TOTP-based multi-factor authentication. The library is purpose-built for modern authentication patterns without the complexity of traditional session/OAuth systems.

```typescript
// config/auth.ts
export default {
  webauthn: {
    rpName: 'My Application',
    rpID: 'example.com',
    attestationType: 'none', // 'none' | 'indirect' | 'direct'
    timeout: 60000,
  },

  totp: {
    issuer: 'My Application',
    algorithm: 'SHA-1', // 'SHA-1' | 'SHA-256' | 'SHA-512'
    digits: 6,
    step: 30, // seconds
  },
}
```

### 8.2 WebAuthn & Passkeys

ts-auth provides comprehensive WebAuthn support for passwordless authentication:

```typescript
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@stacksjs/auth'

// Server: Generate registration options
const registrationOptions = generateRegistrationOptions({
  rpName: 'My App',
  rpID: 'example.com',
  userID: user.id,
  userName: user.email,
  attestationType: 'none',
  authenticatorSelection: {
    userVerification: 'preferred',
    residentKey: 'preferred',
  },
})

// Client: Create credential
import { startRegistration, browserSupportsWebAuthn } from '@stacksjs/auth'

if (browserSupportsWebAuthn()) {
  const credential = await startRegistration(registrationOptions)
  // Send credential to server for verification
}

// Server: Verify registration
const verification = await verifyRegistrationResponse(
  credential,
  expectedChallenge,
  expectedOrigin,
  expectedRPID
)

if (verification.verified) {
  // Store credential: verification.registrationInfo.credential
  // Includes: id, publicKey, counter, deviceType, backedUp status
}
```

### 8.3 TOTP Multi-Factor Authentication

Time-based One-Time Passwords for second-factor authentication:

```typescript
import { generateSecret, generate, verify, keyuri } from '@stacksjs/auth'

// Generate secret for user
const secret = generateSecret() // Base32 encoded

// Generate QR code URI for authenticator apps
const uri = keyuri(user.email, 'My App', secret, {
  algorithm: 'SHA-1',
  digits: 6,
  period: 30,
})

// Generate current TOTP code
const code = generate({ secret, digits: 6, step: 30 })

// Verify user-provided code
const isValid = verify(userCode, {
  secret,
  window: 1, // Allow 1 step before/after for clock skew
})
```

**Browser Support Detection:**

```typescript
import {
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
  platformAuthenticatorIsAvailable
} from '@stacksjs/auth'

// Check WebAuthn availability
const hasWebAuthn = browserSupportsWebAuthn()

// Check for conditional UI (autofill integration)
const hasAutofill = await browserSupportsWebAuthnAutofill()

// Check for built-in authenticator (Face ID, Touch ID, Windows Hello)
const hasPlatformAuth = await platformAuthenticatorIsAvailable()
```

### 8.4 Security Features

Stacks includes comprehensive security features:

#### CSRF Protection
```typescript
// Automatic for all state-changing requests
<form method="POST">
  <x-csrf />
  ...
</form>
```

#### Rate Limiting
```typescript
// config/security.ts
export default {
  rateLimit: {
    api: {
      maxRequests: 60,
      windowMs: 60_000, // 1 minute
    },
    auth: {
      maxRequests: 5,
      windowMs: 300_000, // 5 minutes
    },
  },
}
```

#### Security Headers
```typescript
export default {
  headers: {
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
    xss: true,
    noSniff: true,
    frameOptions: 'DENY',
  },
}
```

#### Encryption
```typescript
import { encrypt, decrypt, hash, verify } from '@stacksjs/security'

// Encryption
const encrypted = await encrypt(sensitiveData)
const decrypted = await decrypt(encrypted)

// Hashing (for passwords)
const hashed = await hash(password)
const valid = await verify(password, hashed)
```

---

# Part IV: Advanced Features

## 9. AI Integration

### 9.1 Multi-Provider Support

Stacks provides a unified API for multiple AI providers:

```typescript
// config/ai.ts
export default {
  default: 'claude',

  providers: {
    claude: {
      driver: 'anthropic',
      model: 'claude-sonnet-4-20250514', // or claude-opus-4-20250514
      apiKey: env('ANTHROPIC_API_KEY'),
    },
    openai: {
      driver: 'openai',
      model: 'gpt-4o',
      apiKey: env('OPENAI_API_KEY'),
    },
    ollama: {
      driver: 'ollama',
      model: 'llama2',
      baseUrl: 'http://localhost:11434',
    },
  },
}
```

Unified usage:

```typescript
import { AI } from '@stacksjs/ai'

// Simple completion
const response = await AI.complete('Explain TypeScript generics')

// Chat conversation
const chat = AI.chat()
await chat.send('Hello!')
const reply = await chat.send('What is Stacks.js?')

// Streaming
const stream = await AI.stream('Write a poem about coding')
for await (const chunk of stream) {
  process.stdout.write(chunk)
}

// Structured output
const analysis = await AI.complete({
  prompt: 'Analyze this code for bugs',
  context: codeSnippet,
  format: 'json',
  schema: BugReportSchema,
})

// Provider switching
const response = await AI.using('openai').complete('...')
```

### 9.2 Buddy AI Assistant

Buddy is an AI-powered development assistant integrated into the Stacks CLI:

```bash
# Voice-activated code modifications
buddy ai chat

# Codebase exploration
buddy ai explore "How does authentication work?"

# Code generation
buddy ai generate "Create a REST API for blog posts"

# Code review
buddy ai review app/Actions/CreateUserAction.ts
```

Buddy capabilities:
- **Natural Language Coding**: Describe changes in plain English
- **Codebase Understanding**: AI reads and understands your project structure
- **Intelligent Suggestions**: Context-aware recommendations
- **Voice Input**: Speak commands instead of typing
- **Multi-File Edits**: Coordinated changes across files

### 9.3 AI-Powered Development

AI integration extends throughout the development workflow:

#### Smart Scaffolding
```bash
buddy make:action "Create an action that processes refund requests"
# AI generates appropriate validation, authorization, and logic
```

#### Documentation Generation
```bash
buddy docs:generate
# AI reads code and generates comprehensive documentation
```

#### Test Generation
```bash
buddy test:generate app/Actions/CreateUserAction.ts
# AI creates relevant test cases based on action logic
```

#### Error Explanation
When errors occur, Buddy can explain:
```
Error: Cannot read property 'id' of undefined at CreatePostAction.ts:23

Buddy: This error occurs because request.user is undefined.
       The route is missing the 'auth' middleware. Add it to
       routes/api.ts or the action's middleware property.
```

---

## 10. Cloud & Infrastructure

### 10.1 ts-cloud: Zero-Dependency Infrastructure as Code

Stacks uses **ts-cloud**, a modern Infrastructure-as-Code framework that enables developers to define and deploy cloud infrastructure using TypeScript configuration files. Built on a **driver-based architecture**, ts-cloud currently ships with full AWS support, integrating **47 AWS services** across compute, storage, networking, databases, AI/ML, and communication domains. Additional cloud providers (GCP, Azure, Cloudflare, DigitalOcean) are planned for future releases.

Unlike AWS CDK, ts-cloud requires zero external dependencies—no AWS SDK, no AWS CLI, just TypeScript and Bun. It implements direct HTTPS calls to AWS APIs with custom Signature V4 authentication.

**Key Advantages over AWS CDK:**

| Aspect | ts-cloud | AWS CDK |
|--------|----------|---------|
| **Dependencies** | Zero (no AWS SDK) | Full AWS SDK (~100MB+) |
| **Startup Time** | Milliseconds | Seconds (SDK initialization) |
| **Bundle Size** | Minimal (~5MB) | Much larger with SDK |
| **Security** | No supply chain risk | Depends on SDK updates |
| **Learning Curve** | Configuration-based | Imperative programming |
| **Presets** | 13 production-ready templates | None built-in |

ts-cloud provides **13 production-ready presets** for common deployment patterns:

1. **Static Sites** - S3 + CloudFront for SPAs and static websites
2. **Node.js Servers** - EC2 + ALB + RDS + Redis
3. **Node.js Serverless** - ECS Fargate + ALB + DynamoDB
4. **Full-Stack Apps** - Frontend (S3+CloudFront) + Backend (ECS) + DB + Cache
5. **API Backends** - API Gateway + Lambda + DynamoDB
6. **WordPress** - RDS + EFS + CloudFront optimized
7. **JAMstack** - Static sites with Lambda@Edge for SSR
8. **Microservices** - Multi-service architecture with service discovery
9. **Real-time Apps** - WebSocket API + Lambda + DynamoDB Streams
10. **Data Pipelines** - Kinesis + Lambda + S3 + Athena + Glue for ETL
11. **ML APIs** - SageMaker + API Gateway for ML inference
12. **Traditional Web Apps** - Session-based with EFS + Redis + ALB
13. **Custom Presets** - Composable and extendable preset system

Configuration example:

```typescript
// cloud.config.ts
import type { CloudConfig } from '@stacksjs/cloud'

export default {
  project: {
    name: 'my-app',
    slug: 'my-app',
    region: 'us-east-1',
  },

  mode: 'serverless',

  environments: {
    production: {
      type: 'production',
      region: 'us-east-1',
      variables: { NODE_ENV: 'production' },
    },
    staging: {
      type: 'staging',
      region: 'us-east-1',
      variables: { NODE_ENV: 'staging' },
    },
  },

  infrastructure: {
    vpc: {
      cidr: '10.0.0.0/16',
      zones: 2,
      natGateway: true,
    },

    storage: {
      frontend: { public: true, website: true, encryption: true },
      uploads: { public: false, encryption: true, versioning: true },
    },

    compute: {
      mode: 'serverless',
      server: {
        instanceType: 't3.small',
        autoScaling: { min: 1, max: 5, desired: 2 },
      },
    },

    databases: {
      main: {
        engine: 'postgres',
        instanceClass: 'db.t3.micro',
        storage: 20,
      },
    },

    cache: { type: 'redis', nodeType: 'cache.t3.micro' },

    cdn: {
      frontend: { origin: 's3-bucket-name', customDomain: 'example.com' },
    },

    security: {
      waf: { enabled: true, rateLimit: 2000 },
      kms: true,
    },

    monitoring: {
      dashboards: true,
      alarms: [
        { name: 'HighCPU', metric: 'CPUUtilization', threshold: 80 },
      ],
    },
  },
} satisfies CloudConfig
```

**Production-Ready Presets:**

```typescript
import { createStaticSitePreset } from '@stacksjs/cloud/presets'

// Simple: S3 + CloudFront + Route53 + ACM
export default createStaticSitePreset({
  name: 'My Website',
  slug: 'my-website',
  domain: 'example.com',
})
```

**Driver-Based Architecture:**

ts-cloud is built on a **driver-based architecture** that abstracts cloud provider specifics behind a unified configuration interface. Currently, only the **AWS driver** is available, but the architecture is designed to support multiple cloud providers with the same configuration:

```typescript
export default {
  driver: 'aws', // Currently: 'aws' only | Coming soon: 'gcp', 'azure', 'cloudflare', 'digitalocean'

  project: { name: 'my-app', slug: 'my-app', region: 'us-east-1' },
  infrastructure: { /* configuration remains consistent across all drivers */ },
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

Deployment:

```bash
# Preview infrastructure changes
cloud deploy --dry-run

# Deploy infrastructure
cloud deploy

# Deploy to specific environment
cloud deploy --env production
```

### 10.2 Deployment Options

Stacks supports multiple deployment targets:

#### Serverless (AWS Lambda)
```bash
buddy deploy:serverless
# - API routes become Lambda functions
# - Automatic API Gateway configuration
# - DynamoDB for sessions/cache
```

#### Container (ECS/Fargate)
```bash
buddy deploy:container
# - Docker image building
# - ECS task definitions
# - Load balancer configuration
```

#### Traditional (EC2)
```bash
buddy deploy:server
# - AMI provisioning
# - Auto-scaling groups
# - Rolling deployments
```

#### Edge (Cloudflare Workers)
```bash
buddy deploy:edge
# - Worker script generation
# - KV for storage
# - Global distribution
```

### 10.3 Serverless Architecture

For serverless deployments, Stacks optimizes for cold starts:

```typescript
// Each route becomes a Lambda handler
// stacks-lambda.ts (auto-generated)
import { handler } from '@stacksjs/serverless'

export const api = handler({
  routes: './routes/api.ts',
  middleware: ['cors', 'auth'],
})
```

Serverless features:
- **Cold Start Optimization**: Minimal dependencies per function
- **Connection Pooling**: Database connections via RDS Proxy
- **Edge Caching**: CloudFront integration
- **Automatic Scaling**: Handles traffic spikes seamlessly

---

## 11. Real-Time & Messaging

### 11.1 WebSocket Support

Stacks provides real-time capabilities through WebSockets:

```typescript
// routes/channels.ts
import { channel } from '@stacksjs/realtime'

// Public channel
channel('news', {
  message(data) {
    // Handle incoming messages
  },
})

// Private channel (requires auth)
channel('user.{userId}', {
  authorize(user, userId) {
    return user.id === userId
  },

  message(data) {
    // Handle private messages
  },
})

// Presence channel (shows who's online)
channel('chat.{roomId}', {
  authorize(user, roomId) {
    return user.canAccessRoom(roomId)
  },

  join(user) {
    return { id: user.id, name: user.name }
  },

  leave(user) {
    // Handle user leaving
  },
})
```

Client-side:

```typescript
import { realtime } from '@stacksjs/realtime'

const channel = realtime.channel('chat.123')

channel.on('message', (data) => {
  console.log('New message:', data)
})

channel.send('message', { text: 'Hello!' })
```

### 11.2 Notifications System

Multi-channel notifications:

```typescript
// app/Notifications/OrderShippedNotification.ts
import { Notification } from '@stacksjs/notifications'

export default class OrderShippedNotification extends Notification {
  constructor(private order: Order) {
    super()
  }

  via(notifiable: User) {
    return ['email', 'sms', 'database', 'push']
  }

  toEmail(notifiable: User) {
    return {
      subject: `Your order #${this.order.id} has shipped!`,
      template: 'emails/order-shipped',
      data: { order: this.order },
    }
  }

  toSms(notifiable: User) {
    return {
      message: `Your order #${this.order.id} is on its way!`,
    }
  }

  toDatabase(notifiable: User) {
    return {
      title: 'Order Shipped',
      body: `Your order #${this.order.id} has shipped.`,
      action_url: `/orders/${this.order.id}`,
    }
  }

  toPush(notifiable: User) {
    return {
      title: 'Order Shipped',
      body: 'Your package is on its way!',
      icon: '/icons/shipping.png',
    }
  }
}
```

Sending notifications:

```typescript
import { notify } from '@stacksjs/notifications'

await notify(user, new OrderShippedNotification(order))

// Bulk notifications
await notify(subscribers, new NewsletterNotification(newsletter))
```

### 11.3 Queue & Job Processing

Background job processing with `bun-queue`:

```typescript
// app/Jobs/ProcessVideoJob.ts
import { Job } from '@stacksjs/queue'

export default class ProcessVideoJob extends Job {
  constructor(private videoId: string) {
    super()
  }

  // Queue configuration
  queue = 'video-processing'
  tries = 3
  timeout = 600 // 10 minutes

  async handle() {
    const video = await Video.find(this.videoId)

    // Process video
    await this.transcode(video)
    await this.generateThumbnails(video)
    await this.updateStatus(video, 'processed')

    // Notify user
    await notify(video.user, new VideoProcessedNotification(video))
  }

  async failed(error: Error) {
    // Handle job failure
    await Video.update(this.videoId, { status: 'failed' })
    await notify(admins, new JobFailedNotification(this, error))
  }
}
```

Dispatching jobs:

```typescript
import { dispatch, dispatchAfter } from '@stacksjs/queue'

// Immediate dispatch
await dispatch(new ProcessVideoJob(videoId))

// Delayed dispatch
await dispatchAfter('5 minutes', new SendReminderJob(userId))

// Chained jobs
await dispatch(new ProcessVideoJob(videoId))
  .chain(new NotifyUserJob(userId))
  .chain(new UpdateAnalyticsJob(videoId))
```

Job scheduling:

```typescript
// config/scheduler.ts
export default {
  jobs: [
    {
      job: 'CleanupTempFilesJob',
      cron: '0 0 * * *', // Daily at midnight
    },
    {
      job: 'SendDailyDigestJob',
      cron: '0 8 * * *', // Daily at 8 AM
    },
    {
      job: 'GenerateReportsJob',
      cron: '0 0 * * 0', // Weekly on Sunday
    },
  ],
}
```

---

# Part V: Developer Experience

## 12. CLI & Tooling (Buddy)

### 12.1 Command Categories

Buddy provides 50+ command categories:

```
Development          Database             Testing
-----------          --------             -------
buddy dev            buddy migrate        buddy test
buddy build          buddy migrate:fresh  buddy test:unit
buddy serve          buddy seed           buddy test:e2e
buddy tinker         buddy db:wipe        buddy test:coverage

Generation           Deployment           Code Quality
----------           ----------           ------------
buddy make:action    buddy deploy         buddy lint
buddy make:model     buddy deploy:prod    buddy lint:fix
buddy make:migration buddy cloud:diff     buddy format
buddy make:component buddy cloud:deploy   buddy typecheck

AI                   Publishing           Git
--                   ----------           ---
buddy ai:chat        buddy release        buddy commit
buddy ai:explore     buddy publish        buddy changelog
buddy ai:generate    buddy version        buddy release

Utilities
---------
buddy key:generate
buddy cache:clear
buddy queue:work
buddy schedule:run
```

### 12.2 Scaffolding & Generators

The `make:*` commands generate boilerplate:

```bash
# Generate a model with migration
buddy make:model Post --migration

# Generate an action
buddy make:action CreatePostAction

# Generate a component
buddy make:component Button

# Generate a full resource (model, migration, action, routes)
buddy make:resource Article

# Generate with AI assistance
buddy make:action "Handle user subscription upgrade" --ai
```

Generated files follow framework conventions:

```typescript
// buddy make:action CreatePostAction generates:

// app/Actions/CreatePostAction.ts
import { Action } from '@stacksjs/actions'
import { Post } from '@/Models/Post'
import type { Request, Response } from '@stacksjs/types'

export default class CreatePostAction extends Action {
  /**
   * Handle the incoming request.
   */
  async handle(request: Request): Promise<Response> {
    const data = request.validated()

    const post = await Post.create({
      title: data.title,
      content: data.content,
      authorId: request.user.id,
    })

    return Response.json(post, 201)
  }

  /**
   * Validation rules for this action.
   */
  rules() {
    return {
      title: 'required|string|max:200',
      content: 'required|string',
    }
  }
}
```

### 12.3 Development Workflow

A typical development session:

```bash
# Start development server
buddy dev
# - Starts HTTP server on port 3000
# - Enables hot module replacement
# - Watches for file changes
# - Displays request logs

# In another terminal: Interactive REPL
buddy tinker
> const user = await User.find(1)
> user.posts.count()
5
> await user.update({ name: 'New Name' })

# Run migrations
buddy migrate

# Run tests
buddy test

# Check types
buddy typecheck

# Lint and format
buddy lint:fix

# Build for production
buddy build

# Deploy
buddy deploy
```

---

## 13. Type Safety

### 13.1 End-to-End Type Harmony

Types flow from database to frontend without breaks:

```typescript
// 1. Model definition (source of truth)
// app/Models/Post.ts
export default class Post extends Model {
  static fields = {
    title: { type: 'string', required: true },
    content: { type: 'string' },
    published: { type: 'boolean', default: false },
    author_id: { type: 'integer', references: 'users.id' },
  }
}

// 2. Auto-generated types
// storage/framework/types/models.d.ts (generated)
interface Post {
  id: number
  title: string
  content: string | null
  published: boolean
  author_id: number
  created_at: Date
  updated_at: Date
}

// 3. API response type
// Types are inferred from action return types
const posts: Post[] = await api.get('/posts')

// 4. Component props are typed
<PostCard :post="post" />
// TypeScript ensures post matches Post interface
```

### 13.2 Auto-Generated Types

Stacks generates types automatically:

```bash
buddy types:generate
# Generates:
# - Model interfaces
# - API response types
# - Component prop types
# - Route parameter types
# - Configuration types
```

Generated type files:

```
storage/framework/types/
├── models.d.ts        # Database model types
├── requests.d.ts      # API request types
├── responses.d.ts     # API response types
├── components.d.ts    # Component prop types
├── routes.d.ts        # Route parameter types
└── config.d.ts        # Configuration types
```

### 13.3 IDE Integration

Stacks optimizes for IDE experience:

- **Auto-imports**: Components and utilities auto-import
- **Go-to-definition**: Jump to model, action, or component definitions
- **Hover documentation**: Types show documentation inline
- **Error highlighting**: TypeScript errors appear immediately
- **Snippets**: Code snippets for common patterns

VSCode workspace settings (auto-configured):

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "files.associations": {
    "*.stx": "vue"
  }
}
```

---

## 14. Testing & Quality

### 14.1 Testing Framework

Stacks uses Bun's test runner with additional utilities:

```typescript
// tests/unit/CreatePostAction.test.ts
import { test, expect, describe, beforeEach } from 'bun:test'
import { createTestContext } from '@stacksjs/testing'
import CreatePostAction from '@/Actions/CreatePostAction'

describe('CreatePostAction', () => {
  let context: TestContext

  beforeEach(async () => {
    context = await createTestContext()
    await context.migrate()
  })

  test('creates a post with valid data', async () => {
    const user = await context.factory.user.create()

    const result = await context.actingAs(user).handle(CreatePostAction, {
      title: 'Test Post',
      content: 'This is test content',
    })

    expect(result.title).toBe('Test Post')
    expect(result.author_id).toBe(user.id)
  })

  test('fails without authentication', async () => {
    await expect(
      context.handle(CreatePostAction, { title: 'Test' })
    ).rejects.toThrow('Unauthorized')
  })

  test('validates required fields', async () => {
    const user = await context.factory.user.create()

    await expect(
      context.actingAs(user).handle(CreatePostAction, {})
    ).rejects.toThrow('title is required')
  })
})
```

#### Feature Tests (E2E)

```typescript
// tests/feature/posts.test.ts
import { test, expect } from '@playwright/test'

test('user can create a post', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')

  await page.goto('/posts/create')
  await page.fill('[name="title"]', 'My New Post')
  await page.fill('[name="content"]', 'Post content here')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL(/\/posts\/\d+/)
  await expect(page.locator('h1')).toContainText('My New Post')
})
```

### 14.2 Linting & Code Quality

Stacks includes preconfigured code quality tools:

```bash
# Run all linters
buddy lint

# Auto-fix issues
buddy lint:fix

# Type checking
buddy typecheck

# Format code
buddy format
```

Configuration:

```typescript
// config/lint.ts
export default {
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },

  ignore: [
    'storage/framework/**',
    'node_modules/**',
  ],
}
```

### 14.3 CI/CD Integration

GitHub Actions workflow (auto-generated):

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - run: bun install
      - run: bun run lint
      - run: bun run typecheck
      - run: bun run test
      - run: bun run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - run: bun install
      - run: bun run deploy:prod
```

---

# Part VI: Ecosystem

## 15. Companion Packages

### 15.1 bun-router

A high-performance, feature-rich HTTP router designed specifically for Bun with Laravel-inspired APIs:

```typescript
import { router } from 'bun-router'

// Basic routes
router.get('/', () => new Response('Hello World'))
router.get('/users/{id}', (req) => Response.json({ id: req.params.id }))

// Resource routes (RESTful)
router.resource('/posts', PostController)

// Route groups with middleware
router.group({ prefix: '/api', middleware: [auth(), cors()] }, () => {
  router.get('/dashboard', DashboardAction)
  router.apiResource('/articles', ArticleController)
})

// Named routes with URL generation
router.get('/users/{id}', ShowUserAction).name('users.show')
const url = router.route('users.show', { id: '123' })

// Model binding (Laravel-style)
router.get('/posts/{post}', (req) => {
  // req.post is automatically resolved from database
  return Response.json(req.post)
}).model('post', PostModel)

// WebSocket support
router.websocket({
  open(ws) { ws.subscribe('chat') },
  message(ws, msg) { router.publish('chat', msg) },
})

await router.serve({ port: 3000 })
```

**25+ Built-in Middleware:**

| Category | Middleware |
|----------|------------|
| **Auth** | `auth()` (Bearer, Basic, JWT, OAuth2), `csrf()` |
| **Security** | `helmet()`, `cors()`, `ddosProtection()`, `requestSigning()` |
| **Performance** | `responseCache()`, `performanceMonitor()`, `requestTracer()` |
| **Data** | `jsonBody()`, `fileUpload()`, `inputValidation()`, `session()` |
| **Limiting** | `rateLimit()` (fixed-window, sliding-window, token-bucket) |

Features:
- **Trie-Based Matching**: O(log n) route matching with static route fast path
- **Parameter Constraints**: `whereNumber()`, `whereUuid()`, `whereSlug()`
- **Implicit Model Binding**: Automatically resolve route parameters to models
- **Response Streaming**: `router.stream()`, `router.eventStream()`, `router.streamJson()`
- **Performance Monitoring**: CPU, memory, response time tracking with alerts
- **Request Tracing**: Distributed tracing with correlation IDs

### 15.2 bun-query-builder

A **narrowly-typed**, high-performance ORM built on Bun's native SQL support. Unlike other ORMs that return `any` or broad types, bun-query-builder uses phantom types to thread precise type information from your model definitions through every query method to the final result:

```typescript
import { DB } from 'bun-query-builder'

// Fluent query API with type inference
const users = await DB.selectFrom('users')
  .select('id', 'name', 'email')
  .where('active', true)
  .whereNotNull('email_verified_at')
  .orderBy('created_at', 'desc')
  .limit(10)
  .get()

// Dynamic where methods (auto-generated from columns)
const user = await DB.selectFrom('users')
  .whereEmail('john@example.com')  // Type-safe!
  .first()

// Comprehensive where clauses
const results = await DB.selectFrom('posts')
  .whereIn('status', ['published', 'featured'])
  .whereBetween('created_at', [startDate, endDate])
  .whereLike('title', '%TypeScript%')
  .whereJsonContains('tags', 'javascript')
  .get()

// Pagination with metadata
const page = await DB.selectFrom('articles')
  .where('published', true)
  .paginate(25, 1)
// { data: [...], meta: { total, perPage, currentPage, lastPage } }

// Relationships and eager loading
const posts = await DB.selectFrom('posts')
  .with('author', 'comments.user')
  .withCount('likes')
  .get()
```

**Performance (vs Prisma):**

| Operation | bun-query-builder | Advantage |
|-----------|-------------------|-----------|
| DELETE | 29.29x faster | Native SQL |
| SELECT + LIMIT | 16.45x faster | No ORM overhead |
| COUNT | 12.65x faster | Direct aggregation |
| SELECT by ID | 13.8x faster | Statement caching |

**Supported Databases:**
- PostgreSQL (with JSONB, ILIKE, FOR SHARE)
- MySQL (with JSON, RAND())
- SQLite (lightweight, text-based complex types)

Features:
- **Narrow Type Inference**: Phantom types thread SQL through transformations; IDE shows exact query structure
- **Dynamic Methods**: `whereEmail()`, `whereCreatedAt()` auto-generated from schema columns
- **Full ORM**: Model definitions, relationships (hasOne/Many, belongsTo, morphic), hooks, scopes, soft deletes
- **Advanced Queries**: CTEs, window functions, JSON operators, subqueries, cursor pagination
- **Transaction Support**: Retries with exponential backoff, savepoints, isolation levels
- **CLI Tools**: 30+ commands for migrations, seeding, introspection

### 15.3 bun-queue

Redis-backed job queue:

```typescript
import { Queue, Worker } from 'bun-queue'

// Producer
const queue = new Queue('emails')
await queue.add('send-welcome', { userId: 123 })

// Consumer
const worker = new Worker('emails', async (job) => {
  if (job.name === 'send-welcome') {
    await sendWelcomeEmail(job.data.userId)
  }
})

// Scheduling
await queue.add('daily-report', {}, {
  repeat: { cron: '0 9 * * *' }
})
```

### 15.4 Clarity (Logging)

Modern logging for browser and server:

```typescript
import { log, debug, info, warn, error } from '@stacksjs/clarity'

// Structured logging
log.info('User logged in', { userId: 123, ip: '192.168.1.1' })

// Log levels
debug('Detailed information for debugging')
info('General information')
warn('Warning messages')
error('Error messages', { error: err })

// Pretty console output in development
// JSON output in production
```

### 15.5 STX & Headwind

**STX** - Blade-inspired templating:
```html
<x-layout>
  @foreach(items as item)
    <x-card :title="item.name">
      {{ item.description }}
    </x-card>
  @endforeach
</x-layout>
```

**Headwind** - Utility CSS framework:
```html
<div class="flex items-center gap-4 p-6 bg-white rounded-xl shadow-lg">
  <img class="w-16 h-16 rounded-full" src="..." />
  <div class="flex-1">
    <h2 class="text-xl font-bold text-gray-900">Title</h2>
    <p class="text-gray-600">Description text</p>
  </div>
</div>
```

---

## 16. Multimodal Deployment

### 16.1 Web Applications

Standard web application deployment:

```bash
buddy build:web
buddy deploy
```

Output structure:
```
dist/
├── client/
│   ├── index.html
│   ├── assets/
│   │   ├── main-[hash].js
│   │   └── style-[hash].css
│   └── manifest.json
└── server/
    └── index.js
```

### 16.2 Desktop Applications (Craft)

Build native desktop and mobile apps from your web codebase using **Craft**, Stacks' high-performance Zig-based application framework. Craft provides a Tauri-like experience with superior performance characteristics.

**Performance Comparison:**

| Metric | Craft | Electron | Tauri |
|--------|-------|----------|-------|
| **Startup Time** | 50ms | 230ms | 100ms |
| **Idle Memory** | 14KB | 68MB | ~80MB |
| **Binary Size** | 3MB | 135MB | ~2MB |
| **IPC Throughput** | 2.89µs | 2.16ms | varies |

**Supported Platforms:**

| Platform | Status | WebView | Binary Size |
|----------|--------|---------|-------------|
| **macOS** | Production | WKWebView | ~1.4MB |
| **Windows** | Production | WebView2 (Edge) | ~1.6MB |
| **Linux** | Production | WebKit2GTK | ~1.5MB |
| **iOS** | Beta | WKWebView + UIKit | Native |
| **Android** | Beta | Android WebView | Native |

```bash
buddy build:desktop
```

Generates platform-specific packages:
- **macOS**: `.app` bundle and `.dmg` installer
- **Windows**: `.exe` installer and `.msi` package
- **Linux**: `.deb`, `.rpm`, and `.AppImage`

**Craft Configuration:**

```typescript
// config/desktop.ts
export default {
  productName: 'My App',
  identifier: 'com.example.myapp',

  window: {
    width: 1200,
    height: 800,
    resizable: true,
    frameless: false,
    transparent: false,
    alwaysOnTop: false,
  },

  systemTray: {
    enabled: true,
    tooltip: 'My App',
  },

  security: {
    csp: "default-src 'self'",
  },
}
```

**JavaScript Bridge API:**

Craft automatically injects `window.craft` with native access:

```typescript
// Window control
window.craft.window.minimize()
window.craft.window.maximize()
window.craft.window.toggleFullscreen()
window.craft.window.setTitle('New Title')

// System tray (menubar apps)
window.craft.tray.setTitle('Status')
window.craft.tray.setMenu([
  { label: 'Show', action: 'show' },
  { label: 'Quit', action: 'quit' },
])

// App lifecycle
window.craft.app.quit()
window.craft.app.notify({ title: 'Alert', body: 'Message' })
window.craft.app.isDarkMode()

// macOS Dock
window.craft.app.setBadge('3')
window.craft.app.bounce()
```

**35 Native UI Components:**

Craft includes native components for common UI patterns:
- **Input**: Button, TextInput, Checkbox, Slider, ColorPicker, DatePicker
- **Display**: ProgressBar, Spinner, Avatar, Badge, Tooltip, Toast
- **Layout**: ScrollView, SplitView, Accordion, Modal, Tabs
- **Data**: ListView, Table, TreeView, DataGrid, Chart
- **Advanced**: CodeEditor (syntax highlighting), MediaPlayer

**System Integration:**

```typescript
// Notifications
await window.craft.notify({
  title: 'Download Complete',
  body: 'File saved to Downloads',
  icon: '/icons/download.png',
})

// File dialogs
const file = await window.craft.dialog.open({
  filters: [{ name: 'Images', extensions: ['png', 'jpg'] }]
})

// Clipboard
await window.craft.clipboard.writeText('Copied!')
const text = await window.craft.clipboard.readText()

// System info
const info = await window.craft.system.getInfo()
// { os: 'macOS', version: '14.0', cpu: {...}, memory: {...} }
```

### 16.3 APIs & Serverless

Standalone API deployment:

```bash
buddy build:api
buddy deploy:serverless
```

Each route becomes a Lambda function:
```
functions/
├── api-users-index.js
├── api-users-show.js
├── api-users-store.js
├── api-users-update.js
└── api-users-destroy.js
```

### 16.4 CLI Applications

Build and distribute CLI tools:

```bash
buddy build:cli
```

Output:
```
dist/
├── cli-linux-x64
├── cli-linux-arm64
├── cli-darwin-x64
├── cli-darwin-arm64
└── cli-windows-x64.exe
```

Publishing to npm:
```bash
buddy publish:cli
# Users install via: npm install -g @yourorg/cli
```

### 16.5 Library Publishing

Publish reusable packages:

```bash
# Component library
buddy build:components
buddy publish:components

# Function library
buddy build:functions
buddy publish:functions
```

Generated package:
```json
{
  "name": "@yourorg/components",
  "exports": {
    ".": "./dist/index.js",
    "./Button": "./dist/Button.js",
    "./Card": "./dist/Card.js"
  },
  "types": "./dist/index.d.ts"
}
```

---

# Part VII: Use Cases & Future

## 17. Use Cases

### 17.1 E-Commerce Applications

Stacks includes a commerce module for online stores:

```typescript
// config/commerce.ts
export default {
  currency: 'USD',

  products: {
    trackInventory: true,
    allowBackorders: false,
  },

  checkout: {
    guestCheckout: true,
    requireBilling: true,
  },

  shipping: {
    providers: ['usps', 'ups', 'fedex'],
    freeShippingThreshold: 50,
  },

  taxes: {
    calculateAutomatically: true,
    provider: 'taxjar',
  },
}
```

Commerce features:
- **Product Management**: Variants, inventory, images
- **Cart System**: Session and authenticated carts
- **Checkout Flow**: Multi-step, address validation
- **Payment Processing**: Stripe integration
- **Order Management**: Status tracking, fulfillment
- **Subscriptions**: Recurring billing

### 17.2 SaaS Platforms

Multi-tenant SaaS applications:

```typescript
// Multi-tenancy configuration
export default {
  tenancy: {
    identifier: 'subdomain', // or 'path', 'domain'

    isolation: {
      database: 'schema', // or 'database', 'row'
    },
  },
}
```

SaaS features:
- **Team Management**: Invitations, roles, permissions
- **Subscription Billing**: Plans, trials, upgrades
- **Usage Metering**: API calls, storage, bandwidth
- **Admin Dashboard**: Analytics, user management
- **Onboarding Flows**: Guided setup, tutorials

### 17.3 Enterprise Applications

Enterprise-grade features:

- **SSO Integration**: SAML, OIDC, LDAP
- **Audit Logging**: Comprehensive activity tracking
- **Role-Based Access**: Granular permissions
- **Data Encryption**: At-rest and in-transit
- **Compliance**: GDPR, SOC 2, HIPAA tooling
- **High Availability**: Multi-region deployment
- **Monitoring**: APM, error tracking, alerting

---

## 18. Roadmap & Future

### 18.1 Current Status (Closed Beta)

**Version**: 0.70.23

Stacks is in **Closed Beta** (January 2026) with active development. The framework is production-ready for:
- Web applications (full-stack and API-only)
- Desktop applications (via Craft - macOS, Windows, Linux)
- Mobile applications (via Craft - iOS, Android in beta)
- CLI tools and libraries

**Production-Ready Components:**
- 77 core framework modules
- bun-router with 25+ middleware
- bun-query-builder with ORM capabilities
- ts-cloud with 47 AWS services and 13 presets
- STX templating with 40+ directives
- ts-auth with WebAuthn and TOTP
- Craft desktop framework (5 platforms)

Active sponsors include JetBrains and Solana Foundation.

### 18.2 Planned Features

**Near-Term:**
- ts-cloud drivers for GCP, Azure, and Cloudflare
- Enhanced mobile support in Craft
- Visual component builder
- Plugin marketplace

**Medium-Term:**
- Traditional auth patterns (session, JWT, OAuth) in ts-auth
- Real-time collaboration features
- Edge deployment optimizations
- Enterprise SSO integration

**Long-Term:**
- Distributed system primitives
- Multi-region deployment automation
- AI-powered code generation improvements
- Visual application builder

### 18.3 Community & Governance

**Open Source**: MIT Licensed, fully open source

**Contributing**:
- GitHub: https://github.com/stacksjs/stacks
- Discord: Community discussions and support
- Sponsorship: GitHub Sponsors, Open Collective

**Governance**:
- Core team maintains framework direction
- RFC process for major changes
- Community input on feature prioritization

---

# Part VIII: Appendices

## Appendix A: Complete Module Reference

| Module | Package | Purpose |
|--------|---------|---------|
| Actions | `@stacksjs/actions` | Business logic pattern |
| AI | `@stacksjs/ai` | AI provider integration |
| Alias | `@stacksjs/alias` | Module aliasing |
| Analytics | `@stacksjs/analytics` | Analytics tracking |
| API | `@stacksjs/api` | API client/server |
| Arrays | `@stacksjs/arrays` | Array utilities |
| Auth | `@stacksjs/auth` | Authentication |
| Browser | `@stacksjs/browser` | Browser utilities |
| Buddy | `@stacksjs/buddy` | CLI toolkit |
| Build | `@stacksjs/build` | Build system |
| Cache | `@stacksjs/cache` | Caching layer |
| Calendar | `@stacksjs/calendar` | Calendar utilities |
| Chat | `@stacksjs/chat` | Chat functionality |
| CLI | `@stacksjs/cli` | CLI creation |
| Cloud | `@stacksjs/cloud` | ts-cloud integration (zero-dependency IaC) |
| Collections | `@stacksjs/collections` | Collection utilities |
| Commerce | `@stacksjs/commerce` | E-commerce toolkit |
| Components | `@stacksjs/components` | UI components |
| Config | `@stacksjs/config` | Configuration |
| Database | `@stacksjs/database` | Database layer |
| DateTime | `@stacksjs/datetime` | Date/time utilities |
| Deploy | `@stacksjs/deploy` | Deployment |
| Desktop | `@stacksjs/desktop` | Desktop apps |
| DNS | `@stacksjs/dns` | DNS management |
| Docs | `@stacksjs/docs` | Documentation |
| Email | `@stacksjs/email` | Email sending |
| Env | `@stacksjs/env` | Environment |
| Error Handling | `@stacksjs/error-handling` | Error management |
| Events | `@stacksjs/events` | Event system |
| Faker | `@stacksjs/faker` | Data generation |
| Git | `@stacksjs/git` | Git integration |
| Health | `@stacksjs/health` | Health checks |
| Lint | `@stacksjs/lint` | Code quality |
| Logging | `@stacksjs/logging` | Logging |
| Notifications | `@stacksjs/notifications` | Notifications |
| Objects | `@stacksjs/objects` | Object utilities |
| ORM | `@stacksjs/orm` | Object-relational mapping |
| Payments | `@stacksjs/payments` | Payment processing |
| Query Builder | `@stacksjs/query-builder` | SQL builder |
| Queue | `@stacksjs/queue` | Job queue |
| Realtime | `@stacksjs/realtime` | WebSockets |
| Router | `@stacksjs/router` | HTTP routing |
| Scheduler | `@stacksjs/scheduler` | Task scheduling |
| Search Engine | `@stacksjs/search-engine` | Search functionality |
| Security | `@stacksjs/security` | Security utilities |
| Server | `@stacksjs/server` | HTTP server |
| Slug | `@stacksjs/slug` | URL slugs |
| SMS | `@stacksjs/sms` | SMS messaging |
| Storage | `@stacksjs/storage` | File storage |
| Strings | `@stacksjs/strings` | String utilities |
| Testing | `@stacksjs/testing` | Test utilities |
| Tinker | `@stacksjs/tinker` | REPL |
| Tunnel | `@stacksjs/tunnel` | Dev tunneling |
| Types | `@stacksjs/types` | Type definitions |
| UI | `@stacksjs/ui` | UI engine |
| Utils | `@stacksjs/utils` | General utilities |
| Validation | `@stacksjs/validation` | Input validation |

## Appendix B: Configuration Reference

| Config File | Purpose | Key Options |
|-------------|---------|-------------|
| `app.ts` | Application settings | name, env, timezone, locale |
| `auth.ts` | Authentication | guards, providers, tokens |
| `database.ts` | Database connections | default, connections, migrations |
| `cache.ts` | Caching | default, stores, prefix |
| `queue.ts` | Job queue | default, connections, failed |
| `email.ts` | Email | default, mailers, from |
| `ai.ts` | AI providers | default, providers, models |
| `cloud.ts` | Cloud infrastructure (ts-cloud) | project, mode, infrastructure |
| `security.ts` | Security settings | cors, csp, rateLimit |
| `commerce.ts` | E-commerce | currency, products, checkout |

## Appendix C: CLI Command Reference

```
buddy dev              Start development server
buddy build            Build for production
buddy serve            Start production server
buddy test             Run tests
buddy lint             Run linters
buddy typecheck        Check TypeScript types
buddy migrate          Run migrations
buddy migrate:fresh    Fresh migration
buddy seed             Run seeders
buddy tinker           Start REPL
buddy make:*           Generate code
buddy deploy           Deploy application
buddy cloud:*          Cloud infrastructure
buddy ai:*             AI assistant
buddy release          Release new version
buddy publish          Publish packages
buddy key:generate     Generate app key
buddy cache:clear      Clear cache
buddy queue:work       Process queue
buddy schedule:run     Run scheduler
```

---

## 19. Conclusion

Stacks.js represents a new paradigm in TypeScript full-stack development. By combining the developer experience principles of Laravel and Ruby on Rails with the performance of Bun and the intelligence of modern AI, Stacks enables developers to build sophisticated applications with unprecedented speed and confidence.

**Key Differentiators**:

1. **Unified Framework**: One cohesive solution from database to deployment
2. **Type Safety**: End-to-end TypeScript without compromise
3. **AI Integration**: First-class AI capabilities for development and applications
4. **Bun Performance**: Native speed without Node.js legacy
5. **Developer Joy**: Every decision optimized for developer experience

The framework is actively developed, well-documented, and backed by a growing community. Whether building a startup MVP, an enterprise application, or a personal project, Stacks provides the tools and conventions to succeed.

---

**Get Started**:
```bash
bunx stacks new my-project
cd my-project
buddy dev
```

**Resources**:
- Documentation: https://stacksjs.com
- GitHub: https://github.com/stacksjs/stacks
- Discord: Community support and discussions
- Sponsors: JetBrains, Solana Foundation

---

*Stacks.js is open source software licensed under the MIT License.*

*This white paper represents Stacks version 0.70.23. Features and APIs are subject to change.*
