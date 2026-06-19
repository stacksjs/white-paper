---
title: Error Handling
description: Exception handling, error pages, error logging, and error reporting in Stacks.js
---

# Error Handling

Stacks.js provides a comprehensive error handling system that catches exceptions, renders appropriate error responses, logs errors, and optionally reports to external services like Sentry.

> **Protocol context** — This guide covers the **Stacks.js reference implementation**. The behavior it relies on is specified by **Actions & the request lifecycle** in the [Stacks Protocol white paper](/) (§3, §6.2), so these concepts transfer to any conformant implementation — the specific APIs shown here are TypeScript/Bun.

## Configuration

### Error Handling Configuration

```typescript
// config/error-handling.ts
export default {
  // Show detailed errors (disable in production)
  debug: process.env.NODE_ENV === 'development',

  // Error reporting
  reporting: {
    // Log all errors
    log: true,

    // External services
    sentry: {
      enabled: process.env.SENTRY_DSN !== undefined,
      dsn: process.env.SENTRY_DSN,
      environment: process.env.APP_ENV,
      tracesSampleRate: 0.1,
    },

    // Slack notifications for critical errors
    slack: {
      enabled: process.env.SLACK_ERROR_WEBHOOK !== undefined,
      webhook: process.env.SLACK_ERROR_WEBHOOK,
      levels: ['error', 'critical'],
    },
  },

  // Error rendering
  render: {
    // Custom error views
    views: {
      404: 'errors/404',
      500: 'errors/500',
      503: 'errors/maintenance',
    },

    // JSON errors for API
    json: {
      includeTrace: false, // Never in production
      includeCode: true,
    },
  },

  // Errors to ignore
  ignore: [
    'ValidationException',
    'AuthenticationException',
    'NotFoundHttpException',
  ],
}
```

## Exception Handler

### Global Exception Handler

```typescript
// app/Exceptions/Handler.ts
import { ExceptionHandler, HttpException } from '@stacksjs/error-handling'

export default class Handler extends ExceptionHandler {
  // Exceptions that should not be reported
  protected dontReport: Array<new (...args: any[]) => Error> = [
    ValidationException,
    AuthenticationException,
    AuthorizationException,
  ]

  // Register exception handling callbacks
  register() {
    // Report to Sentry
    this.reportable((error) => {
      if (Sentry.isEnabled()) {
        Sentry.captureException(error)
      }
    })

    // Handle specific exception types
    this.renderable((error, request) => {
      if (error instanceof ModelNotFoundException) {
        return response({
          message: 'Resource not found',
        }, 404)
      }
    })

    // Log context
    this.context(() => ({
      userId: auth().id,
      url: request().url,
    }))
  }

  // Determine if exception should be reported
  shouldReport(error: Error) {
    // Don't report ignored exceptions
    if (this.dontReport.some(type => error instanceof type)) {
      return false
    }

    // Don't report client errors (4xx)
    if (error instanceof HttpException && error.statusCode < 500) {
      return false
    }

    return true
  }

  // Report exception to external services
  async report(error: Error) {
    // Log locally
    Log.error(error.message, {
      exception: error.name,
      trace: error.stack,
      context: this.context(),
    })

    // Report to Sentry
    if (Sentry.isEnabled() && this.shouldReport(error)) {
      Sentry.captureException(error, {
        extra: this.context(),
      })
    }

    // Notify on Slack for critical errors
    if (error instanceof CriticalException) {
      await this.notifySlack(error)
    }
  }

  // Render exception into HTTP response
  render(error: Error, request: Request) {
    // API request - return JSON
    if (request.wantsJson()) {
      return this.renderJson(error)
    }

    // Web request - return HTML
    return this.renderHtml(error)
  }

  protected renderJson(error: Error) {
    const response: any = {
      message: error.message,
    }

    if (error instanceof HttpException) {
      response.status = error.statusCode
    }

    if (error instanceof ValidationException) {
      response.errors = error.errors()
    }

    if (config('error-handling.debug')) {
      response.exception = error.name
      response.trace = error.stack?.split('\n')
    }

    return response(response, this.getStatusCode(error))
  }

  protected renderHtml(error: Error) {
    const status = this.getStatusCode(error)

    // Check for custom error view
    const customView = config(`error-handling.render.views.${status}`)
    if (customView && view.exists(customView)) {
      return view(customView, { error, status })
    }

    // Default error view
    return view('errors/generic', {
      error,
      status,
      debug: config('error-handling.debug'),
    })
  }

  protected getStatusCode(error: Error): number {
    if (error instanceof HttpException) {
      return error.statusCode
    }
    if (error instanceof ValidationException) {
      return 422
    }
    if (error instanceof AuthenticationException) {
      return 401
    }
    if (error instanceof AuthorizationException) {
      return 403
    }
    return 500
  }
}
```

## Custom Exceptions

### Creating Custom Exceptions

```bash
buddy make:exception PaymentFailedException
buddy make:exception RateLimitExceededException
buddy make:exception InsufficientCreditsException
```

```typescript
// app/Exceptions/PaymentFailedException.ts
import { Exception } from '@stacksjs/error-handling'

export default class PaymentFailedException extends Exception {
  // HTTP status code
  statusCode = 402

  // Error code for API clients
  code = 'PAYMENT_FAILED'

  constructor(
    public reason: string,
    public orderId: number,
  ) {
    super(`Payment failed: ${reason}`)
  }

  // How to render this error
  render(request: Request) {
    if (request.wantsJson()) {
      return response({
        message: this.message,
        code: this.code,
        reason: this.reason,
        order_id: this.orderId,
      }, this.statusCode)
    }

    return view('errors/payment-failed', {
      reason: this.reason,
      orderId: this.orderId,
    })
  }

  // How to report this error
  report() {
    Log.error('Payment failed', {
      reason: this.reason,
      orderId: this.orderId,
    })

    // Don't report to Sentry (expected error)
    return false
  }

  // Additional context for logging
  context() {
    return {
      reason: this.reason,
      orderId: this.orderId,
    }
  }
}

// Usage
throw new PaymentFailedException('Card declined', order.id)
```

### HTTP Exceptions

```typescript
import { HttpException } from '@stacksjs/error-handling'

// Built-in HTTP exceptions
throw new HttpException(404, 'Page not found')
throw new HttpException(500, 'Server error')

// Convenience exceptions
throw new NotFoundHttpException('User not found')
throw new UnauthorizedHttpException('Invalid credentials')
throw new ForbiddenHttpException('Access denied')
throw new BadRequestHttpException('Invalid input')
throw new ConflictHttpException('Resource already exists')
throw new TooManyRequestsHttpException('Rate limit exceeded')
throw new ServiceUnavailableHttpException('Service temporarily unavailable')
```

### Domain Exceptions

```typescript
// app/Exceptions/Domain/InsufficientCreditsException.ts
export class InsufficientCreditsException extends Exception {
  statusCode = 402
  code = 'INSUFFICIENT_CREDITS'

  constructor(
    public required: number,
    public available: number,
  ) {
    super(`Insufficient credits: need ${required}, have ${available}`)
  }

  render() {
    return response({
      message: this.message,
      code: this.code,
      required: this.required,
      available: this.available,
    }, 402)
  }
}

// Usage
if (user.credits < cost) {
  throw new InsufficientCreditsException(cost, user.credits)
}
```

## Error Pages

### Custom Error Views

```stx
<!-- resources/views/errors/404.stx -->
<x-error-layout>
  <div class="error-page">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you're looking for doesn't exist or has been moved.</p>

    <div class="actions">
      <x-button href="/">Go Home</x-button>
      <x-button variant="outline" onclick="history.back()">Go Back</x-button>
    </div>
  </div>
</x-error-layout>
```

```stx
<!-- resources/views/errors/500.stx -->
<x-error-layout>
  <div class="error-page">
    <h1>500</h1>
    <h2>Server Error</h2>
    <p>Something went wrong on our end. We've been notified and are working on it.</p>

    @if(config('error-handling.debug'))
      <div class="error-details">
        <h3>{{ error.name }}</h3>
        <p>{{ error.message }}</p>
        <pre>{{ error.stack }}</pre>
      </div>
    @endif

    <div class="actions">
      <x-button href="/">Go Home</x-button>
      <x-button variant="outline" onclick="location.reload()">Try Again</x-button>
    </div>
  </div>
</x-error-layout>
```

```stx
<!-- resources/views/errors/maintenance.stx -->
<x-error-layout>
  <div class="maintenance-page">
    <x-icon name="wrench" size="xl" />
    <h1>We'll be back soon!</h1>
    <p>We're performing scheduled maintenance. Please check back shortly.</p>

    @if($retryAfter)
      <p>Estimated time: {{ retryAfter }} minutes</p>
    @endif
  </div>
</x-error-layout>
```

### Error Layout

```stx
<!-- resources/views/layouts/error.stx -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ status ?? 'Error' }} - {{ config('app.name') }}</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f5f5f5;
    }
    .error-page {
      text-align: center;
      padding: 2rem;
    }
    .error-page h1 {
      font-size: 6rem;
      margin: 0;
      color: #333;
    }
    .error-page h2 {
      margin: 0 0 1rem;
      color: #666;
    }
    .actions {
      margin-top: 2rem;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
  </style>
</head>
<body>
  <x-slot name="content" />
</body>
</html>
```

## Try-Catch Patterns

### Basic Error Handling

```typescript
// Controller level
export default class PaymentController extends Controller {
  async charge(request: Request) {
    try {
      const payment = await PaymentGateway.charge(
        request.input('amount'),
        request.input('token'),
      )

      return response({ payment })
    } catch (error) {
      if (error instanceof CardDeclinedException) {
        return response({
          message: 'Your card was declined',
          code: 'CARD_DECLINED',
        }, 402)
      }

      if (error instanceof InsufficientFundsException) {
        return response({
          message: 'Insufficient funds',
          code: 'INSUFFICIENT_FUNDS',
        }, 402)
      }

      // Re-throw unexpected errors
      throw error
    }
  }
}
```

### Result Pattern

```typescript
// app/Support/Result.ts
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

// Usage in services
class PaymentService {
  async charge(amount: number, token: string): Promise<Result<Payment, PaymentError>> {
    try {
      const payment = await gateway.charge(amount, token)
      return { success: true, data: payment }
    } catch (error) {
      return {
        success: false,
        error: new PaymentError(error.message, error.code),
      }
    }
  }
}

// Controller
async charge(request: Request) {
  const result = await paymentService.charge(
    request.input('amount'),
    request.input('token'),
  )

  if (!result.success) {
    return response({
      message: result.error.message,
      code: result.error.code,
    }, 402)
  }

  return response({ payment: result.data })
}
```

### Rescue Pattern

```typescript
import { rescue, retry } from '@stacksjs/error-handling'

// Rescue with default value
const config = await rescue(
  () => loadExternalConfig(),
  defaultConfig,
)

// Rescue with callback
const user = await rescue(
  () => User.findOrFail(id),
  (error) => {
    Log.warning('User not found', { id, error })
    return null
  },
)

// Retry with backoff
const result = await retry(
  () => externalApi.fetch(),
  {
    times: 3,
    sleep: 1000,
    when: (error) => error.isRetryable,
  },
)
```

## Logging Errors

### Error Logging

```typescript
import { Log } from '@stacksjs/logging'

try {
  await riskyOperation()
} catch (error) {
  // Log with context
  Log.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    userId: user.id,
    operation: 'riskyOperation',
  })

  // Log and re-throw
  throw error
}
```

### Error Context

```typescript
// Add global context to all errors
Log.withContext({
  requestId: request.id,
  userId: auth().id,
  url: request.url,
})

// Context is automatically included
Log.error('Something went wrong')
// Output includes requestId, userId, url
```

## Sentry Integration

### Setup Sentry

```bash
bun add @sentry/node
```

```typescript
// app/Providers/ErrorServiceProvider.ts
import * as Sentry from '@sentry/node'

export default class ErrorServiceProvider extends ServiceProvider {
  boot() {
    if (config('error-handling.reporting.sentry.enabled')) {
      Sentry.init({
        dsn: config('error-handling.reporting.sentry.dsn'),
        environment: config('app.env'),
        tracesSampleRate: config('error-handling.reporting.sentry.tracesSampleRate'),

        beforeSend(event, hint) {
          // Filter or modify events
          if (hint.originalException instanceof IgnoredException) {
            return null
          }
          return event
        },
      })
    }
  }
}
```

### Capture Errors with Context

```typescript
import * as Sentry from '@sentry/node'

// Capture with additional context
Sentry.withScope((scope) => {
  scope.setUser({ id: user.id, email: user.email })
  scope.setTag('feature', 'payments')
  scope.setExtra('order', order)

  Sentry.captureException(error)
})

// Add breadcrumbs
Sentry.addBreadcrumb({
  category: 'payment',
  message: 'Payment attempt started',
  level: 'info',
  data: { amount, orderId },
})
```

## Error Monitoring

### Health Checks

```typescript
// config/health.ts
export default {
  checks: [
    {
      name: 'error-rate',
      check: async () => {
        const errors = await ErrorLog
          .where('created_at', '>=', dayjs().subtract(5, 'minutes'))
          .count()

        return {
          healthy: errors < 100,
          errorCount: errors,
          message: errors >= 100 ? 'High error rate detected' : 'OK',
        }
      },
    },
  ],
}
```

### Error Dashboard

```typescript
// Dashboard widget for error monitoring
// Access at /dashboard/errors

import { ErrorMonitor } from '@stacksjs/error-handling'

// Get error stats
const stats = await ErrorMonitor.stats({
  period: '24h',
})
// {
//   total: 150,
//   byType: { ValidationException: 100, ServerError: 50 },
//   byEndpoint: { '/api/users': 80, '/api/orders': 70 },
//   trend: 'decreasing',
// }

// Get recent errors
const recent = await ErrorMonitor.recent(20)
```

## Testing Error Handling

```typescript
import { expectException } from '@stacksjs/testing'

describe('Error Handling', () => {
  it('throws validation exception', async () => {
    await expectException(
      () => User.create({ email: 'invalid' }),
      ValidationException,
    )
  })

  it('returns 404 for missing resource', async () => {
    const response = await request.get('/api/users/99999')

    expect(response.status).toBe(404)
    expect(response.body.message).toBe('User not found')
  })

  it('returns validation errors', async () => {
    const response = await request.post('/api/users', {
      email: 'invalid',
    })

    expect(response.status).toBe(422)
    expect(response.body.errors.email).toBeDefined()
  })

  it('handles unexpected errors gracefully', async () => {
    // Force an error
    jest.spyOn(UserService, 'create').mockRejectedValue(new Error('DB error'))

    const response = await request.post('/api/users', validData)

    expect(response.status).toBe(500)
    expect(response.body.message).toBe('Internal server error')
    // Stack trace should not be exposed
    expect(response.body.stack).toBeUndefined()
  })
})
```

## Best Practices

### Error Types

```typescript
// Use specific exception types
throw new PaymentFailedException(reason) // Good
throw new Error('Payment failed') // Bad - too generic

// Include context
throw new InsufficientCreditsException(required, available) // Good
throw new Error('Not enough credits') // Bad - no context
```

### Fail Fast

```typescript
// Validate early, fail early
async createOrder(data: OrderData) {
  // Validate first
  if (!data.items.length) {
    throw new EmptyCartException()
  }

  if (await this.isDuplicateOrder(data)) {
    throw new DuplicateOrderException(data.idempotencyKey)
  }

  // Then proceed with business logic
  return Order.create(data)
}
```

### Graceful Degradation

```typescript
// Handle partial failures gracefully
async fetchDashboard() {
  const [users, orders, stats] = await Promise.allSettled([
    User.count(),
    Order.recent(10),
    Analytics.summary(),
  ])

  return {
    users: users.status === 'fulfilled' ? users.value : null,
    orders: orders.status === 'fulfilled' ? orders.value : [],
    stats: stats.status === 'fulfilled' ? stats.value : {},
    warnings: [users, orders, stats]
      .filter(r => r.status === 'rejected')
      .map(r => r.reason.message),
  }
}
```
