---
title: Request Lifecycle
description: How HTTP requests flow through the Stacks.js framework
---

# Request Lifecycle

## Overview

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

## Router Integration

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

## Configuration System

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

### Configuration Benefits

- **Type Safety**: IDE autocomplete for all options
- **Documentation**: Inline comments explain each setting
- **Environment Variables**: Seamless `.env` integration
- **Defaults**: Sensible values work out of the box
