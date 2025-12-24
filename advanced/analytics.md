---
title: Analytics
description: Track and analyze user behavior with Stacks.js Analytics
---

# Analytics

Stacks.js Analytics provides unified tracking across multiple analytics providers, privacy-first event collection, and built-in reporting dashboards.

## Configuration

### Analytics Configuration

```typescript
// config/analytics.ts
export default {
  // Default provider
  default: 'internal',

  // Analytics providers
  providers: {
    // Built-in analytics
    internal: {
      enabled: true,
      retention: 90, // Days to keep data
      sampling: 1.0, // 100% of events
    },

    // Google Analytics 4
    google: {
      enabled: process.env.NODE_ENV === 'production',
      measurementId: process.env.GA_MEASUREMENT_ID,
      debug: process.env.NODE_ENV !== 'production',
    },

    // Plausible (privacy-focused)
    plausible: {
      enabled: true,
      domain: 'myapp.com',
      apiHost: 'https://plausible.io',
    },

    // Mixpanel
    mixpanel: {
      enabled: true,
      token: process.env.MIXPANEL_TOKEN,
    },

    // PostHog
    posthog: {
      enabled: true,
      apiKey: process.env.POSTHOG_API_KEY,
      host: 'https://app.posthog.com',
    },

    // Amplitude
    amplitude: {
      enabled: true,
      apiKey: process.env.AMPLITUDE_API_KEY,
    },
  },

  // Privacy settings
  privacy: {
    anonymizeIp: true,
    respectDoNotTrack: true,
    cookieConsent: true,
    dataRetention: 365, // Days
  },

  // Auto-tracking
  autoTrack: {
    pageViews: true,
    clicks: true,
    forms: true,
    scrollDepth: true,
    outboundLinks: true,
    fileDownloads: true,
    errors: true,
  },

  // Excluded paths
  exclude: ['/admin/*', '/api/*', '/health'],

  // Custom dimensions
  dimensions: {
    user_type: 'dimension1',
    subscription_plan: 'dimension2',
  },
}
```

## Basic Tracking

### Page Views

```typescript
import { Analytics } from '@stacksjs/analytics'

// Track page view (automatic with autoTrack.pageViews)
Analytics.pageView()

// With custom data
Analytics.pageView({
  title: 'Product Page',
  path: '/products/widget',
  referrer: document.referrer,
})
```

### Events

```typescript
// Track custom event
Analytics.track('button_click', {
  button_id: 'signup',
  page: '/pricing',
})

// E-commerce events
Analytics.track('product_viewed', {
  product_id: 'SKU123',
  name: 'Premium Widget',
  price: 99.99,
  category: 'Widgets',
})

Analytics.track('add_to_cart', {
  product_id: 'SKU123',
  quantity: 2,
  value: 199.98,
})

Analytics.track('purchase', {
  transaction_id: 'TXN123',
  value: 199.98,
  currency: 'USD',
  items: [
    { id: 'SKU123', name: 'Premium Widget', quantity: 2, price: 99.99 },
  ],
})
```

### User Identification

```typescript
// Identify user
Analytics.identify(user.id, {
  email: user.email,
  name: user.name,
  plan: user.subscription?.plan,
  created_at: user.created_at,
})

// Set user properties
Analytics.setUserProperties({
  plan: 'pro',
  company_size: '10-50',
})

// Reset on logout
Analytics.reset()
```

## Frontend Integration

### Script Injection

```stx
<!-- layouts/app.stx -->
<head>
  <!-- Analytics script (auto-injected in production) -->
  @if(config('analytics.providers.google.enabled'))
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('analytics.providers.google.measurementId') }}"></script>
  @endif

  <!-- Or use built-in analytics -->
  <x-analytics-script />
</head>
```

### Analytics Component

```stx
<!-- Auto-tracking component -->
<x-analytics
  :track-page-views="true"
  :track-clicks="true"
  :track-forms="true"
/>

<!-- Tracked element -->
<button
  data-analytics-event="signup_click"
  data-analytics-location="header"
>
  Sign Up
</button>

<!-- Tracked link -->
<a
  href="/pricing"
  data-analytics-event="view_pricing"
  data-analytics-source="homepage"
>
  View Pricing
</a>
```

### React/Vue Integration

```typescript
// Composable for Vue/React
import { useAnalytics } from '@stacksjs/analytics'

export function ProductPage() {
  const analytics = useAnalytics()

  useEffect(() => {
    analytics.track('product_page_viewed', {
      product_id: product.id,
    })
  }, [])

  const handleAddToCart = () => {
    analytics.track('add_to_cart', {
      product_id: product.id,
      value: product.price,
    })
    // ... add to cart logic
  }

  return (
    <button onClick={handleAddToCart}>Add to Cart</button>
  )
}
```

## Server-Side Tracking

### Track from Backend

```typescript
import { Analytics } from '@stacksjs/analytics'

// Track server-side event
await Analytics.serverTrack('api_request', {
  endpoint: '/api/users',
  method: 'POST',
  status: 200,
  duration: 45,
}, {
  userId: request.user?.id,
  ip: request.ip,
  userAgent: request.headers.get('user-agent'),
})

// Track conversion
await Analytics.serverTrack('subscription_created', {
  plan: 'pro',
  value: 99,
  currency: 'USD',
}, { userId: user.id })
```

### Middleware Tracking

```typescript
// app/Middleware/TrackRequests.ts
export async function trackRequests(request: Request, next: Next) {
  const startTime = Date.now()

  const response = await next()

  const duration = Date.now() - startTime

  await Analytics.serverTrack('http_request', {
    path: request.path,
    method: request.method,
    status: response.status,
    duration,
  }, {
    userId: request.user?.id,
  })

  return response
}
```

## Funnel Analysis

### Define Funnels

```typescript
// config/analytics.ts
export default {
  funnels: {
    signup: {
      name: 'Signup Funnel',
      steps: [
        { event: 'landing_page_viewed' },
        { event: 'signup_started' },
        { event: 'email_entered' },
        { event: 'account_created' },
        { event: 'onboarding_completed' },
      ],
    },

    purchase: {
      name: 'Purchase Funnel',
      steps: [
        { event: 'product_viewed' },
        { event: 'add_to_cart' },
        { event: 'checkout_started' },
        { event: 'payment_entered' },
        { event: 'purchase_completed' },
      ],
    },
  },
}
```

### Funnel Analytics

```typescript
import { FunnelAnalytics } from '@stacksjs/analytics'

// Get funnel conversion rates
const funnel = await FunnelAnalytics.analyze('signup', {
  from: dayjs().subtract(30, 'days'),
  to: dayjs(),
})

// {
//   steps: [
//     { name: 'landing_page_viewed', count: 10000, rate: 100 },
//     { name: 'signup_started', count: 3000, rate: 30 },
//     { name: 'email_entered', count: 2500, rate: 25 },
//     { name: 'account_created', count: 2000, rate: 20 },
//     { name: 'onboarding_completed', count: 1500, rate: 15 },
//   ],
//   overallConversion: 15,
//   dropoffPoints: [
//     { from: 'landing_page_viewed', to: 'signup_started', dropoff: 70 },
//   ],
// }
```

## Cohort Analysis

```typescript
import { CohortAnalytics } from '@stacksjs/analytics'

// Retention cohort
const retention = await CohortAnalytics.retention({
  cohortEvent: 'signup',
  returnEvent: 'login',
  period: 'week',
  cohorts: 8, // Last 8 weeks
})

// {
//   cohorts: [
//     { week: '2024-01-01', users: 500, retention: [100, 60, 45, 40, 38, 35, 33, 30] },
//     { week: '2024-01-08', users: 550, retention: [100, 58, 42, 38, 35, 32, 30] },
//     ...
//   ],
// }
```

## A/B Testing

### Define Experiments

```typescript
import { Experiment } from '@stacksjs/analytics'

// Create experiment
const experiment = await Experiment.create({
  name: 'pricing_page_v2',
  variants: [
    { id: 'control', weight: 50 },
    { id: 'variant_a', weight: 50 },
  ],
  goals: ['signup', 'purchase'],
})

// Get variant for user
const variant = await experiment.getVariant(userId)

// Track exposure
await experiment.trackExposure(userId, variant)

// Track conversion
await experiment.trackConversion(userId, 'signup')
```

### Experiment Component

```stx
<x-experiment name="hero_text">
  <template #control>
    <h1>Build Faster</h1>
  </template>

  <template #variant_a>
    <h1>Ship Products 10x Faster</h1>
  </template>

  <template #variant_b>
    <h1>The Framework for Modern Developers</h1>
  </template>
</x-experiment>
```

### Experiment Results

```typescript
const results = await Experiment.getResults('pricing_page_v2')

// {
//   variants: [
//     {
//       id: 'control',
//       exposures: 5000,
//       conversions: { signup: 500, purchase: 50 },
//       conversionRate: { signup: 10, purchase: 1 },
//     },
//     {
//       id: 'variant_a',
//       exposures: 5000,
//       conversions: { signup: 600, purchase: 65 },
//       conversionRate: { signup: 12, purchase: 1.3 },
//       improvement: { signup: 20, purchase: 30 },
//       significance: { signup: 0.95, purchase: 0.88 },
//     },
//   ],
//   winner: 'variant_a',
//   confidence: 0.95,
// }
```

## Real-Time Analytics

### Real-Time Dashboard

```typescript
import { RealTime } from '@stacksjs/analytics'

// Get current visitors
const current = await RealTime.getCurrentVisitors()
// { count: 127, pages: [...], sources: [...] }

// Subscribe to real-time events
RealTime.subscribe((event) => {
  console.log('New event:', event)
})

// Get live page views
const livePages = await RealTime.getLivePageViews()
// [{ path: '/', count: 45 }, { path: '/pricing', count: 23 }, ...]
```

### WebSocket Real-Time

```typescript
// Frontend
const ws = new WebSocket('/analytics/realtime')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)

  switch (data.type) {
    case 'visitor_count':
      updateVisitorCount(data.count)
      break
    case 'page_view':
      addPageView(data.page)
      break
    case 'event':
      addEvent(data.event)
      break
  }
}
```

## Reports & Dashboards

### Built-in Reports

```typescript
import { Reports } from '@stacksjs/analytics'

// Traffic report
const traffic = await Reports.traffic({
  from: startDate,
  to: endDate,
  groupBy: 'day',
})

// User behavior report
const behavior = await Reports.userBehavior({
  period: 'month',
})

// Conversion report
const conversions = await Reports.conversions({
  goals: ['signup', 'purchase'],
  period: 'week',
})

// Export report
const csv = await Reports.export('traffic', {
  format: 'csv',
  from: startDate,
  to: endDate,
})
```

### Custom Dashboard

```typescript
// routes/admin.ts
router.get('/analytics/dashboard', async (request) => {
  const [visitors, pageViews, events, topPages] = await Promise.all([
    Analytics.getVisitors({ period: 'today' }),
    Analytics.getPageViews({ period: 'today' }),
    Analytics.getEvents({ period: 'today' }),
    Analytics.getTopPages({ period: 'week', limit: 10 }),
  ])

  return view('admin/analytics', {
    visitors,
    pageViews,
    events,
    topPages,
  })
})
```

## Privacy & Compliance

### Cookie Consent

```stx
<x-cookie-consent
  :analytics="true"
  :marketing="true"
  @accept="initAnalytics"
  @decline="disableAnalytics"
>
  <template #message>
    We use cookies to improve your experience and analyze site usage.
  </template>
</x-cookie-consent>
```

### GDPR Compliance

```typescript
import { Analytics } from '@stacksjs/analytics'

// Check consent
if (await Analytics.hasConsent(userId)) {
  Analytics.track('page_view')
}

// Delete user data (right to be forgotten)
await Analytics.deleteUserData(userId)

// Export user data
const data = await Analytics.exportUserData(userId)

// Anonymize historical data
await Analytics.anonymizeUser(userId)
```

### Do Not Track

```typescript
// Respect DNT header
if (request.headers.get('DNT') === '1') {
  Analytics.disable()
}

// Or configure globally in config
export default {
  privacy: {
    respectDoNotTrack: true,
  },
}
```

## API Reference

### Query API

```typescript
// Query analytics data
const data = await Analytics.query({
  metrics: ['pageViews', 'uniqueVisitors', 'bounceRate'],
  dimensions: ['page', 'source', 'country'],
  filters: {
    page: { startsWith: '/blog' },
    country: { in: ['US', 'UK', 'CA'] },
  },
  dateRange: {
    from: '2024-01-01',
    to: '2024-01-31',
  },
  orderBy: { pageViews: 'desc' },
  limit: 100,
})
```

### Segments

```typescript
// Define user segments
const powerUsers = await Analytics.segment({
  name: 'Power Users',
  conditions: [
    { event: 'login', count: { gte: 10 }, period: 'month' },
    { property: 'plan', value: 'pro' },
  ],
})

// Query segment
const segmentData = await Analytics.querySegment(powerUsers.id, {
  metrics: ['revenue', 'sessions'],
})
```
