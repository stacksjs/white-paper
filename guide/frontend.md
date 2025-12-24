---
title: Frontend Development
description: Building UI components with Stacks.js
---

# Frontend Development

## UI Components (STX & Web Components)

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

## STX Templating Engine

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
- **Compilation**: Templates compile to optimized JavaScript

## Headwind CSS Framework

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

## Client-Side Utilities

Stacks provides utility modules for common frontend operations:

### Strings

```typescript
import { Str } from '@stacksjs/strings'

Str.slug('Hello World')           // 'hello-world'
Str.camel('hello_world')          // 'helloWorld'
Str.plural('post')                // 'posts'
Str.limit('Long text...', 10)     // 'Long te...'
Str.random(16)                    // Random string
```

### Arrays

```typescript
import { Arr } from '@stacksjs/arrays'

Arr.shuffle([1, 2, 3, 4, 5])
Arr.chunk([1, 2, 3, 4, 5], 2)     // [[1, 2], [3, 4], [5]]
Arr.unique([1, 1, 2, 2, 3])       // [1, 2, 3]
Arr.pluck(users, 'name')          // ['Alice', 'Bob']
```

### Collections

```typescript
import { collect } from '@stacksjs/collections'

collect(users)
  .where('active', true)
  .sortBy('name')
  .pluck('email')
  .toArray()
```
