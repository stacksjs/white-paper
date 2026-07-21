---
title: Analytics
description: Audited analytics configuration and self-hosted client-script surfaces in Stacks.js, with explicit privacy and backend boundaries.
---

# Analytics

> **Maturity: Partial · verified against Stacks source `bf1245e3`**

The audited `@stacksjs/analytics` package exposes two small surfaces:

- a Fathom configuration/placeholder export;
- a self-hosted tracking-script generator.

It does not substantiate the former documentation’s internal analytics service, multi-provider `Analytics` facade, dashboard, retention engine, daily rotating visitor hashes, or built-in reporting API. This page documents the source that exists.

## Project configuration

The supplied application config selects a driver and provides driver-specific settings:

```typescript
// config/analytics.ts
import type { AnalyticsConfig } from '@stacksjs/types'

export default {
  driver: 'fathom',
  drivers: {
    googleAnalytics: {
      trackingId: 'UA-XXXXXXXXX-X',
    },
    fathom: {
      siteId: 'YOUR_SITE_ID',
    },
  },
} satisfies AnalyticsConfig
```

Configuration shape and package implementation are not the same thing. Verify the selected driver exports and network behavior before deployment.

## Self-hosted script generator

```typescript
import {
  generateSelfHostedScript,
  getSelfHostedAnalyticsHead,
} from '@stacksjs/analytics'

const script = generateSelfHostedScript({
  siteId: 'docs',
  apiEndpoint: 'https://analytics.example.com',
  honorDnt: true,
  trackHashChanges: false,
  trackOutboundLinks: true,
})

const head = getSelfHostedAnalyticsHead({
  siteId: 'docs',
  apiEndpoint: 'https://analytics.example.com',
  honorDnt: true,
})
```

The generated browser code:

- sends page-view and custom-event payloads to `<apiEndpoint>/collect`;
- creates an in-memory page-session identifier;
- sends the page origin, path, hash, referrer without query string, title, and screen dimensions;
- can track outbound links;
- can honor `navigator.doNotTrack === "1"` when enabled;
- exposes `window.stacksAnalytics.track(name, value)`.

It does not implement the receiving endpoint. You must provide, secure, operate, and document the collection backend.

## Privacy review

“No cookie” does not mean “no personal data” or “no consent required.” Review at least:

- fields transmitted by the client and added by the server;
- IP addresses visible to the collector or proxy;
- referrer, path, hash, title, and custom-event contents;
- data retention and deletion;
- access control and processor contracts;
- cross-border transfer;
- user notice, opt-out, and applicable consent requirements;
- whether Do Not Track should default to enabled for your product.

The generator strips URL query strings, which reduces accidental token/search leakage, but URL fragments and custom-event values can still contain sensitive data.

## Collector requirements

A production self-hosted collector should define:

- strict request schema and payload limits;
- site authentication or origin validation;
- abuse/rate limiting;
- IP and user-agent handling;
- retention and aggregation policy;
- tenant isolation;
- deletion and export paths;
- monitoring and failure behavior;
- a content-security-policy strategy for the injected script.

## Testing

Test the generated script with a local collector that records exact payloads. Verify:

- query strings are absent;
- Do Not Track prevents transmission when configured;
- SPA/hash behavior matches the selected options;
- outbound-link tracking does not intercept internal links;
- custom events cannot inject unbounded or secret data;
- tracking failures do not break application behavior.

- [Analytics source at the audited revision](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/analytics/src)
- [White paper privacy posture](https://github.com/stacksjs/white-paper#12-security-and-privacy-posture)
