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

AI Context           Publishing           Git
----------           ----------           ---
buddy ai:context     buddy release        buddy commit
                     buddy publish        buddy changelog
                     buddy version        buddy release

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

```

Generators reduce hand-written boilerplate, but generated artifacts remain
application code and should be reviewed. For an LLM workflow, prefer asking the
model to express domain intent inside these conventions rather than recreating
the framework's routing, validation, persistence, and lifecycle glue.

## Compact context for coding assistants

`buddy ai:context` emits a deterministic, bounded summary of the application:

```bash
buddy ai:context
buddy ai:context --max-chars 4000 --model claude-sonnet
buddy ai:context --json --output .stacks/ai-context.json
```

The output includes MVA guidance, override precedence, scripts, dependency names,
capability surfaces, and representative application paths. It excludes
`node_modules`, lockfiles, caches, build output, environment files, credentials,
and private keys. Dependency trees still exist on disk; excluding them keeps
package-manager state out of the app-owned source and prompt budget.

Character and heuristic token metrics compare the compact representation with a
broad legacy context. They help measure prompt-size reduction but do not predict
model quality, provider billing, latency, or correctness.

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

## Extending Projects with Stacks

Stacks projects can be easily extended with pre-built functionality packages called **Stacks**. A Stack is a community or first-party package that adds features to your project by merging its contents directly into your codebase.

### Installing a Stack

```bash
# Install a Stack by name
buddy add blog

# Install from a GitHub repository
buddy add github:stacksjs/blog-stack

# Install from npm
buddy add @stacksjs/commerce-stack
```

### How Stacks Work

When you run `buddy add stack-name`, Stacks:

1. **Resolves the package** - Finds the Stack from the registry, GitHub, or npm
2. **Downloads the contents** - Fetches the Stack's files
3. **Merges into your project** - Copies the folder structure directly into your project

This means a Stack can include:
- New models and migrations
- Pre-built components
- Actions and middleware
- Configuration presets
- Routes and API endpoints
- Tests and documentation

```bash
# Example: Adding a blog Stack
buddy add blog

# Your project now includes:
# app/Models/Post.ts
# app/Models/Category.ts
# app/Actions/CreatePostAction.ts
# database/migrations/create_posts_table.ts
# resources/components/BlogList.stx
# routes/blog.ts
```

### Creating Your Own Stack

Any Stacks project can be published as a Stack for others to use:

```bash
# Initialize a new Stack
buddy make:stack my-feature

# Publish to the registry
buddy publish:stack
```

A Stack is simply a Stacks project (or subset) that follows conventions. When someone installs it, the files merge seamlessly into their existing project structure.

### Available Stacks

| Stack | Description |
|-------|-------------|
| `blog` | Full blogging system with posts, categories, and comments |
| `commerce` | E-commerce with products, carts, and checkout |
| `auth-social` | Social authentication providers (GitHub, Google, etc.) |
| `admin` | Admin dashboard scaffolding |
| `api-docs` | OpenAPI documentation generation |
| `analytics` | Usage analytics and tracking |

*More Stacks are available in the registry and community repositories.*

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

## Project environment management (Pantry)

Stacks uses Pantry to provision its declared native toolchain and run `panx`.
Pantry is a separate project with its own versioned behavior; Stacks does not
redefine its resolution, lockfile, integrity, lifecycle, registry, or storage
semantics. This whitepaper pins the complete [package-manager contract](/reference/package-manager)
and [registry contract](/reference/registry) from Pantry `v0.10.48`.

Pantry distinguishes system/runtime packages, npm-compatible JavaScript
packages, and workspace/local packages. Inspect the generated catalog and
registry rather than relying on a static service or package list copied into
Stacks documentation.

### Integration with Stacks

Use the versions pinned by the project and inspect the installed commands:

```bash
panx @stacksjs/buddy new my-project
cd my-project
pantry --help
buddy doctor
buddy dev
```

Installation paths, shell activation, and package-manager coexistence are
platform details. Use Pantry diagnostics rather than assuming a fixed prefix,
automatic service behavior, or a command copied from an older release.
