---
title: SEO
description: Search engine optimization with Stacks.js
---

# SEO

Stacks.js provides tools and patterns for optimizing your application for search engines.

## Meta Tags

### Basic Meta Tags

```stx
<!-- resources/views/layouts/app.stx -->
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <title>{{ $title ?? config('app.name') }}</title>
  <meta name="description" content="{{ $description ?? config('app.description') }}" />

  <!-- Canonical URL -->
  <link rel="canonical" href="{{ url()->current() }}" />

  <!-- Robots -->
  <meta name="robots" content="{{ $robots ?? 'index, follow' }}" />
</head>
```

### SEO Component

```stx
<!-- components/Seo.stx -->
<template>
  <title>{{ title }} | {{ siteName }}</title>
  <meta name="description" :content="description" />
  <link rel="canonical" :href="canonical" />

  <!-- Open Graph -->
  <meta property="og:title" :content="title" />
  <meta property="og:description" :content="description" />
  <meta property="og:url" :content="canonical" />
  <meta property="og:type" :content="type" />
  <meta property="og:image" :content="image" />
  <meta property="og:site_name" :content="siteName" />

  <!-- Twitter -->
  <meta name="twitter:card" :content="twitterCard" />
  <meta name="twitter:title" :content="title" />
  <meta name="twitter:description" :content="description" />
  <meta name="twitter:image" :content="image" />
  @if(twitterSite)
    <meta name="twitter:site" :content="twitterSite" />
  @endif
</template>

<script>
export default {
  props: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    canonical: { type: String, default: null },
    type: { type: String, default: 'website' },
    image: { type: String, default: null },
    twitterCard: { type: String, default: 'summary_large_image' },
    twitterSite: { type: String, default: null },
  },

  computed: {
    siteName() {
      return config('app.name')
    }
  }
}
</script>
```

### Page Usage

```stx
<!-- resources/views/pages/blog/[slug].stx -->
<x-layout>
  <x-seo
    :title="post.title"
    :description="post.excerpt"
    :canonical="route('blog.show', post.slug)"
    type="article"
    :image="post.featured_image"
  />

  <article>
    <h1>{{ post.title }}</h1>
    {{ post.content }}
  </article>
</x-layout>
```

## Structured Data

### JSON-LD Schema

```stx
<!-- Organization -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "{{ config('app.name') }}",
  "url": "{{ config('app.url') }}",
  "logo": "{{ asset('images/logo.png') }}",
  "sameAs": [
    "https://twitter.com/yourcompany",
    "https://github.com/yourcompany"
  ]
}
</script>

<!-- Article -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{ post.title }}",
  "description": "{{ post.excerpt }}",
  "image": "{{ post.featured_image }}",
  "author": {
    "@type": "Person",
    "name": "{{ post.author.name }}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "{{ config('app.name') }}",
    "logo": {
      "@type": "ImageObject",
      "url": "{{ asset('images/logo.png') }}"
    }
  },
  "datePublished": "{{ post.published_at.toISOString() }}",
  "dateModified": "{{ post.updated_at.toISOString() }}"
}
</script>
```

### Schema Component

```stx
<!-- components/Schema.stx -->
<template>
  <script type="application/ld+json">{{ jsonLd }}</script>
</template>

<script>
export default {
  props: {
    type: { type: String, required: true },
    data: { type: Object, required: true },
  },

  computed: {
    jsonLd() {
      return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': this.type,
        ...this.data,
      })
    }
  }
}
</script>

<!-- Usage -->
<x-schema
  type="Product"
  :data="{
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    }
  }"
/>
```

### Breadcrumb Schema

```stx
<x-schema
  type="BreadcrumbList"
  :data="{
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  }"
/>
```

## Sitemaps

### Automatic Sitemap Generation

```typescript
// config/seo.ts
export default {
  sitemap: {
    enabled: true,
    path: '/sitemap.xml',

    // Static routes
    routes: [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/about', changefreq: 'monthly', priority: 0.8 },
      { url: '/contact', changefreq: 'monthly', priority: 0.8 },
    ],

    // Dynamic routes
    dynamic: [
      {
        model: 'Post',
        url: (post) => `/blog/${post.slug}`,
        lastmod: (post) => post.updated_at,
        changefreq: 'weekly',
        priority: 0.6,
      },
      {
        model: 'Product',
        url: (product) => `/products/${product.slug}`,
        lastmod: (product) => product.updated_at,
        changefreq: 'daily',
        priority: 0.7,
      },
    ],
  }
}
```

### Generate Sitemap

```bash
# Generate sitemap
buddy seo:sitemap

# Auto-generate on deploy
# (configured in deployment pipeline)
```

### Sitemap Index (Large Sites)

```typescript
// config/seo.ts
export default {
  sitemap: {
    index: true, // Generate sitemap index for large sites
    maxUrls: 50000, // Max URLs per sitemap file
  }
}
```

## Robots.txt

### Configuration

```typescript
// config/seo.ts
export default {
  robots: {
    enabled: true,

    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/private'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 1,
      },
    ],

    sitemap: 'https://yoursite.com/sitemap.xml',
  }
}
```

### Dynamic Robots.txt

```typescript
// routes/web.ts
router.get('/robots.txt', (request) => {
  const rules = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api',
    '',
    `Sitemap: ${config('app.url')}/sitemap.xml`,
  ]

  return new Response(rules.join('\n'), {
    headers: { 'Content-Type': 'text/plain' },
  })
})
```

## URL Structure

### Clean URLs

```typescript
// routes/web.ts
// GOOD: Clean, descriptive URLs
router.get('/products/:category/:slug', ProductController.show)
// /products/electronics/wireless-headphones

// BAD: Parameter-based URLs
router.get('/product', ProductController.show)
// /product?id=123&cat=5
```

### Slug Generation

```typescript
// app/Models/Post.ts
import { slugify } from '@stacksjs/strings'

export default class Post extends Model {
  static boot() {
    this.creating((post) => {
      post.slug = slugify(post.title)
    })
  }
}
```

### Canonical URLs

```stx
<!-- Prevent duplicate content -->
<link rel="canonical" href="{{ url()->current() }}" />

<!-- For paginated content -->
@if(page > 1)
  <link rel="canonical" href="{{ route('blog.index') }}" />
@endif
```

## Performance for SEO

### Core Web Vitals

```typescript
// config/seo.ts
export default {
  performance: {
    // Optimize for Core Web Vitals
    preconnect: [
      'https://fonts.googleapis.com',
      'https://cdn.example.com',
    ],
    prefetch: [
      '/api/critical-data',
    ],
  }
}
```

```stx
<head>
  <!-- Preconnect to critical origins -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

  <!-- Preload critical assets -->
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />

  <!-- DNS prefetch for third parties -->
  <link rel="dns-prefetch" href="https://analytics.example.com" />
</head>
```

### Image Optimization

```stx
<!-- Responsive images with proper attributes -->
<img
  src="{{ $image->url('medium') }}"
  srcset="
    {{ $image->url('small') }} 400w,
    {{ $image->url('medium') }} 800w,
    {{ $image->url('large') }} 1200w
  "
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  alt="{{ $image->alt }}"
  loading="lazy"
  decoding="async"
  width="800"
  height="600"
/>
```

### Server-Side Rendering

Stacks renders pages server-side by default, ensuring search engines see full content:

```typescript
// All STX pages are SSR by default
// No additional configuration needed

// For dynamic content, ensure it's rendered server-side
export async function getServerSideProps() {
  const posts = await Post.published().get()
  return { posts }
}
```

## Social Sharing

### Open Graph

```stx
<!-- Open Graph meta tags -->
<meta property="og:title" content="{{ $title }}" />
<meta property="og:description" content="{{ $description }}" />
<meta property="og:image" content="{{ $image }}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="{{ url()->current() }}" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="en_US" />
```

### Twitter Cards

```stx
<!-- Twitter Card meta tags -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@yourhandle" />
<meta name="twitter:title" content="{{ $title }}" />
<meta name="twitter:description" content="{{ $description }}" />
<meta name="twitter:image" content="{{ $image }}" />
```

### OG Image Generation

```typescript
// routes/api.ts
router.get('/og-image/:slug', async (request) => {
  const { slug } = request.params
  const post = await Post.where('slug', slug).first()

  const image = await generateOgImage({
    title: post.title,
    author: post.author.name,
    date: post.published_at,
  })

  return new Response(image, {
    headers: { 'Content-Type': 'image/png' },
  })
})
```

## Internationalization SEO

### Hreflang Tags

```stx
<link rel="alternate" hreflang="en" href="{{ route('home', [], 'en') }}" />
<link rel="alternate" hreflang="es" href="{{ route('home', [], 'es') }}" />
<link rel="alternate" hreflang="fr" href="{{ route('home', [], 'fr') }}" />
<link rel="alternate" hreflang="x-default" href="{{ route('home') }}" />
```

### Language-Specific Sitemaps

```typescript
// config/seo.ts
export default {
  sitemap: {
    locales: ['en', 'es', 'fr'],
    generatePerLocale: true,
  }
}
```

## Analytics Integration

### Google Analytics 4

```stx
<!-- Global site tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXX');
</script>
```

### Google Search Console

```bash
# Verify site ownership
# Add verification file or meta tag

# Submit sitemap
buddy seo:submit-sitemap
```

## SEO Checklist

### Technical SEO
- [ ] Clean, descriptive URLs
- [ ] Proper heading hierarchy (H1-H6)
- [ ] XML sitemap generated and submitted
- [ ] robots.txt configured
- [ ] Canonical URLs set
- [ ] HTTPS enabled
- [ ] Mobile-responsive design

### On-Page SEO
- [ ] Unique title tags (50-60 characters)
- [ ] Meta descriptions (150-160 characters)
- [ ] Proper image alt text
- [ ] Internal linking strategy
- [ ] External links to authoritative sources

### Performance
- [ ] Core Web Vitals passing
- [ ] Images optimized
- [ ] CSS/JS minified
- [ ] Caching configured
- [ ] CDN for static assets

### Content
- [ ] Structured data implemented
- [ ] Fresh, quality content
- [ ] Proper keyword usage
- [ ] Mobile-friendly formatting
