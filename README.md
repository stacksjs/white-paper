# Stacks

## A Draft Protocol and Source-Audited Reference Implementation for Full-Stack Application Development

**Protocol 1.0 Draft · Reference source snapshot: 21 July 2026 · Pre-1.0**

| Document field | Value |
|---|---|
| Status | Governed working draft; RFCs 0002–0005 remain proposed and not ratified |
| Revision | 21 July 2026 |
| Reference implementation | [Stacks.js](https://github.com/stacksjs/stacks) |
| Audited source revision | [`bf1245e336ab14551e22cb7d88284f93e649a1a2`](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2) |
| Evidence revision | [`2a17dd38ffbe9f910273e3777079e7f1ec1623ba`](https://github.com/stacksjs/stacks/tree/2a17dd38ffbe9f910273e3777079e7f1ec1623ba) · [generated evidence](https://whitepaper.stacksjs.com/reference/source-evidence) |
| Protocol repository | [`stacksjs/rfcs`](https://github.com/stacksjs/rfcs) at [`ea9dbe4`](https://github.com/stacksjs/rfcs/tree/ea9dbe438aca308085372e68aaa82ebe2e92b8d0) |
| Snapshot versions | Root manifest `0.70.52`; framework workspaces `0.70.161` |
| Required toolchain | Bun `^1.3.0`, Git `^2.47.0`, SQLite `^3.47.2` |
| Implementation license | [MIT](https://github.com/stacksjs/stacks/blob/bf1245e336ab14551e22cb7d88284f93e649a1a2/LICENSE.md) |

> [!IMPORTANT]
> This paper specifies a proposed protocol and documents a pre-1.0 implementation. It is not a certification, security audit, benchmark report, compatibility guarantee, or promise that every configured provider is implemented. Capability status is stated explicitly in Part II.

---

## Abstract

Full-stack application development repeatedly solves the same coordination problem: route requests, validate input, execute business rules, persist data, authenticate identities, dispatch background work, render views, and operate the result. Individual frameworks solve this problem inside one language, but their conventions and contracts are rarely stated independently of their code.

The **Stacks Protocol** is a draft specification for making those conventions explicit and portable. It defines a Model–View–Action architecture, application layout, request lifecycle, capability interfaces, driver boundaries, type-evidence requirements, and a testable conformance model. It deliberately separates normative behavior—what an implementation promises—from implementation choices such as language, runtime, template syntax, database library, and deployment provider.

**Stacks.js** is the first reference implementation. It is a TypeScript framework built for Bun; the generated snapshot inventories 90 versioned package manifests without treating package count as quality evidence. The supplied source implements substantial surfaces for routing, actions, models, model-derived migrations, validation, authentication, queues, real-time messaging, notifications, AI providers, observability, and developer tooling. It is also visibly pre-1.0: several drivers remain partial, experimental, or unsupported, external services and binaries remain prerequisites, and its current schema-valid conformance report makes no profile claim.

This paper therefore does two jobs. Part I defines the proposed protocol. Part II records what the reference source actually contains at a pinned revision, including limitations. Part III defines how conformance should become measurable. Part IV gives adoption and implementation guidance.

**Keywords:** full-stack framework, application protocol, convention over configuration, Model–View–Action, interface contract, type safety, Bun, TypeScript, conformance

---

## Executive Summary

### The problem

A production application is a system of interacting decisions. Routing shapes validation. Validation shapes domain types. Domain types shape persistence. Authentication affects middleware, actions, queues, and views. Deployment choices feed back into storage, secrets, logging, and background work.

Teams often assemble those concerns from unrelated libraries. That freedom is useful, but the integration burden is real:

- concepts are named differently across packages;
- configuration and error formats drift;
- types are copied between layers;
- routine capabilities require repeated glue code;
- knowledge learned in one stack does not fully transfer to another.

Opinionated frameworks reduce this burden through convention, but their conventions normally remain implicit in a particular codebase and language.

### The proposal

Stacks separates a portable specification from a concrete framework:

```text
                         Stacks Protocol
              conventions · lifecycle · contracts
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
       Stacks.js        future impl B    future impl C
     TypeScript/Bun       any language     any language
     reference source      same tests       same tests
```

The protocol standardizes the parts that benefit from shared expectations:

- the responsibilities of Models, Views, and Actions;
- directory roles and override/discovery behavior;
- the ordered request lifecycle;
- routing, validation, persistence, authentication, and configuration contracts;
- driver selection for replaceable infrastructure;
- evidence that types or schemas remain consistent across boundaries;
- conformance reports that identify exactly what was tested.

It leaves implementation mechanism open: language, runtime, syntax, wire format, storage engine, UI renderer, and performance strategy are implementation-defined.

### The reference implementation

At the audited revision, Stacks.js contains:

- **77** `@stacksjs/*` workspace package manifests under `storage/framework/core/`;
- **62** default model source files and model-driven schema tooling;
- **481** TypeScript files under the default Actions tree, including framework, product-domain, support, and index files;
- **121** checked-in migration files;
- **439** core `*.test.ts` or `*.spec.ts` files;
- typed configuration across application, auth, database, queue, real-time, security, cloud, UI, and other capabilities.

Counts describe repository shape, not quality or production readiness. They are included because they are reproducible from the pinned source and make the implementation’s scope concrete.

### What is different

The central idea is not “more features.” It is a clearer boundary between three things that are often mixed together:

1. **Protocol requirements** — portable behavior that another implementation can test.
2. **Reference behavior** — how Stacks.js realizes a requirement in TypeScript and Bun.
3. **Product extensions** — useful capabilities such as AI, analytics, CMS, commerce, and desktop delivery that do not define baseline conformance.

### What this draft does not claim

This draft does not claim that:

- a second independent implementation already exists;
- conceptual interface similarity makes packages binary-compatible across languages;
- every package can be adopted independently without transitive framework assumptions;
- every configured driver is functional;
- all downstream types are statically proven from one model declaration;
- generated code cannot drift;
- Stacks.js is generally “production-ready” for every workload;
- privacy features automatically satisfy law in every jurisdiction;
- security controls remove the need for threat modeling, review, and testing;
- performance is superior without a published, reproducible benchmark.

Those are evidence questions. The conformance process in Part III is designed to answer them.

---

# Part I — The Stacks Protocol

## 1. Status, Scope, and Language

### 1.1 Normative language

Part I is normative. The terms **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are to be interpreted as described by [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) and [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174) only when written in uppercase.

Parts II–IV are informative unless a section says otherwise.

### 1.2 Protocol scope

The protocol specifies:

- application roles and their separation of concerns;
- canonical layout and resolution behavior;
- ordered request processing;
- behavioral contracts for core capabilities;
- how replaceable backends are selected;
- how an implementation reports supported, partial, experimental, and planned behavior;
- how conformance is tested and declared.

The protocol does not specify:

- a programming language or runtime;
- source-compatible APIs between implementations;
- a universal template syntax;
- one database, queue, cache, or cloud provider;
- one wire protocol for internal drivers;
- implementation performance;
- commercial packaging or hosting.

### 1.3 Goals

The protocol has five goals:

1. **Portable understanding.** A developer should recognize the structure and lifecycle of any conformant application.
2. **Replaceable mechanisms.** Application code should target capability contracts rather than provider-specific clients where a driver boundary is promised.
3. **Traceable data shapes.** Implementations should make shape changes visible across persistence, validation, requests, responses, and views.
4. **Progressive disclosure.** A minimal application should run with defaults while advanced behavior remains configurable.
5. **Testable claims.** “Conformant” should refer to a versioned test report, not a marketing adjective.

### 1.4 Non-goals

The protocol does not attempt to:

- eliminate implementation-specific APIs;
- prevent inline route handlers for transport-only work;
- require every optional product domain;
- make all drivers portable at the byte or package level;
- replace language package managers or standards bodies;
- guarantee that an architecture is appropriate for every system.

### 1.5 Terms

- **Application** — user-owned code and configuration built on an implementation.
- **Implementation** — a framework that realizes protocol requirements.
- **Reference implementation** — the implementation used to develop and illustrate the draft.
- **Capability** — a coherent behavior such as routing, queueing, or authentication.
- **Driver** — a provider-specific implementation behind a capability contract.
- **Adapter** — a boundary that translates between a protocol role and an external transport or system.
- **Action** — transport-independent application behavior with explicit input and output.
- **Conformance report** — a machine-readable record of protocol version, profile, tests, exceptions, and evidence.

---

## 2. Architectural Model

### 2.1 Model–View–Action

Stacks uses **Model–View–Action (MVA)** as its primary separation of concerns.

```text
Request ──► Transport adapter ──► Action ──► Result ──► Response adapter
                                  │
                           reads / writes
                                  │
                                  ▼
                                Model
                                  │
                              projected to
                                  │
                                  ▼
                                 View
```

#### Model

A Model defines a domain entity’s data shape, persistence mapping, relationships, and domain-adjacent behavior. A Model MAY declare capabilities such as generated CRUD routes, search indexing, event observation, factories, or timestamps.

A Model MUST NOT depend on an HTTP request or a UI renderer.

#### View

A View projects prepared data into a presentation format such as HTML, JSON, or a native interface. A View MAY contain presentation logic, including conditional display and iteration, but SHOULD NOT own authorization, persistence, or multi-step business rules.

#### Action

An Action is a named unit of application behavior. It receives explicit input, may validate and authorize that input, coordinates Models and services, and returns a result.

An Action MUST be invokable independently of the transport that exposed it. A conformant implementation MAY support inline handlers and controllers, but behavior that must be reused across HTTP, CLI, jobs, or events SHOULD live in an Action.

### 2.2 Delivery adapters

Delivery targets wrap the same application core:

```text
                         Models + Actions
                               │
             ┌─────────┬───────┼────────┬─────────┐
             ▼         ▼       ▼        ▼         ▼
            Web       JSON     CLI      Job      Event
           views       API   command   worker   listener
```

A Core-conformant implementation MUST support at least one request/response delivery adapter. A Complete implementation MUST support both a rendered-view adapter and a machine-readable API adapter. CLI, desktop, and mobile adapters are optional extensions.

### 2.3 Model-derived artifacts

An implementation SHOULD allow a typed or schema-bearing Model definition to drive related artifacts:

```text
Model definition
   ├──► runtime model/query surface
   ├──► persistence migration or schema diff
   ├──► create/update validation
   ├──► static declarations or generated stubs
   └──► optional CRUD routes, factories, and admin metadata
```

Derivation is not magic and MUST be inspectable:

- generated migrations MUST be reviewable before application;
- destructive changes MUST be distinguishable from additive changes;
- generated artifacts MUST identify their source and protocol/tool version;
- an implementation MUST document when regeneration is required;
- generated output MUST be deterministic for the same input and tool version.

### 2.4 Errors as contract data

Errors cross boundaries and therefore belong in the architecture. Implementations MUST distinguish at least:

- invalid input;
- unauthenticated identity;
- unauthorized action;
- missing resource;
- conflict;
- rate limit;
- internal failure.

Machine-readable adapters MUST return a stable error envelope with a code or category, message, status, and optional field errors. Production responses MUST NOT expose stack traces, credentials, raw queries, or filesystem paths.

---

## 3. Convention Specification

### 3.1 Canonical roles

A conformant application MUST provide equivalent roles for the following layout. An implementation MAY use language-idiomatic casing or extensions, but its mapping MUST be documented.

```text
app/
├── Actions/          # reusable application behavior
├── Models/           # domain entities and persistence definitions
├── Middleware/       # request/response interceptors
├── Jobs/             # deferred work
├── Listeners/        # event consumers
├── Mail/             # mail definitions
└── Commands/         # application CLI commands

config/               # capability-scoped configuration
database/
├── migrations/       # ordered schema changes
└── seeders/          # seed data
resources/
├── components/       # reusable presentation components
├── views/            # page-level presentation
└── functions/        # shared presentation/runtime functions
routes/               # route definitions
tests/                # automated tests
```

Controllers, resources/serializers, policies, broadcasts, and notifications MAY be additional roles.

### 3.2 Discovery and registration

Convention does not require invisible behavior. For each role, an implementation MUST document whether it is:

- discovered by directory scan;
- registered in a manifest;
- generated into a registry;
- imported explicitly.

The implementation MUST make the resolution order deterministic. A file merely existing in a conventional directory MUST NOT be described as “auto-discovered” if a separate registration step is required.

### 3.3 Application override rule

An implementation MAY ship default application behavior. If it does, user-owned application code MUST take precedence over framework defaults at the same logical path.

```text
resolve("Actions/Cms/PostIndex")
  1. app/Actions/Cms/PostIndex.*
  2. framework defaults/Actions/Cms/PostIndex.*
  3. not found
```

The override MUST be local, reversible, and visible in source control. Upgrades MUST NOT overwrite the user-owned file.

### 3.4 Naming

Implementations MUST publish deterministic naming rules for:

- entity name to persistence collection/table;
- relationship name to foreign key;
- component filename to template reference;
- Action reference to source path;
- route name to reverse-generated URL.

Defaults MAY be overridden explicitly.

### 3.5 Zero-configuration baseline

A newly scaffolded application MUST start in a documented local-development mode after its declared toolchain and dependencies are installed. “Zero configuration” does not mean “zero prerequisites,” “all services enabled,” or “production-ready.”

External capabilities—mail, SMS, cloud, paid APIs, Redis, and similar services—MUST fail clearly when selected without required credentials or infrastructure.

---

## 4. Core Capability Contracts

### 4.1 Routing

A router MUST support:

- HTTP method and path matching;
- path parameters;
- named routes and reverse URL generation;
- route groups with shared prefix or middleware;
- middleware attached to a route or group;
- not-found and method-not-allowed behavior.

Resource-route expansion and parameter constraints SHOULD be supported. Action references MAY be strings, functions, objects, or language-native symbols, provided resolution is deterministic.

### 4.2 Request lifecycle

The observable lifecycle MUST preserve this order:

```text
accept request
  → attach request context / request ID
  → global middleware
  → route match
  → route middleware
  → parse input
  → validate input
  → authorize Action
  → execute Action
  → serialize result
  → apply response middleware / headers
  → emit response
```

An implementation MAY combine internal phases, but MUST preserve their externally visible guarantees.

Middleware, validation, and authorization MUST be able to stop execution before the Action. An Action MUST NOT execute after any of those phases has produced a terminal response.

### 4.3 Validation

Validation MUST provide:

- composable primitive and structural validators;
- required/optional semantics;
- nested field paths;
- structured errors keyed by field;
- safe handling of unknown input;
- reusable schemas across more than one call site.

In a statically typed host, a schema SHOULD expose an inferred type. In a dynamic host, runtime validation is sufficient for Core conformance, but the conformance report MUST state that static inference is unavailable.

### 4.4 Data and persistence

The data capability MUST provide:

- Models with declared fields and relationships;
- create, read, update, and delete operations;
- composable filtering, ordering, and pagination;
- transactions;
- ordered, versioned migrations;
- eager loading or an equivalent N+1 mitigation.

Supported relationship kinds and database dialects MUST be reported individually. A configured or typed dialect MUST NOT be reported as supported unless its conformance tests pass.

Migration tooling MUST provide a preview or review boundary before destructive production changes.

### 4.5 Configuration

Configuration MUST be:

- capability-scoped;
- environment-aware;
- validated at startup or build time;
- override-oriented, with documented defaults;
- redacted when rendered in errors or logs.

In a statically typed host, configuration SHOULD be checked against declared types. Secrets MUST NOT be embedded in generated client bundles.

### 4.6 Authentication and authorization

A Standard implementation MUST expose:

- at least one credential mechanism;
- authenticated identity in request context;
- login and logout or equivalent credential lifecycle;
- authorization checks callable outside views;
- credential revocation;
- rate limiting or another brute-force mitigation for credential endpoints.

Session, bearer-token, passkey, OAuth, and TOTP mechanisms are implementation choices. The conformance report MUST identify which are tested and any storage assumptions, such as in-memory sessions.

### 4.7 Driver contract

When an implementation describes a capability as driver-based:

1. application code MUST target a stable capability interface;
2. the selected driver MUST be chosen by configuration or dependency injection;
3. changing driver MUST NOT require application-business-logic changes;
4. unsupported drivers MUST fail loudly before data loss or silent degradation;
5. the conformance report MUST list each tested driver separately.

```text
Application → Queue contract → sync | database | Redis | other tested driver
```

Declaring a driver name in a configuration type does not make that driver conformant.

### 4.8 API representation

A machine-readable API adapter MUST provide:

- explicit response serialization;
- a stable error envelope;
- consistent pagination metadata;
- content-type correctness;
- authentication independent of a browser-only session where token APIs are advertised.

It SHOULD generate a machine-readable description such as OpenAPI from registered routes and schemas. Generated descriptions MUST be marked stale or regenerated when inputs change; an empty placeholder is not evidence of API coverage.

---

## 5. Service and Extension Contracts

### 5.1 Queues and scheduling

A Standard implementation MUST provide at least one non-inline queue driver in addition to an optional synchronous development driver. A Job MUST support named dispatch, payload serialization, retry policy, timeout, and failure recording. Delayed dispatch and recurring schedules SHOULD be supported.

If callbacks or batch state are process-local, that limitation MUST be documented.

### 5.2 Real-time messaging

A Complete implementation MUST provide a bidirectional event transport with:

- public and authorization-gated channels;
- a server lifecycle;
- a client subscription surface;
- bounded payloads and connection/message rate limits;
- documented scale-out behavior.

Presence channels are recommended but optional.

### 5.3 Notifications

A Complete implementation MUST provide a notification abstraction and at least two tested channels, one of which MAY be database storage. Channel credentials and delivery errors MUST be isolated from application-domain logic.

### 5.4 Observability

A Standard implementation MUST provide:

- structured logs;
- request or trace identifiers;
- liveness and readiness surfaces;
- redaction of known secret fields;
- propagation of trace context into at least one background-work path.

Metrics and distributed tracing exporters are optional drivers.

### 5.5 Infrastructure and deployment

A Complete implementation MUST provide at least one documented deployment adapter or integration. Infrastructure plans MUST identify destructive or replacement operations before execution. The implementation MUST state which cloud providers and topologies are exercised by automated tests or deployment evidence.

### 5.6 Security baseline

Security applies to every profile. An implementation MUST:

- parameterize database queries by default;
- escape rendered output by default;
- provide CSRF protection for applicable browser-authenticated writes;
- provide configurable security headers;
- avoid leaking production stack traces and secrets;
- use authenticated encryption for application encryption helpers;
- use a password-hashing algorithm intended for password storage;
- compare authenticators in a timing-safe manner where applicable;
- document trust boundaries and storage assumptions.

“Secure by default” is not a substitute for a threat model. Cryptographic constructions MUST NOT be described as standard schemes unless they implement and test those schemes faithfully.

### 5.7 Type evidence

A Standard implementation MUST publish evidence for shape consistency. It MAY use:

- compiler inference;
- generated declarations;
- generated clients;
- runtime schemas;
- contract tests;
- a combination of these.

The conformance report MUST state where type information is inferred, generated, cast, or checked only at runtime. “End-to-end type safety” MUST NOT be claimed when an untyped boundary is hidden by unchecked casts.

### 5.8 Optional extension badges

The following capabilities do not determine Core, Standard, or Complete conformance. An implementation MAY report independently tested extension badges:

- **AI** — provider adapters, streaming, structured output, embeddings, or tool protocols;
- **Analytics** — collection and reporting with a documented privacy model;
- **Desktop** — native-window development and packaged application delivery;
- **CMS** — content models, workflows, and presentation;
- **Commerce** — product, order, payment, and fulfillment workflows;
- **Search** — indexing and query adapters;
- **Internationalization** — message catalogs, locale negotiation, and formatting.

Extension claims MUST follow the same tested-driver and limitations rules as core capabilities.

---

# Part II — Stacks.js Reference Implementation

## 6. Audit Method and Status Vocabulary

This part is pinned to source commit [`bf1245e3`](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2). Evidence commit [`2a17dd38`](https://github.com/stacksjs/stacks/tree/2a17dd38ffbe9f910273e3777079e7f1ec1623ba) contains the deterministic source manifest, driver registry, Craft matrix, and RFC-suite lock ingested by this paper. See the [generated evidence page](https://whitepaper.stacksjs.com/reference/source-evidence) for hashes, classified counts, and the refresh procedure.

It did not:

- deploy cloud resources;
- exercise paid or credentialed providers;
- run a third-party penetration test;
- reproduce external performance claims;
- certify legal compliance;
- publish packages to verify registry contents.

Status labels mean:

| Label | Meaning |
|---|---|
| **Implemented** | A concrete source path and public surface exist, with relevant tests or active framework use. |
| **Partial** | A useful surface exists, but an advertised path, driver, integration, or guarantee is incomplete. |
| **Experimental** | Source exists but requires unusual setup, external local source/binaries, or lacks stable delivery evidence. |
| **Planned** | Mentioned in types, configuration, documentation, or roadmap without a complete execution path. |
| **Not audited** | Present but outside this paper’s source-level review. |

These labels describe the pinned revision only.

### 6.1 Reproducing repository counts

From the Stacks source root:

```bash
# @stacksjs-scoped core package manifests
find storage/framework/core -mindepth 2 -maxdepth 2 -name package.json -print

# Default model and Action source files
find storage/framework/defaults/app/Models -type f -name '*.ts' -print
find storage/framework/defaults/app/Actions -type f -name '*.ts' -print

# Core tests
find storage/framework/core -path '*/node_modules' -prune -o \
  \( -name '*.test.ts' -o -name '*.spec.ts' \) -print
```

The exact counts in the Executive Summary are snapshot facts, not protocol requirements.

---

## 7. Capability Evidence and Maturity

| Capability | Status at snapshot | Evidence and boundary |
|---|---|---|
| Conventional layout and overrides | **Implemented** | User code under `app/` resolves before framework defaults; route files use an explicit registry. |
| Actions | **Implemented** | `Action` supports validations, authorization, lifecycle hooks, and typed request inference; string-based resolution is used by routes. |
| Routing and middleware | **Implemented** | HTTP methods, groups, names, URL generation, request augmentation, middleware, CSRF handling, and request IDs exist. |
| Validation | **Implemented** | `schema` validators are used by Models and Actions; failures produce structured field errors. |
| Models and ORM | **Implemented** | `defineModel()` wraps the query builder, relations, traits, event hooks, factories, and generated/model-aware types. |
| Model-derived migrations | **Implemented** | `buddy generate:migrations` calls a snapshot/diff-based generator and writes reviewable migrations. |
| API resources | **Implemented** | `JsonResource`, collections, conditional fields, pagination metadata, and response wrapping exist. |
| OpenAPI | **Partial** | A generator exists, but the checked-in OpenAPI file can be empty until generation is run explicitly. |
| Authentication | **Implemented with constraints** | Bearer tokens, refresh/revocation, gates, policies, RBAC, passkeys, TOTP, password reset, and sessions exist. In-memory session behavior and RBAC store setup must be considered for multi-process use. |
| Queue | **Partial** | `sync`, database, and Redis execution paths exist. `sqs`, `memory`, and `beanstalkd` are rejected as unimplemented even though some appear in configuration/types. |
| Scheduler | **Implemented** | Cron-style scheduling, overlap prevention, locks, and job triggering exist. |
| Real-time | **Implemented** | `ts-broadcasting` integration, server lifecycle, public/private/presence emission, and broadcast discovery exist; the server must be initialized. |
| Notifications | **Partial** | Email/SMS/chat/push packages are aggregated and the database driver is concrete. Provider delivery still depends on each channel’s credentials and implementation. |
| Structured logging and tracing | **Implemented** | Request IDs, trace context, JSON/pretty logging, error redaction, and queue trace propagation exist. |
| Health | **Implemented** | HTTP health Actions and queue-health surfaces exist. External dependency depth varies by configuration. |
| AI | **Implemented, provider-dependent** | Anthropic, OpenAI, Ollama, Bedrock utilities, streaming, image/vision, in-memory vector search, RAG helpers, and MCP clients exist. Durable vector storage is not provided by the in-memory index. |
| Analytics | **Partial** | A Fathom configuration/placeholder surface and a self-hosted client-script generator exist. The audited package does not substantiate the paper’s former claims of a complete reporting backend, daily rotating visitor hashes, or consent-law conclusions. |
| Environment encryption | **Experimental** | New writes use versioned ephemeral-static X25519, HKDF-SHA-256, and AES-256-GCM with authenticated metadata; legacy ciphertext is read only for migration. RFC 0005 and independent review remain open, so this is not a broad production recommendation. |
| Application encryption | **Implemented** | `@stacksjs/security` uses versioned AES-GCM ciphertext and PBKDF2-SHA-256 for passphrase-derived keys, with legacy decryption fallback. |
| Cloud and deployment | **Partial / integration-dependent** | Stacks exposes AWS-oriented cloud helpers and integrates `@stacksjs/ts-cloud`. Provider breadth and topology maturity belong to the ts-cloud version actually installed and are not reasserted here. |
| Desktop | **Experimental** | Craft development/build paths, signed update manifests, artifact checksums/provenance, and a machine-readable support gate exist. The matrix has zero stable targets pending native install/update/rollback evidence and platform signing/notarization. |
| Native mobile | **Planned / not audited** | No mobile delivery path is established by the audited Stacks source. |
| Conformance suite | **Implemented, unverified** | The RFC repository publishes 47 requirements, 16 runner-neutral fixtures, seven driver contracts, a report schema, and an independent Python runner. Stacks CI emits a schema-valid report; only executable checks pass and `profileClaim` remains `null`. |

### 7.1 Why the matrix matters

A package manifest proves a package boundary, not a capability guarantee. A configuration union proves an accepted type, not a working driver. A unit test proves a behavior under its test conditions, not production fitness. The matrix keeps those evidence levels separate.

### 7.2 Version interpretation

The source snapshot contains different version numbers in different manifests: the repository root reports `0.70.52`, while framework workspaces report `0.70.161`. The generated source manifest records every package path/version and exact Git tree digest, so this paper identifies source revision and package manifest rather than inventing one repository-wide version.

---

## 8. Repository and Runtime Architecture

```text
stacks/
├── app/                              # user-owned application overrides
├── routes/                           # registered route files
├── config/                           # typed capability configuration
├── database/                         # migrations and database files
├── resources/                        # STX views, components, functions
├── tests/                            # application-level tests
└── storage/framework/
    ├── core/                         # 77 @stacksjs/* package manifests
    ├── defaults/app/                 # framework fallbacks
    ├── types/                        # generated and ambient declarations
    ├── api/                          # API server artifacts
    ├── server/                       # server package
    └── cloud/                        # cloud integration
```

The most important implementation rule is the **override model**:

```text
app/<logical path>  ──wins over──►  storage/framework/defaults/app/<logical path>
```

This lets an application replace a framework default without editing framework storage. It also creates an upgrade responsibility: tools and documentation must make it clear which default is being shadowed and whether the upstream default changed.

### 8.1 Runtime requirements

The root source manifest declares:

- Bun `^1.3.0`;
- Git `^2.47.0`;
- SQLite `^3.47.2`;
- Craft `^0.0.19` for relevant native workflows.

The project targets macOS, Linux, and WSL. Individual packages may run elsewhere, but the full framework should be evaluated against its declared toolchain rather than assumed to be Node-compatible.

### 8.2 Package boundaries

The 77 scoped packages cover capabilities including `actions`, `ai`, `api`, `auth`, `cache`, `cloud`, `database`, `email`, `env`, `error-handling`, `events`, `health`, `logging`, `notifications`, `orm`, `queue`, `realtime`, `router`, `scheduler`, `security`, `storage`, `testing`, `types`, `ui`, and `validation`.

“Package boundary” and “independently adoptable” are not synonyms. Consumers should inspect peer/runtime dependencies and test a package outside the full framework before treating it as standalone.

---

## 9. Verified Developer Workflow

### 9.1 Create an application

The current source documentation uses Pantry to provision and pin the declared toolchain:

```bash
# Install Pantry once, then configure the shell as its installer directs.
curl -fsSL https://pantry.dev | bash

# Create a Stacks project in an isolated tool environment.
panx @stacksjs/buddy new my-project
cd my-project
buddy dev
```

The former `bunx buddy new` and `bunx stacks new` examples were removed because they do not match the supplied source’s current recommended path.

### 9.2 Pantry package-manager boundary

The Stacks toolchain recommendation is not a claim that Pantry is merely a
bootstrap script or a synonym for npm. The paper pins Pantry
[`v0.10.36`](https://github.com/pantry-pm/pantry/tree/v0.10.36) at commit
[`a6bdc420`](https://github.com/pantry-pm/pantry/tree/a6bdc42071cc659896d1b9ff9d7ab6862c72954d).
Its [complete package-manager contract](https://whitepaper.stacksjs.com/reference/package-manager)
is copied, checksummed, and regenerated from that immutable source.

Pantry resolves three distinct dependency classes:

| Class | Source | Installed form |
|---|---|---|
| System tools and runtimes | generated Pantry recipe catalog plus `registry.pantry.dev` metadata | versioned native archives, binaries, shims, and environment links |
| JavaScript packages | npm-compatible metadata | extracted dependency tree with resolved URL and integrity retained in `pantry.lock` |
| Workspace/local packages | workspace manifests, `workspace:` ranges, and the local-link registry | linked or copied workspace package plus resolved external dependencies |

Those sources are not interchangeable. npm fallback does not turn npm into the
Pantry system-package registry, and a locally generated catalog entry is not
proof that an arbitrary npm package can be installed as a native tool.

The effective configuration order is explicit command option, project
configuration/manifests, environment settings, then compiled defaults. A
workspace root owns the lockfile. `pantry ci` requires frozen lock state;
`--offline` forbids network resolution and must miss clearly when required bytes
are absent; `--no-save` prevents manifest and lock writes; and `--force` refreshes
resolution without implying persistence.

The install pipeline is evidence-sensitive:

1. discover the manifest/workspace and normalize requested specs;
2. reuse compatible lock entries unless a refresh is requested;
3. resolve the appropriate source and fetch through bounded cache/network paths;
4. verify declared SHA-256/SHA-512/SHA-1 SRI or raw SHA-256 before extraction;
5. fail closed on malformed or unsupported integrity claims;
6. extract without permitting archive traversal outside the destination;
7. link the dependency tree and write deterministic state only when saving is enabled;
8. run lifecycle scripts only under the selected trust and `--ignore-scripts` policy.

The native command contract includes install/CI, add/remove/update, inspection,
deduplication, workspace linking, audit/search/info, core/npm/commit/binary
publication, and signing/verification paths. The generated reference records
every option, lockfile field, lifecycle boundary, publication channel, failure
mode, and corresponding test file; the runtime `pantry <command> --help` remains
authoritative for the installed build.

### 9.3 Pantry registry boundary

The [complete registry contract](https://whitepaper.stacksjs.com/reference/registry)
is pinned beside the package-manager contract. The service has separate route
families for Pantry/npm-compatible packages, commit-addressed previews,
content-addressed Zig packages, PHP/Composer packages, native binaries/desktop
artifacts/fonts, accounts/tokens, analytics, and build operations. Sharing one
process does not give every route identical authentication or integrity semantics.

Core and commit publication accept an operator token or a scoped `ptry_` API
token where supported. Zig/PHP administrative mutation currently uses the
operator-token boundary. Missing server token configuration fails closed, token
comparison is timing-safe, and the Zig route reads the current environment so a
rotation takes effect without re-importing the module. Publisher ownership is
recorded for user tokens and enforced by account-level mutation paths.

Publication validates normalized names and versions, metadata/body limits,
content type, immutable duplicate keys, and a 50 MiB tarball ceiling. Stored bytes
receive SHA-256 evidence and canonical proxy URLs. That digest proves which bytes
were received; it does not substitute for publisher authentication or signing.
Commit previews require a full commit identity, while Zig additionally provides
content-addressed lookup.

Storage is deliberately split:

| Mode | Bytes | Metadata | Intended boundary |
|---|---|---|---|
| Local | `.registry` files or in-memory stores | JSON/in-memory | development and tests |
| Object | S3-compatible AWS/Hetzner storage | checksummed object snapshots | portable production default |
| AWS compatible | S3 | DynamoDB metadata/analytics tables | existing AWS deployments and migration |

Operators must back up metadata and blobs consistently. Metadata without a
tarball creates a visible but undownloadable version; a tarball without metadata
is unreachable. `NPM_FALLBACK=false` makes a Pantry miss local. When enabled,
fallback is read-only: it does not silently publish npm packages into Pantry, and
external tarball URLs must pass HTTPS and private-host/SSRF checks.

The evidence lock includes the canonical contracts, checker and checker tests,
Zig route implementation and HTTP tests, native integrity pipeline, and the CI
workflow that gates all Bun tests and `zig build test`. Whitepaper CI hashes every
copied artifact and regenerates both reference pages; upstream behavior changes
therefore require an intentional evidence refresh.

### 9.4 Common loop

```bash
buddy dev                    # start development services
buddy make:model Product     # scaffold a model
buddy make:action SaveOrder  # scaffold an Action
buddy generate:migrations    # diff Models and emit migration files
buddy migrate --diff         # preview pending SQL
buddy migrate                # apply pending migrations
buddy test                   # run tests
buddy test:types             # run the typecheck path
buddy lint                   # check with Pickier
buddy build                  # select/build production target
buddy doctor                 # inspect common environment problems
```

Commands can evolve in the 0.x line. `buddy list` and `buddy <command> --help` are the runtime source of truth.

---

## 10. Reference API Examples

These examples follow APIs present in the audited source. They are illustrative; generated application types may change exact request and model names.

### 10.1 Model as a derivation point

```typescript
// app/Models/Product.ts
import { defineModel } from '@stacksjs/orm'
import { schema } from '@stacksjs/validation'

export default defineModel({
  name: 'Product',
  table: 'products',

  traits: {
    useTimestamps: true,
    useSeeder: { count: 10 },
    useApi: {
      uri: 'products',
      routes: ['index', 'store', 'show', 'update', 'destroy'],
    },
    observe: true,
  },

  belongsTo: ['Category'],

  attributes: {
    name: {
      fillable: true,
      validation: { rule: schema.string().required().max(100) },
    },
    price: {
      fillable: true,
      validation: { rule: schema.number().required().min(1) },
    },
    status: {
      fillable: true,
      default: 'draft',
      validation: { rule: schema.enum(['draft', 'published', 'archived']) },
    },
  },
} as const)
```

From this definition, Stacks can construct the runtime model, generate or diff schema artifacts, derive validation metadata, and opt the model into CRUD APIs. Generated migrations should still be reviewed.

### 10.2 Route and Action

```typescript
// routes/api.ts
import { route } from '@stacksjs/router'

route
  .post('/newsletter', 'Actions/SubscribeToNewsletter')
  .middleware('throttle')
  .name('newsletter.store')
```

```typescript
// app/Actions/SubscribeToNewsletter.ts
import { Action } from '@stacksjs/actions'
import { response } from '@stacksjs/router'
import { schema } from '@stacksjs/validation'

export default new Action({
  name: 'SubscribeToNewsletter',
  method: 'POST',

  validations: {
    email: {
      rule: schema.string().email().required(),
      message: 'A valid email address is required.',
    },
  } as const,

  async authorize(request) {
    return !request.boolean('blocked', false)
  },

  async handle(request) {
    const email = request.string('email')
    return response.created({ email })
  },
})
```

The router validates and authorizes the Action before `handle()`. The same Action object can be invoked from another adapter without embedding route-specific logic in the domain operation.

### 10.3 Explicit API representation

```typescript
import { JsonResource } from '@stacksjs/api'

class UserResource extends JsonResource<User> {
  toArray() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      avatar: this.whenNotNull(this.resource.avatar),
      posts: this.whenLoaded('posts'),
    }
  }
}

const payload = new UserResource(user).toResponse()
// { data: { id, name, ... } }
```

This makes exposure a deliberate serialization decision rather than returning raw rows by default.

### 10.4 Queued work

```typescript
// app/Jobs/SendWelcomeEmail.ts
import { Job } from '@stacksjs/queue'

export default new Job({
  name: 'SendWelcomeEmail',
  queue: 'emails',
  tries: 3,
  timeout: 30,
  backoff: [10, 30, 60],

  async handle(payload: { email: string }) {
    // Send through the configured email capability.
    return { delivered: payload.email }
  },
})
```

```typescript
await SendWelcomeEmail.dispatch({ email: 'reader@example.com' })
await SendWelcomeEmail.dispatchAfter(60, { email: 'reader@example.com' })
```

At this snapshot, background execution should select `database` or `redis`. The default `sync` driver executes inline; `sqs` and `memory` are not implemented execution paths despite appearing in configuration.

### 10.5 Real-time events

```typescript
import { emit, emitToUser } from '@stacksjs/realtime'

emit('orders', 'order.updated', { orderId: 42, status: 'shipped' })
emitToUser(7, 'notification', { message: 'Your order has shipped.' })
```

The broadcast server must be created before emission. Redis-backed scale-out and serverless behavior depend on the selected real-time/deployment configuration.

### 10.6 AI provider use

```typescript
import { anthropic } from '@stacksjs/ai'

anthropic.configure({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-sonnet-4-20250514',
  maxTokens: 1024,
})

const summary = await anthropic.prompt('Summarize this incident report.')
```

Provider calls require credentials, network access, cost controls, data-handling review, and application-specific safety measures. The protocol does not make model output trustworthy by default.

---

## 11. Type System: Objective, Mechanisms, and Limits

Stacks.js combines several forms of type evidence:

- literal-preserving `defineModel(... as const)` definitions;
- `InferValidations` for Action input rules;
- model/query utility types;
- generated declarations under `storage/framework/types/`;
- OpenAPI-derived API types when generation is run;
- runtime validation at request boundaries;
- contract and type tests.

```text
Model / schema literals
      │
      ├── compiler inference ──► Action and query authoring
      ├── runtime validation ──► untrusted input boundary
      └── generators ──────────► declarations, migrations, API artifacts
```

This is a stronger and more accurate claim than “one unbroken type chain.” The audited source still contains dynamic loading, ambient globals, generated files, compatibility stubs, and deliberate casts at some generic database boundaries. Those are normal engineering tradeoffs, but they must be visible in the conformance report.

For application teams, the practical rule is:

1. keep Model and Action schemas literal and typed;
2. regenerate declarations after schema changes;
3. validate every untrusted runtime boundary;
4. run `buddy test:types` in CI;
5. treat generated clients and OpenAPI documents as build artifacts that can become stale.

---

## 12. Security and Privacy Posture

### 12.1 Implemented controls

The audited source includes concrete work in the following areas:

- parameterized database/query-builder paths;
- guarded raw-query construction;
- CSRF enforcement and route-level opt-out;
- configurable security headers and HSTS in production paths;
- bearer-token parsing, token rotation/revocation, TOTP, and passkeys;
- password hashing with bcrypt or Argon2 configuration;
- timing-safe comparisons for relevant authenticators and webhook signatures;
- production error sanitization;
- request identifiers and security/audit event types;
- AES-GCM application encryption with a versioned ciphertext format;
- pre-deploy and environment diagnostics in Buddy.

### 12.2 Required cautions

The following limitations materially affect how claims should be interpreted:

- **Environment-file encryption is not independently audited.** Version 2 replaces the simplified construction with X25519, HKDF-SHA-256, and AES-256-GCM, but RFC 0005 and independent review are still open. Ciphertext does not protect a compromised CI job, encryption host, runtime, deployment host, or recipient private key.
- **In-memory state is process-local.** Session and some callback/cache paths require a shared store or different design for multi-process deployment.
- **Configured is not implemented.** A queue or cloud provider appearing in a config type is not evidence that its driver works.
- **Defaults are context-sensitive.** CSRF, CORS, CSP, cookies, proxies, TLS termination, and security headers must be evaluated in the actual deployment topology.
- **AI and analytics are data egress surfaces.** Operators must document what leaves the application and apply provider, retention, and jurisdiction-specific controls.
- **No framework eliminates review.** Applications still require dependency management, threat modeling, access control review, backups, incident response, and security testing.

### 12.3 Privacy claims

The analytics package can generate a cookie-free self-hosted tracking script, strip URL query strings, and honor Do Not Track when configured. Those implementation properties do not determine whether a consent banner or other notice is legally required. That depends on the data collected, purpose, configuration, contracts, and applicable law.

---

## 13. Operations and Delivery

### 13.1 Web and API

Web views and JSON APIs are the best-established delivery targets in the repository. Routes can resolve Actions, middleware can short-circuit, response helpers return standard `Response` objects, and API resources shape data explicitly.

### 13.2 Cloud

Stacks includes cloud/deploy packages, typed configuration, AWS-oriented helpers, deployment hooks, and integration with `@stacksjs/ts-cloud`. This paper intentionally does not copy exact provider counts, preset counts, service coverage, or production-readiness labels from a separate moving dependency.

Before deployment, teams should pin the ts-cloud version and verify:

- supported provider and region;
- generated plan and destructive replacements;
- credential source and least privilege;
- secret injection path;
- database migration ordering and rollback;
- health checks and log access;
- backup and recovery;
- cost controls.

### 13.3 Desktop

The desktop package can construct and launch a Craft command, and the desktop build Action creates a launcher bundle around a Craft runtime. It requires `CRAFT_BIN`, a Craft executable on `PATH`, or a recognized local Craft checkout.

This is an experimental delivery integration. Its generated matrix lists macOS arm64/x64, Linux x64, and Windows x64 as experimental unpackaged bundles and lists zero stable targets. Stable builds fail until the exact row links retained install/launch/update/rollback evidence and enforces signing (plus macOS notarization). Mobile and unlisted targets remain unsupported.

### 13.4 Testing

Stacks uses Bun’s test runner and provides database, queue-fake, and environment helpers. A framework with hundreds of test files can still have untested integrations; teams should distinguish:

- unit tests with mocks;
- integration tests against local services;
- provider contract tests;
- end-to-end browser/API tests;
- deployment smoke tests;
- conformance tests.

The protocol suite is a separate, public layer in `stacksjs/rfcs`. The current Stacks adapter deliberately reports only executed evidence and makes no profile claim.

---

# Part III — Conformance and Porting

## 14. Conformance Profiles

Profiles are nested:

```text
Complete
└── Standard
    └── Core

Optional badges: AI · Analytics · Desktop · CMS · Commerce · Search · i18n
```

### 14.1 Core

Core covers application shape and a request/data path:

- conventions and deterministic resolution;
- MVA responsibilities;
- routing and lifecycle;
- validation;
- Models, persistence, transactions, and migrations;
- configuration;
- error and security baseline.

### 14.2 Standard

Standard adds service-operation fundamentals:

- authentication and authorization;
- at least one non-inline queue driver;
- driver-selection guarantees;
- observability and trace propagation;
- published type/schema evidence.

### 14.3 Complete

Complete adds a full product delivery surface:

- rendered views and JSON APIs;
- real-time messaging;
- multi-channel notifications;
- at least one deployment adapter with plan/review behavior.

Optional extensions do not gate the profile.

---

## 15. Normative Requirement IDs

The conformance suite SHOULD encode at least the following requirements.

| ID | Profile | Requirement | Minimum evidence |
|---|---|---|---|
| `CORE-CONV-01` | Core | Canonical roles map to documented paths. | Fixture application + resolver test |
| `CORE-CONV-02` | Core | Application override wins over framework default. | Two-file precedence test |
| `CORE-CONV-03` | Core | Discovery/registration is deterministic and documented. | Registry snapshot + negative test |
| `CORE-MVA-01` | Core | An Action is invokable without HTTP transport. | Direct invocation test |
| `CORE-ROUTE-01` | Core | Method/path matching and parameters work. | HTTP contract tests |
| `CORE-ROUTE-02` | Core | Named routes reverse-generate correctly. | URL generation tests |
| `CORE-LIFE-01` | Core | Middleware → validation → authorization → Action order is preserved. | Instrumented ordering test |
| `CORE-LIFE-02` | Core | Each pre-Action phase can short-circuit. | One test per phase |
| `CORE-VAL-01` | Core | Nested input produces field-keyed errors. | Invalid fixture + expected envelope |
| `CORE-DATA-01` | Core | CRUD, filtering, ordering, pagination, eager loading, and transaction rollback work. | Database matrix |
| `CORE-MIG-01` | Core | Migrations are ordered and reversible or explicitly compensating. | Apply/rollback test |
| `CORE-MIG-02` | Core | Destructive change is visible before apply. | Plan/diff fixture |
| `CORE-CONFIG-01` | Core | Defaults, environment overrides, and invalid config are deterministic. | Startup matrix |
| `CORE-ERR-01` | Core | Production errors redact stack/secret/query details. | Snapshot tests |
| `CORE-SEC-01` | Core | Queries parameterize untrusted values by default. | Injection fixture |
| `CORE-SEC-02` | Core | Rendered values escape by default. | XSS fixture |
| `CORE-SEC-03` | Core | Applicable browser writes enforce CSRF. | Missing/invalid/valid token tests |
| `STD-AUTH-01` | Standard | Identity, revocation, and authorization gates work. | Auth lifecycle tests |
| `STD-QUEUE-01` | Standard | A non-inline driver persists and executes Jobs. | Driver contract test |
| `STD-DRV-01` | Standard | Unsupported drivers fail loudly. | Invalid/declared-unimplemented driver test |
| `STD-OBS-01` | Standard | Request ID reaches logs and a Job. | Trace propagation test |
| `STD-TYPE-01` | Standard | Type/schema evidence is generated and checked. | Compiler or schema contract fixture |
| `CMP-VIEW-01` | Complete | A rendered view consumes prepared data. | Rendering fixture |
| `CMP-API-01` | Complete | API serialization, errors, and pagination are stable. | Golden response fixtures |
| `CMP-RT-01` | Complete | Authorized real-time subscription and event delivery work. | Client/server integration test |
| `CMP-NOTIFY-01` | Complete | One notification reaches two tested channels. | Channel contract tests |
| `CMP-INFRA-01` | Complete | Deployment adapter emits a reviewable plan. | Golden plan fixture |

The final protocol repository SHOULD publish fixtures, expected outputs, and a runner-neutral test description so implementations in different languages can share behavior without sharing test code.

---

## 16. Conformance Report Format

A conforming implementation MUST publish a report that validates against RFC
0004's schema and semantic checks. This example is abbreviated; a real report
contains exactly one result for every catalog requirement:

```json
{
  "reportVersion": "1.0.0-draft.1",
  "protocol": {
    "version": "1.0-draft",
    "catalogRevision": 1,
    "suiteVersion": "1.0.0-draft.1",
    "rfcsRevision": "ea9dbe438aca308085372e68aaa82ebe2e92b8d0"
  },
  "implementation": {
    "name": "Stacks",
    "version": "0.70.52",
    "revision": "bf1245e336ab14551e22cb7d88284f93e649a1a2",
    "repository": "https://github.com/stacksjs/stacks",
    "sourceDigest": "sha256:..."
  },
  "execution": {
    "runtime": { "name": "bun", "version": "1.3.14" },
    "platform": { "os": "linux", "architecture": "x64" },
    "ci": { "provider": "github-actions", "runUrl": "https://...", "artifactUrl": "https://..." }
  },
  "profileClaim": null,
  "results": ["one attributable result per requirement"],
  "drivers": ["one record per evaluated driver"],
  "extensions": [],
  "exceptions": [],
  "generator": { "name": "@stacksjs/protocol-adapter", "version": "1.0.0-draft.1", "revision": "..." }
}
```

Rules:

- A profile MUST NOT be claimed if any required test fails or is skipped.
- Results MUST name runtime, operating system, database dialect, and tested drivers.
- A higher profile MUST include all lower-profile results.
- Experimental extensions MUST NOT be reported as conformant badges.
- Reports SHOULD link to CI logs and the exact suite revision.

### 16.1 Current Stacks.js statement

Stacks.js is the **reference implementation with no current profile claim**. Its report is structurally and semantically valid, but `profileClaim` is `null`; skipped, unsupported, partial, and experimental evidence cannot be promoted into Core, Standard, or Complete conformance.

---

## 17. Porting Guide

### 17.1 Recommended sequence

1. **Map roles.** Choose language-idiomatic files/modules for Actions, Models, Views, Middleware, Jobs, config, routes, migrations, and tests.
2. **Build the resolver.** Make application overrides and registration deterministic before adding features.
3. **Implement lifecycle fixtures.** Routing, middleware, validation, authorization, and Action execution should pass ordering tests early.
4. **Add persistence.** Implement one database dialect, transactions, migrations, and the data fixtures.
5. **Add configuration and errors.** Validate config, redact secrets, and stabilize error envelopes.
6. **Reach Core.** Publish a Core report before adding breadth.
7. **Add auth, a durable queue, observability, and type evidence.** Reach Standard.
8. **Add views, API representations, real-time, notifications, and one deployment adapter.** Reach Complete.
9. **Add extension badges independently.** Do not block protocol stability on optional product domains.

### 17.2 Host-language mapping

| Protocol concept | TypeScript/Bun expression | Other possible expression |
|---|---|---|
| Action | typed object/class with `handle()` | function, command object, service method |
| Model | `defineModel()` literal + runtime object | struct/class + metadata, schema DSL |
| Validation | fluent runtime schema with inferred type | parser combinator, attributes, generated validator |
| Type evidence | inference + declarations + runtime checks | native types, generated stubs, schemas + tests |
| Driver | typed interface selected by config | trait, protocol, DI binding, virtual interface |
| View | STX template/component | server template, component tree, native renderer |
| Migration | generated/reviewed file | DSL, SQL, declarative schema diff |

### 17.3 Interoperability levels

The protocol promises **conceptual and tooling interoperability**, not automatic package interchange:

1. **Navigation interoperability** — the same roles and layout are recognizable.
2. **Behavioral interoperability** — the same conformance fixtures produce equivalent outcomes.
3. **Description interoperability** — common artifacts such as OpenAPI or JSON Schema can cross implementations.
4. **Wire interoperability** — possible only when a separate wire-format specification exists.
5. **Binary/source interoperability** — explicitly out of scope.

---

# Part IV — Adoption, Governance, and Evidence

## 18. Adoption Guidance

### 18.1 Good fit

Stacks.js is worth evaluating when a team:

- wants Bun and TypeScript as the primary runtime/toolchain;
- values Laravel-like conventions and generated scaffolding;
- benefits from integrated routing, Actions, Models, migrations, auth, and queues;
- can pin a 0.x source/package revision;
- is willing to validate the exact drivers and delivery targets it selects;
- prefers application-owned overrides to editing framework internals.

### 18.2 Use caution

Additional evaluation is appropriate when a system:

- requires a stable 1.0 compatibility contract;
- depends on a configured driver that lacks a concrete execution path;
- requires independently audited secret-management cryptography;
- needs turnkey multi-platform desktop installers or native mobile delivery;
- must prove a particular cloud topology across several providers;
- depends on a generated OpenAPI file being continuously current;
- operates under strict regulatory, safety, or high-availability requirements.

### 18.3 Evaluation checklist

Before adopting:

- pin Bun, Stacks, and companion-package versions;
- run the project’s tests and type checks on the target OS;
- test the selected database, queue, cache, mail, storage, and cloud drivers;
- review generated migrations and rollback procedures;
- exercise token rotation, recovery, and authorization failures;
- verify proxy/TLS/cookie/CSRF behavior in the real topology;
- inspect logs and error pages for secret leakage;
- load-test the application’s own workload;
- document unsupported or experimental capabilities;
- define an upgrade window for 0.x breaking changes.

---

## 19. Positioning Without a Scorecard

Stacks belongs to the **opinionated, integrated framework** family. It favors shared conventions and first-party coordination across application layers. That differs from:

- **composition-first stacks**, where teams select each library independently;
- **frontend-first metaframeworks**, where backend services are often external choices;
- **backend-first frameworks**, where frontend and infrastructure remain separate;
- **platform-coupled frameworks**, where the framework’s strongest path targets one host;
- **language-neutral specifications**, which define behavior but ship no full reference framework.

Stacks attempts to combine the last two ideas: an integrated implementation plus a language-neutral protocol draft. The tradeoff is straightforward. Integration can reduce decision and glue costs, while a broad pre-1.0 surface increases the burden of stabilization, testing, and precise maturity reporting.

This paper does not rank named competitors or repeat unverifiable claims about paid tiers, performance, feature completeness, or lock-in. Comparative claims should be maintained as a dated, sourced research artifact rather than embedded as timeless protocol text.

---

## 20. Governance and Change Control

Protocol governance, licensing, requirement catalogs, fixtures, report schema, and an independent runner are now public in [`stacksjs/rfcs`](https://github.com/stacksjs/rfcs). Ratification still requires:

1. completion of the public review/vote window for RFCs 0002–0005;
2. disposition of review objections and recorded decisions;
3. a complete passing profile report from Stacks.js or another implementation;
4. external security review before broad environment-encryption claims;
5. continued feedback from independent runner/implementation authors.

Protocol changes should use semantic categories:

- **Editorial** — clarification with no observable behavior change;
- **Compatible** — new optional capability or test;
- **Behavioral** — changed requirement, with migration guidance;
- **Breaking** — removed/changed contract requiring a protocol-version increment.

RFC 0001 now governs changes. Proposed RFCs do not become accepted merely because reference code exists; their review windows and decision records remain authoritative.

---

## 21. Evidence-Driven Roadmap

This is a list of work required to strengthen the protocol claim, not a delivery-date commitment.

Implementation is tracked in [stacksjs/stacks#2060 — Protocol 1.0 ratification program](https://github.com/stacksjs/stacks/issues/2060), with focused issues for each workstream.

### Protocol

- Assign requirement IDs to the normative text.
- Publish language-neutral fixtures and a report JSON Schema.
- Resolve whether security is a profile baseline or separate certification layer.
- Define compatibility rules for directory and error-envelope changes.
- Add a driver contract test kit.
- Ratify extension-badge requirements independently of core profiles.

### Reference implementation

- Generate a conformance report in CI.
- Align root and workspace version provenance.
- Remove configured-but-unimplemented drivers or mark them at type/config level.
- Make OpenAPI freshness checkable in CI.
- Publish tested database/provider matrices.
- Complete or narrow environment-encryption claims after cryptographic review.
- Publish desktop release/platform evidence before calling the target stable.
- Keep the white paper’s source snapshot automated and reproducible.

### Documentation

- Tag every capability page with maturity and last-verified revision.
- Separate protocol requirements from Stacks.js syntax.
- Replace volatile counts with generated values or pinned snapshots.
- Remove legal conclusions and unsupported benchmarks.
- Test every command and code sample in CI where practical.

---

## Appendix A — Capability-to-Package Map

Selected mappings at the audited revision:

| Capability | Stacks.js packages |
|---|---|
| Actions and lifecycle | `@stacksjs/actions`, `@stacksjs/router`, `@stacksjs/server`, `@stacksjs/error-handling` |
| API | `@stacksjs/api`, `@stacksjs/router` |
| Validation | `@stacksjs/validation` |
| Data | `@stacksjs/database`, `@stacksjs/orm`, `@stacksjs/query-builder` |
| Authentication and security | `@stacksjs/auth`, `@stacksjs/security` |
| Queues and schedules | `@stacksjs/queue`, `@stacksjs/scheduler`, `@stacksjs/cron` |
| Real-time | `@stacksjs/realtime` |
| Notifications | `@stacksjs/notifications`, `@stacksjs/email`, `@stacksjs/sms`, `@stacksjs/push`, `@stacksjs/chat` |
| Observability | `@stacksjs/logging`, `@stacksjs/health` |
| Storage and cache | `@stacksjs/storage`, `@stacksjs/cache` |
| AI | `@stacksjs/ai` |
| Cloud and deploy | `@stacksjs/cloud`, `@stacksjs/deploy`, `@stacksjs/dns` |
| UI and views | `@stacksjs/ui`, `@stacksjs/composables`; STX is provided through companion workspace/catalog dependencies |
| Developer tooling | `@stacksjs/buddy`, `@stacksjs/build`, `@stacksjs/testing`, `@stacksjs/lint`, `@stacksjs/tinker` |

The mapping is many-to-many. Package names are implementation details and are not protocol identifiers.

---

## Appendix B — Configuration Map

The source contains capability-scoped configuration including:

| File | Concern |
|---|---|
| `config/app.ts` | application identity, environment, locale, timezone |
| `config/auth.ts` | guards, providers, tokens, password reset |
| `config/database.ts` | connections, dialect, migrations |
| `config/cache.ts` | cache stores and defaults |
| `config/queue.ts` | queue selection and connections |
| `config/realtime.ts` | broadcast mode, server, channels, limits |
| `config/notification.ts` | default notification channel |
| `config/email.ts` | mail transport/provider settings |
| `config/filesystems.ts` | storage disks/drivers |
| `config/ai.ts` | AI defaults and models |
| `config/security.ts` | firewall and security policy |
| `config/cloud.ts` | application cloud integration |
| `config/logging.ts` | log behavior |
| `config/analytics.ts` | analytics driver |
| `config/ui.ts` / `crosswind.ts` | UI and CSS behavior |

The live types and source are authoritative for exact options.

---

## Appendix C — Source Evidence Map

Pinned links make the paper auditable even as `main` changes. The generated
[source-evidence page](https://whitepaper.stacksjs.com/reference/source-evidence) is the authoritative inventory:

- [Root toolchain and repository manifest](https://github.com/stacksjs/stacks/blob/bf1245e336ab14551e22cb7d88284f93e649a1a2/package.json)
- [Framework core packages](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core)
- [Action implementation](https://github.com/stacksjs/stacks/blob/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/actions/src/action.ts)
- [Router implementation](https://github.com/stacksjs/stacks/blob/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/router/src/stacks-router.ts)
- [Model definition implementation](https://github.com/stacksjs/stacks/blob/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/orm/src/define-model.ts)
- [Migration generator](https://github.com/stacksjs/stacks/blob/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/database/src/migrations.ts)
- [API resources and OpenAPI generator](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/api/src)
- [Queue execution paths](https://github.com/stacksjs/stacks/blob/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/queue/src/action.ts)
- [Real-time implementation](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/realtime/src)
- [Authentication implementation](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/auth/src)
- [Environment encryption implementation](https://github.com/stacksjs/stacks/blob/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/env/src/crypto.ts)
- [Application encryption implementation](https://github.com/stacksjs/stacks/blob/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/security/src/crypt.ts)
- [Analytics implementation](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/analytics/src)
- [Desktop implementation](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/desktop/src)

---

## Appendix D — Glossary

- **Capability profile** — Core, Standard, or Complete set of required behavior.
- **Extension badge** — independently tested optional capability.
- **Candidate** — an implementation that appears to cover a profile but lacks a passing formal report.
- **Conformant** — an implementation with a passing, versioned conformance report.
- **Generated artifact** — output derived from source definitions, such as migrations, declarations, or OpenAPI.
- **MVA** — Model–View–Action.
- **Reference source snapshot** — exact implementation commit used as evidence.
- **Stable interface** — a documented capability boundary whose compatibility policy is stated.

---

## Conclusion

Stacks has a compelling core idea: make the architecture and conventions of an integrated full-stack framework explicit enough to travel beyond one implementation. Stacks.js supplies unusually broad reference material for that effort—real packages, application defaults, typed configuration, model and migration tooling, Actions, routing, auth, queues, real-time messaging, AI integration, and operational helpers.

The next step is rigor, not a larger feature list. The protocol needs requirement IDs, shared fixtures, public governance, and conformance reports. The implementation needs capability matrices that distinguish concrete paths from configured aspirations, and its documentation must stay pinned to reproducible evidence.

This revision puts that discipline into the paper itself. It treats Stacks.js as a substantial pre-1.0 reference implementation, records what the supplied source supports, names what remains partial or experimental, and defines how future claims can become testable.

### Start with the reference implementation

```bash
curl -fsSL https://pantry.dev | bash
panx @stacksjs/buddy new my-project
cd my-project
buddy dev
```

- Documentation: [stacksjs.org](https://stacksjs.org)
- Source: [github.com/stacksjs/stacks](https://github.com/stacksjs/stacks)
- Discussions: [github.com/stacksjs/stacks/discussions](https://github.com/stacksjs/stacks/discussions)
- Community: [discord.gg/stacksjs](https://discord.gg/stacksjs)
- Sponsors: [JetBrains](https://www.jetbrains.com/) and [Solana Foundation](https://solana.com/)

---

*Protocol 1.0 remains a governed working draft. APIs and contracts may change through the published RFC process before ratification. The implementation statements in this paper apply only to source revision `bf1245e336ab14551e22cb7d88284f93e649a1a2` and its checksummed evidence set.*
