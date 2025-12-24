---
title: CLI & Tooling (Buddy)
description: The Stacks.js command-line interface
---

# CLI & Tooling (Buddy)

## Command Categories

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

## Scaffolding & Generators

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

### Generated Files

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

## Development Workflow

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

## Project Environment Management (Pantry)

Stacks integrates with **Pantry** (also known as Launchpad), a modern package manager that automatically handles project dependencies and creates isolated development environments. Think of it as Homebrew meets nvm meets Docker—but faster and simpler.

### Automatic Environment Activation

When you `cd` into a Stacks project, Pantry automatically:

1. Detects the project's `dependencies.yaml`
2. Installs required tools if missing
3. Activates the project-specific environment
4. Sets environment variables
5. Starts required services (databases, caches)

```bash
# Shell integration (add to .zshrc or .bashrc)
eval "$(pantry dev:shellcode)"

# Now environments activate automatically
cd my-stacks-project
# ✓ Activated environment: my-stacks-project
# ✓ Node 22.1.0, Bun 1.2.0, TypeScript 5.7.0
# ✓ Started services: postgres, redis
```

### Project Dependencies

Define project dependencies in `dependencies.yaml`:

```yaml
# dependencies.yaml
dependencies:
  - node@22
  - bun@1.2
  - typescript@5.7
  - python@3.12  # If needed for tooling

env:
  NODE_ENV: development
  DATABASE_URL: postgres://localhost:5432/myapp

services:
  enabled: true
  autoStart:
    - postgres
    - redis
```

### Per-Project Isolation

Each project gets its own isolated environment:

```yaml
# Project A: dependencies.yaml
dependencies:
  - node@20
  - typescript@5.0

# Project B: dependencies.yaml
dependencies:
  - node@22
  - typescript@5.7
```

Switching between projects is instant (sub-millisecond) with no conflicts—each project uses its specified versions without affecting the system or other projects.

### Service Management

Pantry includes 30+ pre-configured services:

```bash
# Start services
pantry service start postgres redis

# Check status
pantry service status
# postgres: running (port 5432)
# redis: running (port 6379)

# Stop when done
pantry service stop postgres redis
```

**Available services include:**

| Category | Services |
|----------|----------|
| Databases | PostgreSQL, MySQL, MongoDB, Redis, InfluxDB, CockroachDB |
| Web Servers | Nginx, Caddy |
| Message Queues | Kafka, RabbitMQ, NATS, Apache Pulsar |
| Monitoring | Prometheus, Grafana, Jaeger |
| Development | LocalStack, Verdaccio, Jenkins |
| Infrastructure | Vault, Consul, etcd, MinIO |

### Pantry CLI Commands

```bash
# Installation
pantry install node@22 bun@1.2    # Install packages
pantry remove node                 # Remove packages
pantry update                      # Update all packages

# Environment management
pantry dev:on                      # Activate environment
pantry env:list                    # List all environments
pantry env:clean                   # Clean unused environments

# Services
pantry service start postgres      # Start a service
pantry service stop postgres       # Stop a service
pantry service restart postgres    # Restart a service
pantry service list                # List all services

# System setup
pantry bootstrap                   # Initial system setup
```

### Comparison with Alternatives

| Feature | Pantry | Homebrew | nvm/pyenv | Docker |
|---------|--------|----------|-----------|--------|
| Speed | Sub-ms switching | Slow | Medium | Slow startup |
| Project isolation | Automatic | None | Manual | Full |
| Service management | Built-in | No | No | Yes |
| Cross-platform | Yes | macOS/Linux | Yes | Yes |
| Native performance | Yes | Yes | Yes | No (VM) |
| PATH management | Automatic | Manual | Manual | N/A |

### Integration with Stacks

When creating a new Stacks project, dependencies are automatically configured:

```bash
bunx stacks new my-project
cd my-project
# ✓ Environment automatically activated
# ✓ All dependencies ready

buddy dev  # Start developing immediately
```

Pantry coexists peacefully with Homebrew—it uses `/usr/local` and never touches `/opt/homebrew`, so your existing setup remains intact.
