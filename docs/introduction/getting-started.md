---
title: Getting Started
description: Quick start guide for the Stacks.js framework and protocol
---

# Getting Started

This guide covers using the full Stacks framework. You can also adopt individual modules in existing TypeScript projects—each `@stacksjs/*` package works independently.

## Prerequisites

Before you begin, ensure you have [Bun](https://bun.sh) installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

## Create a New Project

Create a new Stacks application with a single command:

```bash
bunx stacks new my-project
cd my-project
```

## Start Development

Launch the development server:

```bash
buddy dev
```

This starts:
- HTTP server on port 3000
- Hot module replacement
- TypeScript compilation
- File watching
- Error overlay
- Request logging

## Project Structure

Your new project includes:

```
my-project/
├── app/
│   ├── Actions/          # Business logic handlers
│   ├── Models/           # Database models
│   ├── Middleware/       # Request middleware
│   ├── Jobs/             # Queue jobs
│   └── Notifications/    # Notification classes
├── config/               # 40+ configuration files
├── database/
│   ├── migrations/       # Database migrations
│   └── seeders/          # Data seeders
├── resources/
│   ├── components/       # UI components
│   ├── views/            # Page templates
│   └── functions/        # Utility functions
├── routes/               # Route definitions
├── storage/              # Generated files, logs, cache
├── tests/                # Test suite
└── package.json
```

## Common Commands

```bash
# Development
buddy dev              # Start development server
buddy tinker           # Interactive REPL

# Database
buddy migrate          # Run migrations
buddy migrate:fresh    # Fresh migration
buddy seed             # Run seeders

# Testing
buddy test             # Run tests
buddy test:coverage    # With coverage

# Code Quality
buddy lint             # Run linters
buddy lint:fix         # Auto-fix issues
buddy typecheck        # Check TypeScript

# Building
buddy build            # Build for production
buddy build:web        # Build web assets
buddy build:api        # Build API server

# Deployment
buddy deploy           # Deploy application
```

## Next Steps

- [Architecture Overview](/architecture/) - Understand how Stacks is structured
- [Frontend Development](/guide/frontend) - Build UI components
- [Backend Development](/guide/backend) - Create APIs and business logic
- [Database & ORM](/guide/database) - Work with data
