---
title: Library Showcases
description: Companion libraries powering Stacks.js - ts-collect, ts-datetime, rpx, tlsx, and more
---

# Library Showcases

Stacks.js is powered by a suite of companion libraries, each designed as a standalone package that can be used independently. These zero-dependency libraries form the foundation of the reference implementation.

> **Protocol context** — This page describes companion libraries of the **Stacks.js reference implementation**. The capabilities map to contracts in the [Stacks Protocol white paper](/); the specific packages and Bun tooling shown here are TypeScript/Bun-specific.

## ts-collect

A Laravel-inspired collection library for JavaScript with full TypeScript support.

```bash
bun add ts-collect
```

### Basic Usage

```typescript
import { collect } from 'ts-collect'

// Create a collection
const users = collect([
  { name: 'John', age: 30, role: 'admin' },
  { name: 'Jane', age: 25, role: 'user' },
  { name: 'Bob', age: 35, role: 'user' },
])

// Chain operations fluently
const result = users
  .where('role', 'user')
  .sortBy('age')
  .pluck('name')
  .all()
// ['Jane', 'Bob']
```

### Collection Methods

```typescript
// Filtering
collect([1, 2, 3, 4, 5]).filter(n => n > 2) // [3, 4, 5]
collect(users).where('age', '>', 25)
collect(users).whereIn('role', ['admin', 'editor'])
collect(users).whereBetween('age', [20, 30])
collect(users).whereNotNull('email')
collect(users).reject(user => user.inactive)
collect(users).first(user => user.isAdmin)
collect(users).firstWhere('role', 'admin')

// Transforming
collect([1, 2, 3]).map(n => n * 2) // [2, 4, 6]
collect(users).pluck('name') // ['John', 'Jane', 'Bob']
collect(users).keyBy('id')
collect(users).groupBy('role')
collect([[1, 2], [3, 4]]).flatten() // [1, 2, 3, 4]
collect(users).mapToGroups(user => [user.role, user.name])

// Aggregation
collect([1, 2, 3]).sum() // 6
collect(users).sum('age') // 90
collect(users).avg('age') // 30
collect(users).min('age') // 25
collect(users).max('age') // 35
collect(users).count() // 3
collect(users).countBy('role') // { admin: 1, user: 2 }

// Sorting
collect([3, 1, 2]).sort() // [1, 2, 3]
collect(users).sortBy('name')
collect(users).sortByDesc('age')
collect(users).sortKeys()

// Combining
collect([1, 2]).concat([3, 4]) // [1, 2, 3, 4]
collect([1, 2]).merge([2, 3]) // [1, 2, 2, 3]
collect([1, 2, 2, 3]).unique() // [1, 2, 3]
collect(users).union(moreUsers)
collect([1, 2]).zip(['a', 'b']) // [[1, 'a'], [2, 'b']]

// Chunking
collect([1, 2, 3, 4, 5]).chunk(2) // [[1, 2], [3, 4], [5]]
collect(users).split(2)
collect(items).forPage(2, 10) // Page 2, 10 per page

// Checking
collect([1, 2, 3]).contains(2) // true
collect(users).contains('name', 'John') // true
collect([1, 2, 3]).every(n => n > 0) // true
collect([1, 2, 3]).some(n => n > 2) // true
collect([]).isEmpty() // true
collect([1]).isNotEmpty() // true

// Reducing
collect([1, 2, 3]).reduce((sum, n) => sum + n, 0) // 6
collect(users).pipe(users => users.count())
collect(users).tap(users => console.log(users.count()))
```

### Lazy Collections

```typescript
import { lazy } from 'ts-collect'

// Process large datasets efficiently
const result = lazy(hugeArray)
  .filter(item => item.active)
  .map(item => transform(item))
  .take(100)
  .all()

// Generator support
function* generateNumbers() {
  for (let i = 0; i < 1000000; i++) yield i
}

lazy(generateNumbers())
  .filter(n => n % 2 === 0)
  .take(10)
  .all()
```

## ts-datetime

A modern, immutable date-time library with timezone support.

```bash
bun add ts-datetime
```

### Basic Usage

```typescript
import { DateTime } from 'ts-datetime'

// Create instances
const now = DateTime.now()
const date = DateTime.parse('2024-01-15')
const fromTimestamp = DateTime.fromTimestamp(1705276800)

// Fluent manipulation
const future = now
  .addDays(7)
  .addHours(3)
  .startOfDay()

// Formatting
now.format('YYYY-MM-DD') // '2024-01-15'
now.format('MMMM D, YYYY') // 'January 15, 2024'
now.toISOString() // '2024-01-15T10:30:00.000Z'
now.toRelative() // '2 hours ago'
```

### Date Manipulation

```typescript
// Adding/Subtracting
date.addYears(1)
date.addMonths(3)
date.addWeeks(2)
date.addDays(5)
date.addHours(12)
date.addMinutes(30)
date.addSeconds(45)

date.subDays(5)
date.subMonths(1)

// Start/End of periods
date.startOfDay()
date.endOfDay()
date.startOfWeek()
date.endOfWeek()
date.startOfMonth()
date.endOfMonth()
date.startOfYear()
date.endOfYear()

// Setting values
date.setYear(2025)
date.setMonth(6)
date.setDay(15)
date.setHour(14)
date.setMinute(30)
```

### Comparisons

```typescript
const date1 = DateTime.parse('2024-01-15')
const date2 = DateTime.parse('2024-01-20')

date1.isBefore(date2) // true
date1.isAfter(date2) // false
date1.isSame(date2) // false
date1.isSameDay(date2) // false
date1.isSameMonth(date2) // true

date1.isBetween('2024-01-01', '2024-01-31') // true
date1.isPast() // depends on current date
date1.isFuture() // depends on current date
date1.isToday() // false
date1.isWeekend() // false
date1.isWeekday() // true
```

### Differences

```typescript
const start = DateTime.parse('2024-01-01')
const end = DateTime.parse('2024-03-15')

start.diffInDays(end) // 74
start.diffInWeeks(end) // 10
start.diffInMonths(end) // 2
start.diffInYears(end) // 0
start.diffInHours(end) // 1776
start.diffForHumans(end) // '2 months'
```

### Timezones

```typescript
// Create in timezone
const tokyo = DateTime.now('Asia/Tokyo')
const newYork = DateTime.now('America/New_York')

// Convert timezones
tokyo.toTimezone('UTC')
tokyo.toTimezone('Europe/London')

// Get timezone info
tokyo.timezone // 'Asia/Tokyo'
tokyo.offset // '+09:00'
tokyo.offsetMinutes // 540
```

### Formatting

```typescript
const date = DateTime.parse('2024-01-15T14:30:00')

// Format tokens
date.format('YYYY') // '2024'
date.format('MM') // '01'
date.format('DD') // '15'
date.format('HH:mm') // '14:30'
date.format('dddd') // 'Monday'
date.format('MMMM') // 'January'
date.format('YYYY-MM-DD HH:mm:ss') // '2024-01-15 14:30:00'

// Relative time
date.fromNow() // '2 hours ago'
date.toNow() // 'in 2 hours'

// Localization
date.locale('de').format('MMMM D, YYYY') // '15. Januar 2024'
date.locale('ja').format('YYYY年MM月DD日') // '2024年01月15日'
```

## rpx

A reverse proxy and local development tunnel solution.

```bash
bun add rpx
```

### Basic Usage

```typescript
import { startProxy, startTunnel } from 'rpx'

// Reverse proxy
const proxy = await startProxy({
  from: 'localhost:3000',
  to: 'app.localhost',
  https: true,
})

// Local tunnel (expose to internet)
const tunnel = await startTunnel({
  port: 3000,
  subdomain: 'my-app',
})

console.log(tunnel.url) // https://my-app.rpx.dev
```

### SSL Certificates

```typescript
// Auto-generate development certificates
const proxy = await startProxy({
  from: 'localhost:3000',
  to: 'myapp.localhost',
  https: {
    auto: true,
    trust: true, // Add to system trust store
  },
})

// Custom certificates
const proxy = await startProxy({
  from: 'localhost:3000',
  to: 'myapp.localhost',
  https: {
    cert: './certs/localhost.crt',
    key: './certs/localhost.key',
  },
})
```

### Multiple Domains

```typescript
// Route multiple domains
await startProxy({
  routes: {
    'api.localhost': 'localhost:3001',
    'app.localhost': 'localhost:3000',
    'admin.localhost': 'localhost:3002',
  },
  https: true,
})
```

## tlsx

TLS/SSL certificate generation and management.

```bash
bun add tlsx
```

### Generate Certificates

```typescript
import { createCertificate, createCA } from 'tlsx'

// Create a Certificate Authority
const ca = await createCA({
  organization: 'My Dev CA',
  countryCode: 'US',
  state: 'California',
  locality: 'San Francisco',
  validity: 365 * 10, // 10 years
})

// Create certificate signed by CA
const cert = await createCertificate({
  ca,
  domains: ['localhost', '*.localhost', 'myapp.dev'],
  validity: 365,
})

// Save to files
await Bun.write('ca.crt', ca.certificate)
await Bun.write('cert.crt', cert.certificate)
await Bun.write('cert.key', cert.privateKey)
```

### Trust System Store

```typescript
import { trust, untrust } from 'tlsx'

// Add CA to system trust store
await trust(ca.certificate)

// Remove from trust store
await untrust(ca.certificate)
```

## clarity

Structured logging with beautiful output.

```bash
bun add clarity
```

### Basic Usage

```typescript
import { log, createLogger } from 'clarity'

// Simple logging
log.info('Server started', { port: 3000 })
log.warning('High memory usage', { usage: '85%' })
log.error('Request failed', { error: error.message })
log.debug('Cache hit', { key: 'user:123' })

// Create named logger
const dbLog = createLogger('database')
dbLog.info('Query executed', { sql: '...', time: 45 })
```

### Configuration

```typescript
import { configure } from 'clarity'

configure({
  level: 'debug',
  format: 'pretty', // 'pretty' | 'json'
  colors: true,
  timestamp: true,
  context: {
    app: 'my-app',
    version: '1.0.0',
  },
})
```

### Transports

```typescript
import { addTransport, FileTransport, HttpTransport } from 'clarity'

// File transport
addTransport(new FileTransport({
  path: 'logs/app.log',
  rotate: 'daily',
}))

// HTTP transport (send to log service)
addTransport(new HttpTransport({
  url: 'https://logs.example.com/ingest',
  batchSize: 100,
}))
```

## ts-mocker (Faker)

Fake data generation for testing and development.

```bash
bun add ts-mocker
```

### Basic Usage

```typescript
import { fake } from 'ts-mocker'

// Generate fake data
fake.name() // 'John Smith'
fake.email() // 'john.smith@example.com'
fake.phone() // '(555) 123-4567'
fake.address() // '123 Main St, New York, NY 10001'
fake.company() // 'Acme Corporation'
fake.paragraph() // 'Lorem ipsum...'
```

### Available Generators

```typescript
// Personal
fake.firstName() // 'John'
fake.lastName() // 'Smith'
fake.name() // 'John Smith'
fake.email() // 'john@example.com'
fake.phone() // '+1 555-123-4567'
fake.avatar() // 'https://...'
fake.username() // 'johnsmith42'
fake.password() // 'aB3$xY9z'

// Address
fake.address() // '123 Main St'
fake.city() // 'New York'
fake.state() // 'California'
fake.zipCode() // '90210'
fake.country() // 'United States'
fake.latitude() // 40.7128
fake.longitude() // -74.0060

// Business
fake.company() // 'Acme Inc.'
fake.jobTitle() // 'Software Engineer'
fake.department() // 'Engineering'

// Internet
fake.url() // 'https://example.com'
fake.domain() // 'example.com'
fake.ip() // '192.168.1.1'
fake.userAgent() // 'Mozilla/5.0...'

// Text
fake.word() // 'lorem'
fake.words(5) // 'lorem ipsum dolor sit amet'
fake.sentence() // 'Lorem ipsum dolor sit amet.'
fake.paragraph() // 'Lorem ipsum...'
fake.paragraphs(3) // '...'

// Numbers
fake.number(1, 100) // 42
fake.float(0, 1) // 0.7234
fake.boolean() // true
fake.uuid() // 'a1b2c3d4-...'

// Dates
fake.date() // Date object
fake.pastDate() // Date in the past
fake.futureDate() // Date in the future
fake.dateTime() // '2024-01-15T10:30:00Z'

// Commerce
fake.price() // 99.99
fake.productName() // 'Ergonomic Chair'
fake.color() // 'blue'
fake.currency() // 'USD'

// Images
fake.image() // 'https://picsum.photos/...'
fake.image(400, 300) // Specific dimensions
fake.avatar() // Profile image URL
```

### Seeded Generation

```typescript
import { seed, fake } from 'ts-mocker'

// Reproducible results
seed(12345)
fake.name() // Always 'John Smith' with this seed
fake.email() // Always same email
```

## dnsx

DNS record management across providers.

```bash
bun add dnsx
```

### Basic Usage

```typescript
import { DNS } from 'dnsx'

// Configure provider
const dns = new DNS({
  provider: 'cloudflare',
  token: process.env.CLOUDFLARE_TOKEN,
  zone: 'example.com',
})

// Get records
const records = await dns.getRecords()
const aRecords = await dns.getRecords({ type: 'A' })

// Create record
await dns.createRecord({
  type: 'A',
  name: 'app',
  content: '192.168.1.1',
  ttl: 3600,
})

// Update record
await dns.updateRecord(recordId, {
  content: '192.168.1.2',
})

// Delete record
await dns.deleteRecord(recordId)
```

### Supported Providers

```typescript
// Cloudflare
new DNS({ provider: 'cloudflare', token: '...' })

// AWS Route 53
new DNS({ provider: 'route53', accessKeyId: '...', secretAccessKey: '...' })

// DigitalOcean
new DNS({ provider: 'digitalocean', token: '...' })

// Google Cloud DNS
new DNS({ provider: 'gcloud', credentials: {...} })
```

## bunpress

Static site and documentation generator.

```bash
bun add bunpress
```

### Configuration

```typescript
// bunpress.config.ts
export default {
  title: 'My Documentation',
  description: 'Documentation for my project',
  docsDir: './docs',
  outDir: './dist',

  theme: 'vitepress',

  markdown: {
    toc: { enabled: true },
    syntaxHighlightTheme: 'github-dark',
  },

  nav: [
    { text: 'Guide', link: '/guide/' },
    { text: 'API', link: '/api/' },
  ],

  sidebar: {
    '/guide/': [
      { text: 'Introduction', link: '/guide/' },
      { text: 'Getting Started', link: '/guide/getting-started' },
    ],
  },
}
```

### Build

```bash
bunpress build  # Build static site
bunpress dev    # Development server
bunpress serve  # Serve built site
```

## More Libraries

| Library | Description | Package |
|---------|-------------|---------|
| **bun-reverse-proxy** | Reverse proxy for Bun | `bun-reverse-proxy` |
| **localtunnels** | Expose local servers | `localtunnels` |
| **bun-plugin-auto-imports** | Auto-import for Bun | `bun-plugin-auto-imports` |
| **bun-plugin-dtsx** | Auto-generate .d.ts | `bun-plugin-dtsx` |
| **bun-git-hooks** | Git hooks for Bun | `bun-git-hooks` |
| **bun-spreadsheets** | Excel/CSV handling | `bun-spreadsheets` |
| **ts-spreadsheets** | TypeScript spreadsheets | `ts-spreadsheets` |
| **dtsx** | TypeScript to .d.ts | `dtsx` |
| **vite-plugin-stacks** | Vite integration | `vite-plugin-stacks` |

## Using Libraries Standalone

All Stacks.js companion libraries are zero-dependency and can be used independently:

```typescript
// In any project, not just Stacks.js
import { collect } from 'ts-collect'
import { DateTime } from 'ts-datetime'
import { fake } from 'ts-mocker'
import { log } from 'clarity'

// Use them anywhere
const users = collect(data).where('active', true).sortBy('name')
const tomorrow = DateTime.now().addDays(1)
const testUser = { name: fake.name(), email: fake.email() }
log.info('Processing complete', { count: users.count() })
```
