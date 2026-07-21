---
title: Database & ORM
description: Comprehensive guide to Stacks.js database layer and narrowly-typed ORM
---

# Database & ORM

Stacks.js includes **bun-query-builder**, a fully-typed, model-driven ORM built specifically for Bun's native SQL API. It combines the elegance of Laravel's Eloquent with exceptional TypeScript type inference, delivering both developer experience and performance.

> **Protocol context** — This guide covers the **Stacks.js reference implementation**. The draft [Data and persistence contract](https://github.com/stacksjs/white-paper#44-data-and-persistence) defines portable behavior; the APIs here are TypeScript/Bun-specific and no formal conformance report exists yet.

## Key Features

- **Narrowly Typed**: Types flow from model definitions through queries to results with precise inference
- **Dynamic Methods**: Auto-generated `whereColumn()` methods from your schema
- **Model-Driven**: Define your schema once, derive type-safe queries automatically
- **Bun-Native Execution**: Integrates with Bun database/runtime primitives; benchmark your own workload with pinned versions
- **Full-Featured**: Relationships, migrations, seeders, hooks, transactions, caching

## Multi-Dialect Support

| Database | Status | Use Case |
|----------|--------|----------|
| SQLite | Primary audited path | Local development and deployed workloads after scale/durability review |
| MySQL | Driver present; verify selected operations | Traditional relational workloads |
| PostgreSQL | Driver present; verify selected operations | Relational workloads requiring PostgreSQL features |

```typescript
// config/database.ts
export default {
  default: env('DB_CONNECTION', 'postgres'),

  connections: {
    sqlite: {
      driver: 'sqlite',
      database: 'storage/database.sqlite',
    },

    mysql: {
      driver: 'mysql',
      host: env('DB_HOST', 'localhost'),
      port: env('DB_PORT', 3306),
      database: env('DB_DATABASE', 'stacks'),
      username: env('DB_USERNAME', 'root'),
      password: env('DB_PASSWORD', ''),
      charset: 'utf8mb4',
    },

    postgres: {
      driver: 'postgres',
      host: env('DB_HOST', 'localhost'),
      port: env('DB_PORT', 5432),
      database: env('DB_DATABASE', 'stacks'),
      username: env('DB_USERNAME', 'postgres'),
      password: env('DB_PASSWORD', ''),
      // Or use connection URL
      url: env('DATABASE_URL'),
    },
  },
}
```

## Narrow Type Inference

The ORM's type system is extraordinarily precise. Types flow from your model definition through every query method to the final result:

```typescript
// Define a model with validation rules
const User = defineModel({
  name: 'User',
  table: 'users',
  primaryKey: 'id',

  attributes: {
    id: { validation: { rule: v.integer() } },
    email: { unique: true, validation: { rule: v.string() } },
    name: { validation: { rule: v.string() } },
    age: { default: 0, validation: { rule: v.integer() } },
    role: { validation: { rule: v.enum(['user', 'admin', 'moderator']) } },
    created_at: { validation: { rule: v.date() } },
  },
})

// TypeScript knows the exact shape of results
const users = await db.selectFrom('users')
  .select('id', 'name', 'email')
  .where('role', '=', 'admin')
  .execute()

// Type: Array<{ id: number; name: string; email: string }>
// NOT: Array<any> or Array<Record<string, unknown>>
```

### Dynamic Where Methods

The ORM auto-generates typed convenience methods from your schema columns:

```typescript
// These methods are auto-generated from your schema
const user = await db.selectFrom('users')
  .whereEmail('john@example.com')     // Generated from 'email' column
  .whereRole('admin')                  // Generated from 'role' column
  .first()

// Column snake_case converts to PascalCase methods
// created_at → whereCreatedAt()
// email_verified_at → whereEmailVerifiedAt()

// Also available: andWhereX(), orWhereX()
const admins = await db.selectFrom('users')
  .whereRole('admin')
  .orWhereRole('moderator')
  .execute()
```

### Phantom SQL Types

The type system preserves SQL structure through transformations:

```typescript
// IDE hover shows: TypedSelectQueryBuilder<..., "SELECT id, name FROM users WHERE role = ?">
const query = db.selectFrom('users')
  .select('id', 'name')
  .where('role', '=', 'admin')

// Compile-time SQL verification
query.toSQL() // Type: "SELECT id, name FROM users WHERE role = ?"
```

## Query Builder

### SELECT Queries

```typescript
import { db } from '@stacksjs/database'

// Basic select
const users = await db.selectFrom('users')
  .select('id', 'name', 'email')
  .execute()

// Select all columns
const allUsers = await db.selectFrom('users').execute()

// With type-safe where clauses
const activeUsers = await db.selectFrom('users')
  .select('id', 'name')
  .where('active', '=', true)
  .whereNotNull('email_verified_at')
  .execute()

// Raw select expressions
const stats = await db.selectFrom('orders')
  .selectRaw('DATE(created_at) as date, SUM(total) as revenue')
  .groupBy('date')
  .execute()

// Distinct
const roles = await db.selectFrom('users')
  .distinct()
  .select('role')
  .execute()

// PostgreSQL DISTINCT ON
const latestPerUser = await db.selectFrom('posts')
  .distinctOn('user_id')
  .orderBy('user_id')
  .orderBy('created_at', 'desc')
  .execute()
```

### WHERE Clauses

The query builder supports extensive where clause variants:

```typescript
// Object shorthand
.where({ status: 'active', role: 'admin' })

// Tuple format with operators
.where(['created_at', '>', new Date('2024-01-01')])

// Three-argument format
.where('age', '>=', 18)

// Dynamic column methods (auto-generated)
.whereEmail('john@example.com')
.whereRole('admin')
.whereCreatedAt(new Date())

// IN / NOT IN
.whereIn('status', ['active', 'pending'])
.whereNotIn('role', ['banned', 'suspended'])

// NULL checks
.whereNull('deleted_at')
.whereNotNull('email_verified_at')

// BETWEEN
.whereBetween('age', 18, 65)
.whereNotBetween('price', 0, 10)

// LIKE / ILIKE (dialect-aware)
.whereLike('name', '%john%')
.whereILike('email', '%@gmail.com')  // Case-insensitive

// Date comparisons
.whereDate('created_at', '2024-01-15')

// Column comparisons
.whereColumn('updated_at', '>', 'created_at')

// JSON operators
.whereJsonContains('settings', { notifications: true })
.whereJsonDoesntContain('tags', ['spam'])
.whereJsonContainsKey('meta.published')
.whereJsonDoesntContainKey('meta.archived')
.whereJsonPath('metadata', '$.tags[0]', '=', 'featured')
.whereJsonLength('tags', '>', 3)

// Subquery existence
.whereExists(
  db.selectFrom('orders').where('orders.user_id', '=', db.ref('users.id'))
)

// Nested conditions (parentheses)
.whereNested((qb) => {
  qb.where('role', '=', 'admin')
    .orWhere('permissions', 'LIKE', '%manage_users%')
})

// Multiple conditions on any/all/none columns
.whereAny(['email', 'phone'], 'LIKE', '%john%')
.whereAll(['age', 'experience'], '>=', 5)
.whereNone(['role', 'status'], 'in', ['banned', 'suspended'])
```

### Composition Operators

```typescript
// AND (default)
.where('active', '=', true)
.andWhere('verified', '=', true)

// OR
.where('role', '=', 'admin')
.orWhere('role', '=', 'moderator')

// Dynamic AND/OR variants
.whereRole('admin')
.orWhereRole('moderator')
.andWhereActive(true)
```

### Ordering & Pagination

```typescript
// Basic ordering
.orderBy('created_at', 'desc')
.orderByDesc('updated_at')

// Multiple columns
.orderBy('role', 'asc')
.orderBy('name', 'asc')

// Raw ordering
.orderByRaw('FIELD(status, "high", "medium", "low")')

// Random ordering (dialect-aware)
.inRandomOrder()

// Replace existing ORDER BY
.reorder('name', 'asc')

// Timestamp shortcuts
.latest()           // ORDER BY created_at DESC
.latest('updated_at')
.oldest()           // ORDER BY created_at ASC

// Pagination
.limit(10)
.offset(20)
.forPage(3, 10)     // Page 3, 10 per page
```

### JOINs

```typescript
// Inner join
const posts = await db.selectFrom('posts')
  .join('users', 'posts.author_id', '=', 'users.id')
  .select('posts.*', 'users.name as author_name')
  .execute()

// Left/Right joins
.leftJoin('profiles', 'users.id', '=', 'profiles.user_id')
.rightJoin('teams', 'users.team_id', '=', 'teams.id')

// Cross join
.crossJoin('categories')

// Join with subquery
.joinSub(
  db.selectFrom('orders').select('user_id', db.raw('SUM(total) as total_spent')).groupBy('user_id'),
  'order_totals',
  'users.id', '=', 'order_totals.user_id'
)
```

### Aggregations

```typescript
// Count
const count = await db.selectFrom('users').count()
const activeCount = await db.selectFrom('users').where('active', '=', true).count()

// Sum, Avg, Min, Max
const totalRevenue = await db.selectFrom('orders').sum('total')
const avgAge = await db.selectFrom('users').avg('age')
const oldestUser = await db.selectFrom('users').max('age')
const youngestUser = await db.selectFrom('users').min('age')

// Group by with aggregates
const salesByRegion = await db.selectFrom('orders')
  .select('region')
  .selectRaw('SUM(total) as revenue')
  .selectRaw('COUNT(*) as order_count')
  .groupBy('region')
  .having('revenue', '>', 10000)
  .execute()
```

### Set Operations

```typescript
// Union (distinct)
const allContacts = await db.selectFrom('customers')
  .select('email', 'name')
  .union(
    db.selectFrom('leads').select('email', 'name')
  )
  .execute()

// Union all (with duplicates)
.unionAll(otherQuery)
```

### Window Functions

```typescript
// Row number
const ranked = await db.selectFrom('users')
  .select('*')
  .rowNumber('row_num', 'department', 'salary DESC')
  .execute()

// Rank and dense rank
.rank('rank', 'department', 'salary DESC')
.denseRank('dense_rank', 'department', 'salary DESC')
```

### Common Table Expressions (CTEs)

```typescript
// Non-recursive CTE
const result = await db
  .withCTE('active_users',
    db.selectFrom('users').where('active', '=', true)
  )
  .selectFrom('active_users')
  .execute()

// Recursive CTE (e.g., for hierarchies)
const hierarchy = await db
  .withRecursive('subordinates',
    db.selectFrom('employees')
      .where('manager_id', '=', null)
      .unionAll(
        db.selectFrom('employees')
          .join('subordinates', 'employees.manager_id', '=', 'subordinates.id')
      )
  )
  .selectFrom('subordinates')
  .execute()
```

## Result Retrieval

### Execution Methods

```typescript
// Get all rows
const users = await query.execute()
const users = await query.get()

// Get first row
const user = await query.first()              // Returns T | undefined
const user = await query.firstOrFail()        // Throws if not found
const user = await query.executeTakeFirst()   // Alias for first()

// Find by primary key
const user = await db.selectFrom('users').find(1)
const user = await db.selectFrom('users').findOrFail(1)
const users = await db.selectFrom('users').findMany([1, 2, 3])

// Existence checks
const exists = await query.exists()
const notExists = await query.doesntExist()

// Single column value
const email = await db.selectFrom('users').where('id', '=', 1).value('email')

// Pluck column(s)
const emails = await db.selectFrom('users').pluck('email')
// ['a@b.c', 'd@e.f', ...]

const emailsByName = await db.selectFrom('users').pluck('email', 'name')
// { 'John': 'john@example.com', 'Jane': 'jane@example.com' }
```

### Pagination

```typescript
// Standard pagination
const page = await db.selectFrom('users')
  .orderBy('created_at', 'desc')
  .paginate(25, 1)

// Returns:
// {
//   data: User[],
//   total: 150,
//   perPage: 25,
//   currentPage: 1,
//   lastPage: 6,
//   from: 1,
//   to: 25
// }

// Simple pagination (no total count - faster)
const page = await db.selectFrom('users')
  .simplePaginate(25, 1)

// Returns:
// {
//   data: User[],
//   perPage: 25,
//   currentPage: 1,
//   hasMore: true
// }

// Cursor-based pagination (most efficient for large datasets)
const page = await db.selectFrom('users')
  .orderBy('id')
  .cursorPaginate(25, lastId, 'id', 'after')

// Returns:
// {
//   data: User[],
//   cursor: '123',
//   hasMore: true
// }
```

### Chunking & Streaming

For processing large datasets efficiently:

```typescript
// Process in chunks
await db.selectFrom('users')
  .chunk(100, async (users) => {
    for (const user of users) {
      await processUser(user)
    }
  })

// Chunk by ID (more efficient for concurrent modifications)
await db.selectFrom('users')
  .chunkById(100, 'id', async (users) => {
    await Promise.all(users.map(processUser))
  })

// Lazy iteration (async iterator)
for await (const user of db.selectFrom('users').lazy()) {
  await processUser(user)
}

// Lazy by ID
for await (const user of db.selectFrom('users').lazyById(100, 'id')) {
  await processUser(user)
}

// Process each row individually by ID
await db.selectFrom('users')
  .eachById(100, 'id', async (user) => {
    await processUser(user)
  })

// With query timeout (cancel after expiration)
const users = await db.selectFrom('users')
  .withTimeout(5000)  // 5 second timeout
  .get()

// With AbortSignal support
const controller = new AbortController()
const users = await db.selectFrom('users')
  .abort(controller.signal)
  .get()
// controller.abort() // Cancel the query
```

## INSERT Operations

```typescript
// Single insert
await db.insertInto('users')
  .values({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
  })
  .execute()

// Insert with returning
const user = await db.insertInto('users')
  .values({ name: 'John', email: 'john@example.com' })
  .returning('id', 'created_at')
  .executeTakeFirst()

// Multiple inserts
await db.insertInto('users')
  .values([
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' },
  ])
  .execute()

// Insert and get ID
const id = await db.insertGetId('users', { name: 'John', email: 'john@example.com' })

// Insert or ignore (on conflict do nothing)
await db.insertOrIgnore('users', { email: 'existing@example.com', name: 'Test' })
```

## UPDATE Operations

```typescript
// Basic update
await db.updateTable('users')
  .set({ last_login: new Date() })
  .where('id', '=', userId)
  .execute()

// Update with returning
const updated = await db.updateTable('users')
  .set({ verified: true })
  .where('id', '=', userId)
  .returning('*')
  .executeTakeFirst()

// Increment/Decrement
await db.table('products')
  .where('id', '=', productId)
  .increment('stock', 10)

await db.table('accounts')
  .where('id', '=', accountId)
  .decrement('balance', 50)
```

## DELETE Operations

```typescript
// Basic delete
await db.deleteFrom('users')
  .where('id', '=', userId)
  .execute()

// Delete with returning
const deleted = await db.deleteFrom('users')
  .where('id', '=', userId)
  .returning('*')
  .executeTakeFirst()

// Delete many by IDs
await db.deleteMany('users', [1, 2, 3])

// Truncate (delete all)
await db.truncate('sessions')
```

## Upsert Operations

```typescript
// Upsert (insert or update on conflict)
await db.upsert('users',
  [
    { email: 'john@example.com', name: 'John', login_count: 1 },
    { email: 'jane@example.com', name: 'Jane', login_count: 1 },
  ],
  ['email'],                    // Conflict columns
  ['name', 'login_count']       // Columns to update on conflict
)

// First or create
const user = await db.firstOrCreate('users',
  { email: 'john@example.com' },           // Match conditions
  { name: 'John', role: 'user' }           // Defaults if creating
)

// Update or create
const user = await db.updateOrCreate('users',
  { email: 'john@example.com' },           // Match conditions
  { name: 'John Updated', login_count: 5 } // Values to set
)

// Create and return the record
const newUser = await db.create('users', {
  name: 'Alice',
  email: 'alice@example.com',
})

// Create many records
await db.createMany('users', [
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Carol', email: 'carol@example.com' },
])

// Save (insert if new, update if exists)
const user = await db.save('users', {
  id: 1,  // If exists, updates; if not, inserts
  name: 'Updated Name',
})

// Remove by primary key
await db.remove('users', userId)
```

## Row Locking

For concurrent access control in transactions:

```typescript
// Exclusive lock (FOR UPDATE)
const user = await db.transaction(async (tx) => {
  return tx.selectFrom('users')
    .where('id', '=', userId)
    .lockForUpdate()
    .first()
})

// Shared lock (FOR SHARE / LOCK IN SHARE MODE)
const users = await db.transaction(async (tx) => {
  return tx.selectFrom('users')
    .where('team_id', '=', teamId)
    .sharedLock()
    .get()
})
```

## Conditional Queries

Build queries dynamically based on conditions:

```typescript
// Conditional modification with when()
const query = db.selectFrom('users')
  .when(filterByActive, qb => qb.where('active', '=', true))
  .when(sortByDate, qb => qb.orderBy('created_at', 'desc'))
  .when(!sortByDate, qb => qb.orderBy('name', 'asc'))

// Side effects with tap()
const users = await db.selectFrom('users')
  .tap(qb => console.log('Query:', qb.toSQL()))
  .get()

// Clone query for branching
const baseQuery = db.selectFrom('users').where('active', '=', true)
const admins = await baseQuery.clone().where('role', '=', 'admin').get()
const users = await baseQuery.clone().where('role', '=', 'user').get()

// Pipe through functions
const result = await db.selectFrom('users')
  .pipe(qb => addPagination(qb, page, perPage))
  .pipe(qb => addFilters(qb, filters))
  .get()
```

## Connection Management

```typescript
// Ping to check connectivity
const isConnected = await db.ping()

// Wait for database to be ready (useful in containers)
await db.waitForReady({ attempts: 10, delayMs: 500 })

// Reserve a connection from the pool
const reserved = await db.reserve()
try {
  await reserved.selectFrom('users').get()
} finally {
  reserved.release()
}

// Close all connections
await db.close({ timeout: 5000 })
```

## Advisory Locks (PostgreSQL)

```typescript
// Acquire an advisory lock (blocks until acquired)
await db.advisoryLock('my-unique-task')

// Try to acquire without blocking
const acquired = await db.tryAdvisoryLock('my-unique-task')
if (acquired) {
  // Perform exclusive operation
}
```

## Model Definitions

Models provide a schema definition that drives type inference:

```typescript
// app/Models/User.ts
import { defineModel } from '@stacksjs/orm'
import { v } from '@stacksjs/validation'

export default defineModel({
  name: 'User',
  table: 'users',
  primaryKey: 'id',

  // Relationships
  hasMany: {
    posts: 'Post',
    comments: 'Comment',
  },
  belongsTo: {
    team: 'Team',
  },
  belongsToMany: {
    roles: 'Role',
  },

  // Column definitions with validation
  attributes: {
    id: {
      validation: { rule: v.integer() },
    },
    email: {
      unique: true,
      validation: { rule: v.string().email() },
    },
    name: {
      validation: { rule: v.string().min(2).max(100) },
    },
    password: {
      hidden: true,
      validation: { rule: v.string().min(8) },
    },
    age: {
      default: 0,
      validation: { rule: v.integer().min(0).max(150) },
    },
    role: {
      validation: { rule: v.enum(['user', 'admin', 'moderator']) },
    },
    bio: {
      nullable: true,
      validation: { rule: v.string().optional() },
    },
    settings: {
      default: {},
      validation: { rule: v.object() },
    },
    email_verified_at: {
      nullable: true,
      validation: { rule: v.date().optional() },
    },
    created_at: {
      validation: { rule: v.date() },
    },
    updated_at: {
      validation: { rule: v.date() },
    },
  },

  // Reusable query scopes
  scopes: {
    active: (qb) => qb.where({ deleted_at: null }),
    verified: (qb) => qb.whereNotNull('email_verified_at'),
    admins: (qb) => qb.where({ role: 'admin' }),
    recentlyCreated: (qb) => qb.where('created_at', '>', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
  },
})
```

### Using Scopes

```typescript
// Apply predefined scopes
const activeAdmins = await db.selectFrom('users')
  .scope('active')
  .scope('admins')
  .execute()

// Scopes can accept parameters
scopes: {
  olderThan: (qb, age: number) => qb.where('age', '>', age),
  role: (qb, role: string) => qb.where({ role }),
}

// Usage
.scope('olderThan', 21)
.scope('role', 'admin')
```

## Relationships

### Defining Relationships

```typescript
const User = defineModel({
  name: 'User',
  table: 'users',

  // One-to-One
  hasOne: {
    profile: 'Profile',        // User has one Profile
  },

  // One-to-Many
  hasMany: {
    posts: 'Post',             // User has many Posts
    comments: 'Comment',
  },

  // Inverse One-to-One / One-to-Many
  belongsTo: {
    team: 'Team',              // User belongs to Team
  },

  // Many-to-Many
  belongsToMany: {
    roles: 'Role',             // User belongs to many Roles (via user_roles table)
  },

  // Has-Through
  hasManyThrough: {
    teamPosts: {
      through: 'Team',
      target: 'Post',
    },
  },

  // Polymorphic relationships
  morphMany: {
    activities: 'Activity',
  },
})
```

### Eager Loading

Prevent N+1 queries by eager loading relationships:

```typescript
// Load single relationship
const users = await db.selectFrom('users')
  .with('posts')
  .execute()

// Load multiple relationships
const users = await db.selectFrom('users')
  .with('posts', 'comments', 'profile')
  .execute()

// Nested eager loading
const users = await db.selectFrom('users')
  .with('posts.comments', 'team.members')
  .execute()

// Eager loading with constraints
const users = await db.selectFrom('users')
  .with({
    posts: (qb) => qb
      .where('published', '=', true)
      .orderBy('created_at', 'desc')
      .limit(5),
    comments: (qb) => qb
      .where('approved', '=', true),
  })
  .execute()

// Load relationship counts
const users = await db.selectFrom('users')
  .withCount('posts', 'comments')
  .execute()
// users[0].posts_count, users[0].comments_count

// Load all relationships defined on model
const users = await db.selectFrom('users')
  .selectAllRelations()
  .execute()
```

### Querying Relationships

```typescript
// Filter by relationship existence
const usersWithPosts = await db.selectFrom('users')
  .has('posts')
  .execute()

const usersWithoutPosts = await db.selectFrom('users')
  .doesntHave('posts')
  .execute()

// Filter by relationship conditions
const usersWithPublishedPosts = await db.selectFrom('users')
  .whereHas('posts', (qb) => qb.where('published', '=', true))
  .execute()

// Count relationship records
const usersWithManyPosts = await db.selectFrom('users')
  .whereHas('posts', (qb) => qb, '>=', 10)
  .execute()
```

### Pivot Tables (Many-to-Many)

```typescript
// Access pivot data
const users = await db.selectFrom('users')
  .with('roles')
  .withPivot('roles', 'assigned_at', 'assigned_by')
  .execute()

// users[0].roles[0].pivot.assigned_at
// users[0].roles[0].pivot.assigned_by
```

### Relationship Introspection

```typescript
// Get all relationships for a table
const relationships = db.getRelationships('users')
// { posts: { type: 'hasMany', target: 'posts' }, team: { type: 'belongsTo', target: 'teams' } }

// Check if relationship exists
const hasPostsRelation = db.hasRelationship('users', 'posts')  // true

// Get relationship type
const type = db.getRelationshipType('users', 'posts')  // 'hasMany'

// Get relationship target
const target = db.getRelationshipTarget('users', 'team')  // 'teams'
```

## Transactions

```typescript
// Basic transaction
const result = await db.transaction(async (tx) => {
  const order = await tx.insertInto('orders')
    .values({ user_id: 1, total: 99.99 })
    .returning('id')
    .executeTakeFirst()

  await tx.insertInto('order_items')
    .values([
      { order_id: order.id, product_id: 1, quantity: 2 },
      { order_id: order.id, product_id: 3, quantity: 1 },
    ])
    .execute()

  await tx.updateTable('products')
    .set({ stock: db.raw('stock - 3') })
    .whereIn('id', [1, 3])
    .execute()

  return order
})

// Transaction with options
await db.transaction(async (tx) => {
  // ... operations
}, {
  retries: 3,                           // Retry on serialization failures
  isolation: 'serializable',           // Transaction isolation level

  backoff: {
    baseMs: 50,                        // Initial retry delay
    factor: 2,                         // Exponential factor
    maxMs: 2000,                       // Maximum delay
    jitter: true,                      // Add randomness
  },

  // Lifecycle callbacks
  afterCommit: () => {
    console.log('Transaction committed')
    invalidateCache()
  },
  onRollback: (error) => {
    console.log('Transaction rolled back:', error)
  },
  onRetry: (attempt, error) => {
    console.log(`Retry attempt ${attempt}:`, error.message)
  },
})

// Savepoints
await db.transaction(async (tx) => {
  await tx.insertInto('users').values({ name: 'John' }).execute()

  await tx.savepoint(async (sp) => {
    await sp.insertInto('profiles').values({ user_id: 1 }).execute()
    // If this fails, only savepoint is rolled back
  })
})

// Transactional wrapper (creates function that runs in transaction)
const createOrderWithItems = db.transactional(
  async (tx, userId: number, items: OrderItem[]) => {
    const order = await tx.create('orders', { user_id: userId, total: 0 })
    await tx.createMany('order_items', items.map(i => ({ ...i, order_id: order.id })))
    return order
  },
  { retries: 3 }
)

// Usage: automatically wrapped in transaction
const order = await createOrderWithItems(userId, items)
```

## Migrations

### Auto-Generated Migrations

Migrations are automatically generated from your model definitions:

```bash
# Generate migrations from models
buddy migrate:generate

# Run pending migrations
buddy migrate

# Rollback last migration
buddy migrate:rollback

# Rollback multiple steps
buddy migrate:rollback --steps 3

# Fresh database (drop all + migrate)
buddy migrate:fresh

# Migration status
buddy migrate:status
```

### Migration Files

```typescript
// database/migrations/2024_01_15_000000_create_users_table.ts
import { Migration, Schema } from '@stacksjs/database'

export default class CreateUsersTable extends Migration {
  async up(schema: Schema) {
    await schema.create('users', (table) => {
      table.id()                                    // bigint primary key
      table.string('name')
      table.string('email').unique()
      table.string('password')
      table.enum('role', ['user', 'admin', 'moderator']).default('user')
      table.integer('age').default(0)
      table.json('settings').default('{}')
      table.text('bio').nullable()
      table.timestamp('email_verified_at').nullable()
      table.timestamps()                            // created_at, updated_at
      table.softDeletes()                           // deleted_at

      // Indexes
      table.index('role')
      table.index(['role', 'created_at'])
    })
  }

  async down(schema: Schema) {
    await schema.drop('users')
  }
}
```

### Schema Builder Methods

```typescript
// Column types
table.id()                          // BIGINT PRIMARY KEY AUTO_INCREMENT
table.string('name', 255)           // VARCHAR(255)
table.text('content')               // TEXT
table.integer('count')              // INTEGER
table.bigInteger('big_count')       // BIGINT
table.float('price')                // FLOAT
table.double('precise_price')       // DOUBLE
table.decimal('amount', 10, 2)      // DECIMAL(10,2)
table.boolean('active')             // BOOLEAN
table.date('birth_date')            // DATE
table.datetime('event_at')          // DATETIME
table.timestamp('created_at')       // TIMESTAMP
table.time('start_time')            // TIME
table.json('metadata')              // JSON
table.enum('status', ['a', 'b'])    // ENUM or TEXT

// Modifiers
.nullable()                         // Allow NULL
.default(value)                     // Default value
.unique()                           // Unique constraint
.primary()                          // Primary key
.unsigned()                         // Unsigned integer
.autoIncrement()                    // Auto increment

// Foreign keys
table.foreignId('user_id').references('id').on('users').onDelete('CASCADE')

// Indexes
table.index('column')
table.index(['col1', 'col2'])
table.unique('column')
table.unique(['col1', 'col2'])
```

## Seeders

### Creating Seeders

```bash
buddy make:seeder User
```

```typescript
// database/seeders/UserSeeder.ts
import { Seeder } from '@stacksjs/database'
import { faker } from '@faker-js/faker'

export default class UserSeeder extends Seeder {
  // Execution order (lower = earlier)
  get order() { return 10 }

  get description() { return 'Seed users table with test data' }

  async run(db: any) {
    // Create admin user
    await db.insertInto('users').values({
      name: 'Admin',
      email: 'admin@example.com',
      password: await hash('password'),
      role: 'admin',
      email_verified_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    }).execute()

    // Create fake users
    const users = Array.from({ length: 50 }, () => ({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await hash('password'),
      role: faker.helpers.arrayElement(['user', 'moderator']),
      age: faker.number.int({ min: 18, max: 80 }),
      bio: faker.lorem.paragraph(),
      created_at: faker.date.past(),
      updated_at: new Date(),
    }))

    await db.insertInto('users').values(users).execute()
  }
}
```

### Running Seeders

```bash
# Run all seeders
buddy seed

# Run specific seeder
buddy seed --class UserSeeder

# Fresh database + seed
buddy db:fresh
```

## Model Hooks

Lifecycle hooks allow you to execute code before/after database operations:

```typescript
const db = createQueryBuilder({
  schema,
  meta,

  hooks: {
    // Before creating a record
    beforeCreate: async ({ table, data }) => {
      if (table === 'users') {
        data.password = await hash(data.password)
        data.created_at = new Date()
      }
    },

    // After creating a record
    afterCreate: async ({ table, data, result }) => {
      if (table === 'users') {
        await sendWelcomeEmail(result.email)
        await createDefaultSettings(result.id)
      }
    },

    // Before updating
    beforeUpdate: async ({ table, data, where }) => {
      data.updated_at = new Date()
    },

    // After updating
    afterUpdate: async ({ table, data, where, result }) => {
      if (table === 'users' && data.email) {
        await sendEmailChangeNotification(result)
      }
    },

    // Before deleting
    beforeDelete: async ({ table, where }) => {
      // Archive before deleting
    },

    // After deleting
    afterDelete: async ({ table, where, result }) => {
      await clearCache(`${table}:*`)
    },

    // Query lifecycle
    onQueryStart: ({ sql, params }) => {
      console.log('Executing:', sql)
    },

    onQueryEnd: ({ sql, duration }) => {
      if (duration > 100) {
        console.warn('Slow query:', sql, `${duration}ms`)
      }
    },

    onQueryError: ({ sql, error }) => {
      console.error('Query failed:', sql, error)
    },
  },
})
```

## Query Caching

Built-in LRU cache for query results:

```typescript
// Enable caching for a query (default 60s TTL)
const users = await db.selectFrom('users')
  .where('active', '=', true)
  .cache()
  .execute()

// Custom TTL
const users = await db.selectFrom('users')
  .cache(300_000)  // 5 minutes
  .execute()

// Clear cache
clearQueryCache()

// Configure cache size
setQueryCacheMaxSize(200)  // Default: 100
```

## Soft Deletes

```typescript
// Enable soft deletes in config
softDeletes: {
  enabled: true,
  column: 'deleted_at',
  defaultFilter: true,  // Auto-exclude deleted records
}

// Queries automatically exclude soft-deleted records
const users = await db.selectFrom('users').execute()
// WHERE deleted_at IS NULL is automatically added

// Include soft-deleted records
const allUsers = await db.selectFrom('users')
  .withTrashed()
  .execute()

// Only soft-deleted records
const deletedUsers = await db.selectFrom('users')
  .onlyTrashed()
  .execute()

// Soft delete a record
await db.deleteFrom('users').where('id', '=', 1).execute()
// Sets deleted_at = NOW() instead of deleting

// Force delete (actually remove)
await db.deleteFrom('users').where('id', '=', 1).forceDelete()

// Restore soft-deleted record
await db.updateTable('users')
  .set({ deleted_at: null })
  .where('id', '=', 1)
  .execute()
```

## Raw Queries

```typescript
// Tagged template (parameterized, safe)
const users = await db.sql`SELECT * FROM users WHERE id = ${userId}`

// Raw with parameters
const users = await db.raw('SELECT * FROM users WHERE role = ?', ['admin'])

// Unsafe raw SQL (use with caution)
const results = await db.unsafe('SELECT * FROM users')

// Execute SQL file
await db.file('./database/scripts/setup.sql')
```

## Debugging

```typescript
// Get SQL string
const sql = query.toSQL()
// "SELECT * FROM users WHERE role = ?"

// Get parameters
const params = query.toParams()
// ['admin']

// Log and continue
query.dump()

// Log and throw (die and dump)
query.dd()

// Explain query plan
const plan = await query.explain()

// Full query text (requires debug.captureText: true)
const text = query.toText()
```

## CLI Commands

```bash
# Model management
buddy make:model User
buddy model:show User

# Migrations
buddy migrate
buddy migrate:generate
buddy migrate:rollback
buddy migrate:fresh
buddy migrate:status

# Seeders
buddy seed
buddy make:seeder User
buddy db:fresh

# Database info
buddy db:info
buddy db:stats
buddy db:wipe --force

# Data import/export
buddy export users --format json
buddy import users data.json

# Interactive console
buddy tinker
```

## Performance

bun-query-builder is designed around Bun database primitives, prepared statements, and narrowly typed query composition. This guide does not publish cross-ORM multipliers because the prior figures lacked a pinned public harness in this repository.

Benchmark the application’s actual reads, writes, joins, transactions, relationship loading, and pagination with:

- pinned ORM/runtime/database versions;
- production-like data volume and indexes;
- identical query semantics and durability settings;
- warm-up policy and connection-pool configuration;
- latency percentiles, throughput, errors, CPU, and memory;
- public scripts and raw results.

Use query plans and query counts to catch missing indexes and N+1 access before micro-optimizing the query-builder layer.
