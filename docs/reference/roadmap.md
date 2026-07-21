---
title: Roadmap & Evidence Gaps
description: Work needed to ratify the Stacks Protocol and strengthen the pre-1.0 Stacks.js reference implementation.
---

# Roadmap & Evidence Gaps

This page describes evidence and stabilization work, not promised dates.

Program tracking: [stacksjs/stacks#2060 — Protocol 1.0 ratification program](https://github.com/stacksjs/stacks/issues/2060)

## Current status

The white paper is a **Protocol 1.0 working draft**. Stacks.js is a **pre-1.0 reference implementation and unverified Complete candidate**.

The source snapshot used by the paper is commit [`ce19440`](https://github.com/stacksjs/stacks/tree/ce19440cd6cbdb2913ff5bd821b10830eeae8e96) from 21 July 2026. Its root manifest reports `0.70.52`; framework workspaces report `0.70.161`.

Substantial implemented surfaces include routing, Actions, Models, model-derived migrations, validation, authentication, sync/database/Redis queues, scheduling, real-time messaging, API resources, logging, request IDs, health checks, and several AI provider integrations.

Important gaps include configured-but-unimplemented drivers, explicit/stale-able generated artifacts, unverified provider matrices, experimental desktop delivery, a simplified environment-encryption construction, and the absence of a public protocol conformance suite.

## Protocol ratification work

- Assign stable requirement IDs to all normative behavior.
- Publish language-neutral fixtures and expected outputs.
- Publish a JSON Schema for conformance reports.
- Define Core, Standard, Complete, and extension-badge compatibility rules.
- Establish a public RFC template, decision log, and change process.
- Publish specification and fixture licenses.
- Produce at least one complete report from Stacks.js.
- Seek feedback or a partial implementation from another language/runtime.

Tracked work:

- [#2050 — requirement IDs, profiles, and compatibility](https://github.com/stacksjs/stacks/issues/2050)
- [#2051 — language-neutral fixtures and driver contracts](https://github.com/stacksjs/stacks/issues/2051)
- [#2052 — report schema and Stacks.js CI report](https://github.com/stacksjs/stacks/issues/2052)
- [#2053 — RFC governance, change control, and licensing](https://github.com/stacksjs/stacks/issues/2053)
- [#2054 — independent implementation or runner](https://github.com/stacksjs/stacks/issues/2054)

## Reference implementation stabilization

- Align root, workspace, source, and published-package version provenance.
- Remove unsupported driver names from active configuration or mark them as planned at the type level.
- Run OpenAPI and generated-declaration freshness checks in CI.
- Publish tested database, queue, cache, storage, mail, real-time, and cloud matrices.
- Review environment encryption cryptographically before recommending encrypted secrets in version control.
- Publish a supported-platform/release matrix for Craft desktop output.
- Separate unit, integration, provider-contract, end-to-end, deployment, and protocol-conformance results.

Tracked work:

- [#2055 — version provenance and reproducible source snapshots](https://github.com/stacksjs/stacks/issues/2055)
- [#2056 — generated artifact and documentation freshness](https://github.com/stacksjs/stacks/issues/2056)
- [#2057 — tested driver/provider matrices and fail-loudly configuration](https://github.com/stacksjs/stacks/issues/2057)
- [#2058 — environment-encryption cryptographic review](https://github.com/stacksjs/stacks/issues/2058)
- [#2059 — Craft desktop support and release matrix](https://github.com/stacksjs/stacks/issues/2059)

## Documentation quality

- Tag capability pages with maturity and last-verified source revision.
- Test commands and snippets against the installed CLI/API.
- Replace volatile counts with generated values or pinned snapshots.
- Remove unsupported performance and legal-compliance claims.
- Distinguish protocol requirements from Stacks.js implementation syntax.
- Keep provider-specific claims in the provider project’s versioned documentation.

## Extension work

AI, analytics, desktop, CMS, commerce, search, and internationalization should be specified and reported as independent extension badges. This prevents optional product breadth from delaying baseline protocol stability.

## Community and governance

- Source: [github.com/stacksjs/stacks](https://github.com/stacksjs/stacks)
- Discussions: [github.com/stacksjs/stacks/discussions](https://github.com/stacksjs/stacks/discussions)
- Community chat: [discord.gg/stacksjs](https://discord.gg/stacksjs)

The Stacks.js implementation is MIT-licensed. The protocol governance and specification license remain ratification work until published explicitly.
