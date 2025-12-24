---
title: Use Cases
description: Common use cases for Stacks.js applications
---

# Use Cases

## E-Commerce Applications

Stacks includes a commerce module for online stores:

```typescript
// config/commerce.ts
export default {
  currency: 'USD',

  products: {
    trackInventory: true,
    allowBackorders: false,
  },

  checkout: {
    guestCheckout: true,
    requireBilling: true,
  },

  shipping: {
    providers: ['usps', 'ups', 'fedex'],
    freeShippingThreshold: 50,
  },

  taxes: {
    calculateAutomatically: true,
    provider: 'taxjar',
  },
}
```

### Commerce Features

- **Product Management**: Variants, inventory, images
- **Cart System**: Session and authenticated carts
- **Checkout Flow**: Multi-step, address validation
- **Payment Processing**: Stripe integration
- **Order Management**: Status tracking, fulfillment
- **Subscriptions**: Recurring billing

## SaaS Platforms

Multi-tenant SaaS applications:

```typescript
// Multi-tenancy configuration
export default {
  tenancy: {
    identifier: 'subdomain', // or 'path', 'domain'

    isolation: {
      database: 'schema', // or 'database', 'row'
    },
  },
}
```

### SaaS Features

- **Team Management**: Invitations, roles, permissions
- **Subscription Billing**: Plans, trials, upgrades
- **Usage Metering**: API calls, storage, bandwidth
- **Admin Dashboard**: Analytics, user management
- **Onboarding Flows**: Guided setup, tutorials

## Enterprise Applications

Enterprise-grade features:

- **SSO Integration**: SAML, OIDC, LDAP
- **Audit Logging**: Comprehensive activity tracking
- **Role-Based Access**: Granular permissions
- **Data Encryption**: At-rest and in-transit
- **Compliance**: GDPR, SOC 2, HIPAA tooling
- **High Availability**: Multi-region deployment
- **Monitoring**: APM, error tracking, alerting
