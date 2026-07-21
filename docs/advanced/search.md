---
title: Search Integration
description: Full-text search and search engines in Stacks.js
---

# Search Integration

Stacks.js provides flexible search capabilities from simple database queries to full-text search engines.

## Database Search

### Basic Search

```typescript
// Simple LIKE search
const users = await User
  .where('name', 'like', `%${query}%`)
  .orWhere('email', 'like', `%${query}%`)
  .get()

// Case-insensitive search
const posts = await Post
  .whereRaw('LOWER(title) LIKE ?', [`%${query.toLowerCase()}%`])
  .get()
```

### Full-Text Search (PostgreSQL)

```typescript
// Using PostgreSQL full-text search
const results = await Post
  .whereRaw(
    "to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', ?)",
    [query]
  )
  .orderByRaw(
    "ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', ?)) DESC",
    [query]
  )
  .get()
```

### Full-Text Search (MySQL)

```typescript
// Using MySQL FULLTEXT index
const results = await Post
  .whereRaw(
    "MATCH(title, content) AGAINST(? IN NATURAL LANGUAGE MODE)",
    [query]
  )
  .orderByRaw(
    "MATCH(title, content) AGAINST(? IN NATURAL LANGUAGE MODE) DESC",
    [query]
  )
  .get()
```

### SQLite FTS5

```typescript
// Create virtual table for FTS
await DB.raw(`
  CREATE VIRTUAL TABLE posts_fts USING fts5(
    title,
    content,
    content=posts,
    content_rowid=id
  )
`)

// Search using FTS5
const results = await DB.raw(`
  SELECT posts.*
  FROM posts_fts
  JOIN posts ON posts_fts.rowid = posts.id
  WHERE posts_fts MATCH ?
  ORDER BY rank
`, [query])
```

## Searchable Trait

### Making Models Searchable

```typescript
// app/Models/Post.ts
import { Model, Searchable } from '@stacksjs/orm'

export default class Post extends Model {
  use = [Searchable]

  // Define searchable fields
  static searchable = ['title', 'content', 'excerpt']

  // Optional: Weight fields differently
  static searchWeights = {
    title: 'A',      // Highest priority
    excerpt: 'B',    // Medium priority
    content: 'C',    // Lower priority
  }

  // Optional: Custom search configuration
  static searchConfig = {
    minLength: 3,
    fuzzy: true,
    highlight: true,
  }
}
```

### Using Searchable Models

```typescript
// Search posts
const results = await Post.search('typescript tutorial')

// With additional filters
const results = await Post
  .search('typescript')
  .where('published', true)
  .where('category_id', 5)
  .get()

// Paginated search
const results = await Post
  .search('typescript')
  .paginate(20)
```

## Search Drivers

### Configuration

```typescript
// config/search.ts
export default {
  // Default search driver
  default: 'database',

  drivers: {
    // Database driver (default)
    database: {
      driver: 'database',
    },

    // Meilisearch
    meilisearch: {
      driver: 'meilisearch',
      host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
      apiKey: process.env.MEILISEARCH_KEY,
    },

    // Typesense
    typesense: {
      driver: 'typesense',
      host: process.env.TYPESENSE_HOST || 'localhost',
      port: 8108,
      protocol: 'http',
      apiKey: process.env.TYPESENSE_KEY,
    },

    // Algolia
    algolia: {
      driver: 'algolia',
      appId: process.env.ALGOLIA_APP_ID,
      apiKey: process.env.ALGOLIA_API_KEY,
    },

    // Elasticsearch
    elasticsearch: {
      driver: 'elasticsearch',
      hosts: [process.env.ELASTICSEARCH_HOST || 'http://localhost:9200'],
      username: process.env.ELASTICSEARCH_USER,
      password: process.env.ELASTICSEARCH_PASSWORD,
    },
  }
}
```

### Model-Specific Drivers

```typescript
// app/Models/Product.ts
export default class Product extends Model {
  use = [Searchable]

  // Use a specific search driver for this model
  static searchDriver = 'meilisearch'

  static searchable = ['name', 'description', 'sku']
}
```

## Meilisearch Integration

### Setup

```bash
# Start Meilisearch with Pantry
pantry install meilisearch
pantry service start meilisearch
```

### Index Configuration

```typescript
// app/Models/Product.ts
export default class Product extends Model {
  use = [Searchable]

  static searchDriver = 'meilisearch'
  static searchable = ['name', 'description', 'category', 'brand']

  // Meilisearch-specific settings
  static searchSettings = {
    filterableAttributes: ['category', 'brand', 'price', 'in_stock'],
    sortableAttributes: ['price', 'created_at', 'popularity'],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness',
    ],
  }

  // Transform data for search index
  toSearchableArray() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category?.name,
      brand: this.brand?.name,
      price: this.price,
      in_stock: this.stock > 0,
    }
  }
}
```

### Search with Filters

```typescript
// Search with facets and filters
const results = await Product
  .search('laptop')
  .filter('category = "Electronics"')
  .filter('price < 1000')
  .filter('in_stock = true')
  .sort('price:asc')
  .get()

// Get facet counts
const { results, facets } = await Product
  .search('laptop')
  .facets(['category', 'brand'])
  .get()

// facets = { category: { Electronics: 50, ... }, brand: { Apple: 20, ... } }
```

## Typesense Integration

### Setup

```bash
# Start Typesense with Docker
docker run -d -p 8108:8108 \
  -v typesense-data:/data \
  typesense/typesense:latest \
  --api-key=xyz123 \
  --data-dir=/data
```

### Collection Schema

```typescript
// app/Models/Article.ts
export default class Article extends Model {
  use = [Searchable]

  static searchDriver = 'typesense'

  // Typesense schema definition
  static searchSchema = {
    fields: [
      { name: 'title', type: 'string' },
      { name: 'content', type: 'string' },
      { name: 'author', type: 'string', facet: true },
      { name: 'tags', type: 'string[]', facet: true },
      { name: 'published_at', type: 'int64' },
      { name: 'views', type: 'int32' },
    ],
    default_sorting_field: 'published_at',
  }

  toSearchableArray() {
    return {
      id: String(this.id),
      title: this.title,
      content: this.content,
      author: this.author?.name || '',
      tags: this.tags?.map(t => t.name) || [],
      published_at: this.published_at?.getTime() || 0,
      views: this.views || 0,
    }
  }
}
```

### Geo Search

```typescript
// Search with geo-filtering (Typesense)
const results = await Store
  .search('coffee')
  .filterBy('location:(48.8566, 2.3522, 10 km)') // Paris, 10km radius
  .get()
```

## Indexing

### Manual Indexing

```bash
# Index all searchable models
buddy search:index

# Index specific model
buddy search:index Post

# Clear and reindex
buddy search:flush Post
buddy search:index Post
```

### Automatic Indexing

```typescript
// Models are indexed automatically on save/delete
const post = await Post.create({
  title: 'New Post',
  content: 'Content here...',
})
// Automatically indexed

await post.update({ title: 'Updated Title' })
// Index updated

await post.delete()
// Removed from index
```

### Queue Indexing

```typescript
// config/search.ts
export default {
  // Queue index operations for better performance
  queue: true,
  queueConnection: 'redis',
}

// Index operations are now queued
// Great for bulk imports
```

### Bulk Indexing

```typescript
// Efficient bulk indexing
await Post.chunk(1000, async (posts) => {
  await Search.indexMany('posts', posts.map(p => p.toSearchableArray()))
})

// Or use the import command
// buddy search:import Post --chunk=1000
```

## Search API

### Basic Search Endpoint

```typescript
// routes/api.ts
router.get('/search', async (request) => {
  const { q, type = 'all', page = 1, limit = 20 } = request.query

  if (!q || q.length < 2) {
    return { results: [], total: 0 }
  }

  const results = {}

  if (type === 'all' || type === 'posts') {
    results.posts = await Post.search(q).limit(limit).get()
  }

  if (type === 'all' || type === 'products') {
    results.products = await Product.search(q).limit(limit).get()
  }

  if (type === 'all' || type === 'users') {
    results.users = await User.search(q).limit(limit).get()
  }

  return results
})
```

### Advanced Search Endpoint

```typescript
// routes/api.ts
router.post('/search/advanced', async (request) => {
  const {
    query,
    filters = {},
    sort = 'relevance',
    page = 1,
    limit = 20,
  } = request.body

  let search = Product.search(query)

  // Apply filters
  if (filters.category) {
    search = search.filter(`category = "${filters.category}"`)
  }

  if (filters.priceMin) {
    search = search.filter(`price >= ${filters.priceMin}`)
  }

  if (filters.priceMax) {
    search = search.filter(`price <= ${filters.priceMax}`)
  }

  if (filters.inStock) {
    search = search.filter('in_stock = true')
  }

  // Apply sorting
  switch (sort) {
    case 'price_asc':
      search = search.sort('price:asc')
      break
    case 'price_desc':
      search = search.sort('price:desc')
      break
    case 'newest':
      search = search.sort('created_at:desc')
      break
    case 'popular':
      search = search.sort('sales:desc')
      break
  }

  // Paginate
  const results = await search.paginate(limit, page)

  return results
})
```

## Search UI

### Search Component

```stx
<!-- components/SearchBox.stx -->
<template>
  <div class="relative">
    <input
      type="search"
      v-model="query"
      @input="debouncedSearch"
      placeholder="Search..."
      class="w-full px-4 py-2 border rounded-lg"
      aria-label="Search"
    />

    <!-- Results dropdown -->
    <div
      v-if="showResults && results.length"
      class="absolute w-full mt-2 bg-white border rounded-lg shadow-lg"
    >
      <a
        v-for="result in results"
        :key="result.id"
        :href="result.url"
        class="block px-4 py-2 hover:bg-gray-100"
      >
        <span v-html="highlight(result.title, query)"></span>
        <span class="text-sm text-gray-500">{{ result.type }}</span>
      </a>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="absolute right-3 top-2">
      <x-spinner size="sm" />
    </div>
  </div>
</template>

<script>
import { debounce } from '@stacksjs/utils'

export default {
  data() {
    return {
      query: '',
      results: [],
      loading: false,
      showResults: false,
    }
  },

  methods: {
    debouncedSearch: debounce(async function() {
      if (this.query.length < 2) {
        this.results = []
        return
      }

      this.loading = true

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(this.query)}`)
        this.results = await response.json()
        this.showResults = true
      } finally {
        this.loading = false
      }
    }, 300),

    highlight(text, query) {
      const regex = new RegExp(`(${query})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    }
  }
}
</script>
```

### Faceted Search UI

```stx
<!-- components/FacetedSearch.stx -->
<template>
  <div class="flex gap-6">
    <!-- Filters sidebar -->
    <aside class="w-64">
      <div v-for="(values, facet) in facets" :key="facet" class="mb-6">
        <h3 class="font-semibold mb-2">{{ facet }}</h3>
        <label
          v-for="(count, value) in values"
          :key="value"
          class="flex items-center gap-2"
        >
          <input
            type="checkbox"
            :checked="isSelected(facet, value)"
            @change="toggleFilter(facet, value)"
          />
          <span>{{ value }}</span>
          <span class="text-gray-400">({{ count }})</span>
        </label>
      </div>
    </aside>

    <!-- Results -->
    <main class="flex-1">
      <div class="grid grid-cols-3 gap-4">
        <x-product-card
          v-for="product in results"
          :key="product.id"
          :product="product"
        />
      </div>
    </main>
  </div>
</template>
```

## Search Analytics

### Tracking Searches

```typescript
// Log search queries for analytics
router.get('/search', async (request) => {
  const { q } = request.query

  // Track search
  await SearchLog.create({
    query: q,
    user_id: request.user?.id,
    results_count: results.length,
    ip: request.ip,
  })

  return results
})
```

### Popular Searches

```typescript
// Get popular searches
const popular = await SearchLog
  .select('query')
  .selectRaw('COUNT(*) as count')
  .where('created_at', '>', dayjs().subtract(7, 'days'))
  .groupBy('query')
  .orderBy('count', 'desc')
  .limit(10)
  .get()
```

### Zero-Result Queries

```typescript
// Find searches with no results (opportunity for content)
const zeroResults = await SearchLog
  .select('query')
  .selectRaw('COUNT(*) as count')
  .where('results_count', 0)
  .groupBy('query')
  .orderBy('count', 'desc')
  .limit(20)
  .get()
```
