---
title: Type Safety
description: End-to-end type safety in Stacks.js
---

# Type Safety

## End-to-End Type Harmony

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

## Auto-Generated Types

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

### Generated Type Files

```
storage/framework/types/
├── models.d.ts        # Database model types
├── requests.d.ts      # API request types
├── responses.d.ts     # API response types
├── components.d.ts    # Component prop types
├── routes.d.ts        # Route parameter types
└── config.d.ts        # Configuration types
```

## Auto-Imports

Stacks eliminates manual imports — **everything is auto-importable by default**. Functions, composables, components, utilities, and even Actions are available globally without explicit import statements.

### How It Works

Stacks automatically scans these directories and makes their exports available:

| Directory | What's Auto-Imported |
|-----------|---------------------|
| `./app/Actions` | Action classes (`CreateUser`, `SendEmail`) |
| `./app/Composables` | Vue composables (`useAuth`, `useCart`) |
| `./app/Utils` | Utility functions (`formatCurrency`, `slugify`) |
| `./components` | Vue/STX components (`UserCard`, `Modal`) |
| `./resources/functions` | Helper functions |

### Usage Example

```typescript
// Traditional approach (verbose)
import { useAuth } from './app/Composables/useAuth'
import { formatCurrency } from './app/Utils/formatCurrency'
import CreateUser from './app/Actions/CreateUser'
import UserCard from './components/UserCard.vue'

// Stacks approach (zero imports!)
// Everything just works:
const { user, login } = useAuth()
const price = formatCurrency(99.99)
await CreateUser.handle({ name: 'John' })
// <UserCard :user="user" /> in templates
```

### Configuration

Auto-imports are configured in `config/app.ts`:

```typescript
export default {
  autoImports: {
    // Directories to scan
    dirs: [
      './app/Actions',
      './app/Composables',
      './app/Utils',
      './components',
      './resources/functions',
    ],

    // Package presets (vue, react, solid-js, etc.)
    presets: ['vue', '@vueuse/core'],

    // Explicit package imports
    imports: [
      { from: 'zod', names: ['z'] },
      { from: '@stacksjs/validation', names: ['v'] },
    ],

    // TypeScript declaration output
    dts: './storage/framework/types/auto-imports.d.ts',
  },
}
```

### Generated Type Declarations

A `.d.ts` file is automatically generated so TypeScript and your IDE understand all available globals:

```typescript
// storage/framework/types/auto-imports.d.ts (auto-generated)
declare global {
  const useAuth: typeof import('./app/Composables/useAuth')['default']
  const formatCurrency: typeof import('./app/Utils/formatCurrency')['formatCurrency']
  const ref: typeof import('vue')['ref']
  const computed: typeof import('vue')['computed']
  // ... all your functions, composables, and utilities
}
```

This enables:
- **Full IntelliSense**: Autocomplete for all auto-imported functions
- **Go-to-definition**: Click through to source files
- **Type checking**: TypeScript validates usage without explicit imports

## IDE Integration

Stacks optimizes for IDE experience:

- **Auto-imports**: Components, composables, and utilities available without manual imports
- **Go-to-definition**: Jump to model, action, or component definitions
- **Hover documentation**: Types show documentation inline
- **Error highlighting**: TypeScript errors appear immediately
- **Snippets**: Code snippets for common patterns

### VSCode Workspace Settings

Auto-configured settings:

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
