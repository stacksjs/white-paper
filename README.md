# Stacks

## A Protocol — and its Reference Implementation — for Full-Stack Application Development

**Protocol Version 1.0 (Draft) · Reference Implementation `stacks.js` 0.70.45 · Closed Beta**

---

### White Paper

**Author**: Stacks Core Team

**Published**: January 2026

**Reference Implementation**: https://github.com/stacksjs/stacks

---

## Abstract

**Stacks is an open protocol for building full-stack applications.** It specifies—independently of any single programming language—the conventions, interface contracts, and architectural patterns that a full-stack application needs: how requests are routed and validated, how data is modeled and persisted, how users are authenticated, how background work is scheduled, and how applications are deployed. The protocol defines *what* a conformant full-stack framework provides and *how its pieces fit together*, while leaving *how* each piece is implemented to the language and runtime that hosts it.

**Stacks.js is the protocol's first reference implementation**, written in TypeScript and built from the ground up for the Bun runtime. It demonstrates that the protocol is buildable, complete, and pleasant to use, comprising 77 specialized packages that implement every contract the protocol defines.

This white paper is organized in three parts. **Part I specifies the Stacks Protocol** in language-agnostic terms. **Part II describes Stacks.js**, the TypeScript/Bun reference implementation, and how it satisfies each contract. **Part III defines conformance**—what any implementation, in any language, must provide to call itself "Stacks-conformant"—and offers a porting guide for new implementations.

**Keywords**: Application Protocol, Full-Stack Framework, Convention over Configuration, Interface Contracts, Type Safety, Conformance, Reference Implementation, AI Integration, Developer Experience

---

## Executive Summary

Modern application development has become increasingly fragmented. Developers must orchestrate dozens of tools, libraries, and frameworks—each with its own configuration, conventions, and learning curve. Ecosystems like JavaScript are rich but lack the cohesive, opinionated foundations that made platforms like Laravel (PHP) and Ruby on Rails paradigmatically successful—and even those foundations are bound to a single language. There is no shared, portable specification for *what a full-stack framework is*, so every language reinvents the wheel and no convention travels across language boundaries.

**Stacks addresses this at two layers.**

```
        ┌─────────────────────────────────────────────────────────────┐
        │                     THE STACKS PROTOCOL                       │
        │              (language-agnostic specification)                │
        │                                                               │
        │    Conventions · MVA architecture · Interface contracts       │
        │    Driver pattern · Type contract · Conformance levels        │
        └─────────────────────────────────────────────────────────────┘
                                     ▲
                  conforms to /      │
                  implements         │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
     ┌────────┴────────┐   ┌─────────┴────────┐   ┌─────────┴────────┐
     │    Stacks.js    │   │  Implementation  │   │  Implementation  │
     │ TypeScript · Bun│   │  in language B   │   │  in language C   │
     │   (reference)   │   │    (future)      │   │    (future)      │
     └─────────────────┘   └──────────────────┘   └──────────────────┘

       One specification.  Many conformant implementations.  Portable
       conventions, contracts, and tooling patterns across every one.
```

### The Protocol

The Stacks Protocol is a language-agnostic specification. It defines:

- **Conventions** — directory layout, naming, and auto-discovery rules that make applications legible regardless of implementation language.
- **The Model–View–Action (MVA) architecture** — a clear separation of data, presentation, and business logic.
- **Interface contracts** — the behavioral specification for routing, validation, data modeling, authentication, configuration, queues, real-time messaging, and notifications.
- **The driver pattern** — a uniform way to swap backends (databases, caches, queues, storage, cloud providers) behind stable interfaces.
- **A static type-contract requirement** — types (or the host language's strongest equivalent) must flow from data definitions through to responses and views.
- **Conformance levels** — so implementations can be partial, complete, or extended, and still interoperate at the convention level.

Because these are specifications rather than code, they can be implemented in any language. The conventions a developer learns once travel with them to every conformant implementation.

### The Reference Implementation: Stacks.js

Stacks.js proves the protocol in practice. Built exclusively for **Bun**, it provides a batteries-included framework: frontend UI, backend APIs, a typed ORM, cloud infrastructure-as-code, real-time messaging, passwordless authentication, payments, queues, and an AI-powered CLI. Everything is built-in and MIT-licensed—no feature gates, no per-feature subscriptions, no vendor lock-in.

**Why a protocol, not just a framework?** Three reasons:

1. **Portability of knowledge.** Conventions learned in one implementation apply to all of them. A developer who knows Stacks knows the shape of any conformant framework.
2. **Longevity.** Runtimes and languages rise and fall; a specification outlives any single implementation. The protocol can be implemented anew as ecosystems evolve.
3. **Plurality.** A protocol invites multiple implementations—reference, alternative, and specialized—that interoperate at the convention and contract level rather than competing in isolation.

Stacks.js is the first conformant implementation. It will not be the last: the protocol is explicitly designed so that implementations in other languages can satisfy the same contracts and share the same conventions, with this white paper serving as the shared specification each one builds against.

Stacks is currently in Closed Beta (January 2026), with active development supported by sponsors including JetBrains and the Solana Foundation. Both the protocol specification and the reference implementation are open-source and MIT-licensed.

---

# Part I: The Stacks Protocol

> Part I specifies the protocol in language-agnostic terms. It uses neutral notation and, where interfaces are shown, an illustrative pseudo-signature syntax that any statically- or gradually-typed language can express. Concrete TypeScript appears only in Part II. Throughout, **MUST**, **SHOULD**, and **MAY** carry their conventional specification meaning (RFC 2119).

## 1. Introduction & Vision

### 1.1 The Problem: Full-Stack Complexity and Fragmentation

Building a production application requires decisions across dozens of categories—runtime, web framework, API style, database, ORM, authentication, styling, state management, testing, and deployment. Each decision cascades into further choices, configuration, and integration work. The result is fatigue: developers spend more time wiring tools together than building features.

Opinionated frameworks like Laravel and Rails solved this *within* their languages by replacing configuration with convention. But their conventions are not portable: a Rails developer moving to a TypeScript project, or a PHP team adopting Go for a service, must relearn everything. The knowledge does not travel because there is no specification—only code.

```
   WITHOUT A SHARED PROTOCOL              WITH THE STACKS PROTOCOL
   ─────────────────────────              ────────────────────────

   runtime?   framework?   ORM?           ┌──────────────────────────┐
   auth?      styling?     API?           │  one set of conventions   │
   testing?   deploy?      state?   ──▶   │  one architecture (MVA)   │
        ▼  ▼  ▼  ▼  ▼  ▼                  │  one set of contracts     │
   re-decided every project,              │  portable across every    │
   re-learned in every language           │  conformant language      │
                                          └──────────────────────────┘
   knowledge trapped in code              knowledge travels with you
```

**The Stacks Protocol exists to make the conventions portable.** It captures the hard-won patterns of full-stack development as a specification that any language can implement, so the value compounds across ecosystems instead of being trapped inside one.

### 1.2 The Solution: A Protocol with Reference Implementations

Stacks separates *specification* from *implementation*:

- **The protocol** (Part I) defines conventions, architecture, and interface contracts—language-agnostic, stable, and versioned.
- **An implementation** (Stacks.js, Part II) realizes those contracts in a specific language and runtime, adding the concrete tooling, performance characteristics, and developer experience appropriate to that ecosystem.
- **Conformance** (Part III) is the bridge: a checklist that any implementation can be measured against, so "Stacks-conformant" is a meaningful, testable claim.

### 1.3 Design Philosophy

The protocol is built on six foundational principles. These are properties of the *specification*; every conformant implementation is expected to honor them in its own idiom.

#### Principle 1: Developer Joy
Every contract is evaluated against a simple question: does this bring joy to developers? The protocol optimizes for the developer experience, recognizing that productive developers build better software.

#### Principle 2: Progressive Disclosure
Simple things should be simple; complex things should be possible. Implementations MUST provide zero-configuration defaults for common patterns while exposing full control when needed.

#### Principle 3: Type-Driven Development
Static type contracts are foundational, not optional. Data definitions are the source of truth, and types (or the host language's strongest static guarantee) MUST flow from those definitions through queries, requests, responses, and views. Where a host language lacks static types, the implementation SHOULD provide the closest equivalent (e.g., generated stubs, runtime schemas, or gradual typing).

#### Principle 4: Batteries Included, Batteries Removable
The protocol specifies solutions for common requirements—authentication, payments, email, queues—but none are mandatory. Each capability is an independent module behind a stable interface, so any one can be replaced without disturbing the rest.

#### Principle 5: Protocol-First Design
Every capability exposes a well-defined interface that serves as its specification. Third parties can implement alternative backends (drivers), extend functionality, or adopt individual capabilities. The interface enables an ecosystem; any given framework is one implementation of it.

#### Principle 6: AI as Collaborator
AI capabilities are part of the specification, not bolted on. The protocol defines an AI integration interface so that code generation, codebase exploration, and in-application AI features are available uniformly across implementations.

---

## 2. Protocol Foundations

### 2.1 What the Protocol Specifies — and What It Leaves Open

The protocol draws a deliberate line between *contract* and *mechanism*.

**The protocol specifies (normative):**
- The **conventions**: directory layout, file naming, and auto-discovery semantics (§4).
- The **MVA architecture** and the responsibilities of each layer (§3).
- The **interface contracts** for each core capability: routing, validation, data modeling, authentication, configuration, queues, real-time, and notifications (§5–§6).
- The **driver pattern** for pluggable backends (§6.6).
- The **type-contract requirement** linking data definitions to all downstream layers (§6.7).
- The **request lifecycle** and the ordering guarantees within it (§6.2).

**The protocol leaves open (implementation-defined):**
- The host **language and runtime**.
- The concrete **syntax** of templates, schemas, and configuration.
- **Performance** characteristics and internal data structures.
- The **wire formats** and storage engines behind drivers (only the driver interface is fixed).
- Which **optional capabilities** an implementation ships.

This boundary is what makes the protocol portable. Two conformant implementations may share zero source code yet expose the same conventions, the same architecture, and interchangeable interface contracts.

### 2.2 Conformance Levels

An implementation declares one of three conformance levels (formally defined in Part III):

| Level | Requirement |
|-------|-------------|
| **Core** | Implements the conventions (§4), the MVA architecture (§3), the request lifecycle (§6.2), and the routing, validation, data-model, and configuration contracts. |
| **Standard** | Core, plus authentication, the driver pattern, queues, and the type-contract requirement. |
| **Complete** | Standard, plus real-time, notifications, AI integration, and infrastructure/deployment contracts. |

The levels are nested—each is a superset of the one inside it:

```
   ┌─────────────────────────────────────────────────────┐
   │ COMPLETE                                              │
   │   + real-time · notifications · AI · infrastructure   │
   │   ┌─────────────────────────────────────────────┐    │
   │   │ STANDARD                                     │    │
   │   │   + auth · driver pattern · queues · types    │   │
   │   │   ┌─────────────────────────────────────┐    │    │
   │   │   │ CORE                                 │    │    │
   │   │   │   conventions · MVA · lifecycle ·    │    │    │
   │   │   │   routing · validation · data · config│   │    │
   │   │   └─────────────────────────────────────┘    │    │
   │   └─────────────────────────────────────────────┘    │
   └─────────────────────────────────────────────────────┘
                                              ▲
                            Stacks.js implements this level
```

Stacks.js (Part II) is a **Complete** implementation.

---

## 3. The Model–View–Action (MVA) Architecture

The protocol prescribes a **Model–View–Action** separation. MVA refines the familiar MVC pattern by replacing the broad "Controller" with focused, single-responsibility **Actions**.

```
            ┌──────────┐
 Request ──▶│  Action  │──▶ Response
            └────┬─────┘
                 │ reads/writes
            ┌────▼─────┐         ┌──────────┐
            │  Model   │◀───────▶│   View    │
            └──────────┘ renders └──────────┘
```

- **Model** — the source of truth for a domain entity. A model declares its fields (with types and constraints), its relationships, and its domain behavior. Models drive the type contract: the field definitions are what downstream types are generated from.

- **View** — the presentation layer. A view renders model data for a target medium (HTML, JSON, a native UI). Views MUST NOT contain business logic; they consume data prepared by Actions.

- **Action** — a single unit of business logic with explicit inputs and outputs. An Action validates its input, checks authorization, performs its work (often via Models), and returns a result. Actions are the protocol's primary unit of testability and reuse: the same Action MAY be invoked from a route, a CLI command, a queued job, or another Action.

The protocol requires that business logic live in Actions (not in routes, models, or views), that validation and authorization be expressible declaratively on an Action, and that an Action be invokable independently of the transport that triggered it.

### 3.1 One Core, Many Delivery Targets

Because business logic lives in transport-independent Actions (data in Models, presentation in Views), a single application core can serve many **delivery targets** without duplicating logic. The protocol treats the delivery target as a thin edge around the same core:

```
                    ┌────────────────────────────┐
                    │    Models  +  Actions       │   write once
                    │   (+ Views for UI targets)  │
                    └──────────────┬─────────────┘
        ┌───────────────┬──────────┼──────────┬───────────────┐
        ▼               ▼          ▼          ▼               ▼
   ┌─────────┐    ┌─────────┐ ┌─────────┐ ┌─────────┐   ┌─────────┐
   │   Web   │    │   API   │ │ Desktop │ │ Mobile  │   │   CLI   │
   │ (views) │    │ (JSON)  │ │(native) │ │(native) │   │(commands)│
   └─────────┘    └─────────┘ └─────────┘ └─────────┘   └─────────┘
```

A conformant implementation MUST be able to expose the same Action through at least the **web** and **API** targets; **desktop**, **mobile**, and **CLI** targets are RECOMMENDED where the host platform supports them. The defining requirement: adding a target does not require rewriting business logic—only adapting how input arrives and how output is rendered.

### 3.2 The Model as Single Source of Truth

The protocol elevates the Model beyond a data class. A **typed model definition is the single source of truth** from which much of the application is *derived* rather than hand-written. From one declaration of an entity—its fields (with types and constraints), relationships, and the capabilities it opts into—a conformant implementation derives:

```
                     Model definition  (typed: fields · rules · relations · traits)
                                       │   single source of truth
        ┌───────────────┬─────────────┼─────────────┬────────────────┐
        ▼               ▼             ▼             ▼                ▼
   Static types   Persistence    Request        Default REST    Opt-in capabilities
   (row / insert  schema /       validation     API surface     (search index ·
    / update)     migration      (create/update) (CRUD + pages)  admin views · seeds)
```

The protocol's requirements here:

- The **type contract** (§6.7) MUST hold: a change to the model's fields propagates to the derived types, persistence schema, and request/response shapes.
- Request **validation** (§6.3) for create/update operations SHOULD be derivable from the model's field rules.
- A **default API surface** (§6.9)—list, show, create, update, delete, with pagination and authorization—SHOULD be auto-providable for a model that opts in.
- Secondary capabilities (search indexing, admin views, seed data) MAY be auto-provided from the same declaration.

The developer declares *what the data is and what it may do*; the implementation provides the mechanical surface. This is the protocol's sharpest expression of convention over configuration: define the data once, and the types, validation, schema, and API move with it—they cannot drift, because they are derived, not copied.

---

## 4. Convention Specification

Conventions are the protocol's most visible, most portable contribution: they make any conformant application legible at a glance, regardless of language.

### 4.1 Directory Layout

A conformant application MUST organize code into the following roles. Names are normative; an implementation MAY map them to language-idiomatic casing but MUST preserve the role and the auto-discovery semantics.

```
app/
├── Actions/          # Business logic units (one responsibility each)
├── Models/           # Domain entities and their behavior
├── Middleware/       # Request/response interceptors
├── Jobs/             # Queueable background work
└── Notifications/    # Multi-channel notification definitions

config/               # Typed configuration, one file per capability
database/
├── migrations/       # Versioned schema changes
└── seeders/          # Deterministic seed data
resources/
├── components/       # Reusable view components
├── views/            # Page-level views
└── functions/        # Shared utility functions
routes/               # Route definitions
tests/                # Test suite
```

### 4.2 Auto-Discovery

Files placed in these directories MUST be auto-discovered by role:
- Models are mapped to storage (e.g., a database table) by naming convention.
- Components are made available to views without explicit import.
- Routes, jobs, and notifications are registered by their presence in the corresponding directory.

Auto-discovery is what lets convention replace configuration. An implementation MAY allow explicit registration as an escape hatch, but the default MUST be discovery.

### 4.3 Naming Conventions

The protocol fixes the *mapping rules*, not the casing:
- An entity named `User` maps to a storage collection named `users` (pluralized, lower-cased) unless overridden.
- A component's file name determines its reference name in views.
- An Action's name describes its single responsibility (e.g., `CreatePostAction`).

### 4.4 Zero-Config Default

A newly scaffolded application MUST run with no configuration. Configuration files exist to *override* sensible defaults, never to *enable* basic operation.

---

## 5. Module Capability Specification

The protocol organizes functionality into **capability domains**. Each domain has a defined interface; an implementation realizes a domain as one or more modules/packages. The reference implementation (Part II) ships 77 such modules, but the protocol counts *capabilities*, not packages—another implementation MAY split or combine them differently as long as the interfaces hold.

| Domain | Capability (interface contract) |
|--------|----------------------------------|
| **Routing** | Map requests to Actions; groups, parameters, constraints, named routes (§6.1) |
| **Request Lifecycle** | Ordered middleware → validation → action → response pipeline (§6.2) |
| **Validation** | Declarative, composable schemas with type inference (§6.3) |
| **Data Modeling** | Models, relationships, migrations, query building (§6.4) |
| **Authentication** | Identity, credentials, and authorization checks (§6.5) |
| **Security & Secrets** | Secure defaults, injection/XSS safety, crypto, encrypted-in-repo secrets, audit log (§7.8) |
| **Drivers** | Pluggable backends for storage, cache, queue, mail, cloud (§6.6) |
| **Configuration** | Typed, environment-aware, capability-scoped config (§6.8) |
| **Queues & Scheduling** | Deferred and recurring background work (§7.1) |
| **Real-Time** | Bidirectional channels with authorization and presence (§7.2) |
| **Notifications** | One message, many delivery channels (§7.3) |
| **AI Integration** | Provider-agnostic completion/chat/streaming interface (§7.4) |
| **API** | Resourceful routing, response shaping, pagination, machine-readable description (§6.9) |
| **Delivery Targets** | One core exposed as web, API, desktop, mobile, CLI (§3.1) |
| **Observability** | Structured logging, health checks, request tracing (§7.6) |
| **Analytics** | Cookieless, no-PII product analytics with ingest + reporting interfaces (§7.7) |
| **Infrastructure** | Declarative, driver-based deployment targets (§7.5) |
| **Utilities** | Strings, arrays, objects, collections, dates (implementation-provided) |

The remaining sections specify the contracts for the core domains.

---

## 6. Core Interface Contracts

### 6.1 Routing Contract

A router MUST map an (HTTP method, path) pair to an Action (or inline handler) and MUST support:

- **Path parameters** with optional **constraints** (e.g., numeric, UUID, slug).
- **Named routes** with reverse URL generation.
- **Route groups** sharing a prefix and/or middleware stack.
- **Resource routes** that expand to the conventional CRUD set.

Illustrative specification notation:

```
route(method, path, action)            // bind a handler
route(...).where(param, constraint)    // constrain a parameter
route(...).name(identifier)            // name for reverse lookup
group({ prefix, middleware }, () => …) // shared prefix/middleware
resource(path, actions)                // CRUD expansion
```

Binding an Action by reference (rather than importing it) is RECOMMENDED, so routing stays declarative and discoverable.

### 6.2 Request Lifecycle

Every request MUST flow through this ordered pipeline. The ordering is normative; implementations MUST NOT reorder validation before routing, or the action before validation.

```
Request
  → Server (accept connection)
  → Global Middleware       (CORS, logging, security headers)
  → Router                  (match request to an Action)
  → Route Middleware        (auth, rate limiting)
  → Validation              (validate input against the Action's schema)
  → Action                  (business logic)
  → Response                (serialization, headers)
Response
```

Middleware MUST be able to short-circuit the pipeline (e.g., an auth middleware returning `401` before the Action runs). Validation failure MUST prevent the Action from executing and MUST produce a structured error result.

### 6.3 Validation Contract

Validation is a first-class, declarative capability. The contract requires:

- **Composable schemas** built from primitive and complex validators (string, number, boolean, array, object, enum, date, and specialized formats such as email, URL, UUID).
- **Fluent constraints** chained onto a validator (`min`, `max`, `required`, `optional`, format checks).
- **Static type inference**: a schema MUST be able to yield the static type of the data it validates (the type-contract requirement, §6.7).
- **Structured errors** keyed by field path (including nested paths via dot notation).
- **Shared client/server use**: the same schema MUST be usable to validate input on both the server and, where applicable, the client.

Illustrative notation:

```
schema = object({
  email:    string().email().required(),
  age:      integer().min(18).optional(),
  role:     enum(['user', 'admin']).required(),
})
result = schema.validate(input)   // → { valid, data | errors }
T      = Infer<schema>            // static type of validated data
```

### 6.4 Data Model & Persistence Contract

The data layer has three required surfaces.

**Models** declare fields (name, type, constraints), relationships, and behavior. The field declarations are the source of truth for the type contract.

**Relationships** MUST cover one-to-one, one-to-many, many-to-many, has-through, and polymorphic associations, and MUST support eager loading to avoid N+1 access patterns.

**Migrations** MUST express schema changes as reversible, versioned units (`up`/`down`).

A **query interface** MUST provide composable, type-aware construction of reads and writes (filtering, joins, aggregation, ordering, pagination) and transactional execution. The query interface SHOULD return precisely-typed results derived from model definitions rather than untyped rows.

Illustrative notation:

```
model User {
  fields { name: string!, email: string! unique, role: enum }
  posts(): hasMany(Post)
}

query(User).where('active', true).with('posts').limit(10).get()
transaction(tx => { … })
```

### 6.5 Authentication Contract

The protocol specifies authentication around **identity**, **credentials**, and **authorization**, and is credential-mechanism-agnostic. An implementation MUST provide at least one credential mechanism and MUST expose:

- **Registration** and **verification** flows for its credential mechanism(s).
- An **authenticated identity** attached to the request (e.g., `request.user`).
- **Authorization checks** usable declaratively from Actions and views (e.g., `can(ability, subject)`).

The protocol RECOMMENDS passwordless-first mechanisms (e.g., WebAuthn/passkeys and TOTP second factors) but does not forbid session, token, or OAuth mechanisms; these are credential drivers behind the same contract.

### 6.6 The Driver Pattern

Pluggable backends are central to the protocol. For each of **database, cache, queue, mail, storage, and cloud/infrastructure**, the protocol defines a *capability interface*; concrete backends are **drivers** implementing that interface.

```
interface QueueDriver {
  push(job, options)
  later(delay, job)
  process(handler)
}
// drivers: in-memory, redis, sqs, … — selected by configuration
```

```
            Application code  (imports only the interface)
                            │
                   ┌────────▼─────────┐
                   │   QueueDriver     │   capability interface  (fixed by
                   │   push · later ·  │   the protocol — never changes)
                   │   process         │
                   └────────┬─────────┘
            ┌───────────────┼───────────────┐
     ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
     │  in-memory  │  │   Redis    │  │     SQS     │   drivers (swapped by
     └─────────────┘  └────────────┘  └─────────────┘   configuration alone)
```

The contract: application code depends only on the capability interface; the active driver is selected by configuration (§6.8). Swapping a driver MUST NOT require changes to application code. This is what makes an application portable across environments—and what lets an implementation grow new backends without breaking consumers.

### 6.7 The Type-Contract Requirement

The protocol requires an unbroken chain of static guarantees from data definition to delivery:

```
   ┌────────────┐    ┌───────────┐    ┌──────────────┐    ┌──────────────┐
   │   Model    │──▶ │ Migration │──▶ │    Query     │──▶ │ Request /    │
   │   fields   │    │  schema   │    │   results    │    │ Response     │
   │ (source of │    └───────────┘    └──────────────┘    └──────┬───────┘
   │  truth)    │                                                │
   └─────┬──────┘    ┌────────────────┐    ┌──────────────┐      ▼
         └────────▶  │   Validation   │──▶ │ View / component inputs      │
                     │    schemas     │    └──────────────────────────────┘
                     └────────────────┘
         ▲                                                        │
         └──── change a field, and every consumer surfaces it ────┘
                    (compile time, or test time)
```

Each arrow MUST preserve type information. In a statically-typed host language this is enforced by the compiler; in a gradually- or dynamically-typed host the implementation MUST provide the strongest available equivalent (generated type stubs, runtime schema validation, or both). The defining property is that a change to a model's fields surfaces—at authoring time or test time—everywhere those fields are consumed.

### 6.8 Configuration Contract

Configuration MUST be:
- **Typed** — each configuration file conforms to a declared shape, with editor assistance where the host language allows.
- **Capability-scoped** — one file per capability (database, cache, queue, mail, auth, …).
- **Environment-aware** — values resolvable from the environment, with defaults.
- **Override-only** — present to override defaults, never required for basic operation (§4.4).

### 6.9 API Contract

When an Action is exposed as a JSON API rather than a rendered view (§3.1), the protocol adds requirements for predictable, machine-consumable responses:

- **Resourceful routing** — a resource maps to the conventional CRUD set (`index`, `show`, `store`, `update`, `destroy`), with the ability to include or exclude members.
- **Response shaping** — responses are produced by an explicit transformer (a "resource"/serializer), never by leaking raw model rows; the transformer controls which fields appear and how related data is embedded.
- **Pagination conventions** — list endpoints MUST support pagination and return consistent metadata (current page and size, plus total or next/previous cursors). Implementations SHOULD offer both offset and cursor strategies.
- **Stable error format** — validation and runtime errors MUST serialize to a consistent, documented shape, keyed by field where applicable (§6.3).
- **API authentication** — at least one token mechanism (e.g., bearer tokens), gated by the authentication contract (§6.5) and independent of any browser session.
- **Machine-readable description** — an implementation SHOULD emit a machine-readable API description (e.g., an OpenAPI document) derived from its routes and validation schemas, so clients and tooling can be generated from the contract.

These requirements make an API surface portable: a client written against one implementation's description works against any other implementation exposing the same resources.

```
resource(path, action, { only | except })   // CRUD expansion
transform(model) -> shaped JSON              // explicit serializer
paginate(query, perPage | cursor) -> { data, meta }
describe() -> OpenAPI document               // generated from routes + schemas
```

---

## 7. Cross-Cutting Capability Contracts

### 7.1 Queues & Scheduling

The protocol specifies deferred and recurring work:
- A **Job** is a self-contained unit of background work with configurable retry, timeout, and failure handling.
- Jobs MUST be **dispatchable** immediately, after a delay, and as **chains** (sequential dependencies).
- A **scheduler** MUST support recurring execution by cron-style expressions.
- Queue backends are **drivers** (§6.6).

### 7.2 Real-Time

The protocol specifies bidirectional channels:
- **Public, private, and presence** channel types.
- **Authorization** callbacks gating private/presence channels.
- **Presence** tracking (join/leave with member metadata).
- A symmetric **client interface** for subscribing and publishing.

### 7.3 Notifications

One notification, many channels:
- A notification declares the **channels** it targets (email, SMS, push, database, chat, …) per recipient.
- Per-channel **formatting** methods produce the channel-specific payload.
- Delivery channels are **drivers** (§6.6).

### 7.4 AI Integration

The protocol defines a **provider-agnostic** AI interface:
- **Completion**, **chat**, and **streaming** primitives.
- **Structured output** constrained by a validation schema (§6.3).
- **Provider switching** by configuration (Anthropic, OpenAI, local models, …) behind one interface.

This contract makes AI a uniform capability across implementations, both for in-application features and for developer tooling (e.g., code generation).

### 7.5 Infrastructure & Deployment

The protocol specifies infrastructure as a **declarative, driver-based** capability:
- Infrastructure is described as typed configuration, not imperative scripts.
- Cloud providers are **drivers**; the same configuration SHOULD port across providers as drivers become available.
- Implementations SHOULD ship **presets** for common deployment topologies (static site, server, serverless, full-stack, API backend).

### 7.6 Observability

The protocol specifies that applications be observable by default:
- **Structured logging** — log records carry structured context; human-readable in development, machine-parseable in production.
- **Health checks** — a standard endpoint reports liveness/readiness and the status of critical dependencies (database, cache, queue).
- **Request tracing** — every request carries a correlation identifier propagated across middleware, actions, jobs, and notifications, so a unit of work can be followed end to end.

Logging and tracing backends are **drivers** (§6.6).

### 7.7 Privacy-First Analytics

The protocol treats product analytics as a core, privacy-preserving capability—measurement MUST be possible without surveilling users:

- **Cookieless by default** — visitor identity is derived without persistent client storage. Implementations SHOULD count unique visitors via a rotating, secret-salted hash of coarse request attributes that cannot be reversed or correlated across days.
- **No personal data** — no PII is stored; IP addresses MUST be anonymizable (never stored raw by default), and geolocation, if collected at all, is opt-in and coarse (country-level).
- **Respect user signals** — Do Not Track and explicit opt-out MUST be honored.
- **Two interfaces** — an **ingest** interface (record a pageview or custom event) and a **reporting** interface (aggregations over time, with breakdowns and filters), so one event stream serves both collection and querying.
- **Retention & aggregation** — raw events have bounded retention; pre-aggregated rollups serve fast, cheap reporting over long ranges.

Because no consent-gating identifiers are used, conformant analytics SHOULD be operable without a cookie-consent banner. Storage and geolocation lookups are **drivers** (§6.6).

### 7.8 Security & Secret Management

Security is a protocol-level concern, not an add-on. A conformant implementation MUST be secure by default and MUST provide:

- **Secure defaults** — protective response headers (content-type-options, frame-options, referrer-policy; HSTS in production), CSRF protection for state-changing requests, and rate limiting MUST be available and applied by default where relevant.
- **Injection safety** — the data layer MUST default to parameterized queries; raw query construction from unsanitized input MUST be prevented (ideally rejected at the type level).
- **Output safety** — the view layer MUST escape output by default and evaluate template expressions in a sandbox, preventing XSS.
- **Cryptographic primitives** — authenticated encryption (`encrypt`/`decrypt`) and modern password hashing (`hash`/`verify`) MUST be provided with safe, current defaults.
- **Encrypted secrets in the repository** — the protocol specifies that configuration secrets MAY be stored **encrypted in version control**: a committed *public* key encrypts values, and a *private* key held outside the repository decrypts them at runtime. Teams can version their full configuration without exposing secrets, and deployment injects only the private key. (This is the model popularized by dotenvx.)
- **Auditability** — security-relevant events (authentication, authorization, secret access, rate-limit and CSRF failures) SHOULD be recordable to a pluggable audit log.

Secret stores, audit backends, and rate-limit stores are **drivers** (§6.6).

---

# Part II: Stacks.js — The Reference Implementation

> Part II describes **Stacks.js**, the protocol's first reference implementation, written in TypeScript for the **Bun** runtime. Each section notes which protocol contract (from Part I) it satisfies. Everything here is one *concrete realization* of the protocol; the contracts it implements are universal, but the syntax, packages, and tooling shown are specific to TypeScript/Bun.

## 8. Implementation Overview

Stacks.js is a **Complete** conformant implementation (§2.2). It is a rapid full-stack development framework providing:

- **Frontend**: STX components, Web Components, a templating engine, the Crosswind CSS framework
- **Backend**: HTTP routing, middleware, validation, the Actions pattern
- **APIs**: resourceful REST routing, API Resources/transformers, three pagination strategies, token auth, automatic OpenAPI 3.0 generation
- **Database**: multi-dialect ORM, query builder, migrations, seeders
- **Infrastructure**: ts-cloud — zero-dependency IaC that manages both long-lived server fleets and serverless deployments
- **Services**: authentication, payments, email, SMS, notifications, queues
- **Security**: encrypted-in-repo secrets (dotenvx-style `.env`), CSRF, security headers, rate limiting, AES-GCM crypto, bcrypt/Argon2 hashing, audit logging
- **Observability**: structured logging (Clarity), health checks, request tracing
- **AI**: multi-provider AI integration, the Buddy assistant, code generation
- **CLI**: the `buddy` command-line toolkit
- **Delivery targets**: web, JSON APIs, desktop (Craft, production), mobile (Craft, roadmap), and CLI — from one application core (§3.1)

Layered, each tier mapping to protocol contracts from Part I:

```
   ┌──────────────────────────────────────────────────────────────────┐
   │  Views      STX components · Crosswind CSS · Web Components   §3   │
   ├──────────────────────────────────────────────────────────────────┤
   │  Actions    Routing (bun-router) · Middleware · Validation   §6.1 │
   │             ts-validation                                    §6.3 │
   ├──────────────────────────────────────────────────────────────────┤
   │  Models     ORM · Query Builder (bun-query-builder)          §6.4 │
   ├──────────────────────────────────────────────────────────────────┤
   │  Drivers    cache · queue (bun-queue) · mail · storage · cloud §6.6│
   ├──────────────────────────────────────────────────────────────────┤
   │  Services   ts-auth · ts-cloud · realtime · notifications · AI  §7 │
   ├──────────────────────────────────────────────────────────────────┤
   │  Tooling    Buddy CLI  ·  Bun runtime (TS · bundler · tests)      │
   └──────────────────────────────────────────────────────────────────┘
```

### 8.1 Runtime & Platform Requirements

Stacks.js is built exclusively for **Bun** (`^1.3.0`) and requires **SQLite `^3.47.2`** as a system dependency. It runs on **macOS, Linux, and WSL**; Windows-native support is on the roadmap. Building on Bun gives the reference implementation native TypeScript execution, a unified toolchain (runtime, package manager, bundler, test runner in one binary), fast startup, and high HTTP throughput.

```bash
bun install          # package management
bun run              # script execution
bun test             # test runner
bun build            # production bundling
```

### 8.2 Monorepo & Module System (77 Packages)

The implementation is a Bun-workspaces monorepo. The 77 framework modules live under `storage/framework/core/` and are published independently under the `@stacksjs/` npm scope. This is how Stacks.js realizes the protocol's *capability domains* (§5)—each contract maps to one or more packages.

```
stacks/
├── storage/framework/
│   ├── core/                # 77 framework modules (router, orm, auth, ai, buddy, …)
│   ├── api/                 # API server
│   ├── server/              # development server
│   └── cloud/               # ts-cloud integration
├── app/                     # Actions, Models, Middleware, Jobs, Notifications
├── config/                  # typed configuration
├── database/                # migrations & seeders
├── resources/               # components, views, functions
├── routes/                  # route definitions
└── tests/                   # test suite
```

Selected modules and the protocol domain each serves:

| Domain (§5) | Stacks.js modules |
|-------------|-------------------|
| Routing / Lifecycle | `router` (extends `bun-router`), `server`, `api`, `actions`, `middleware`, `error-handling` |
| Validation | `validation` (powered by `ts-validation`) |
| Data Modeling | `database`, `orm`, `query-builder` (powered by `bun-query-builder`) |
| Authentication | `auth` (powered by `ts-auth`) |
| Drivers | `cache`, `queue`, `storage`, `email`, `cloud` |
| Queues & Scheduling | `queue` (powered by `bun-queue`), `scheduler` |
| Real-Time | `realtime` (powered by `ts-broadcasting`) |
| Notifications | `notifications`, `sms`, `push`, `chat` |
| AI Integration | `ai`, `buddy`, `chat` |
| Infrastructure | `cloud` (powered by `ts-cloud`), `deploy`, `dns`, `health`, `tunnel` |
| Frontend | `ui`, `components`, `stx` (templating), `composables` |
| Utilities | `strings`, `arrays`, `objects`, `collections`, `datetime`, `slug`, `faker`, … |

## 9. Frontend (Reference Implementation)

### 9.1 UI Components (STX & Web Components)

Stacks.js implements the view layer (§3) with **STX**, a Blade-inspired templating engine that outputs standard Web Components.

```stx
<!-- resources/components/Button.stx -->
@ts
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}
@endts

@component('Button', { props: { variant: 'primary', size: 'md', disabled: false } })
  <button class="btn btn-{{ variant }} btn-{{ size }}" :disabled="disabled">
    <slot />
  </button>
@endcomponent
```

Components are auto-registered (no import in templates—satisfying the auto-discovery convention §4.2), typed, documented from their types, and publishable as npm packages.

### 9.2 STX Templating Engine

STX combines Vue-like Single File Components with server-side rendering and 40+ Blade-style directives.

```html
<!-- resources/views/dashboard.stx -->
<script server>
  const user = await User.find(userId)
  const notifications = await Notification.where('user_id', userId).get()
</script>

<template>
  <x-layout title="Dashboard">
    @if(notifications.length > 0)
      <x-notification-list :notifications="notifications" />
    @else
      <p>No new notifications</p>
    @endif

    @foreach(projects as project)
      <x-project-card :project="project" :key="project.id" />
    @endforeach

    @auth
      <x-admin-panel />
    @endauth
  </x-layout>
</template>
```

| Category | Directives |
|----------|------------|
| **Conditionals** | `@if`, `@elseif`, `@else`, `@unless`, `@isset`, `@empty`, `@switch`, `@case` |
| **Loops** | `@foreach`, `@for`, `@while`, `@forelse`, `@break`, `@continue` |
| **Layouts** | `@layout`, `@extends`, `@section`, `@yield`, `@slot`, `@stack`, `@push` |
| **Includes** | `@include`, `@partial`, `@includeIf`, `@includeWhen`, `@once` |
| **Auth** | `@auth`, `@guest`, `@can`, `@cannot` |
| **Content** | `@markdown`, `@json`, `@translate`, `@t` |

STX features: Vue-like SFCs with server/client script variants, auto-imported PascalCase components, scoped slots, expression filters (`{{ value | uppercase }}`), sandboxed expression evaluation, 200K+ Iconify icons, SSR with hydration, and stateful hot reload.

### 9.3 Crosswind CSS Framework

Stacks.js ships **Crosswind** (`@cwcss/crosswind`), a utility-first CSS framework optimized for the framework:

```html
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <img class="w-12 h-12 rounded-full" :src="user.avatar" />
  <div>
    <h3 class="font-semibold text-gray-900">{{ user.name }}</h3>
    <p class="text-sm text-gray-500">{{ user.email }}</p>
  </div>
</div>
```

Crosswind provides JIT compilation (only used classes are emitted), design tokens, built-in dark mode, and mobile-first responsive utilities.

### 9.4 Client-Side Utilities

```typescript
import { Str } from '@stacksjs/strings'
Str.slug('Hello World')   // 'hello-world'
Str.plural('post')        // 'posts'

import { collect } from '@stacksjs/collections'
collect(users).where('active', true).sortBy('name').pluck('email').toArray()
```

## 10. Backend (Reference Implementation)

### 10.1 Routing — satisfies §6.1

```typescript
// routes/api.ts
import { router } from '@stacksjs/router'

router.get('/users/{id}', 'Actions/ShowUserAction').where('id', '[0-9]+')
router.get('/dashboard', 'Actions/DashboardAction').name('dashboard')
router.resource('/articles', 'Actions/ArticleActions')   // CRUD expansion

router.group({ prefix: '/admin', middleware: ['auth', 'admin'] }, () => {
  router.get('/dashboard', 'Actions/Admin/DashboardAction')
  router.resource('/users', 'Actions/Admin/UserActions')
})
```

### 10.2 Actions — satisfies §3 (MVA)

```typescript
// app/Actions/CreatePostAction.ts
import { Action } from '@stacksjs/actions'
import { Post } from '@stacksjs/orm'
import type { CreatePostRequest } from '@stacksjs/types'

export default class CreatePostAction extends Action {
  async handle(request: CreatePostRequest) {
    const post = await Post.create({
      title: request.title,
      content: request.content,
      author_id: request.user.id,
    })
    await this.dispatch('PostCreated', post)
    return post
  }

  rules() {
    return { title: 'required|string|max:255', content: 'required|string' }
  }

  authorize() {
    return this.user?.can('create', Post)
  }
}
```

The same Action is invokable from a route, the CLI, a queued job, or another Action—satisfying the transport-independence requirement of §3.

### 10.3 Middleware & Request Lifecycle — satisfies §6.2

```typescript
// app/Middleware/AuthMiddleware.ts
import { Middleware } from '@stacksjs/middleware'

export default class AuthMiddleware extends Middleware {
  async handle(request: Request, next: Next): Promise<Response> {
    const token = request.header('Authorization')?.replace('Bearer ', '')
    if (!token) return Response.unauthorized('Authentication required')

    const user = await this.auth.validateToken(token)
    if (!user) return Response.unauthorized('Invalid token')

    request.user = user
    return next(request)
  }
}
```

Built-in middleware: CORS, RateLimit, Logger, Compress, SecurityHeaders.

### 10.4 Validation — satisfies §6.3

Powered by `ts-validation`, with a fluent API and 90+ validators, runnable on client and server:

```typescript
import { v } from '@stacksjs/validation'

const CreateUserSchema = v.object({
  name: v.string().min(2).max(100).required(),
  email: v.string().email().required(),
  password: v.password().min(8).hasUppercase().hasNumbers().required(),
  role: v.enum(['user', 'admin', 'moderator']).required(),
  age: v.integer().min(18).max(120).required(),
})

const result = CreateUserSchema.validate(userData)
type CreateUser = Infer<typeof CreateUserSchema>   // §6.7 type contract
```

| Category | Validators |
|----------|------------|
| **Primitives** | `string()`, `number()`, `integer()`, `float()`, `decimal()`, `bigint()`, `boolean()` |
| **Complex** | `array()`, `object()`, `enum()`, `json()` |
| **Date/Time** | `date()`, `datetime()`, `time()`, `timestamp()`, `unix()` |
| **Specialized** | `password()`, `email()`, `url()`, `uuid()`, `ip()`, `creditCard()`, `iban()` |

### 10.5 Building APIs — satisfies §6.9

Stacks.js treats API construction as a first-class delivery target (§3.1): the same Actions that back web routes serve JSON APIs. There are two paths to a REST resource—**derive it from a model** via the `useApi` trait (§11.4), or **define it explicitly** with the building blocks below. Both feed the same OpenAPI document.

**Resourceful routing** expands to the full CRUD set, with `only`/`except`:

```typescript
router.apiResource('/posts', 'Actions/PostActions')   // index, show, store, update, destroy
router.resource('/tags', 'Actions/TagActions', { only: ['index', 'show'] })
router.resource('/comments', 'Actions/CommentActions', { except: ['destroy'] })
```

**API Resources** shape responses explicitly (Laravel-style transformers), so endpoints never leak raw rows:

```typescript
// app/Resources/UserResource.ts
export default class UserResource extends JsonResource<User> {
  toArray() {
    return {
      id: this.resource.id,
      name: this.resource.name,
      email: this.resource.email,
      posts: PostResource.collection(this.whenLoaded('posts')),
      created_at: this.resource.created_at,
    }
  }
}

return new UserResource(user).toResponse()
return UserResource.collection(users).toResponse()
```

`whenLoaded`, `when`, `whenNotNull`, and `whenCounted` conditionally include fields and relations.

**Pagination** ships in three strategies, all serializing to a consistent `{ data, meta, links }` shape:

| Strategy | Returns | Best for |
|----------|---------|----------|
| `paginate()` | data + total + page metadata | UIs needing page numbers / total counts |
| `simplePaginate()` | data + next/prev only | large tables where counting is expensive |
| `cursorPaginate()` | data + opaque cursors | deep, constant-cost pagination over big sets |

**API authentication** uses SHA-256-hashed personal access tokens (with scopes and refresh tokens), checked by middleware; the `fetcher` HTTP client supports Bearer, Basic, and Digest auth:

```typescript
const res = await fetcher
  .withToken(apiToken)
  .withQueryParams({ page: 2 })
  .get<PaginatedData<User>>('/api/users')
```

**Action-level rate limiting** buckets by user, token, IP, or a custom identity, across multiple windows, emitting `Retry-After` on 429:

```typescript
await rateLimit('create-post', 10).per('hour')
await rateLimit('login', 5, { identity: email }).per('minute')
```

**OpenAPI 3.0 generation** is automatic: Stacks.js derives an OpenAPI document from the live route registry and each Action's validation schema, persists it to `storage/framework/api/openapi.json`, and serves a live copy at `GET /__openapi.json` in development—so the spec never drifts from the routes. This satisfies the protocol's machine-readable-description requirement (§6.9) and lets external clients and SDKs be generated from the contract.

## 11. Database & ORM (Reference Implementation) — satisfies §6.4

### 11.1 Multi-Dialect Support

| Database | Status | Use Case |
|----------|--------|----------|
| SQLite | Full Support | Development, small apps |
| MySQL | Full Support | Traditional web apps |
| PostgreSQL | Full Support | Enterprise applications |
| DynamoDB | Supported | Serverless, NoSQL needs |

### 11.2 Type-Safe Query Builder

The query builder (`bun-query-builder`) provides fluent, narrowly-typed SQL construction over Bun's native SQL support:

```typescript
import { DB } from '@stacksjs/database'

const users = await DB.table('users')
  .select('id', 'name', 'email')
  .where('active', true)
  .whereNotNull('email_verified_at')
  .orderBy('created_at', 'desc')
  .limit(10)
  .get()

await DB.transaction(async (trx) => {
  const order = await trx.table('orders').insert(orderData)
  await trx.table('order_items').insert(items)
  await trx.table('inventory').decrement('quantity', ordered)
})
```

### 11.3 Models & Migrations

Models are declared with `defineModel()`. Each attribute carries its type, fillability, visibility, validation rule, and casts; `traits` opt the model into framework behavior (timestamps, UUIDs, soft deletes, search, auth, an auto-served API, …); relationships, getters/setters, and indexes round out the definition.

```typescript
// app/Models/User.ts
import { defineModel, schema } from '@stacksjs/orm'

export default defineModel({
  name: 'User',
  table: 'users',
  traits: { useTimestamps: true, useUuid: true, useAuth: true },
  attributes: {
    name:  { fillable: true, validation: { rule: schema.string().required() } },
    email: { fillable: true, unique: true, validation: { rule: schema.string().email().required() } },
    password: { hidden: true, validation: { rule: schema.string().min(8) } },
    role: { fillable: true, cast: 'string', validation: { rule: schema.enum(['user', 'admin']) } },
  },
  relationships: { posts: { hasMany: 'Post' }, team: { belongsTo: 'Team' } },
  get: { isAdmin: attrs => attrs.role === 'admin' },
})
```

```typescript
// database/migrations/2024_01_01_000000_create_users_table.ts
import { Migration } from '@stacksjs/database'

export default class CreateUsersTable extends Migration {
  async up() {
    await this.schema.create('users', (table) => {
      table.id()
      table.string('name')
      table.string('email').unique()
      table.enum('role', ['user', 'admin']).default('user')
      table.timestamps()
    })
  }
  async down() { await this.schema.drop('users') }
}
```

```typescript
// database/migrations/2024_01_01_000000_create_users_table.ts
import { Migration } from '@stacksjs/database'

export default class CreateUsersTable extends Migration {
  async up() {
    await this.schema.create('users', (table) => {
      table.id()
      table.string('name')
      table.string('email').unique()
      table.enum('role', ['user', 'admin']).default('user')
      table.timestamps()
    })
  }
  async down() { await this.schema.drop('users') }
}
```

Relationships cover one-to-one, one-to-many, many-to-many, has-through, and polymorphic, with eager loading to prevent N+1 queries:

```typescript
const users = await User.query().with('posts', 'team', 'profile').where('active', true).get()
const posts = await Post.query().with('author.team', 'comments.user').get()
```

### 11.4 Model-Driven Provisioning — satisfies §3.2

Because the model is typed and declarative, Stacks.js can **derive an entire working backend from it**. The flagship example is the `useApi` trait: declaring it auto-serves a complete REST resource for the model—no routes, controllers, or serializers written by hand.

```typescript
// app/Models/Post.ts
import { defineModel, schema } from '@stacksjs/orm'

export default defineModel({
  name: 'Post',
  table: 'posts',
  traits: {
    useTimestamps: true,
    useSoftDeletes: true,
    useSearch: { searchable: ['title', 'body'], sortable: ['created_at'] },
    useApi: { uri: 'posts', routes: ['index', 'show', 'store', 'update', 'destroy'] },
  },
  attributes: {
    title: { fillable: true, validation: { rule: schema.string().required().min(3).max(255) } },
    body:  { fillable: true, validation: { rule: schema.string().required() } },
    published: { fillable: true, cast: 'boolean', validation: { rule: schema.boolean() } },
  },
})
```

From that one file, with no further code, Stacks.js provides:

| Derived from the model | What you get |
|------------------------|--------------|
| **Static types** | `buddy generate:types` emits the table schema (`database/types.d.ts`) and `ModelRow<Post>` / `ModelCreateData<Post>` utilities; `--watch` regenerates them whenever the model changes |
| **REST API** (`useApi`) | `GET /api/posts` (paginated; `?search=`, `?sort=`, `?include=`, `?fields=`, and filtering on allow-listed columns), `GET /api/posts/{id}`, `POST`, `PUT`/`PATCH`, `DELETE`, and bulk-delete |
| **Request validation** | create/update bodies are validated from each attribute's `validation.rule` (partial validation on `PATCH`) |
| **Security defaults** | write routes default to `auth` middleware; `hidden` fields are stripped from both input and output; per-row ownership checks when declared; soft-delete awareness |
| **Search** | `useSearch` attaches `toSearchableObject()` and keeps the search index in sync on create/update/delete |
| **Admin** | the model surfaces in the auto-generated dashboard browse views |
| **OpenAPI** | the generated endpoints feed the live OpenAPI document (§10.5) |

Declare the data once; the CRUD surface, validation, types, and search are **derived, not duplicated**, so they cannot drift out of sync with the model.

> **What stays explicit (by design).** Migrations *can* be generated from a model, but they are applied deliberately rather than silently on every change. The dashboard auto-provides **browse** views, not full edit/create forms (yet). And business logic, authorization policies, and anything non-CRUD still live in hand-written Actions. Model-driven provisioning removes boilerplate—not control.

## 12. Authentication, Security & Secrets (Reference Implementation) — satisfies §6.5, §7.8

Stacks.js implements authentication with **`ts-auth`**, a comprehensive library that is **passwordless-first** (WebAuthn/passkeys and TOTP MFA — the protocol's RECOMMENDED mechanisms) while also shipping traditional credential drivers: **sessions**, **JWT** (HS/RS/ES 256/384/512, with access+refresh token pairs and a revocation blacklist), and **OAuth** across 11 providers — all behind the one §6.5 contract.

```typescript
// config/auth.ts
export default {
  webauthn: { rpName: 'My Application', rpID: 'example.com', attestationType: 'none', timeout: 60000 },
  totp: { issuer: 'My Application', algorithm: 'SHA-1', digits: 6, step: 30 },
}
```

```typescript
import { generateRegistrationOptions, verifyRegistrationResponse } from '@stacksjs/auth'

const registrationOptions = generateRegistrationOptions({
  rpName: 'My App', rpID: 'example.com',
  userID: user.id, userName: user.email, attestationType: 'none',
})

const verification = await verifyRegistrationResponse(credential, expectedChallenge, expectedOrigin, expectedRPID)
if (verification.verified) { /* store verification.registrationInfo.credential */ }
```

TOTP second factor, browser-capability detection (`browserSupportsWebAuthn`, `platformAuthenticatorIsAvailable`), per-account login rate limiting (5 failures → 15-minute lockout), and a comprehensive audit log (§12.7) round out the auth layer.

### 12.5 Encrypted Environment & Secret Management — satisfies §7.8

Stacks.js realizes the protocol's encrypted-secrets contract with `@stacksjs/env`, a **dotenvx-inspired** encrypted `.env` system. Secrets are encrypted **in place** in the committed `.env` file; only a private key—kept out of the repository—decrypts them at runtime.

```
  .env  (safe to commit)                      .env.keys  (git-ignored)
  ┌───────────────────────────────┐          ┌────────────────────────────┐
  │ DOTENV_PUBLIC_KEY=03a1f2…      │ ───────▶ │ DOTENV_PRIVATE_KEY=b7f2…   │
  │ DB_PASSWORD=enc:Yx9kQ2…        │ encrypt  │  decrypts at runtime,       │
  │ STRIPE_SECRET=enc:Qm2v8…       │ ◀─────── │  injected at deploy time    │
  └───────────────────────────────┘ decrypt  └────────────────────────────┘
```

- **Crypto** — each value is sealed with **AES-256-GCM** (authenticated encryption) under a key derived from the committed `DOTENV_PUBLIC_KEY`; the matching `DOTENV_PRIVATE_KEY` lives in `.env.keys` (git-ignored). Encrypted values carry an `enc:` prefix; the ciphertext bundles IV, auth tag, and payload.
- **Per-environment keys** — `DOTENV_PUBLIC_KEY_PRODUCTION`, `…_STAGING`, etc. give each environment its own keypair.
- **Workflow** —
  ```bash
  buddy env:set STRIPE_SECRET sk_live_…   # encrypts with the public key, writes enc:… to .env
  buddy env:encrypt                       # encrypt an entire plaintext .env in place
  buddy env:rotate                        # rotate the keypair and re-encrypt
  ```
- **Deploy integration** — ts-cloud (§14) injects only the private key as a managed secret (Secrets Manager / SSM); the encrypted `.env` ships with the code.
- **Safe parsing** — the parser supports variable expansion but only a **whitelisted** set of command substitutions (no arbitrary shell), closing a common `.env` code-execution vector.
- **Typed access** — `env.PORT` returns a coerced `number`; `requireEnv([...])` fails fast at boot when required secrets are missing.

### 12.6 Cryptography & Hashing — satisfies §7.8

```typescript
import { encrypt, decrypt } from '@stacksjs/security'
const sealed = await encrypt(secret)   // AES-GCM, 600,000 PBKDF2-SHA256 iterations (OWASP 2026)
const clear  = await decrypt(sealed)   // versioned format: 0x01 | salt | IV | ciphertext
```

Password hashing uses **bcrypt** (12 rounds) or **Argon2id** (64 MiB, 2 passes), with Laravel-compatible algorithm detection and `needsRehash()` for transparent upgrades. Webhook signatures are verified with timing-safe HMAC (Stripe with a 300 s replay tolerance, GitHub, and generic HMAC).

### 12.7 Defense in Depth — satisfies §7.8

| Concern | Implementation |
|---------|----------------|
| **Security headers** | `nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`, and (in production) 1-year HSTS by default; CSP opt-in. User-set headers are never overwritten. |
| **CSRF** | Session-bound 32-byte token, verified in constant time; read from header, form, or JSON body; `HttpOnly`/`Secure`/`SameSite=Lax` cookies. |
| **Rate limiting** | `rateLimit('login', 5, { identity: email }).per('minute')`; identity resolves user → token → IP; returns `429` + `Retry-After`. |
| **SQL injection** | Parameterized by default; `whereRaw` rejects bare strings at the **type level**, requiring a `sql\`…\`` tagged template (audit #1858). |
| **XSS** | STX escapes output by default and evaluates expressions in a sandbox (no `eval`/`Function`). |
| **Audit logging** | 50+ typed auth/security events (`login.*`, `token.*`, `security.csrf_failure`, …) to a pluggable store, with IP/UA/session context and a query API. |
| **WAF & secret scanning** | At deploy, ts-cloud provisions AWS WAF and runs a pre-deploy secret scan (35+ patterns) that blocks credential leaks before shipping. |

### 12.8 Observability — satisfies §7.6

Stacks.js implements structured logging with **Clarity** (pretty output in development, JSON in production), health checks via the `health` module, and request tracing with correlation IDs carried from `bun-router` through actions, jobs, and notifications:

```typescript
import { log } from '@stacksjs/clarity'
log.info('User logged in', { userId: 123, ip: req.ip, traceId: req.traceId })
```

`bun-router` additionally provides performance monitoring (CPU, memory, response-time tracking with alerts) and distributed request tracing out of the box.

## 13. AI Integration (Reference Implementation) — satisfies §7.4

```typescript
// config/ai.ts
export default {
  default: 'claude',
  providers: {
    claude: { driver: 'anthropic', model: 'claude-sonnet-4-6', apiKey: env('ANTHROPIC_API_KEY') },
    openai: { driver: 'openai', model: 'gpt-4o', apiKey: env('OPENAI_API_KEY') },
    ollama: { driver: 'ollama', model: 'llama2', baseUrl: 'http://localhost:11434' },
  },
}
```

```typescript
import { AI } from '@stacksjs/ai'

const response = await AI.complete('Explain TypeScript generics')
const stream = await AI.stream('Write a poem about coding')
const analysis = await AI.complete({ prompt: 'Analyze this code', context: code, format: 'json', schema: BugReportSchema })
const alt = await AI.using('openai').complete('…')
```

**Buddy** is the AI-powered development assistant built into the CLI—natural-language code modification, codebase exploration, scaffolding, documentation, test generation, and error explanation:

```bash
buddy ai:chat
buddy ai:explore "How does authentication work?"
buddy make:action "Create an action that processes refund requests" --ai
```

## 14. Cloud & Infrastructure (Reference Implementation) — satisfies §7.5

Stacks.js implements the infrastructure contract with **`ts-cloud`**, a zero-dependency IaC framework that manages **both long-lived server fleets and serverless deployments** from one typed configuration. In other ecosystems these are two paid products—**Laravel Forge** (server provisioning/management) and **Laravel Vapor** (serverless). In Stacks they are one open, built-in capability.

Unlike AWS CDK, ts-cloud requires **no AWS SDK and no AWS CLI**—just TypeScript and Bun. It issues direct HTTPS calls to cloud APIs with a hand-written **Signature V4** signer (`packages/ts-cloud/src/aws/client.ts`), resolving credentials from environment variables, `~/.aws/credentials`, or an EC2 IAM role. The reference version is `@stacksjs/ts-cloud` 0.5.17 (MIT).

| Aspect | ts-cloud | AWS CDK |
|--------|----------|---------|
| **Dependencies** | Zero (no AWS SDK) | Full AWS SDK (~100MB+) |
| **Startup Time** | Milliseconds | Seconds (SDK init) |
| **Manages** | Server fleets **and** serverless | Resources (BYO server tooling) |
| **Model** | Declarative config + presets | Imperative programming |
| **Presets** | 21 production-ready templates | None built-in |

```
                       cloud.config.ts  (one typed config)
                                  │
                ┌─────────────────┴──────────────────┐
                ▼                                    ▼
    ┌────────────────────────┐          ┌───────────────────────────┐
    │  SERVER MODE  (Forge)   │          │  SERVERLESS MODE  (Vapor)  │
    │  EC2 fleet · Auto Scaling│         │  one artifact → 3 Lambdas: │
    │  ALB/NLB · health checks │         │   • HTTP  (API Gateway v2) │
    │  SSM shell · rolling     │         │   • Queue (SQS worker)     │
    │  deploys · RDS · Redis   │         │   • CLI   (EventBridge)    │
    └────────────────────────┘          │  RDS Proxy · EFS · warmer  │
                │                         └───────────────────────────┘
                └──────────────┬───────────────────┘
                               ▼
                  Driver:  AWS  ·  Hetzner  (production)
                           GCP · Azure · Cloudflare · DO  (planned)
```

### 14.1 Server Fleets (the Forge side)

In **server mode**, ts-cloud provisions and manages long-lived infrastructure: it discovers the VPC and subnets, reconciles security groups, resolves the latest Ubuntu AMI via SSM Parameter Store, attaches an IAM instance profile, and stands up an **EC2 Auto Scaling Group** (configurable min/max, target-CPU tracking, scale cooldowns) behind an **Application/Network Load Balancer** with health checks and optional sticky sessions. Shell access uses **SSM Session Manager** (no SSH keys to manage on AWS); application releases are deployed to instances over SSM, with `deploy:rollback` to revert. Managed **RDS** (PostgreSQL/MySQL/Aurora, Multi-AZ, encrypted, automated backups) and **ElastiCache** Redis complete the fleet.

### 14.2 Serverless (the Vapor side)

In **serverless mode**, ts-cloud packages a single build artifact into **three coordinated Lambda functions**—an HTTP handler (API Gateway HTTP API v2), an SQS queue worker, and a CLI/scheduler function (EventBridge)—rather than one function per route. It supports Node 18/20/22 plus Bun and PHP on custom `provided.al2023` layers; cold starts are mitigated by an EventBridge **warmer** and optional **provisioned concurrency**; a persistent **Octane-style** mode is available. Functions attach to the VPC to reach private resources, with **RDS Proxy** connection pooling and **EFS** shared storage, and read secrets from Secrets Manager / SSM. Packaging is zip (250 MB) or container image via ECR (10 GB).

```typescript
// cloud.config.ts — serverless preset
import { createFullStackAppPreset } from '@stacksjs/ts-cloud/presets'

export default createFullStackAppPreset({
  name: 'My App',
  slug: 'my-app',
  domain: 'example.com',
  apiSubdomain: 'api',
})
// → S3 + CloudFront frontend, Fargate/Lambda backend, RDS, Redis,
//   Route53 records, and auto-issued ACM certificates
```

### 14.3 Drivers, Services, Presets & Safety

- **Drivers (§6.6)** — **AWS** and **Hetzner** are production drivers today (auto-detected from config); GCP, Azure, Cloudflare, and DigitalOcean are planned. The same configuration is intended to port across providers as drivers land.
- **Coverage** — the AWS driver implements **54 service clients** (EC2, ECS, Lambda, S3, RDS, DynamoDB, ElastiCache, CloudFront, Route53, ACM, SQS, SNS, EventBridge, SES, WAF, OpenSearch, and AI services such as Bedrock, Rekognition, Textract, Transcribe, Polly, and Translate).
- **Presets** — **21 production-ready** blueprints (static site, Node server, Node serverless, full-stack, API backend, WordPress, JAMstack, microservices, real-time, data pipeline, ML API, traditional web app, Laravel, serverless Laravel, and more), composable via `extendPreset()` / `composePresets()`.
- **Plan & state** — `cloud deploy --dry-run` runs `analyzeStackDiff()` to preview added/removed/updated/**replaced** resources and flag dangerous changes. CloudFormation is the source of truth (no local state file); re-running `deploy` is idempotent.
- **Safety** — a **pre-deploy security scan** (35+ secret patterns) blocks accidental credential leaks before anything ships. DNS is multi-provider (Route53, Cloudflare, Porkbun, GoDaddy) with automatic ACM issuance via DNS validation; object storage can be migrated across S3, Backblaze B2, and Hetzner.

```bash
cloud deploy --dry-run        # preview the diff
cloud deploy                  # provision / update
cloud serverless:rollback     # roll serverless app back a release
cloud logs:tail <function>    # stream logs
cloud secrets:set DB_URL ...  # Secrets Manager / SSM
```

> **Maturity note.** Infrastructure provisioning (CloudFormation generation, Signature V4, serverless deploys, static sites, RDS/ElastiCache) is production-ready for Node/Bun. The high-level `server:*` management CLI (à la Forge's dashboard verbs) and PHP/Laravel serverless are still maturing.

## 15. Real-Time, Queues, Notifications & Analytics (Reference Implementation)

**Real-time** (§7.2) via `realtime`/`ts-broadcasting`:

```typescript
// routes/channels.ts
import { channel } from '@stacksjs/realtime'

channel('chat.{roomId}', {
  authorize(user, roomId) { return user.canAccessRoom(roomId) },
  join(user) { return { id: user.id, name: user.name } },
  message(data) { /* … */ },
})
```

**Queues** (§7.1) via `queue`/`bun-queue`, **scheduling** via `scheduler`:

```typescript
export default class ProcessVideoJob extends Job {
  queue = 'video-processing'; tries = 3; timeout = 600
  async handle() { /* … */ }
  async failed(error: Error) { /* … */ }
}

await dispatch(new ProcessVideoJob(videoId)).chain(new NotifyUserJob(userId))
await dispatchAfter('5 minutes', new SendReminderJob(userId))
```

**Notifications** (§7.3) via `notifications`, one definition fanning out to email/SMS/database/push:

```typescript
export default class OrderShippedNotification extends Notification {
  via(notifiable: User) { return ['email', 'sms', 'database', 'push'] }
  toEmail(n: User) { return { subject: `Order #${this.order.id} shipped!`, template: 'emails/order-shipped' } }
  toSms(n: User)   { return { message: `Order #${this.order.id} is on its way!` } }
}

await notify(user, new OrderShippedNotification(order))
```

**Privacy-first analytics** (§7.7) via `analytics`/`ts-analytics` — a cookieless, self-hosted alternative to Google Analytics, in the spirit of Plausible and Fathom:

- **Cookieless visitor counting** — a unique visitor is a SHA-256 hash of IP + user-agent + site, salted with an HMAC secret that **rotates daily**. No cookies, no cross-day correlation, no consent banner required.
- **No PII** — IP anonymization is on by default; geolocation is opt-in and country-level; Do Not Track and per-path/IP exclusions are honored.
- **Rich model** — pageviews, sessions, custom events, goals/conversions (with revenue), UTM campaigns, referrers, devices, web vitals, funnels, and real-time visitors.
- **Two interfaces** — a ~3–4 KB dependency-free tracking script (auto pageviews, SPA route changes, outbound links, engagement) and a reporting API (`/api/sites/{siteId}/stats`, `/timeseries`, `/pages`, `/referrers`, `/countries`, `/campaigns`, `/goals`, `/realtime`, …).
- **Storage** — DynamoDB single-table design with TTL-based retention and pre-computed daily rollups for cheap long-range queries.

```typescript
// auto-track requests; read a typed reporting API
app.use(createServerTrackingMiddleware(driver, { excludedPaths: [/^\/api/, /^\/admin/] }))
const stats = await createDashboardActions(driver).getDashboardStats({ startDate: '2024-01-01' })

// client: record a custom event — no cookies set
sa('track', 'signup', { plan: 'pro' })
```

It ships a Vue 3 dashboard (real-time counter, time series, breakdowns, funnels, goals) styled with Crosswind. As a recent (0.1.0) capability it is evolving quickly, but the privacy model—cookieless, daily-rotating-salt hashing, no raw IP storage—is real and core to the design.

## 16. CLI, Type Generation & Testing (Reference Implementation)

### 16.1 Buddy CLI

The reference CLI is **`buddy`** (aliases: `stacks`, `stx`, `bud`), with 50+ command categories:

```bash
buddy dev            buddy migrate         buddy test
buddy build          buddy seed            buddy typecheck
buddy make:action    buddy deploy          buddy lint:fix
buddy make:model     buddy cloud:deploy    buddy ai:chat
buddy tinker         buddy queue:work      buddy release
```

Scaffolding follows the conventions of §4:

```bash
buddy make:model Post --migration
buddy make:resource Article     # model + migration + action + routes
buddy new my-app                # zero-config new project
```

### 16.2 Auto-Generated Types — satisfies §6.7

```bash
buddy types:generate
# storage/framework/types/{models,requests,responses,components,routes,config}.d.ts
```

A change to a model's `fields` propagates—at compile time—through query results, request/response types, and component props.

### 16.3 Testing

Stacks.js uses Bun's test runner plus framework helpers:

```typescript
import { test, expect, describe, beforeEach } from 'bun:test'
import { createTestContext } from '@stacksjs/testing'
import CreatePostAction from '@/Actions/CreatePostAction'

describe('CreatePostAction', () => {
  let context: TestContext
  beforeEach(async () => { context = await createTestContext(); await context.migrate() })

  test('creates a post with valid data', async () => {
    const user = await context.factory.user.create()
    const result = await context.actingAs(user).handle(CreatePostAction, { title: 'Test', content: '…' })
    expect(result.title).toBe('Test')
  })
})
```

## 17. Desktop & Multimodal Deployment (Reference Implementation)

Desktop, mobile, web, API, and CLI are all delivery targets (§3.1) over one application core. Stacks.js builds **native desktop apps today** from the web codebase using **Craft**, a Zig-based application framework offering a Tauri-like experience, with **native mobile (iOS/Android) on the near-term roadmap**.

```
                  Craft  ·  one web codebase
                              │
            ┌─────────────────┴─────────────────┐
            ▼                                   ▼
   ┌──────────────────────────┐    ┌──────────────────────┐
   │  Desktop  (production)    │    │  Mobile  (roadmap)   │
   │  macOS · Windows · Linux  │    │  iOS · Android       │
   └──────────────────────────┘    └──────────────────────┘
```

| Metric | Craft | Electron | Tauri |
|--------|-------|----------|-------|
| **Startup Time** | 50ms | 230ms | 100ms |
| **Idle Memory** | 14KB | 68MB | ~80MB |
| **Binary Size** | 3MB | 135MB | ~2MB |

| Platform | Status | WebView |
|----------|--------|---------|
| macOS | Production | WKWebView |
| Windows | Production | WebView2 |
| Linux | Production | WebKit2GTK |
| iOS / Android | Roadmap | WKWebView / Android WebView |

```bash
buddy build:desktop   # .app/.dmg, .exe/.msi, .deb/.rpm/.AppImage
```

Craft injects a `window.craft` bridge (window control, system tray, lifecycle, notifications, dialogs, clipboard, system info) and ships 35 native UI components. The same codebase also targets standard web builds, standalone APIs and serverless deployments (§14), CLI binaries, and publishable component/function libraries.

## 18. Companion Packages

The reference implementation is backed by focused companion packages, each independently usable:

- **`bun-router`** — high-performance Bun HTTP router with 25+ middleware, trie-based matching, implicit model binding, and streaming.
- **`bun-query-builder`** — narrowly-typed ORM on Bun's native SQL, using phantom types to thread precise types through every query (benchmarked multiples faster than Prisma on common operations).
- **`bun-queue`** — Redis-backed job queue.
- **`ts-validation`**, **`ts-auth`**, **`ts-cloud`** — the validation, auth, and IaC engines.
- **`@stacksjs/stx`** — the STX templating engine.
- **`@cwcss/crosswind`** — the Crosswind CSS engine.
- **Clarity** — structured logging for browser and server.

---

# Part III: Conformance & Porting

> Part III defines what it means to be a **Stacks-conformant** implementation and guides the construction of new implementations in other languages. The protocol is deliberately designed so that Stacks.js is the *first* implementation, not the only one—this part is the contract every future implementation builds against.

## 19. Conformance

### 19.1 Conformance Levels (normative)

An implementation declares one of three levels (§2.2):

- **Core** — conventions (§4), MVA (§3), request lifecycle (§6.2), and the routing, validation, data-model, and configuration contracts.
- **Standard** — Core, plus authentication (§6.5), the driver pattern (§6.6), queues (§7.1), and the type-contract requirement (§6.7).
- **Complete** — Standard, plus real-time (§7.2), notifications (§7.3), AI integration (§7.4), and infrastructure/deployment (§7.5).

Stacks.js is **Complete**.

### 19.2 Conformance Checklist

A conformant implementation MUST:

1. **Conventions** — auto-discover code by role from the directory layout of §4.1, with the naming/mapping rules of §4.3.
2. **Zero-config** — run a freshly scaffolded application with no configuration (§4.4).
3. **MVA** — confine business logic to Actions, support declarative validation and authorization on Actions, and make Actions invokable independently of transport (§3).
4. **Lifecycle** — execute the request pipeline in the order of §6.2, allow middleware short-circuiting, and block the Action on validation failure.
5. **Routing** — support parameters, constraints, named routes with reverse generation, groups, and resource expansion (§6.1).
6. **Validation** — provide composable schemas, structured field-keyed errors, and static type inference (§6.3).
7. **Data** — provide models with the five relationship kinds, reversible migrations, and a type-aware query interface with transactions and eager loading (§6.4).
8. **Configuration** — typed, capability-scoped, environment-aware, override-only (§6.8).

For **Standard** and **Complete**, the corresponding contracts of §6.5–§6.7 and §7 MUST also hold.

An implementation SHOULD ship a **conformance test suite** that exercises each contract through its public surface, so the claim is testable rather than asserted.

### 19.3 What Is Protocol vs. Implementation-Specific

| Protocol (universal, normative) | Implementation-specific (Stacks.js examples) |
|---------------------------------|----------------------------------------------|
| Directory roles & auto-discovery | The `.stx` template syntax |
| MVA separation | The `Action` base class API |
| Routing/validation/data contracts | `bun-router`, `ts-validation`, `bun-query-builder` |
| The driver pattern | The set of drivers shipped (SQLite, Redis, AWS…) |
| Type-contract requirement | TypeScript compiler enforcement; `buddy types:generate` |
| AI integration interface | The `@stacksjs/ai` client; provider list |
| Conventions for config files | The `satisfies CloudConfig` TypeScript idiom |
| CLI capabilities (scaffold, migrate, test) | The `buddy` command names and Bun toolchain |

The left column travels to every implementation; the right column is free to differ.

## 20. Porting Guide: Building a New Implementation

A new implementation, in any language, follows the same path Stacks.js did.

### 20.1 Map Protocol Concepts to Host-Language Idioms

Each protocol concept has a natural expression in the host language. The reference column shows TypeScript; the right column is the open slot a new implementation fills.

| Protocol concept | Stacks.js (TypeScript) | A new implementation expresses it as… |
|------------------|------------------------|----------------------------------------|
| Action | `class … extends Action` | the host's unit-of-logic idiom (class, function, struct + method) |
| Model fields → types | `static fields` + generated `.d.ts` | the host's strongest static guarantee (native types, generated stubs, or runtime schema) |
| Validation schema | `v.object({...})` fluent builder | the host's idiomatic schema/builder |
| View/template | STX `.stx` SFCs | any templating or component system that forbids business logic |
| Driver selection | config + `driver: '…'` | the host's dependency-injection or config mechanism |
| CLI | `buddy` on Bun | the host's CLI tooling |
| Type contract | compiler | compiler, gradual typing, or generated stubs + tests |

### 20.2 Recommended Build Order

1. **Conventions & scaffolding** — implement directory discovery and `new`/scaffold commands first; everything else hangs off the conventions.
2. **MVA core** — Actions, the request lifecycle, and routing (Core level).
3. **Validation & data** — schemas with type inference, then models/migrations/query interface.
4. **Configuration & drivers** — the typed config layer and the first set of drivers (database, cache, queue).
5. **Auth, queues, real-time, notifications, AI** — the Standard and Complete capabilities.
6. **Conformance suite** — port or re-derive the conformance tests to prove the level claimed.

### 20.3 Interoperability Expectations

Implementations are not required to share a runtime or wire protocol. They interoperate at two levels:
- **Convention-level** — a developer (or an AI assistant) who knows one implementation can read and navigate another, because the directory layout, naming, and architecture are identical.
- **Contract-level** — drivers, schemas, and configuration shapes are conceptually portable; an OpenAPI surface or a serialized schema produced by one implementation describes the same thing in another.

```
                    ┌───────────────────────────────┐
                    │   This white paper (the spec) │
                    └───────────────┬───────────────┘
            builds against          │          builds against
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
  ┌───────────┐               ┌───────────┐               ┌───────────┐
  │ Stacks.js │               │  impl B   │               │  impl C   │
  └─────┬─────┘               └─────┬─────┘               └─────┬─────┘
        │                           │                           │
        └─────── a developer (or AI assistant) who knows one ───┘
                 can read, navigate, and reason about all three
                 — same layout, same MVA, same contracts
```

This is the payoff of the protocol: knowledge, tooling patterns, and architectural decisions compound across every language that implements it.

## 21. Roadmap

### 21.1 Reference Implementation (Stacks.js)

**Version**: 0.70.45 — Closed Beta (January 2026). Production-ready for full-stack and API-only web applications, desktop apps (Craft: macOS/Windows/Linux), and CLI tools/libraries; native mobile (Craft: iOS/Android) is on the near-term roadmap. Sponsors include JetBrains and the Solana Foundation.

- **Near-term**: additional ts-cloud drivers (GCP, Azure, Cloudflare); enhanced Craft mobile support; plugin marketplace.
- **Medium-term**: real-time collaboration; edge-deployment optimizations; database-level encryption-at-rest; the high-level `server:*` management CLI for ts-cloud.
- **Long-term**: distributed-system primitives; multi-region deployment automation; deeper AI-assisted generation.

### 21.2 Protocol

- **v1.0** — ratify the contracts in Part I and publish the conformance test suite (§19.2).
- **Future implementations** — the protocol is explicitly designed for implementations in languages beyond TypeScript. Each new implementation builds against this white paper as the shared specification and declares its conformance level. As additional implementations ship, the protocol will evolve through an RFC process with input from every conformant implementation.

---

## 22. Comparison with Existing Approaches

Stacks shares DNA with the great full-stack frameworks but differs in two structural ways: it is a **portable specification** first, and it is **batteries-included without paid tiers**.

| Dimension | Stacks | Laravel (PHP) | Rails (Ruby) | Next.js (JS) |
|-----------|--------|---------------|--------------|--------------|
| Primary artifact | Protocol + reference impl | Framework | Framework | Framework |
| Portable across languages | Yes (by design) | No | No | No |
| Convention over configuration | Yes | Yes | Yes | Partial |
| Architecture | Model–View–Action | MVC | MVC | File-based routing |
| Full-stack scope | Front · back · data · cloud · desktop | Back (front via add-ons) | Back (front via add-ons) | Front + API routes |
| Built-in auth / queues / realtime / IaC | Included, free | Mixed (some paid services) | Mostly (via gems) | Bring-your-own |
| Server fleet + serverless management | Built-in (ts-cloud) | Paid (Forge / Vapor) | Third-party | Platform-tied (Vercel) |
| Encrypted secrets in version control | Built-in (encrypted `.env`) | Third-party (dotenvx) | Third-party | Bring-your-own |
| End-to-end type safety | Required by protocol | Optional | Optional | Partial |
| Runtime | Implementation-defined (Bun in ref impl) | PHP | Ruby | Node / edge |

The point is not that Stacks is uniformly "better." It occupies a different layer: Laravel, Rails, and Next.js are each a single framework bound to a single language, whereas Stacks is a *specification those very patterns can be expressed against*—with Stacks.js as one concrete, complete realization. Notably, capabilities that Laravel splits into paid first-party services (Forge for servers, Vapor for serverless) are part of the protocol and shipped free in the reference implementation via **ts-cloud** (§14).

---

# Part IV: Appendices

## Appendix A: Capability Domains → Reference Modules

The protocol counts *capabilities* (§5); the reference implementation realizes them as 77 `@stacksjs/` packages. Selected mapping:

| Capability domain | Reference modules (`@stacksjs/…`) |
|-------------------|-----------------------------------|
| Routing / Lifecycle | `router`, `server`, `api`, `actions`, `error-handling` |
| API | `api` (resources, OpenAPI, fetcher), `router` (resource routing) |
| Validation | `validation` |
| Data Modeling | `database`, `orm`, `query-builder` |
| Authentication | `auth`, `security` |
| Drivers (cache/queue/mail/storage/cloud) | `cache`, `queue`, `email`, `storage`, `cloud` |
| Queues & Scheduling | `queue`, `scheduler` |
| Real-Time | `realtime` |
| Notifications | `notifications`, `sms`, `push`, `chat` |
| AI Integration | `ai`, `buddy`, `chat` |
| Observability | `logging` (Clarity), `health` |
| Infrastructure | `cloud`, `deploy`, `dns`, `health`, `tunnel` |
| Frontend / Views | `ui`, `components`, `stx`, `composables` |
| Utilities | `strings`, `arrays`, `objects`, `collections`, `datetime`, `slug`, `faker`, `enums`, `path` |
| Developer tooling | `buddy`, `cli`, `build`, `lint`, `testing`, `git`, `docs`, `tinker`, `repl` |

The full module set (77) is published independently; consult the reference implementation for the complete list.

## Appendix B: Configuration Reference (Reference Implementation)

| Config File | Purpose | Key Options |
|-------------|---------|-------------|
| `app.ts` | Application settings | name, env, timezone, locale |
| `auth.ts` | Authentication | webauthn, totp, guards |
| `database.ts` | Database connections | default, connections, migrations |
| `cache.ts` | Caching | default, stores, prefix |
| `queue.ts` | Job queue | default, connections, failed |
| `email.ts` | Email | default, mailers, from |
| `ai.ts` | AI providers | default, providers, models |
| `cloud.ts` | Cloud infrastructure (ts-cloud) | driver, project, mode, infrastructure |
| `security.ts` | Security settings | cors, csp, rateLimit |

## Appendix C: CLI Reference (Reference Implementation)

```
buddy new              Scaffold a new project (zero-config)
buddy dev              Start development server
buddy build            Build for production
buddy serve            Start production server
buddy test             Run tests
buddy typecheck        Check types
buddy migrate          Run migrations
buddy seed             Run seeders
buddy tinker           Start REPL
buddy make:*           Generate code by convention
buddy deploy           Deploy application
buddy cloud:*          Cloud infrastructure
buddy ai:*             AI assistant (Buddy)
buddy queue:work       Process the queue
buddy schedule:run     Run the scheduler
```

## Appendix D: Glossary

- **Protocol** — the language-agnostic specification (Part I).
- **Implementation** — a concrete framework that realizes the protocol in a language/runtime.
- **Reference implementation** — Stacks.js, the first and canonical implementation.
- **Conformance level** — Core / Standard / Complete (§2.2, §19.1).
- **MVA** — Model–View–Action architecture (§3).
- **Driver** — a pluggable backend behind a capability interface (§6.6).
- **Capability domain** — a unit of functionality with a defined interface contract (§5).
- **Type contract** — the requirement that types flow unbroken from data definitions to delivery (§6.7).

## Appendix E: Cloud Capability Reference (ts-cloud)

A condensed reference for §14. ts-cloud is the reference implementation of the infrastructure contract (§7.5).

**Deployment modes**

| Mode | What it manages | Primitives |
|------|-----------------|------------|
| **Server** (Forge-equivalent) | Long-lived fleets | EC2 + Auto Scaling Group · ALB/NLB · RDS · ElastiCache · SSM deploys |
| **Serverless** (Vapor-equivalent) | One artifact → 3 Lambdas | HTTP (API Gateway v2) · SQS queue worker · CLI/scheduler (EventBridge) |
| **Hybrid** | Static front + serverless/Fargate back | S3 + CloudFront · ECS Fargate · RDS · Redis |

**Drivers** — AWS (production), Hetzner (production); GCP, Azure, Cloudflare, DigitalOcean (planned).

**Service coverage** — 54 AWS service clients, including compute (EC2, ECS, Lambda), data (RDS, DynamoDB, ElastiCache, OpenSearch), networking/CDN (VPC, ALB/NLB, CloudFront, Route53, ACM), messaging (SQS, SNS, EventBridge, SES), security (WAF, Secrets Manager, KMS, IAM), and AI (Bedrock, Rekognition, Textract, Transcribe, Polly, Translate, Comprehend).

**Presets (21)** — static site · Node server · Node serverless · serverless Node · full-stack · API backend · WordPress · JAMstack · microservices · real-time · data pipeline · ML API · traditional web app · Laravel · serverless Laravel · dashboard · (+ composable variants).

**Operational guarantees** — zero-dependency Signature V4 signing · `--dry-run` stack diff with replacement/danger detection · CloudFormation as state (no local state file) · idempotent re-deploys · pre-deploy secret scan (35+ patterns) · multi-provider DNS with automatic ACM issuance.

---

## 23. Conclusion

Stacks separates the *idea* of a full-stack framework from any single *expression* of it. **The protocol** captures the conventions, architecture, and interface contracts that make full-stack development coherent—as a portable, versioned specification rather than as code locked inside one language. **Stacks.js** proves that specification in practice: a Complete, Bun-native, MIT-licensed implementation that is fast, type-safe, batteries-included, and pleasant to use.

The value of this separation compounds. Conventions learned once apply everywhere the protocol is implemented. A specification outlives the runtimes that host it. And a protocol invites many implementations—the reference today, and others, in other languages, built against this same document tomorrow.

**Key differentiators**:

1. **Protocol-first** — a portable specification, not a single-language framework.
2. **Reference implementation** — Stacks.js demonstrates completeness and feasibility on Bun.
3. **Type safety** — an unbroken type contract from data to delivery.
4. **Batteries included, removable** — every capability behind a swappable interface.
5. **AI as collaborator** — AI integration specified, not bolted on.
6. **Developer joy** — every contract evaluated against the experience of building with it.

---

**Get Started (Reference Implementation)**:
```bash
bunx buddy new my-project
cd my-project
buddy dev
```

**Resources**:
- Documentation: https://stacksjs.org
- GitHub: https://github.com/stacksjs/stacks
- Discord: community support and discussions
- Sponsors: JetBrains, Solana Foundation

---

*The Stacks Protocol and Stacks.js are open source, licensed under the MIT License.*

*This white paper describes Protocol Version 1.0 (Draft) and reference implementation `stacks.js` 0.70.45. Contracts and APIs are subject to change before v1.0 ratification.*
