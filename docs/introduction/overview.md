---
title: Framework & Protocol Overview
description: What Stacks.js provides as both a protocol and framework
---

# Framework & Protocol Overview

## What is Stacks?

Stacks is an **open protocol and reference implementation** for building full-stack TypeScript applications. As a protocol, it defines standardized interfaces, conventions, and specifications. As a framework, it provides a batteries-included implementation optimized for the Bun runtime.

### The Protocol Layer

The Stacks protocol establishes open specifications for:

- **Model Contracts**: Interface definitions for data models, relationships, and lifecycle hooks
- **Request/Response Schemas**: Standardized validation, serialization, and error formats
- **Driver Interfaces**: Pluggable adapters for databases, caches, queues, storage, mail, and cloud providers
- **Routing Conventions**: Patterns for file-based and declarative route definitions
- **Component Specifications**: STX and Web Component contracts for reusable UI
- **Module APIs**: Each of the 77 packages exposes a defined interface for interoperability

### The Framework Layer

The reference implementation provides:

- **Frontend**: STX components, Web Components, templating engine, CSS framework
- **Backend**: HTTP routing, middleware, validation, business logic patterns
- **Database**: Multi-dialect ORM, query builder, migrations, seeders
- **Infrastructure**: ts-cloud integration (zero-dependency IaC), serverless support, deployment automation
- **Services**: Authentication, payments, email, SMS, notifications, queues
- **AI**: Multi-provider AI integration, voice assistant, code generation
- **CLI**: Comprehensive command-line toolkit with 50+ command categories
- **Desktop**: Craft-based desktop application support
- **Libraries**: Tools for publishing npm packages and component libraries

## Core Principles

### Protocol-Driven Conventions

The protocol defines conventions (inspired by Laravel and Rails) that enable tooling, code generation, and ecosystem interoperability:

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

### Everything is Auto-Importable

Stacks eliminates manual imports — functions, composables, components, utilities, and Actions are all globally available without explicit import statements:

```typescript
// No imports needed! Everything just works:
const { user, login } = useAuth()              // From ./app/Composables/useAuth
const price = formatCurrency(99.99)             // From ./app/Utils/formatCurrency
await CreateUser.handle({ name: 'John' })       // From ./app/Actions/CreateUser
const posts = await Post.all()                  // Model from ./app/Models/Post
```

This is powered by `bun-plugin-auto-imports` which:
- Scans configured directories (`./app/Actions`, `./app/Composables`, `./components`, etc.)
- Generates TypeScript declarations for full IDE IntelliSense
- Includes presets for Vue, React, Solid.js, and other frameworks
- Works at both build-time and runtime

The result: cleaner code, faster development, and no import management overhead.

### Zero-Config Development

Starting a new project requires no configuration:

```bash
bunx stacks new my-app
cd my-app
buddy dev
```

The development server starts with hot reloading, TypeScript compilation, and all framework features enabled.

### Explicit Over Implicit (When It Matters)

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

## Target Audience

Stacks serves four primary audiences:

### Indie Developers & Startups

Stacks enables solo developers and small teams to build production-ready applications quickly. The integrated feature set (auth, payments, email, etc.) eliminates the need to evaluate and integrate third-party services for common requirements.

### Enterprise Teams

Large organizations benefit from Stacks' consistency and type safety. The protocol's conventions reduce onboarding time, while its modularity allows teams to adopt components incrementally within existing systems.

### Library Authors

The protocol and publishing tools support developers creating and distributing:

- STX component libraries following the component specification
- Web Component packages using Stacks conventions
- Utility function libraries compatible with Stacks types
- CLI applications using the Buddy CLI patterns

### Protocol Implementers

Framework authors and tool builders can:

- Implement alternative backends for Stacks driver interfaces
- Build tooling that leverages Stacks conventions
- Create integrations that work with any Stacks-compatible project
- Extend the protocol with custom module specifications
