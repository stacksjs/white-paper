---
title: Technical Architecture
description: Source-audited architecture of the Stacks.js reference implementation and its relationship to the draft protocol.
---

# Technical Architecture

Stacks has two architectural views:

1. the draft protocol’s portable roles and lifecycle;
2. the Stacks.js packages and runtime mechanisms that implement them.

The distinction matters. `@stacksjs/router` is an implementation detail; “route matching occurs before validation and Action execution” is a protocol guarantee.

## Protocol view

```text
Transport
  │
  ▼
Request context → middleware → route → validation → authorization
                                                   │
                                                   ▼
                                                Action
                                                   │
                                     ┌─────────────┴─────────────┐
                                     ▼                           ▼
                                   Model                       Service
                                     │                           │
                                     └─────────────┬─────────────┘
                                                   ▼
                                              result / error
                                                   │
                                      serializer or rendered View
                                                   │
                                                   ▼
                                                Response
```

Protocol conformance concerns observable behavior: ordering, short-circuiting, stable errors, transactions, driver failure, and type/schema evidence.

## Stacks.js repository view

At source revision [`bf1245e3`](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2):

```text
stacks/
├── app/                                  # user-owned overrides and additions
├── routes/                               # route definitions
├── config/                               # typed capability settings
├── database/                             # migrations and local databases
├── resources/                            # STX views/components/functions
├── tests/                                # application tests
└── storage/framework/
    ├── core/                             # first-party framework packages
    │   ├── actions/
    │   ├── api/
    │   ├── auth/
    │   ├── database/
    │   ├── orm/
    │   ├── queue/
    │   ├── realtime/
    │   ├── router/
    │   ├── security/
    │   ├── validation/
    │   └── ...
    ├── defaults/app/                    # framework fallback application
    ├── types/                           # generated and ambient declarations
    ├── api/                             # API server/generated API artifacts
    ├── server/                          # server package
    └── cloud/                           # cloud integration
```

## Resolution and overrides

Stacks.js resolves application code before bundled defaults:

```text
app/Actions/Cms/PostIndexAction.ts
        │ exists? yes ──► use it
        │ no
        ▼
storage/framework/defaults/app/Actions/Cms/PostIndexAction.ts
```

This pattern applies to logical paths supported by the relevant resolver. It permits local customization without forking framework storage.

Route files are different: `routes/*.ts` files are registered through `app/Routes.ts`. Creating a route file without registering it is not sufficient.

## Request path

The router builds on Bun HTTP primitives and the underlying Bun router package. Stacks-specific layers add:

- route-file loading and prefixes;
- Action/controller resolution;
- request augmentation and AsyncLocalStorage context;
- middleware aliases and parameters;
- CSRF handling;
- request IDs and `Server-Timing` data;
- response helpers;
- development/production error behavior;
- named URL generation.

The lifecycle can terminate before the Action when middleware, validation, authorization, or CSRF checks return an error response.

## Action path

An `Action` declares metadata and `handle()`, and may declare:

- `validations`;
- `authorize`;
- `before` and `after` hooks;
- HTTP method/path metadata;
- rate/retry/backoff metadata for relevant execution paths;
- a Model association for request inference.

String-based route handlers are resolved lazily. This improves override flexibility but means some import errors surface only when a route is exercised. Route smoke tests are therefore important.

## Model and migration path

`defineModel()` combines a literal definition with the query-builder runtime. A Model can declare:

- attributes and validation rules;
- relationships;
- indexes;
- factories;
- timestamps, UUIDs, API generation, search, events, and domain traits;
- accessors, mutators, and hooks.

Migration generation compares Model state with a dialect-specific snapshot and writes migration artifacts under `database/migrations/`. A safe workflow is:

```text
edit Model → generate migrations → inspect diff/SQL → apply → run tests
```

Model-driven generation reduces duplicated schema declarations but does not eliminate migration review.

## Type and schema path

Stacks.js uses multiple mechanisms:

| Boundary | Primary evidence |
|---|---|
| Model literal → runtime Model | generic/literal inference in `defineModel()` |
| Action validation → request body | `InferValidations` plus runtime validation |
| Model/config/component inventories | generated declarations and manifests |
| Routes → API description | explicit OpenAPI generation |
| External input | runtime schema and parser checks |
| Database implementation edges | typed query builder plus selected dynamic casts |

Generated declarations and OpenAPI output can become stale, so CI should regenerate or verify them.

## Application source and AI context boundary

Stacks conventions compress recurring integration into framework behavior. Models
and Actions express application intent; generated migrations and declarations are
reviewable artifacts; installed dependencies remain package-manager state. The
`buddy ai:context` command projects that boundary into a deterministic prompt:

```text
application intent + conventions + representative paths
                         |
                         v
              bounded AI authoring context

excluded: node_modules, locks, caches, builds, env files, credentials, keys
```

This can reduce the code and prompt tokens required for AI-assisted changes, but
it does not remove runtime dependencies or replace tests and review.

## Service packages

Selected capability boundaries:

| Capability | Main packages | Snapshot boundary |
|---|---|---|
| Routing/API | `router`, `api`, `server`, `actions` | Implemented; OpenAPI generation is explicit. |
| Data | `database`, `orm`, `query-builder` | Implemented; test each selected dialect. |
| Auth | `auth`, `security` | Broad surface; shared-store assumptions matter. |
| Queue | `queue`, `scheduler`, `cron` | Sync/database/Redis execute; other configured names may not. |
| Real-time | `realtime` | Server must be initialized; scale-out is configuration-dependent. |
| Notifications | `notifications`, `email`, `sms`, `push`, `chat` | Database is concrete; provider delivery requires provider setup. |
| AI | `ai` | Provider-dependent; the built-in vector index is in-memory. |
| Observability | `logging`, `health` | Request/trace IDs and health surfaces exist. |
| Cloud | `cloud`, `deploy`, `dns` | AWS-oriented integration plus ts-cloud dependency. |
| Desktop | `desktop` | Craft launch/build integration is experimental. |

## Runtime and process boundaries

The full framework targets Bun. Process-local mechanisms—including in-memory sessions, callbacks, registries, or caches—do not automatically coordinate across workers or hosts. When scaling horizontally, select shared stores and verify:

- session and token behavior;
- queue locks and retries;
- real-time fan-out;
- rate-limit state;
- idempotency;
- scheduler overlap prevention;
- trace propagation.

## Architecture guarantees versus aspirations

The source demonstrates broad capability coverage. It does not yet provide a language-neutral conformance suite, provider matrix, or certification report. Treat the repository as the reference design and the [white paper requirements](https://github.com/stacksjs/white-paper#15-normative-requirement-ids) as the proposed path from design to verifiable protocol.

## Continue

- [Request lifecycle](/architecture/request-lifecycle)
- [Architecture internals](/architecture/internals)
- [Performance](/architecture/performance)
- [Full source-audit matrix](https://github.com/stacksjs/white-paper#7-capability-evidence-and-maturity)
