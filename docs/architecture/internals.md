---
title: Framework Internals
description: Deep dive into Stacks.js middleware, events, service providers, and dependency injection
---

# Framework Internals

This section covers the internal architecture patterns that power Stacks.js applications.

## Middleware System

Middleware provides a mechanism for filtering and modifying HTTP requests and responses as they flow through your application.

### Defining Middleware

```typescript
// app/Middleware/AuthMiddleware.ts
import { Middleware, Request, Response, Next } from '@stacksjs/types'

export default class AuthMiddleware implements Middleware {
  /**
   * Handle the incoming request.
   */
  async handle(request: Request, next: Next): Promise<Response> {
    // Before: Check authentication
    if (!request.user) {
      return Response.redirect('/login')
    }

    // Call next middleware in the stack
    const response = await next(request)

    // After: Modify response if needed
    response.headers.set('X-Authenticated', 'true')

    return response
  }
}
```

### Middleware Types

```typescript
// Terminating middleware (doesn't call next)
export class MaintenanceMiddleware implements Middleware {
  async handle(request: Request, next: Next): Promise<Response> {
    if (config.app.maintenance) {
      return Response.view('maintenance', {}, 503)
    }
    return next(request)
  }
}

// Transforming middleware (modifies request/response)
export class JsonMiddleware implements Middleware {
  async handle(request: Request, next: Next): Promise<Response> {
    // Transform request
    if (request.is('application/json')) {
      request.parsedBody = await request.json()
    }

    const response = await next(request)

    // Transform response
    if (response.data && !response.headers.has('Content-Type')) {
      return Response.json(response.data)
    }

    return response
  }
}

// Measuring middleware (observes without modifying)
export class TimingMiddleware implements Middleware {
  async handle(request: Request, next: Next): Promise<Response> {
    const start = performance.now()

    const response = await next(request)

    const duration = performance.now() - start
    response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`)

    return response
  }
}
```

### Registering Middleware

```typescript
// config/middleware.ts
export default {
  // Global middleware (runs on every request)
  global: [
    'TimingMiddleware',
    'CorsMiddleware',
    'JsonMiddleware',
  ],

  // Route middleware (applied via groups or routes)
  route: {
    auth: 'AuthMiddleware',
    guest: 'GuestMiddleware',
    admin: 'AdminMiddleware',
    verified: 'VerifiedEmailMiddleware',
    throttle: 'ThrottleMiddleware',
    signed: 'SignedUrlMiddleware',
  },

  // Middleware groups
  groups: {
    web: [
      'SessionMiddleware',
      'CsrfMiddleware',
      'ShareErrorsFromSession',
    ],
    api: [
      'ThrottleMiddleware:60,1',
      'JsonMiddleware',
    ],
  },

  // Middleware priority (execution order)
  priority: [
    'MaintenanceMiddleware',
    'TimingMiddleware',
    'CorsMiddleware',
    'SessionMiddleware',
    'AuthMiddleware',
  ],
}
```

### Applying Middleware to Routes

```typescript
// routes/web.ts
import { Router } from '@stacksjs/router'

// Single middleware
Router.get('/dashboard', 'DashboardController@index')
  .middleware('auth')

// Multiple middleware
Router.get('/admin', 'AdminController@index')
  .middleware(['auth', 'admin', 'verified'])

// Middleware with parameters
Router.post('/api/upload', 'UploadController@store')
  .middleware('throttle:10,1') // 10 requests per minute

// Middleware groups
Router.group({ middleware: 'web' }, () => {
  Router.get('/', 'HomeController@index')
  Router.get('/about', 'PageController@about')
})

// Excluding middleware
Router.get('/health', 'HealthController@check')
  .withoutMiddleware('auth')
```

### Middleware Parameters

```typescript
// app/Middleware/RoleMiddleware.ts
export default class RoleMiddleware implements Middleware {
  async handle(request: Request, next: Next, ...roles: string[]): Promise<Response> {
    const user = request.user

    if (!user || !roles.some(role => user.hasRole(role))) {
      return Response.json({ error: 'Unauthorized' }, 403)
    }

    return next(request)
  }
}

// Usage in routes
Router.get('/admin', 'AdminController@index')
  .middleware('role:admin,super-admin')
```

## Event System

Stacks implements an observer pattern for decoupled event-driven architecture.

### Defining Events

```typescript
// app/Events/UserRegistered.ts
import { Event } from '@stacksjs/events'

export default class UserRegistered extends Event {
  constructor(public user: User) {
    super()
  }

  // Optional: broadcast to websocket channels
  broadcastOn(): string[] {
    return [
      'users',                      // Public channel
      `private-user.${this.user.id}`, // Private channel
    ]
  }

  // Optional: custom event name (defaults to class name)
  broadcastAs(): string {
    return 'user.registered'
  }

  // Optional: custom broadcast data (defaults to public properties)
  broadcastWith(): object {
    return {
      id: this.user.id,
      name: this.user.name,
      email: this.user.email,
    }
  }

  // Optional: condition for broadcasting
  broadcastWhen(): boolean {
    return this.user.isActive
  }
}
```

### Defining Listeners

```typescript
// app/Listeners/SendWelcomeEmail.ts
import { Listener } from '@stacksjs/events'
import { UserRegistered } from '@/Events/UserRegistered'

export default class SendWelcomeEmail extends Listener {
  /**
   * Handle the event.
   */
  async handle(event: UserRegistered): Promise<void> {
    await Mail.send({
      to: event.user.email,
      template: 'welcome',
      data: { name: event.user.name },
    })
  }

  /**
   * Handle a job failure.
   */
  async failed(event: UserRegistered, error: Error): Promise<void> {
    log.error('Failed to send welcome email', {
      userId: event.user.id,
      error: error.message,
    })
  }
}

// Queueable listener
export default class ProcessUserAvatar extends Listener {
  // Process in background queue
  queue = 'default'
  connection = 'redis'
  delay = 0
  tries = 3

  async handle(event: UserRegistered): Promise<void> {
    await ImageProcessor.generateAvatarVariants(event.user.avatarUrl)
  }
}
```

### Registering Events & Listeners

```typescript
// config/events.ts
export default {
  // Event to listener mapping
  listen: {
    UserRegistered: [
      'SendWelcomeEmail',
      'CreateDefaultSettings',
      'ProcessUserAvatar',
      'NotifyAdmins',
    ],

    OrderPlaced: [
      'SendOrderConfirmation',
      'UpdateInventory',
      'NotifyWarehouse',
    ],

    PaymentFailed: [
      'SendPaymentFailedNotification',
      'LogPaymentFailure',
    ],
  },

  // Event subscribers (classes that listen to multiple events)
  subscribe: [
    'UserEventSubscriber',
    'PaymentEventSubscriber',
  ],
}
```

### Event Subscribers

```typescript
// app/Subscribers/UserEventSubscriber.ts
import { Subscriber } from '@stacksjs/events'

export default class UserEventSubscriber extends Subscriber {
  /**
   * Register the listeners for the subscriber.
   */
  subscribe(events: EventDispatcher): void {
    events.listen(UserRegistered, this.onUserRegistered)
    events.listen(UserLoggedIn, this.onUserLoggedIn)
    events.listen(UserDeleted, this.onUserDeleted)
  }

  async onUserRegistered(event: UserRegistered): Promise<void> {
    await analytics.track('user_registered', event.user)
  }

  async onUserLoggedIn(event: UserLoggedIn): Promise<void> {
    await event.user.update({ lastLoginAt: new Date() })
  }

  async onUserDeleted(event: UserDeleted): Promise<void> {
    await cleanupUserData(event.userId)
  }
}
```

### Dispatching Events

```typescript
import { dispatch, event } from '@stacksjs/events'
import { UserRegistered } from '@/Events/UserRegistered'

// Dispatch an event
await dispatch(new UserRegistered(user))

// Dispatch multiple events
await dispatch([
  new UserRegistered(user),
  new WelcomeEmailQueued(user),
])

// Dispatch without waiting (fire and forget)
dispatch(new UserRegistered(user)).catch(log.error)

// Conditional dispatch
if (user.isNewCustomer) {
  await dispatch(new NewCustomerRegistered(user))
}

// Dispatch from model events
class User extends Model {
  protected dispatchesEvents = {
    created: UserRegistered,
    deleted: UserDeleted,
  }
}
```

### Model Events

```typescript
// Built-in model events
class Post extends Model {
  // Lifecycle hooks
  protected static booted(): void {
    // Before events (can prevent action by returning false)
    this.creating((post) => {
      post.slug = slugify(post.title)
    })

    this.updating((post) => {
      if (post.isDirty('title')) {
        post.slug = slugify(post.title)
      }
    })

    this.deleting((post) => {
      if (post.comments.count() > 0) {
        return false // Prevent deletion
      }
    })

    // After events
    this.created((post) => {
      cache.tags(['posts']).flush()
    })

    this.saved((post) => {
      SearchIndex.update(post)
    })
  }
}
```

## Service Providers

Service providers are the central place of application bootstrapping, registering services, bindings, and event listeners.

### Creating a Service Provider

```typescript
// app/Providers/AppServiceProvider.ts
import { ServiceProvider } from '@stacksjs/support'

export default class AppServiceProvider extends ServiceProvider {
  /**
   * Register any application services.
   */
  register(): void {
    // Bind interfaces to implementations
    this.app.bind('PaymentGateway', () => {
      return new StripeGateway(config.services.stripe)
    })

    // Singleton binding (same instance every time)
    this.app.singleton('Analytics', () => {
      return new AnalyticsService(config.services.analytics)
    })

    // Contextual binding
    this.app.when(PhotoController)
      .needs('Storage')
      .give(() => new S3Storage())

    this.app.when(VideoController)
      .needs('Storage')
      .give(() => new CloudflareStorage())
  }

  /**
   * Bootstrap any application services.
   */
  boot(): void {
    // Run after all providers are registered

    // Share data with all views
    View.share('appName', config.app.name)

    // Register custom validation rules
    Validator.extend('phone', (value) => {
      return /^\+?[\d\s-]+$/.test(value)
    })

    // Register macros
    Response.macro('success', function (data: any) {
      return Response.json({ success: true, data })
    })
  }
}
```

### Registering Providers

```typescript
// config/app.ts
export default {
  providers: [
    // Framework providers
    '@stacksjs/routing/RouteServiceProvider',
    '@stacksjs/database/DatabaseServiceProvider',
    '@stacksjs/cache/CacheServiceProvider',
    '@stacksjs/queue/QueueServiceProvider',

    // Application providers
    'AppServiceProvider',
    'AuthServiceProvider',
    'EventServiceProvider',
    'RouteServiceProvider',

    // Third-party providers
    'StripeServiceProvider',
    'AnalyticsServiceProvider',
  ],

  // Deferred providers (loaded only when needed)
  deferred: [
    'MailServiceProvider',
    'NotificationServiceProvider',
  ],
}
```

### Deferred Providers

```typescript
// app/Providers/ReportServiceProvider.ts
export default class ReportServiceProvider extends ServiceProvider {
  // Only load when these services are requested
  provides = ['ReportGenerator', 'PdfExporter', 'CsvExporter']

  // Indicates this provider is deferred
  deferred = true

  register(): void {
    this.app.singleton('ReportGenerator', () => {
      return new ReportGenerator()
    })

    this.app.bind('PdfExporter', PdfExporter)
    this.app.bind('CsvExporter', CsvExporter)
  }
}
```

## Dependency Injection

Stacks provides automatic dependency injection through constructor injection and method injection.

### Constructor Injection

```typescript
// app/Controllers/UserController.ts
import { UserService } from '@/Services/UserService'
import { Logger } from '@stacksjs/clarity'

export default class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {}

  async index(): Promise<Response> {
    const users = await this.userService.all()
    this.logger.info('Users retrieved', { count: users.length })
    return Response.json(users)
  }
}
```

### Method Injection

```typescript
export default class OrderController {
  async store(
    request: Request,
    orderService: OrderService, // Injected automatically
    paymentGateway: PaymentGateway, // Injected automatically
  ): Promise<Response> {
    const order = await orderService.create(request.validated())
    await paymentGateway.charge(order.total)
    return Response.json(order, 201)
  }
}
```

### Interface Binding

```typescript
// Define interface
interface PaymentGateway {
  charge(amount: number): Promise<PaymentResult>
  refund(transactionId: string): Promise<RefundResult>
}

// Implement interface
class StripeGateway implements PaymentGateway {
  async charge(amount: number): Promise<PaymentResult> {
    // Stripe implementation
  }

  async refund(transactionId: string): Promise<RefundResult> {
    // Stripe implementation
  }
}

// Bind in service provider
this.app.bind<PaymentGateway>('PaymentGateway', StripeGateway)

// Inject by interface
class CheckoutController {
  constructor(private payment: PaymentGateway) {}
}
```

### Container Resolution

```typescript
import { app, resolve } from '@stacksjs/support'

// Resolve from container
const service = app.make<UserService>('UserService')
const payment = resolve<PaymentGateway>('PaymentGateway')

// Check if bound
if (app.bound('CustomService')) {
  const custom = app.make('CustomService')
}

// Resolve with parameters
const report = app.make('ReportGenerator', {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
})
```

### Tagged Bindings

```typescript
// In service provider
this.app.bind('DiskStorage', S3Storage)
this.app.bind('CdnStorage', CloudflareStorage)
this.app.bind('BackupStorage', GlacierStorage)

// Tag related bindings
this.app.tag(['DiskStorage', 'CdnStorage', 'BackupStorage'], 'storages')

// Resolve all tagged bindings
const storages = this.app.tagged<Storage[]>('storages')
for (const storage of storages) {
  await storage.healthCheck()
}
```

### Extending Bindings

```typescript
// Extend existing binding
this.app.extend('Cache', (cache, app) => {
  return new MonitoredCache(cache, app.make('Monitor'))
})

// Decorating services
this.app.extend('Logger', (logger) => {
  return new LoggerWithContext(logger, {
    app: config.app.name,
    env: config.app.env,
  })
})
```
