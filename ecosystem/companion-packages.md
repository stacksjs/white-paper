---
title: Companion Packages
description: The ecosystem of packages that power Stacks.js
---

# Companion Packages

## bun-router

A high-performance, feature-rich HTTP router designed specifically for Bun with Laravel-inspired APIs:

```typescript
import { router } from 'bun-router'

// Basic routes
router.get('/', () => new Response('Hello World'))
router.get('/users/{id}', (req) => Response.json({ id: req.params.id }))

// Resource routes (RESTful)
router.resource('/posts', PostController)

// Route groups with middleware
router.group({ prefix: '/api', middleware: [auth(), cors()] }, () => {
  router.get('/dashboard', DashboardAction)
  router.apiResource('/articles', ArticleController)
})

// Named routes with URL generation
router.get('/users/{id}', ShowUserAction).name('users.show')
const url = router.route('users.show', { id: '123' })

// Model binding (Laravel-style)
router.get('/posts/{post}', (req) => Response.json(req.post))
  .model('post', PostModel)

// WebSocket support
router.websocket({
  open(ws) { ws.subscribe('chat') },
  message(ws, msg) { router.publish('chat', msg) },
})

await router.serve({ port: 3000 })
```

**25+ Built-in Middleware:**

| Category | Middleware |
|----------|------------|
| **Auth** | `auth()` (Bearer, Basic, JWT, OAuth2), `csrf()` |
| **Security** | `helmet()`, `cors()`, `ddosProtection()`, `requestSigning()` |
| **Performance** | `responseCache()`, `performanceMonitor()`, `requestTracer()` |
| **Data** | `jsonBody()`, `fileUpload()`, `inputValidation()`, `session()` |
| **Limiting** | `rateLimit()` (fixed-window, sliding-window, token-bucket) |

Features:

- **Trie-Based Matching**: O(log n) route matching with static route fast path
- **Parameter Constraints**: `whereNumber()`, `whereUuid()`, `whereSlug()`
- **Implicit Model Binding**: Automatically resolve route parameters to models
- **Response Streaming**: `router.stream()`, `router.eventStream()`, `router.streamJson()`
- **Performance Monitoring**: CPU, memory, response time tracking with alerts
- **Request Tracing**: Distributed tracing with correlation IDs

## bun-query-builder

A high-performance, type-safe SQL query builder built on Bun's native SQL support:

```typescript
import { DB } from 'bun-query-builder'

// Fluent query API with type inference
const users = await DB.selectFrom('users')
  .select('id', 'name', 'email')
  .where('active', true)
  .whereNotNull('email_verified_at')
  .orderBy('created_at', 'desc')
  .limit(10)
  .get()

// Dynamic where methods (auto-generated from columns)
const user = await DB.selectFrom('users')
  .whereEmail('john@example.com')  // Type-safe!
  .first()

// Comprehensive where clauses
const results = await DB.selectFrom('posts')
  .whereIn('status', ['published', 'featured'])
  .whereBetween('created_at', [startDate, endDate])
  .whereLike('title', '%TypeScript%')
  .whereJsonContains('tags', 'javascript')
  .get()

// Pagination with metadata
const page = await DB.selectFrom('articles')
  .where('published', true)
  .paginate(25, 1)
// { data: [...], meta: { total, perPage, currentPage, lastPage } }

// Relationships and eager loading
const posts = await DB.selectFrom('posts')
  .with('author', 'comments.user')
  .withCount('likes')
  .get()
```

**Performance (vs Prisma):**

| Operation | bun-query-builder | Advantage |
|-----------|-------------------|-----------|
| DELETE | 29.29x faster | Native SQL |
| SELECT + LIMIT | 16.45x faster | No ORM overhead |
| COUNT | 12.65x faster | Direct aggregation |
| SELECT by ID | 13.8x faster | Statement caching |

**Supported Databases:**
- PostgreSQL (with JSONB, ILIKE, FOR SHARE)
- MySQL (with JSON, RAND())
- SQLite (lightweight, text-based complex types)

Features:

- **ORM Capabilities**: Model definitions, relationships, hooks, scopes, soft deletes
- **Type Inference**: Auto-generated types from model definitions
- **Cursor Pagination**: Efficient large dataset handling
- **Transaction Support**: Retries, savepoints, isolation levels
- **CLI Tools**: 30+ commands for migrations, seeding, introspection

## bun-queue

Redis-backed job queue:

```typescript
import { Queue, Worker } from 'bun-queue'

// Producer
const queue = new Queue('emails')
await queue.add('send-welcome', { userId: 123 })

// Consumer
const worker = new Worker('emails', async (job) => {
  if (job.name === 'send-welcome') {
    await sendWelcomeEmail(job.data.userId)
  }
})

// Scheduling
await queue.add('daily-report', {}, {
  repeat: { cron: '0 9 * * *' }
})
```

## Clarity (Logging)

Modern logging for browser and server:

```typescript
import { log, debug, info, warn, error } from '@stacksjs/clarity'

// Structured logging
log.info('User logged in', { userId: 123, ip: '192.168.1.1' })

// Log levels
debug('Detailed information for debugging')
info('General information')
warn('Warning messages')
error('Error messages', { error: err })

// Pretty console output in development
// JSON output in production
```

## STX & Headwind

### STX - Blade-inspired templating

```html
<x-layout>
  @foreach(items as item)
    <x-card :title="item.name">
      {{ item.description }}
    </x-card>
  @endforeach
</x-layout>
```

### Headwind - Utility CSS framework

```html
<div class="flex items-center gap-4 p-6 bg-white rounded-xl shadow-lg">
  <img class="w-16 h-16 rounded-full" src="..." />
  <div class="flex-1">
    <h2 class="text-xl font-bold text-gray-900">Title</h2>
    <p class="text-gray-600">Description text</p>
  </div>
</div>
```

## rpx (Reverse Proxy)

Modern reverse proxy server for local development and production:

```typescript
import { startProxy, createConfig } from 'rpx'

// Simple HTTPS reverse proxy
await startProxy({
  from: 'localhost:3000',
  to: 'my-app.localhost',
  https: true,
  cleanup: true,
})

// Multi-domain configuration
const config = createConfig({
  domains: [
    { from: 'localhost:3000', to: 'app.localhost' },
    { from: 'localhost:3001', to: 'api.localhost' },
    { from: 'localhost:5173', to: 'admin.localhost' },
  ],
  https: {
    altNameIPs: ['127.0.0.1'],
    altNameURIs: ['localhost'],
    validity: 365,
  },
})
```

Features:

- **Local HTTPS**: Auto-generated trusted certificates
- **Multi-Domain**: Multiple local domains simultaneously
- **Zero Config**: Works out of the box
- **Hot Reload**: Detects port changes automatically

## tlsx (TLS & Certificates)

Zero-dependency TLS certificate management:

```typescript
import { generateCertificate, addCertToSystemTrust } from 'tlsx'

// Generate self-signed certificate
const cert = await generateCertificate({
  domain: 'localhost',
  altNames: ['*.localhost', '127.0.0.1'],
  validityDays: 365,
  organization: 'My Company',
})

// Add to system trust store
await addCertToSystemTrust(cert)

// Use with Bun server
Bun.serve({
  port: 443,
  tls: {
    cert: cert.certificate,
    key: cert.privateKey,
  },
  fetch(req) {
    return new Response('Secure!')
  },
})
```

Features:

- **Zero Dependencies**: Pure TypeScript implementation
- **Cross-Platform**: macOS, Linux, Windows support
- **System Trust**: Automatic trust store integration
- **Multiple Formats**: PEM, DER, PKCS#12 support

## httx (HTTP Client)

Modern, type-safe HTTP client for Bun:

```typescript
import { httx, createClient } from 'httx'

// Simple requests
const response = await httx.get('https://api.example.com/users')
const data = await response.json()

// Type-safe client
interface User {
  id: number
  name: string
}

const api = createClient<{
  '/users': { GET: User[] }
  '/users/:id': { GET: User; PUT: User }
}>('https://api.example.com')

const users = await api.get('/users') // Type: User[]
const user = await api.get('/users/:id', { params: { id: '1' } }) // Type: User

// Request interceptors
api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${getToken()}`
  return config
})
```

Features:

- **Type Inference**: Full TypeScript support with route types
- **Interceptors**: Request/response middleware
- **Retry Logic**: Configurable retry strategies
- **Timeout Handling**: Per-request and global timeouts

## dtsx (DTS Generation)

TypeScript declaration file generator:

```typescript
import { generate, extractTypes } from 'dtsx'

// Generate .d.ts from TypeScript source
await generate({
  input: './src',
  output: './dist',
  clean: true,
})

// Extract types from JavaScript with JSDoc
const types = await extractTypes({
  source: './legacy.js',
  inferTypes: true,
})

// Bundle declarations
await generate({
  input: './src/index.ts',
  output: './dist/index.d.ts',
  bundle: true,
  externals: ['bun'],
})
```

Features:

- **Fast Generation**: Bun-native performance
- **Bundle Mode**: Single-file declaration output
- **JSDoc Support**: Infer types from comments
- **External Handling**: Proper external type resolution

## ts-auth

Comprehensive authentication library:

```typescript
import { Auth, createAuthConfig } from 'ts-auth'

// Configure authentication
const auth = new Auth({
  driver: 'session', // or 'jwt', 'passport'
  session: {
    driver: 'redis',
    lifetime: 86400,
  },
  providers: {
    users: {
      model: User,
      table: 'users',
    },
  },
  guards: {
    web: { driver: 'session', provider: 'users' },
    api: { driver: 'jwt', provider: 'users' },
  },
})

// Authentication methods
await auth.attempt({ email, password })
await auth.login(user)
await auth.logout()
const user = auth.user()

// Multi-guard support
const apiUser = auth.guard('api').user()
```

Features:

- **Multiple Guards**: Session, JWT, API tokens
- **OAuth Support**: GitHub, Google, Twitter, Discord
- **MFA/2FA**: TOTP, SMS, email verification
- **Passwordless**: Magic links, WebAuthn support

## ts-broadcasting

Real-time event broadcasting library that powers Stacks.js real-time features. Similar to Laravel's broadcasting with Reverb, but built for Bun and TypeScript.

### Server-Side Broadcasting

```typescript
import { Broadcast, createBroadcaster } from 'ts-broadcasting'

// Configure broadcaster with native WebSocket server
const broadcast = createBroadcaster({
  driver: 'websocket', // Native WebSocket (recommended for Stacks)
  server: {
    host: 'localhost',
    port: 6001,
  },
})

// Or use Pusher-compatible service
const broadcast = createBroadcaster({
  driver: 'pusher',
  pusher: {
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: 'us2',
  },
})

// Or use Redis pub/sub
const broadcast = createBroadcaster({
  driver: 'redis',
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379,
  },
})
```

### Broadcasting to Channels

```typescript
// Public channel - anyone can subscribe
await broadcast.channel('news')
  .event('ArticlePublished', {
    id: article.id,
    title: article.title,
  })

// Private channel - requires authorization
await broadcast.private(`user.${userId}`)
  .event('NotificationReceived', notification)

// Presence channel - tracks who's online
await broadcast.presence(`chat.${roomId}`)
  .event('MessageSent', message)

// Broadcast to multiple channels
await broadcast.channels(['news', 'updates'])
  .event('Announcement', data)

// Exclude sender from receiving broadcast
await broadcast.channel('chat')
  .except(socketId)
  .event('NewMessage', message)
```

### Channel Authorization

```typescript
import { defineChannels } from 'ts-broadcasting'

defineChannels({
  // Private channel - user must own the resource
  'private-user.{userId}': (user, userId) => {
    return user.id === parseInt(userId)
  },

  // Private channel with async authorization
  'private-order.{orderId}': async (user, orderId) => {
    const order = await Order.find(orderId)
    return order?.userId === user.id
  },

  // Presence channel with member info
  'presence-chat.{roomId}': {
    authorize: async (user, roomId) => {
      return await ChatRoom.isMember(roomId, user.id)
    },
    join: (user) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    }),
  },
})
```

### WebSocket Server (Stacks Reverb Equivalent)

```typescript
import { WebSocketServer } from 'ts-broadcasting/server'

// Start a standalone WebSocket server
const server = new WebSocketServer({
  host: '0.0.0.0',
  port: 6001,

  // App credentials
  app: {
    id: 'my-app',
    key: 'my-key',
    secret: 'my-secret',
  },

  // TLS (optional)
  tls: {
    cert: './certs/server.crt',
    key: './certs/server.key',
  },

  // Redis for horizontal scaling
  redis: {
    host: 'localhost',
    port: 6379,
  },
})

await server.start()

// Server events
server.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
})

server.on('subscription', (socket, channel) => {
  console.log(`${socket.id} subscribed to ${channel}`)
})
```

### Client Library

```typescript
import { createClient } from 'ts-broadcasting/client'

const realtime = createClient({
  host: 'localhost',
  port: 6001,
  key: 'my-key',
  auth: {
    endpoint: '/broadcasting/auth',
  },
})

// Public channel
realtime.channel('news').on('ArticlePublished', (data) => {
  console.log('New article:', data.title)
})

// Private channel
realtime.private(`user.${userId}`).on('Notification', (data) => {
  showNotification(data)
})

// Presence channel
const chat = realtime.join(`chat.${roomId}`)
chat.here((members) => console.log('Members:', members))
chat.joining((member) => console.log(`${member.name} joined`))
chat.leaving((member) => console.log(`${member.name} left`))
chat.on('Message', (msg) => addMessage(msg))

// Client-to-client events (whisper)
chat.whisper('typing', { isTyping: true })
chat.listenForWhisper('typing', (data) => updateTyping(data))
```

Features:

- **Native WebSocket Server**: High-performance Bun-native server (like Laravel Reverb)
- **Multiple Drivers**: Native WebSocket, Pusher-compatible, Redis pub/sub
- **Channel Types**: Public, private, and presence channels
- **Authorization**: Built-in channel authorization with async support
- **Horizontal Scaling**: Redis pub/sub for multi-server deployments
- **Type-Safe**: Full TypeScript support with inferred types
- **Client Library**: Included client for browser and Node.js

## ts-rate-limiter

Flexible rate limiting:

```typescript
import { RateLimiter, createLimiter } from 'ts-rate-limiter'

// Simple rate limiter
const limiter = new RateLimiter({
  driver: 'redis',
  max: 100,
  window: 60, // 100 requests per minute
})

// Check and consume
const result = await limiter.attempt('user:123')
if (result.limited) {
  console.log(`Rate limited. Retry after ${result.retryAfter}s`)
}

// Multiple tiers
const apiLimiter = createLimiter({
  tiers: {
    free: { max: 100, window: 3600 },
    pro: { max: 1000, window: 3600 },
    enterprise: { max: 10000, window: 3600 },
  },
})

await apiLimiter.check('user:123', 'pro')

// Sliding window algorithm
const slidingLimiter = new RateLimiter({
  algorithm: 'sliding-window',
  max: 1000,
  window: 60,
})
```

Features:

- **Multiple Algorithms**: Fixed window, sliding window, token bucket
- **Redis Backend**: Distributed rate limiting
- **Tier Support**: Different limits per user tier
- **Response Headers**: X-RateLimit-* headers included

## Media Processing

### imgx (Image Processing)

```typescript
import { imgx, optimize, transform } from 'imgx'

// Optimize image
const optimized = await optimize('./photo.jpg', {
  quality: 80,
  format: 'webp',
  width: 1200,
})

// Transform pipeline
const result = await imgx('./input.png')
  .resize(800, 600)
  .crop('center')
  .grayscale()
  .sharpen()
  .toFormat('avif', { quality: 75 })
  .toBuffer()

// Batch processing
await imgx.batch('./images/*.jpg', {
  output: './optimized',
  transforms: [
    { resize: { width: 1920 }, suffix: '-large' },
    { resize: { width: 800 }, suffix: '-medium' },
    { resize: { width: 400 }, suffix: '-thumb' },
  ],
})
```

### vidx (Video Processing)

```typescript
import { vidx, transcode, extractFrame } from 'vidx'

// Transcode video
await transcode('./video.mp4', './output.webm', {
  codec: 'vp9',
  bitrate: '2M',
  resolution: '1080p',
})

// Extract frames
await extractFrame('./video.mp4', './thumbnail.jpg', {
  time: '00:00:05',
})

// Generate HLS stream
await vidx('./video.mp4').toHLS('./stream', {
  segments: 10,
  qualities: ['1080p', '720p', '480p'],
})
```

### qrx (QR Code Generation)

```typescript
import { qrx, generate, createSVG } from 'qrx'

// Generate QR code
const qr = await generate('https://stacksjs.org', {
  errorCorrection: 'H',
  margin: 2,
})

// SVG output
const svg = await createSVG('https://stacksjs.org', {
  width: 256,
  color: '#000000',
  background: '#ffffff',
})

// PNG with logo overlay
const png = await qrx('https://stacksjs.org')
  .logo('./logo.png', { size: 0.2 })
  .toPNG({ width: 512 })
```

## Utility Libraries

### ts-cache

Fast, type-safe caching with multiple drivers:

```typescript
import { Cache, cache } from 'ts-cache'

// Simple caching
const users = await cache.remember('users:all', 3600, async () => {
  return await User.all()
})

// Cache instance with driver
const redisCache = new Cache({
  driver: 'redis',
  prefix: 'myapp:',
  ttl: 3600,
})

await redisCache.put('user:123', user)
const cached = await redisCache.get('user:123')
await redisCache.forget('user:123')

// Tags for grouped invalidation
await cache.tags(['users', 'admin']).put('admin:list', admins)
await cache.tags(['users']).flush() // Clears all user-tagged cache

// Atomic operations
await cache.increment('visits')
await cache.decrement('stock:item-123')

// Cache locks for distributed systems
await cache.lock('process:report').get(async () => {
  await generateExpensiveReport()
})
```

### ts-collect

Laravel-inspired Collections for TypeScript:

```typescript
import { collect } from 'ts-collect'

const users = collect([
  { id: 1, name: 'John', role: 'admin', salary: 5000 },
  { id: 2, name: 'Jane', role: 'user', salary: 3000 },
  { id: 3, name: 'Bob', role: 'admin', salary: 4500 },
])

// Filtering and mapping
const adminNames = users
  .where('role', 'admin')
  .pluck('name')
  .toArray()
// ['John', 'Bob']

// Aggregations
const totalSalary = users.sum('salary') // 12500
const avgSalary = users.avg('salary')   // 4166.67
const maxSalary = users.max('salary')   // 5000

// Grouping
const byRole = users.groupBy('role')
// { admin: [...], user: [...] }

// Chaining
const result = users
  .filter(u => u.salary > 3000)
  .sortByDesc('salary')
  .map(u => ({ ...u, bonus: u.salary * 0.1 }))
  .keyBy('id')
  .toArray()

// Unique, chunk, partition
const unique = collect([1, 2, 2, 3]).unique() // [1, 2, 3]
const chunks = collect([1, 2, 3, 4, 5]).chunk(2) // [[1,2], [3,4], [5]]
const [pass, fail] = users.partition(u => u.salary > 4000)
```

### ts-datetime

Carbon-inspired datetime library:

```typescript
import { DateTime, now, parse } from 'ts-datetime'

// Creation
const dt = now()
const specific = DateTime.create(2024, 12, 25, 10, 30)
const parsed = parse('2024-12-25T10:30:00Z')
const fromFormat = DateTime.createFromFormat('d/m/Y', '25/12/2024')

// Manipulation
const tomorrow = now().addDays(1)
const nextWeek = now().addWeeks(1)
const lastMonth = now().subMonths(1)
const startOfDay = now().startOfDay()
const endOfMonth = now().endOfMonth()

// Comparison
if (dt.isPast()) { /* ... */ }
if (dt.isFuture()) { /* ... */ }
if (dt.isToday()) { /* ... */ }
if (dt.isBetween(start, end)) { /* ... */ }

// Formatting
dt.format('YYYY-MM-DD')           // 2024-12-25
dt.format('dddd, MMMM D, YYYY')   // Wednesday, December 25, 2024
dt.toISO()                         // 2024-12-25T10:30:00.000Z
dt.toRelative()                    // "in 2 hours" or "3 days ago"

// Differences
const diff = dt.diff(other)
diff.inDays()    // 5
diff.inHours()   // 120
diff.forHumans() // "5 days"

// Timezone handling
dt.setTimezone('America/New_York')
dt.utc()
```

### ts-i18n

Type-safe internationalization:

```typescript
import { i18n, t, setLocale } from 'ts-i18n'

// Setup
const translations = {
  en: {
    greeting: 'Hello, {name}!',
    items: '{count} item | {count} items',
    nested: {
      welcome: 'Welcome back',
    },
  },
  es: {
    greeting: '¡Hola, {name}!',
    items: '{count} artículo | {count} artículos',
    nested: {
      welcome: 'Bienvenido de nuevo',
    },
  },
}

i18n.init({ translations, locale: 'en', fallback: 'en' })

// Usage
t('greeting', { name: 'John' })  // "Hello, John!"
t('nested.welcome')              // "Welcome back"

// Pluralization
t('items', { count: 1 })  // "1 item"
t('items', { count: 5 })  // "5 items"

// Switch locale
setLocale('es')
t('greeting', { name: 'John' })  // "¡Hola, John!"

// Number and date formatting
i18n.formatNumber(1234567.89)     // "1,234,567.89" (en) / "1.234.567,89" (es)
i18n.formatCurrency(99.99, 'USD') // "$99.99" (en) / "99,99 US$" (es)
i18n.formatDate(new Date())       // "12/25/2024" (en) / "25/12/2024" (es)
```

### ts-mocker

Performance-focused faker library:

```typescript
import { fake, seed } from 'ts-mocker'

// Seed for reproducible data
seed(12345)

// Person data
fake.person.firstName()      // "John"
fake.person.lastName()       // "Smith"
fake.person.fullName()       // "John Smith"
fake.person.email()          // "john.smith@example.com"

// Internet
fake.internet.email()        // "random@email.com"
fake.internet.username()     // "cool_user_123"
fake.internet.password()     // "xK9#mP2$vL"
fake.internet.url()          // "https://example.com/page"
fake.internet.ip()           // "192.168.1.1"

// Commerce
fake.commerce.productName()  // "Ergonomic Steel Chair"
fake.commerce.price()        // "29.99"
fake.commerce.department()   // "Electronics"

// Location
fake.location.address()      // "123 Main St"
fake.location.city()         // "New York"
fake.location.country()      // "United States"
fake.location.zipCode()      // "10001"

// Lorem
fake.lorem.sentence()        // "Lorem ipsum dolor sit amet."
fake.lorem.paragraph()       // Full paragraph
fake.lorem.words(5)          // "lorem ipsum dolor sit amet"

// Locale support
fake.setLocale('de')
fake.person.firstName()      // "Hans"
```

### ts-spreadsheets

Generate CSV and Excel files:

```typescript
import { Spreadsheet, csv, excel } from 'ts-spreadsheets'

// Simple CSV
const csvData = csv([
  ['Name', 'Email', 'Role'],
  ['John', 'john@example.com', 'Admin'],
  ['Jane', 'jane@example.com', 'User'],
])
await csvData.save('users.csv')

// Excel with styling
const workbook = new Spreadsheet()
const sheet = workbook.addSheet('Users')

// Headers with styling
sheet.row(1).style({ bold: true, background: '#4A90D9', color: '#FFFFFF' })
sheet.cell('A1').value('Name')
sheet.cell('B1').value('Email')
sheet.cell('C1').value('Salary')

// Data rows
const users = [
  { name: 'John', email: 'john@example.com', salary: 5000 },
  { name: 'Jane', email: 'jane@example.com', salary: 6000 },
]

users.forEach((user, i) => {
  const row = i + 2
  sheet.cell(`A${row}`).value(user.name)
  sheet.cell(`B${row}`).value(user.email)
  sheet.cell(`C${row}`).value(user.salary).format('$#,##0')
})

// Column widths
sheet.column('A').width(20)
sheet.column('B').width(30)
sheet.column('C').width(15)

await workbook.save('users.xlsx')

// Stream for large files
const stream = workbook.stream()
```

### ts-markdown

Performant markdown parser:

```typescript
import { parse, render, Markdown } from 'ts-markdown'

// Simple parsing
const html = parse('# Hello **World**')
// <h1>Hello <strong>World</strong></h1>

// With options
const result = render(markdownContent, {
  gfm: true,           // GitHub Flavored Markdown
  tables: true,        // Table support
  taskLists: true,     // - [x] checkboxes
  footnotes: true,     // Footnote support
  highlight: true,     // Syntax highlighting
  sanitize: true,      // XSS protection
})

// Custom renderer
const md = new Markdown({
  renderers: {
    heading: (text, level) => `<h${level} class="heading-${level}">${text}</h${level}>`,
    link: (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`,
    code: (code, lang) => highlightCode(code, lang),
  },
})

const html = md.render(content)

// Extract metadata (frontmatter)
const { meta, content } = parse(`---
title: My Post
date: 2024-12-25
---
# Content here
`)
// meta = { title: 'My Post', date: '2024-12-25' }
```

### clapp

Modern CLI application framework:

```typescript
import { CLI, command, option, argument } from 'clapp'

const cli = new CLI({
  name: 'myapp',
  version: '1.0.0',
  description: 'My awesome CLI tool',
})

// Define commands
cli.command('greet')
  .description('Greet a user')
  .argument('<name>', 'Name to greet')
  .option('-l, --loud', 'Shout the greeting')
  .action((name, options) => {
    const greeting = `Hello, ${name}!`
    console.log(options.loud ? greeting.toUpperCase() : greeting)
  })

cli.command('init')
  .description('Initialize a new project')
  .option('-t, --template <name>', 'Template to use', 'default')
  .action(async (options) => {
    await initializeProject(options.template)
  })

// Interactive prompts
cli.command('setup')
  .action(async () => {
    const answers = await cli.prompt([
      { type: 'input', name: 'name', message: 'Project name?' },
      { type: 'select', name: 'type', message: 'Project type?', choices: ['web', 'api', 'cli'] },
      { type: 'confirm', name: 'typescript', message: 'Use TypeScript?', default: true },
    ])

    await createProject(answers)
  })

// Progress bars and spinners
cli.command('build')
  .action(async () => {
    const spinner = cli.spinner('Building...')
    spinner.start()
    await build()
    spinner.succeed('Build complete!')

    const progress = cli.progress('Processing files', 100)
    for (let i = 0; i <= 100; i++) {
      progress.update(i)
      await delay(10)
    }
  })

cli.run()
```

### bunfig

Smart configuration loader for Bun:

```typescript
import { loadConfig, defineConfig } from 'bunfig'

// Define typed config schema
interface AppConfig {
  port: number
  database: {
    host: string
    port: number
    name: string
  }
  features: string[]
}

// Load config with defaults
const config = await loadConfig<AppConfig>({
  name: 'myapp',           // Looks for myapp.config.ts, myapp.config.js, etc.
  defaults: {
    port: 3000,
    database: {
      host: 'localhost',
      port: 5432,
      name: 'myapp',
    },
    features: [],
  },
})

// Searches in order:
// 1. myapp.config.ts
// 2. myapp.config.js
// 3. myapp.config.json
// 4. .myapprc
// 5. package.json "myapp" field

// Environment-specific overrides
// myapp.config.ts
export default defineConfig({
  port: 3000,

  // Automatically merged based on NODE_ENV
  $development: {
    database: { host: 'localhost' },
  },
  $production: {
    database: { host: 'db.example.com' },
  },
})

// Environment variable interpolation
export default defineConfig({
  database: {
    host: '${DB_HOST:localhost}',
    password: '${DB_PASSWORD}',
  },
})
```

## Pantry (Launchpad)

Modern, performant package manager with automatic project environment management:

```typescript
// dependencies.yaml in your Stacks project
dependencies:
  - node@22
  - bun@1.2
  - typescript@5.7

env:
  NODE_ENV: development
  DATABASE_URL: postgres://localhost:5432/myapp

services:
  enabled: true
  autoStart:
    - postgres
    - redis
```

```bash
# Automatic activation when entering project directory
cd my-stacks-project
# ✓ Activated: node@22, bun@1.2, typescript@5.7
# ✓ Started: postgres, redis

# Manual commands
pantry install node@22 python@3.12  # Install packages
pantry service start postgres       # Start services
pantry env:list                     # List environments
```

Features:

- **Automatic Activation**: Environments activate on `cd` into project
- **Project Isolation**: Each project gets its own tool versions
- **30+ Services**: PostgreSQL, MySQL, Redis, Kafka, and more
- **Sub-millisecond Switching**: Three-tier caching for instant env changes
- **Homebrew Compatible**: Uses `/usr/local`, coexists with Homebrew

## Post (Mail Server)

Modern mail server and utilities:

```typescript
import { Mail, createMailServer, SMTP, IMAP } from 'post'

// Send emails
await Mail.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to our app!</h1>',
  text: 'Welcome to our app!',
})

// With templates
await Mail.send({
  to: 'user@example.com',
  template: 'welcome',
  data: { name: 'John', activationLink: '...' },
})

// Attachments
await Mail.send({
  to: 'user@example.com',
  subject: 'Your Report',
  attachments: [
    { filename: 'report.pdf', content: pdfBuffer },
    { path: './files/data.csv' },
  ],
})

// Run your own mail server
const server = createMailServer({
  domain: 'mail.example.com',

  smtp: {
    port: 587,
    tls: true,
    auth: true,
  },

  imap: {
    port: 993,
    tls: true,
  },

  storage: {
    driver: 'filesystem',
    path: './mail-storage',
  },

  dkim: {
    selector: 'mail',
    privateKey: process.env.DKIM_PRIVATE_KEY,
  },

  spf: true,
  dmarc: true,
})

await server.start()

// SMTP client for sending
const smtp = new SMTP({
  host: 'smtp.example.com',
  port: 587,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

await smtp.send(message)

// IMAP client for receiving
const imap = new IMAP({
  host: 'imap.example.com',
  port: 993,
  tls: true,
  auth: { user: '...', pass: '...' },
})

await imap.connect()
const messages = await imap.fetch('INBOX', { unseen: true })
```

CLI tools included:

```bash
# Send email from command line
post send --to user@example.com --subject "Hello" --body "Message"

# Check mail server configuration
post check-dns example.com

# Test SMTP connection
post test-smtp smtp.example.com:587
```

## very-happy-dom

Blazing-fast DOM implementation for testing:

```typescript
import { Window, Document } from 'very-happy-dom'

// Create a virtual browser environment
const window = new Window({
  url: 'https://example.com',
  width: 1920,
  height: 1080,
})

const document = window.document

// Full DOM API support
document.body.innerHTML = `
  <div id="app">
    <h1>Hello World</h1>
    <button class="btn">Click me</button>
  </div>
`

// Query elements
const heading = document.querySelector('h1')
console.log(heading.textContent) // "Hello World"

const buttons = document.querySelectorAll('.btn')
buttons.forEach(btn => btn.click())

// Create elements
const div = document.createElement('div')
div.className = 'container'
div.setAttribute('data-id', '123')
document.body.appendChild(div)

// Event handling
const button = document.querySelector('button')
button.addEventListener('click', (event) => {
  console.log('Clicked!', event.target)
})
button.click() // Triggers the event

// CSS and computed styles
const element = document.querySelector('#app')
element.style.color = 'red'
const computed = window.getComputedStyle(element)

// Fetch API support
window.fetch('https://api.example.com/data')
  .then(res => res.json())
  .then(data => console.log(data))

// Storage APIs
window.localStorage.setItem('key', 'value')
window.sessionStorage.setItem('session', 'data')

// Cleanup
window.close()
```

Integration with testing:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'besting'
import { Window } from 'very-happy-dom'

describe('Component', () => {
  let window: Window
  let document: Document

  beforeEach(() => {
    window = new Window()
    document = window.document
    // Set up global for libraries that expect it
    globalThis.window = window
    globalThis.document = document
  })

  afterEach(() => {
    window.close()
  })

  it('renders correctly', () => {
    document.body.innerHTML = '<my-component></my-component>'
    const component = document.querySelector('my-component')

    expect(component).toBeDefined()
    expect(component.shadowRoot).toBeDefined()
    expect(component.shadowRoot.innerHTML).toContain('Expected content')
  })
})
```

Performance comparison:

| Operation | very-happy-dom | jsdom | linkedom |
|-----------|----------------|-------|----------|
| Parse HTML (1000 elements) | 2ms | 15ms | 8ms |
| querySelector (10000 calls) | 5ms | 45ms | 20ms |
| DOM manipulation (1000 ops) | 3ms | 25ms | 12ms |
| Memory usage | Low | High | Medium |

## Package Summary

| Package | Purpose | Status |
|---------|---------|--------|
| **Core** | | |
| pantry | Package/environment management | Stable |
| bun-router | HTTP routing | Stable |
| bun-query-builder | SQL queries | Stable |
| bun-queue | Job queues | Stable |
| stx | Templating | Stable |
| headwind | CSS framework | Stable |
| **Networking** | | |
| rpx | Reverse proxy | Stable |
| tlsx | TLS/certificates | Stable |
| httx | HTTP client | Stable |
| localtunnels | Local tunneling | Stable |
| dnsx | DNS client | Stable |
| **Security & Auth** | | |
| ts-auth | Authentication | Stable |
| ts-security | Cryptography | Stable |
| ts-rate-limiter | Rate limiting | Stable |
| **Real-time** | | |
| ts-broadcasting | Real-time events | Stable |
| **Data & Storage** | | |
| ts-cache | Caching | Stable |
| ts-collect | Collections | Stable |
| ts-cloud | Infrastructure | Stable |
| **Utilities** | | |
| ts-datetime | Date/time handling | Stable |
| ts-i18n | Internationalization | Stable |
| ts-mocker | Mock data | Stable |
| ts-markdown | Markdown parser | Stable |
| ts-spreadsheets | CSV/Excel export | Stable |
| ts-validation | Data validation | Stable |
| **Media** | | |
| imgx | Image processing | Beta |
| vidx | Video processing | Beta |
| qrx | QR codes | Stable |
| **Developer Tools** | | |
| clarity | Logging | Stable |
| dtsx | DTS generation | Stable |
| bunfig | Config loading | Stable |
| clapp | CLI framework | Stable |
| bumpx | Version bumping | Stable |
| gitlint | Commit linting | Stable |
| logsmith | Changelog generation | Stable |
| **Testing** | | |
| besting | Testing framework | Stable |
| very-happy-dom | DOM implementation | Stable |
| **Mail** | | |
| post | Mail server/client | Stable |
