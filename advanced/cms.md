---
title: Content Management System
description: Build content-driven applications with Stacks.js CMS
---

# Content Management System

Stacks.js includes a flexible, headless CMS for building content-driven applications. It provides content modeling, media management, and a powerful API for content delivery.

## Configuration

### CMS Configuration

```typescript
// config/cms.ts
export default {
  // Enable CMS functionality
  enabled: true,

  // Admin panel path
  adminPath: '/admin',

  // API path for content
  apiPath: '/api/content',

  // Content storage
  storage: {
    driver: 'database', // 'database' | 'file' | 'git'
    connection: 'default',
  },

  // Media configuration
  media: {
    disk: 'public',
    path: 'media',
    allowedTypes: ['image/*', 'video/*', 'application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    transforms: {
      thumbnail: { width: 150, height: 150, fit: 'cover' },
      medium: { width: 600, height: 400, fit: 'inside' },
      large: { width: 1200, height: 800, fit: 'inside' },
    },
  },

  // Content versioning
  versioning: {
    enabled: true,
    maxVersions: 10,
  },

  // Draft/publish workflow
  workflow: {
    enabled: true,
    states: ['draft', 'review', 'published', 'archived'],
  },

  // Localization
  localization: {
    enabled: true,
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
  },
}
```

## Content Models

### Defining Collections

```typescript
// content/collections/posts.ts
import { defineCollection } from '@stacksjs/cms'

export default defineCollection({
  name: 'posts',
  label: 'Blog Posts',
  icon: 'document-text',

  // Slugs for URL generation
  slug: {
    field: 'title',
    prefix: '/blog/',
  },

  // Fields definition
  fields: [
    {
      name: 'title',
      type: 'string',
      label: 'Title',
      required: true,
      validation: 'required|min:3|max:200',
    },
    {
      name: 'slug',
      type: 'slug',
      label: 'URL Slug',
      from: 'title',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Excerpt',
      maxLength: 300,
    },
    {
      name: 'content',
      type: 'richtext',
      label: 'Content',
      required: true,
    },
    {
      name: 'featured_image',
      type: 'media',
      label: 'Featured Image',
      accept: 'image/*',
    },
    {
      name: 'author',
      type: 'relation',
      label: 'Author',
      collection: 'authors',
      displayField: 'name',
    },
    {
      name: 'categories',
      type: 'relation',
      label: 'Categories',
      collection: 'categories',
      multiple: true,
    },
    {
      name: 'tags',
      type: 'tags',
      label: 'Tags',
    },
    {
      name: 'published_at',
      type: 'datetime',
      label: 'Publish Date',
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'meta_title', type: 'string', label: 'Meta Title' },
        { name: 'meta_description', type: 'textarea', label: 'Meta Description' },
        { name: 'og_image', type: 'media', label: 'OG Image' },
      ],
    },
  ],

  // Default sorting
  defaultSort: { field: 'published_at', direction: 'desc' },

  // Enable features
  timestamps: true,
  softDeletes: true,
  versioning: true,
  localization: true,
})
```

### Field Types

```typescript
// Available field types
const fieldTypes = {
  // Text fields
  string: { maxLength: 255 },
  text: { rows: 3 },
  textarea: { rows: 5 },
  richtext: { toolbar: ['bold', 'italic', 'link', 'image'] },
  markdown: { preview: true },
  code: { language: 'typescript' },

  // Number fields
  number: { min: 0, max: 100, step: 1 },
  decimal: { precision: 2 },

  // Selection fields
  select: { options: ['option1', 'option2'] },
  radio: { options: ['option1', 'option2'] },
  checkbox: { },
  toggle: { },

  // Date/Time
  date: { format: 'YYYY-MM-DD' },
  datetime: { format: 'YYYY-MM-DD HH:mm' },
  time: { format: 'HH:mm' },

  // Media
  media: { accept: 'image/*', multiple: false },
  file: { accept: '*/*' },
  gallery: { accept: 'image/*' },

  // Relations
  relation: { collection: 'posts', multiple: false },

  // Special
  slug: { from: 'title' },
  tags: { suggestions: true },
  color: { format: 'hex' },
  json: { },
  blocks: { types: ['text', 'image', 'video'] },

  // Layout
  group: { fields: [] },
  repeater: { fields: [], min: 0, max: 10 },
}
```

### Singletons (Global Content)

```typescript
// content/singletons/settings.ts
import { defineSingleton } from '@stacksjs/cms'

export default defineSingleton({
  name: 'settings',
  label: 'Site Settings',

  fields: [
    {
      name: 'site_name',
      type: 'string',
      label: 'Site Name',
      required: true,
    },
    {
      name: 'logo',
      type: 'media',
      label: 'Logo',
    },
    {
      name: 'social',
      type: 'group',
      label: 'Social Links',
      fields: [
        { name: 'twitter', type: 'string', label: 'Twitter URL' },
        { name: 'facebook', type: 'string', label: 'Facebook URL' },
        { name: 'instagram', type: 'string', label: 'Instagram URL' },
      ],
    },
    {
      name: 'footer_text',
      type: 'richtext',
      label: 'Footer Text',
    },
  ],
})
```

## Content API

### Fetching Content

```typescript
import { Content } from '@stacksjs/cms'

// Get all posts
const posts = await Content.collection('posts').get()

// Get single post by slug
const post = await Content.collection('posts')
  .where('slug', 'my-post')
  .first()

// Get with relations
const post = await Content.collection('posts')
  .with('author', 'categories')
  .find(id)

// Filter and sort
const recentPosts = await Content.collection('posts')
  .where('status', 'published')
  .where('published_at', '<=', new Date())
  .orderBy('published_at', 'desc')
  .limit(10)
  .get()

// Pagination
const paginatedPosts = await Content.collection('posts')
  .where('status', 'published')
  .paginate(20, page)

// Search
const results = await Content.collection('posts')
  .search('typescript tutorial')
  .get()
```

### Fetching Singletons

```typescript
// Get singleton data
const settings = await Content.singleton('settings')

// Access fields
console.log(settings.site_name)
console.log(settings.social.twitter)
```

### Creating & Updating Content

```typescript
// Create new content
const post = await Content.collection('posts').create({
  title: 'My New Post',
  content: 'Post content here...',
  status: 'draft',
})

// Update content
await Content.collection('posts').update(id, {
  title: 'Updated Title',
})

// Publish content
await Content.collection('posts').publish(id)

// Unpublish
await Content.collection('posts').unpublish(id)

// Delete (soft delete if enabled)
await Content.collection('posts').delete(id)

// Restore
await Content.collection('posts').restore(id)

// Force delete
await Content.collection('posts').forceDelete(id)
```

### Versioning

```typescript
// Get version history
const versions = await Content.collection('posts')
  .versions(id)

// Restore specific version
await Content.collection('posts')
  .restoreVersion(id, versionId)

// Compare versions
const diff = await Content.collection('posts')
  .compareVersions(id, versionId1, versionId2)
```

### Localized Content

```typescript
// Get content in specific locale
const post = await Content.collection('posts')
  .locale('es')
  .find(id)

// Get all locales for content
const translations = await Content.collection('posts')
  .allLocales(id)

// Update specific locale
await Content.collection('posts')
  .locale('es')
  .update(id, { title: 'Título en español' })
```

## Media Management

### Uploading Media

```typescript
import { Media } from '@stacksjs/cms'

// Upload file
const media = await Media.upload(file, {
  folder: 'posts',
  alt: 'Image description',
})

// Upload with transforms
const media = await Media.upload(file, {
  transforms: ['thumbnail', 'medium', 'large'],
})

// Get transformed URL
media.url('thumbnail') // /media/posts/image-thumbnail.jpg
media.url('medium')    // /media/posts/image-medium.jpg
media.url()            // /media/posts/image.jpg (original)
```

### Media Library

```typescript
// Browse media
const files = await Media.browse({
  folder: 'posts',
  type: 'image',
  page: 1,
  limit: 50,
})

// Search media
const files = await Media.search('hero image')

// Get media by ID
const file = await Media.find(mediaId)

// Update media metadata
await Media.update(mediaId, {
  alt: 'Updated alt text',
  title: 'Image title',
})

// Delete media
await Media.delete(mediaId)

// Create folder
await Media.createFolder('products/2024')

// Move media
await Media.move(mediaId, 'new-folder')
```

## Admin Panel

### Accessing Admin

```typescript
// routes/web.ts
import { cmsRoutes } from '@stacksjs/cms'

// Mount CMS admin routes
router.group({ prefix: '/admin', middleware: ['auth', 'admin'] }, () => {
  cmsRoutes()
})
```

### Customizing Admin

```typescript
// config/cms.ts
export default {
  admin: {
    // Custom branding
    branding: {
      logo: '/images/admin-logo.svg',
      name: 'My CMS',
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      },
    },

    // Dashboard widgets
    dashboard: {
      widgets: [
        'recent-content',
        'content-stats',
        'media-usage',
        'activity-log',
      ],
    },

    // Navigation customization
    navigation: [
      { label: 'Dashboard', icon: 'home', link: '/admin' },
      { label: 'Content', icon: 'document', children: [
        { label: 'Posts', link: '/admin/posts' },
        { label: 'Pages', link: '/admin/pages' },
      ]},
      { label: 'Media', icon: 'photo', link: '/admin/media' },
      { label: 'Settings', icon: 'cog', link: '/admin/settings' },
    ],
  },
}
```

## Blocks Editor

### Defining Blocks

```typescript
// content/blocks/hero.ts
import { defineBlock } from '@stacksjs/cms'

export default defineBlock({
  name: 'hero',
  label: 'Hero Section',
  icon: 'sparkles',

  fields: [
    { name: 'heading', type: 'string', label: 'Heading' },
    { name: 'subheading', type: 'text', label: 'Subheading' },
    { name: 'image', type: 'media', label: 'Background Image' },
    { name: 'cta', type: 'group', label: 'Call to Action', fields: [
      { name: 'text', type: 'string', label: 'Button Text' },
      { name: 'url', type: 'string', label: 'Button URL' },
    ]},
  ],

  // Preview template
  preview: ({ heading, image }) => ({
    title: heading,
    image: image?.url,
  }),
})
```

### Using Blocks in Collections

```typescript
// content/collections/pages.ts
export default defineCollection({
  name: 'pages',
  label: 'Pages',

  fields: [
    { name: 'title', type: 'string', required: true },
    {
      name: 'content',
      type: 'blocks',
      label: 'Page Content',
      blocks: ['hero', 'text', 'image', 'gallery', 'cta', 'faq'],
    },
  ],
})
```

### Rendering Blocks

```stx
<!-- pages/[slug].stx -->
<template>
  <x-layout>
    <h1>{{ page.title }}</h1>

    @foreach(page.content as block)
      <x-block :type="block.type" :data="block.data" />
    @endforeach
  </x-layout>
</template>

<!-- components/blocks/hero.stx -->
<template>
  <section
    class="hero"
    :style="{ backgroundImage: `url(${data.image?.url})` }"
  >
    <h1>{{ data.heading }}</h1>
    <p>{{ data.subheading }}</p>
    @if(data.cta?.text)
      <a :href="data.cta.url" class="btn">{{ data.cta.text }}</a>
    @endif
  </section>
</template>
```

## Webhooks & Events

### Content Events

```typescript
// app/Listeners/ContentPublished.ts
import { ContentEvent } from '@stacksjs/cms'

export default {
  async handle(event: ContentEvent) {
    const { collection, entry, action } = event

    if (action === 'published') {
      // Trigger rebuild, notify subscribers, etc.
      await triggerStaticBuild()
      await notifySubscribers(entry)
    }
  }
}

// Register listener
Content.on('published', ContentPublished)
Content.on('updated', ContentUpdated)
Content.on('deleted', ContentDeleted)
```

### Webhooks

```typescript
// config/cms.ts
export default {
  webhooks: {
    endpoints: [
      {
        url: 'https://api.example.com/webhook',
        events: ['content.published', 'content.updated'],
        secret: process.env.WEBHOOK_SECRET,
      },
    ],
  },
}
```

## Static Generation

### Pre-rendering Content

```typescript
// Generate static pages from content
export async function generateStaticPaths() {
  const posts = await Content.collection('posts')
    .where('status', 'published')
    .get()

  return posts.map(post => ({
    params: { slug: post.slug },
  }))
}

export async function getStaticProps({ params }) {
  const post = await Content.collection('posts')
    .where('slug', params.slug)
    .with('author', 'categories')
    .first()

  return { post }
}
```

### Incremental Regeneration

```typescript
// config/cms.ts
export default {
  staticGeneration: {
    enabled: true,
    revalidate: 60, // Revalidate every 60 seconds
    onDemand: true, // Enable on-demand revalidation
  },
}

// Trigger revalidation
await Content.revalidate('/blog/my-post')
```

## Access Control

### Permissions

```typescript
// config/cms.ts
export default {
  roles: {
    admin: {
      permissions: ['*'],
    },
    editor: {
      permissions: [
        'content.read',
        'content.create',
        'content.update',
        'media.read',
        'media.upload',
      ],
    },
    author: {
      permissions: [
        'content.read',
        'content.create:own',
        'content.update:own',
      ],
    },
  },
}
```

### Collection-Level Permissions

```typescript
export default defineCollection({
  name: 'posts',

  access: {
    read: () => true, // Anyone can read
    create: ({ user }) => user.hasRole(['admin', 'editor', 'author']),
    update: ({ user, entry }) => {
      if (user.hasRole('admin')) return true
      return entry.author_id === user.id
    },
    delete: ({ user }) => user.hasRole('admin'),
    publish: ({ user }) => user.hasRole(['admin', 'editor']),
  },
})
```
