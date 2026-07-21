---
title: Framework & Protocol Overview
description: What the draft protocol standardizes, what Stacks.js implements, and what remains implementation-specific.
---

# Framework & Protocol Overview

Stacks separates portable behavior from one concrete framework.

```text
Protocol draft
  ├── roles and conventions
  ├── lifecycle guarantees
  ├── capability contracts
  └── conformance tests and reports

Stacks.js reference implementation
  ├── TypeScript + Bun
  ├── STX + Crosswind
  ├── Actions + router + validation
  ├── Models + ORM + migrations
  ├── auth + queues + real-time + notifications
  └── Buddy tooling + deployment integrations
```

## Protocol layer

The protocol standardizes behaviors that another language could reproduce:

| Area | Portable requirement |
|---|---|
| Architecture | Models own domain data, Views project data, Actions own reusable application behavior. |
| Conventions | Application roles and their resolution/registration rules are deterministic. |
| Lifecycle | Middleware, validation, authorization, Action execution, and serialization preserve a documented order. |
| Data | Models, relationships, transactions, migrations, and query behavior meet shared fixtures. |
| Drivers | Each working backend passes its capability contract; unsupported names fail clearly. |
| Type evidence | Implementations disclose what is inferred, generated, cast, or runtime-validated. |
| Conformance | A profile claim names the suite, runtime, platform, drivers, results, and exceptions. |

The protocol does not standardize TypeScript syntax, STX templates, Bun APIs, package names, cloud SDKs, or raw driver wire formats.

## Reference implementation layer

Stacks.js supplies one expression of the protocol:

- `Action` objects with validation, authorization, hooks, and `handle()`;
- string-resolved and inline routes with groups, middleware, names, and URL generation;
- `defineModel()` definitions with attributes, relationships, traits, factories, and events;
- model-diff migration generation plus reviewable migration files;
- API resources and optional OpenAPI generation;
- bearer-token auth, refresh/revocation, gates, policies, RBAC, TOTP, and passkeys;
- sync/database/Redis Job execution and cron-style scheduling;
- real-time broadcasting and database/provider notification surfaces;
- compiler inference, runtime validation, and generated declarations;
- Buddy commands for development, scaffolding, quality, migration, build, and deploy workflows.

## Profiles and extensions

Profiles are nested:

- **Core** — conventions, MVA, routing/lifecycle, validation, data, configuration, errors, and security baseline.
- **Standard** — Core plus authentication, a durable queue, driver guarantees, observability, and type evidence.
- **Complete** — Standard plus rendered views, JSON APIs, real-time messaging, multi-channel notifications, and one deployment adapter.

AI, analytics, desktop, CMS, commerce, search, and internationalization are optional extension badges. Their absence does not prevent baseline conformance.

No profile is formally certified yet because the language-neutral suite and report schema remain proposed work.

## Auto-imports and discovery

Stacks.js uses several mechanisms, not one universal “everything is global” rule:

- STX templates receive browser-side composables, components, and selected functions through generated manifests/plugins.
- Server contexts expose built-in Models and selected application resources through server auto-imports.
- framework source and application TypeScript still import many core helpers explicitly, including `defineModel`, `schema`, `route`, `response`, and `Action` in normal examples.
- route files are registered through `app/Routes.ts`; merely creating an arbitrary route file is not sufficient.
- application files override framework defaults at the same logical path.

Run `buddy generate` after changing inputs that feed generated declarations or manifests.

## Scope and maturity

The audited revision has substantial implementation depth, but capability selection still matters. For example, queue execution supports `sync`, database, and Redis while rejecting several configured-but-unimplemented driver names. Desktop builds require Craft. OpenAPI output requires explicit generation. Environment encryption has not been independently audited.

Use the [white paper maturity matrix](https://github.com/stacksjs/white-paper#7-capability-evidence-and-maturity) before treating a feature list as a deployment guarantee.

## Next

- [Get started](/introduction/getting-started)
- [Technical architecture](/architecture/)
- [Configuration](/reference/configuration)
