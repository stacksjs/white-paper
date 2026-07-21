---
title: Backend Development
description: Building APIs and business logic with Stacks.js
---

# Backend Development

> **Protocol context** — This guide covers Stacks.js Actions and routing. Portable responsibilities appear in the draft [MVA](https://github.com/stacksjs/white-paper#21-modelviewaction), [Routing](https://github.com/stacksjs/white-paper#41-routing), and [Request lifecycle](https://github.com/stacksjs/white-paper#42-request-lifecycle) sections.

## Routing System

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

## Actions Pattern

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

## Middleware

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

## Validation Framework

Stacks validation runs on both client and server with identical rules:

```typescript
// Validation schema
import { z } from '@stacksjs/validation'

const CreateUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, 'Must contain uppercase'),
  role: z.enum(['user', 'admin', 'moderator']),
  preferences: z.object({
    newsletter: z.boolean().default(true),
    theme: z.enum(['light', 'dark']).default('light'),
  }).optional(),
})

type CreateUserRequest = z.infer<typeof CreateUserSchema>
```

Validation features:

- **Type Inference**: Schema generates TypeScript types
- **Custom Rules**: Extend with custom validation logic
- **Async Validation**: Database uniqueness checks
- **Localization**: Error messages in multiple languages
- **Client Sharing**: Same schema validates forms
