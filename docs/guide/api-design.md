---
title: API Design
description: RESTful patterns, API versioning, pagination, rate limiting, and API documentation in Stacks.js
---

# API Design

Stacks.js provides tools and conventions for building well-designed, consistent, and developer-friendly APIs. This guide covers RESTful patterns, versioning, pagination, rate limiting, and API documentation.

> **Protocol context** — This guide covers Stacks.js API resources and routing in relation to the draft [API representation contract](https://github.com/stacksjs/white-paper#48-api-representation). The APIs here are implementation-specific.

## RESTful Conventions

### Resource Naming

```typescript
// routes/api.ts
import { Router } from '@stacksjs/router'

const router = Router.prefix('/api')

// Resources use plural nouns
router.resource('users', UserController)
router.resource('posts', PostController)
router.resource('comments', CommentController)

// Nested resources
router.resource('posts.comments', PostCommentController)
// Creates: /api/posts/:postId/comments

// Custom actions
router.post('posts/:id/publish', PostController.publish)
router.post('posts/:id/archive', PostController.archive)
```

### HTTP Methods

```typescript
// GET - Retrieve resources
router.get('/users', UserController.index)        // List users
router.get('/users/:id', UserController.show)     // Get single user

// POST - Create resources
router.post('/users', UserController.store)       // Create user

// PUT/PATCH - Update resources
router.put('/users/:id', UserController.update)   // Full update
router.patch('/users/:id', UserController.patch)  // Partial update

// DELETE - Remove resources
router.delete('/users/:id', UserController.destroy) // Delete user
```

### Response Status Codes

```typescript
// app/Controllers/Api/UserController.ts
export default class UserController extends Controller {
  // GET /users - 200 OK
  async index() {
    const users = await User.paginate()
    return response(users, 200)
  }

  // POST /users - 201 Created
  async store(request: Request) {
    const user = await User.create(request.validated())
    return response(user, 201)
  }

  // GET /users/:id - 200 OK or 404 Not Found
  async show(request: Request) {
    const user = await User.findOrFail(request.params.id)
    return response(user, 200)
  }

  // PUT /users/:id - 200 OK
  async update(request: Request) {
    const user = await User.findOrFail(request.params.id)
    await user.update(request.validated())
    return response(user, 200)
  }

  // DELETE /users/:id - 204 No Content
  async destroy(request: Request) {
    const user = await User.findOrFail(request.params.id)
    await user.delete()
    return response(null, 204)
  }
}
```

### Response Format

```typescript
// Consistent response structure
// app/Support/ApiResponse.ts
export class ApiResponse {
  static success(data: any, meta?: object) {
    return {
      success: true,
      data,
      meta,
    }
  }

  static error(message: string, errors?: object, code?: string) {
    return {
      success: false,
      error: {
        message,
        code,
        errors,
      },
    }
  }

  static paginated(data: any, pagination: object) {
    return {
      success: true,
      data,
      meta: {
        pagination,
      },
    }
  }
}

// Usage
return ApiResponse.success(user)
// {
//   "success": true,
//   "data": { "id": 1, "name": "John" }
// }

return ApiResponse.error('Validation failed', errors, 'VALIDATION_ERROR')
// {
//   "success": false,
//   "error": {
//     "message": "Validation failed",
//     "code": "VALIDATION_ERROR",
//     "errors": { "email": ["Invalid email"] }
//   }
// }
```

## API Versioning

### URL Versioning

```typescript
// routes/api.ts
const v1 = Router.prefix('/api/v1')
const v2 = Router.prefix('/api/v2')

// V1 routes
v1.resource('users', V1.UserController)

// V2 routes with updated behavior
v2.resource('users', V2.UserController)

// Version detection middleware
router.use(ApiVersionMiddleware)
```

### Header Versioning

```typescript
// middleware/ApiVersion.ts
export class ApiVersionMiddleware extends Middleware {
  handle(request: Request, next: Function) {
    const version = request.header('API-Version') || 'v1'

    request.apiVersion = version

    return next()
  }
}

// Controller using version
export default class UserController extends Controller {
  async show(request: Request) {
    const user = await User.find(request.params.id)

    if (request.apiVersion === 'v2') {
      return this.transformV2(user)
    }

    return this.transformV1(user)
  }
}
```

### Version Deprecation

```typescript
// middleware/DeprecatedVersion.ts
export class DeprecatedVersionMiddleware extends Middleware {
  handle(request: Request, next: Function) {
    const response = next()

    // Add deprecation headers
    response.headers.set('Deprecation', 'true')
    response.headers.set('Sunset', 'Sat, 01 Jan 2025 00:00:00 GMT')
    response.headers.set('Link', '</api/v2/users>; rel="successor-version"')

    return response
  }
}

// Apply to deprecated routes
v1.use(DeprecatedVersionMiddleware)
```

## Pagination

### Offset Pagination

```typescript
// Controller
async index(request: Request) {
  const page = request.query('page', 1)
  const perPage = request.query('per_page', 20)

  const users = await User.paginate(page, perPage)

  return response({
    data: users.data,
    meta: {
      pagination: {
        total: users.total,
        count: users.data.length,
        per_page: perPage,
        current_page: page,
        total_pages: users.lastPage,
        links: {
          previous: users.previousPageUrl,
          next: users.nextPageUrl,
        },
      },
    },
  })
}
```

### Cursor Pagination

```typescript
// Better for large datasets
async index(request: Request) {
  const cursor = request.query('cursor')
  const limit = request.query('limit', 20)

  const users = await User
    .orderBy('id')
    .cursorPaginate(limit, cursor)

  return response({
    data: users.data,
    meta: {
      cursor: {
        next: users.nextCursor,
        previous: users.previousCursor,
        has_more: users.hasMore,
      },
    },
  })
}
```

### Pagination Links

```typescript
// Include HATEOAS links
{
  "data": [...],
  "links": {
    "self": "/api/users?page=2",
    "first": "/api/users?page=1",
    "prev": "/api/users?page=1",
    "next": "/api/users?page=3",
    "last": "/api/users?page=10"
  },
  "meta": {
    "current_page": 2,
    "from": 21,
    "to": 40,
    "per_page": 20,
    "total": 200,
    "last_page": 10
  }
}
```

## Filtering & Sorting

### Query Parameters

```typescript
// GET /api/users?status=active&role=admin&sort=-created_at

async index(request: Request) {
  let query = User.query()

  // Filtering
  if (request.has('status')) {
    query = query.where('status', request.query('status'))
  }

  if (request.has('role')) {
    query = query.where('role', request.query('role'))
  }

  if (request.has('search')) {
    query = query.where('name', 'like', `%${request.query('search')}%`)
  }

  // Sorting (- prefix for descending)
  const sort = request.query('sort', 'created_at')
  const direction = sort.startsWith('-') ? 'desc' : 'asc'
  const field = sort.replace(/^-/, '')

  query = query.orderBy(field, direction)

  return response(await query.paginate())
}
```

### Filter Builder

```typescript
// app/Support/QueryFilter.ts
export class QueryFilter {
  constructor(
    private query: any,
    private request: Request,
    private allowedFilters: string[],
  ) {}

  apply() {
    for (const filter of this.allowedFilters) {
      if (this.request.has(filter)) {
        this.query = this.query.where(filter, this.request.query(filter))
      }
    }

    return this.query
  }
}

// Controller
async index(request: Request) {
  const query = new QueryFilter(User.query(), request, [
    'status',
    'role',
    'department_id',
  ]).apply()

  return response(await query.paginate())
}
```

### Advanced Filtering

```typescript
// GET /api/users?filter[status]=active&filter[created_at][gte]=2024-01-01

async index(request: Request) {
  let query = User.query()
  const filters = request.query('filter', {})

  for (const [field, value] of Object.entries(filters)) {
    if (typeof value === 'object') {
      // Operator filters: { gte: '2024-01-01' }
      for (const [operator, operand] of Object.entries(value)) {
        query = this.applyOperator(query, field, operator, operand)
      }
    } else {
      // Simple equality
      query = query.where(field, value)
    }
  }

  return response(await query.paginate())
}

applyOperator(query: any, field: string, operator: string, value: any) {
  const operators = {
    eq: '=',
    ne: '!=',
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    like: 'like',
    in: 'in',
  }

  if (operator === 'in') {
    return query.whereIn(field, value.split(','))
  }

  return query.where(field, operators[operator], value)
}
```

## Rate Limiting

### API Rate Limits

```typescript
// config/api.ts
export default {
  rateLimit: {
    // Default limits
    default: {
      requests: 60,
      window: 60, // seconds
    },

    // Per-tier limits
    tiers: {
      free: { requests: 60, window: 60 },
      pro: { requests: 600, window: 60 },
      enterprise: { requests: 6000, window: 60 },
    },
  },
}
```

```typescript
// middleware/ApiRateLimit.ts
export class ApiRateLimitMiddleware extends Middleware {
  async handle(request: Request, next: Function) {
    const user = request.user
    const tier = user?.subscription?.tier || 'free'
    const limits = config(`api.rateLimit.tiers.${tier}`)

    const key = user ? `api:${user.id}` : `api:${request.ip}`
    const current = await RateLimiter.get(key)

    if (current >= limits.requests) {
      return response({
        error: {
          message: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          retry_after: await RateLimiter.retryAfter(key),
        },
      }, 429)
    }

    await RateLimiter.increment(key, limits.window)

    const response = await next()

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', limits.requests)
    response.headers.set('X-RateLimit-Remaining', limits.requests - current - 1)
    response.headers.set('X-RateLimit-Reset', await RateLimiter.resetTime(key))

    return response
  }
}
```

### Endpoint-Specific Limits

```typescript
// routes/api.ts
router.post('/api/auth/login', [
  RateLimiter.perMinute(5).by((req) => req.ip),
], AuthController.login)

router.post('/api/emails/send', [
  RateLimiter.perHour(100).by((req) => req.user.id),
], EmailController.send)

router.get('/api/search', [
  RateLimiter.perMinute(30),
], SearchController.index)
```

## Authentication

### API Key Authentication

```typescript
// middleware/ApiKeyAuth.ts
export class ApiKeyAuthMiddleware extends Middleware {
  async handle(request: Request, next: Function) {
    const apiKey = request.header('X-API-Key')

    if (!apiKey) {
      return response({
        error: { message: 'API key required', code: 'MISSING_API_KEY' },
      }, 401)
    }

    const key = await ApiKey.where('key', Hash.make(apiKey)).first()

    if (!key || key.isExpired()) {
      return response({
        error: { message: 'Invalid API key', code: 'INVALID_API_KEY' },
      }, 401)
    }

    request.apiKey = key
    request.user = await key.user

    // Track usage
    await key.increment('requests_count')

    return next()
  }
}
```

### JWT Authentication

```typescript
// middleware/JwtAuth.ts
export class JwtAuthMiddleware extends Middleware {
  async handle(request: Request, next: Function) {
    const token = request.bearerToken()

    if (!token) {
      return response({
        error: { message: 'Token required', code: 'MISSING_TOKEN' },
      }, 401)
    }

    try {
      const payload = await JWT.verify(token)
      request.user = await User.find(payload.sub)
      return next()
    } catch (error) {
      return response({
        error: { message: 'Invalid token', code: 'INVALID_TOKEN' },
      }, 401)
    }
  }
}
```

### OAuth2 Scopes

```typescript
// Define scopes
const scopes = {
  'read:users': 'Read user information',
  'write:users': 'Create and update users',
  'delete:users': 'Delete users',
  'read:orders': 'Read orders',
  'write:orders': 'Create and update orders',
}

// Require scopes on routes
router.get('/api/users', [
  'auth:api',
  'scope:read:users',
], UserController.index)

router.post('/api/users', [
  'auth:api',
  'scope:write:users',
], UserController.store)

router.delete('/api/users/:id', [
  'auth:api',
  'scope:delete:users',
], UserController.destroy)
```

## Error Handling

### API Error Responses

```typescript
// app/Exceptions/ApiHandler.ts
export default class ApiHandler extends ExceptionHandler {
  render(error: Error, request: Request) {
    // Validation errors
    if (error instanceof ValidationException) {
      return response({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors: error.errors(),
        },
      }, 422)
    }

    // Not found
    if (error instanceof ModelNotFoundException) {
      return response({
        error: {
          message: `${error.model} not found`,
          code: 'NOT_FOUND',
        },
      }, 404)
    }

    // Authentication
    if (error instanceof AuthenticationException) {
      return response({
        error: {
          message: 'Unauthenticated',
          code: 'UNAUTHENTICATED',
        },
      }, 401)
    }

    // Authorization
    if (error instanceof AuthorizationException) {
      return response({
        error: {
          message: 'Forbidden',
          code: 'FORBIDDEN',
        },
      }, 403)
    }

    // Generic server error
    return response({
      error: {
        message: 'Internal server error',
        code: 'SERVER_ERROR',
        ...(config('app.debug') && { trace: error.stack }),
      },
    }, 500)
  }
}
```

### Error Codes

```typescript
// app/Support/ErrorCodes.ts
export const ErrorCodes = {
  // Authentication
  MISSING_TOKEN: { status: 401, message: 'Authentication token required' },
  INVALID_TOKEN: { status: 401, message: 'Invalid authentication token' },
  TOKEN_EXPIRED: { status: 401, message: 'Authentication token expired' },

  // Authorization
  FORBIDDEN: { status: 403, message: 'You do not have permission' },
  INSUFFICIENT_SCOPE: { status: 403, message: 'Insufficient scope' },

  // Validation
  VALIDATION_ERROR: { status: 422, message: 'Validation failed' },
  INVALID_INPUT: { status: 400, message: 'Invalid input' },

  // Resources
  NOT_FOUND: { status: 404, message: 'Resource not found' },
  CONFLICT: { status: 409, message: 'Resource conflict' },

  // Rate limiting
  RATE_LIMIT_EXCEEDED: { status: 429, message: 'Rate limit exceeded' },

  // Server
  SERVER_ERROR: { status: 500, message: 'Internal server error' },
  SERVICE_UNAVAILABLE: { status: 503, message: 'Service unavailable' },
}
```

## API Documentation

### OpenAPI/Swagger

An OpenAPI 3.0 spec is generated automatically from your routes and served at `/__openapi.json` — no manual annotation required. The options below customize that output.

```typescript
// Generate OpenAPI spec from routes
// buddy api:docs

// config/api.ts
export default {
  docs: {
    enabled: true,
    path: '/api/docs',
    title: 'My API',
    version: '1.0.0',
    description: 'API documentation',
    servers: [
      { url: 'https://api.example.com', description: 'Production' },
      { url: 'https://staging-api.example.com', description: 'Staging' },
    ],
  },
}
```

### Route Documentation

```typescript
// app/Controllers/Api/UserController.ts
import { ApiDoc } from '@stacksjs/api'

export default class UserController extends Controller {
  @ApiDoc({
    summary: 'List all users',
    description: 'Returns a paginated list of users',
    tags: ['Users'],
    parameters: [
      { name: 'page', in: 'query', type: 'integer', description: 'Page number' },
      { name: 'per_page', in: 'query', type: 'integer', description: 'Items per page' },
      { name: 'status', in: 'query', type: 'string', enum: ['active', 'inactive'] },
    ],
    responses: {
      200: { description: 'Successful response', schema: UserListResponse },
      401: { description: 'Unauthorized' },
    },
  })
  async index(request: Request) {
    return User.paginate()
  }

  @ApiDoc({
    summary: 'Create a user',
    tags: ['Users'],
    requestBody: { schema: CreateUserRequest },
    responses: {
      201: { description: 'User created', schema: UserResponse },
      422: { description: 'Validation error' },
    },
  })
  async store(request: CreateUserRequest) {
    return User.create(request.validated())
  }
}
```

### Response Schemas

```typescript
// app/Schemas/UserSchema.ts
import { Schema } from '@stacksjs/api'

export const UserSchema = Schema.object({
  id: Schema.integer(),
  name: Schema.string(),
  email: Schema.string().format('email'),
  role: Schema.enum(['user', 'admin']),
  created_at: Schema.string().format('date-time'),
  updated_at: Schema.string().format('date-time'),
})

export const UserListResponse = Schema.object({
  data: Schema.array(UserSchema),
  meta: Schema.object({
    pagination: PaginationSchema,
  }),
})
```

## API Resources

### Resource Transformers

```typescript
// app/Resources/UserResource.ts
import { Resource } from '@stacksjs/api'

export default class UserResource extends Resource {
  toArray() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      avatar_url: this.avatarUrl,
      created_at: this.createdAt.toISOString(),

      // Conditional fields
      ...(this.when(this.isAdmin, {
        admin_notes: this.adminNotes,
      })),

      // Relationships
      ...(this.whenLoaded('posts', {
        posts: PostResource.collection(this.posts),
      })),

      // Links
      links: {
        self: `/api/users/${this.id}`,
        posts: `/api/users/${this.id}/posts`,
      },
    }
  }
}

// Usage
async show(request: Request) {
  const user = await User.with('posts').find(request.params.id)
  return new UserResource(user)
}

async index() {
  const users = await User.paginate()
  return UserResource.collection(users)
}
```

### Collection Resources

```typescript
// Paginated collection
return UserResource.collection(users).additional({
  meta: {
    total: users.total,
    per_page: users.perPage,
  },
})

// With wrapper
return {
  data: UserResource.collection(users.data),
  links: users.links,
  meta: users.meta,
}
```

## Webhooks

### Sending Webhooks

```typescript
// app/Services/WebhookService.ts
import { Webhook } from '@stacksjs/api'

export class WebhookService {
  async send(event: string, payload: object) {
    const subscriptions = await WebhookSubscription
      .where('event', event)
      .where('active', true)
      .get()

    for (const subscription of subscriptions) {
      await Webhook.send({
        url: subscription.url,
        event,
        payload,
        secret: subscription.secret,
        retries: 3,
      })
    }
  }
}

// Send webhook
await WebhookService.send('order.created', {
  order_id: order.id,
  total: order.total,
  customer: order.customer,
})
```

### Webhook Signature

```typescript
// Signing webhooks
const signature = Webhook.sign(payload, secret)
// X-Webhook-Signature: sha256=abc123...

// Verifying webhooks (receiving)
router.post('/webhooks/stripe', async (request) => {
  const signature = request.header('Stripe-Signature')

  if (!Webhook.verify(request.body, signature, secret)) {
    return response({ error: 'Invalid signature' }, 401)
  }

  // Process webhook
  await processStripeWebhook(request.body)

  return response({ received: true })
})
```

## Testing APIs

```typescript
import { apiTest } from '@stacksjs/testing'

describe('User API', () => {
  it('lists users', async () => {
    const users = await User.factory().count(3).create()

    const response = await apiTest()
      .withToken(adminToken)
      .get('/api/users')

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(3)
  })

  it('creates a user', async () => {
    const response = await apiTest()
      .withToken(adminToken)
      .post('/api/users', {
        name: 'John Doe',
        email: 'john@example.com',
      })

    expect(response.status).toBe(201)
    expect(response.body.data.name).toBe('John Doe')
  })

  it('validates input', async () => {
    const response = await apiTest()
      .withToken(adminToken)
      .post('/api/users', { name: '' })

    expect(response.status).toBe(422)
    expect(response.body.error.errors.name).toBeDefined()
  })

  it('requires authentication', async () => {
    const response = await apiTest().get('/api/users')

    expect(response.status).toBe(401)
  })
})
```
