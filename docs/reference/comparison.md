---
title: Architectural Positioning
description: A durable, evidence-based way to compare Stacks with other approaches without unsupported scorecards.
---

# Architectural Positioning

Framework comparisons become stale quickly. Pricing changes, features move between core and plugins, runtimes add capabilities, and benchmark results depend on workload. This page therefore compares **architectural approaches**, not volatile product checklists.

## Where Stacks sits

Stacks combines two ideas:

1. an opinionated, integrated TypeScript/Bun framework;
2. a draft language-neutral protocol intended to make its conventions and behavioral contracts portable.

```text
less integrated                                              more integrated

independent libraries ── metaframework ── full-stack framework ── Stacks.js
                                                         + protocol draft
```

Integration can reduce selection and glue work. It also expands the surface that one project must stabilize, test, document, and upgrade.

## Approach comparison

| Approach | Primary strength | Primary cost | Good fit |
|---|---|---|---|
| Composition-first libraries | Maximum local choice | Team owns integration contracts and lifecycle | Experienced teams with strong platform standards |
| Frontend metaframework | Cohesive rendering/routing experience | Backend and operations may remain separate choices | UI-heavy products with existing services |
| Backend framework | Strong domain/data/service conventions | Frontend and deployment may be separate | APIs and server-rendered applications |
| Integrated full-stack framework | Shared conventions across layers | Larger framework surface and upgrade coupling | Teams that value a paved path |
| Platform-coupled framework | Excellent path on one host | Portability depends on adapters | Teams aligned with the target platform |
| Language-neutral specification | Portable behavior and tooling | No application exists without an implementation | Multiple ecosystems needing shared contracts |
| Stacks proposal | Integrated reference source plus portable draft contracts | Pre-1.0 breadth and no formal conformance suite yet | Bun/TypeScript teams willing to validate selected capabilities |

## Distinguishing questions

Instead of counting checkmarks, ask:

### Architecture

- Where does reusable business behavior live?
- Can it run outside HTTP?
- What is the observable middleware/validation/authorization order?
- How do user overrides interact with framework defaults?

### Data and types

- Is schema declared once or copied across layers?
- Which artifacts are inferred, generated, or runtime-validated?
- Can generated migrations be reviewed before apply?
- Which dialects pass the same contract tests?

### Replaceability

- Is a “driver” a real interface with multiple tested implementations?
- Does selecting an unsupported provider fail loudly?
- Can an application change provider without changing domain logic?

### Operations

- Which deployment topologies are tested at the pinned revision?
- How are request IDs, logs, health, queues, and rollbacks verified?
- Which state is process-local and which is shared?

### Maturity

- Is the project pre-1.0?
- Are compatibility and deprecation policies published?
- Do code samples run in CI?
- Are security and performance claims backed by independent or reproducible evidence?

## Stacks.js strengths at the audited revision

Source revision [`ce19440`](https://github.com/stacksjs/stacks/tree/ce19440cd6cbdb2913ff5bd821b10830eeae8e96) demonstrates:

- a coherent application layout and override model;
- Actions with validation, authorization, and hooks;
- Models with relationships, traits, factories, and migration generation;
- routing, middleware, request context, API resources, and error handling;
- broad authentication/authorization primitives;
- sync/database/Redis Job execution and scheduling;
- real-time and notification surfaces;
- request IDs, structured logs, and health checks;
- an extensive Buddy CLI and a wide package/test surface.

## Stacks.js tradeoffs at the audited revision

- Root and workspace versions are not expressed as one source/package version.
- Some driver names appear in configuration but intentionally fail as unimplemented.
- OpenAPI and declarations include generated artifacts that must be kept fresh.
- Environment encryption has not received an independent cryptographic audit and uses a source-described simplified key construction.
- Cloud capability depends partly on the installed ts-cloud version.
- Craft desktop delivery requires an external binary and lacks a published release/benchmark matrix.
- No protocol conformance suite currently certifies the Complete profile.

## About cost and lock-in

Open-source licensing, hosted-service pricing, and infrastructure cost are separate dimensions. A framework package may be free while its chosen database, SMS, AI, email, or cloud provider costs money. Self-hosting may avoid a subscription while increasing operational cost.

Similarly, “no lock-in” is too broad to be useful. Evaluate lock-in by layer:

- source and license;
- runtime APIs;
- model/query semantics;
- generated migrations;
- provider-specific infrastructure;
- data export;
- operational tooling;
- application knowledge and conventions.

Stacks’s driver and protocol ambitions can reduce some forms of coupling, but only tested alternative paths provide evidence of portability.

## About performance

This documentation does not publish cross-framework requests-per-second or “N× faster” tables. A valid comparison must pin versions, behavior, data, hardware, concurrency, warm-up, and errors, then publish scripts and raw results.

Use the [performance methodology](/architecture/performance) to evaluate your workload.

## When to evaluate Stacks.js

Stacks.js is a reasonable candidate when:

- Bun and TypeScript are intentional choices;
- the team values a broad convention-driven framework;
- Actions, model-driven artifacts, and application overrides fit the design;
- versions can be pinned and 0.x changes can be scheduled;
- the exact database, queue, provider, and deployment paths will be tested.

Choose or retain another approach when its ecosystem, compatibility policy, deployment evidence, staffing familiarity, or specialized capability better matches the system. The protocol proposal is not an argument that every application should use the reference implementation.

## Maintaining a named-product comparison

If the project publishes a comparison of current frameworks, it should be a separate dated research artifact with:

- exact product and version;
- official primary sources;
- capture date;
- definitions for “built in,” “supported,” and “production-ready”;
- public benchmark methodology;
- a correction/update process.

That keeps the protocol durable while allowing current market research to evolve independently.
