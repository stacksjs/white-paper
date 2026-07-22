---
title: Stacks — Draft Protocol & Reference Implementation
description: A source-audited draft protocol for full-stack application development, with Stacks.js as its TypeScript/Bun reference implementation.
layout: home
hero:
  name: Stacks
  text: Draft Protocol & Reference Implementation
  tagline: Portable full-stack conventions and testable capability contracts, grounded in a source-audited TypeScript/Bun implementation.
  actions:
    - theme: brand
      text: Read the White Paper
      link: https://github.com/stacksjs/white-paper#readme
    - theme: alt
      text: Evaluate Stacks.js
      link: /introduction/getting-started
    - theme: alt
      text: View Source
      link: https://github.com/stacksjs/stacks
features:
  - title: Protocol, Clearly Bounded
    details: Part I defines portable conventions, lifecycle guarantees, capability contracts, profiles, and non-goals. Runtime and syntax remain implementation choices.
  - title: Source-Audited
    details: Implementation statements are generated from a checksummed Stacks evidence set pinned to source bf1245e3 and RFC revision ea9dbe4.
  - title: Honest Maturity
    details: Capabilities are labeled Implemented, Partial, Experimental, Planned, or Not Audited. Configured providers are not assumed to be working drivers.
  - title: Model–View–Action
    details: Models define domain data, Views project prepared data, and transport-independent Actions hold reusable application behavior.
  - title: Testable Conformance
    details: Core, Standard, and Complete have 47 public requirement IDs, runner-neutral fixtures, a report schema, and an independent runner. Stacks currently claims no profile.
  - title: Type Evidence
    details: Stacks.js combines compiler inference, runtime validation, generated declarations, migrations, API artifacts, and contract tests—with dynamic boundaries disclosed.
  - title: Security With Caveats
    details: The paper documents concrete controls and material limits; it does not turn framework features into blanket security or legal-compliance claims.
  - title: Pre-1.0 by Design
    details: Stacks.js is usable for evaluation and active development, but selected drivers and delivery targets must be verified for each workload.
---

# Stacks White Paper

**Protocol 1.0 Draft · Source snapshot 21 July 2026 · Pre-1.0**

Stacks proposes a language-neutral protocol for the recurring coordination work of full-stack applications: routing, validation, Actions, persistence, authentication, background work, rendering, observability, and deployment boundaries.

[Stacks.js](https://github.com/stacksjs/stacks) is the first reference implementation. It is written in TypeScript for Bun. The current paper ingests a deterministic manifest at [`bf1245e3`](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2), which classifies 90 versioned package manifests without presenting count as quality evidence.

## Read this first

The protocol is a **governed working draft**, not a ratified standard. The public RFC repository includes a catalog, fixtures, report schema, and independent Python runner. Stacks.js emits a schema-valid report whose `profileClaim` is `null`.

The audit found substantial implemented surfaces for routing, Actions, Models, migrations, validation, auth, queues, real-time messaging, notifications, AI, logging, and health. It also found important boundaries:

- queue execution supports `sync`, database, and Redis; known unsupported names fail configuration or dispatch loudly;
- OpenAPI generation is explicit, so checked-in output can be stale or empty;
- analytics provides integrations and a client script, not the previously claimed complete reporting system;
- environment encryption v2 uses X25519, HKDF-SHA-256, and AES-256-GCM but remains experimental pending RFC and independent review;
- Craft desktop launch/build paths require an external Craft binary; signed updates and provenance exist, but the support matrix has zero stable targets;
- native mobile delivery is not established by the audited Stacks source.

The full paper turns those findings into a concrete maturity matrix and a testable conformance design.

## Reference snapshot

| Field | Value |
|---|---|
| Source revision | [`bf1245e336ab14551e22cb7d88284f93e649a1a2`](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2) |
| Evidence | [Checksummed generated page](/reference/source-evidence) |
| RFC suite | [`ea9dbe438aca308085372e68aaa82ebe2e92b8d0`](https://github.com/stacksjs/rfcs/tree/ea9dbe438aca308085372e68aaa82ebe2e92b8d0) |
| Root manifest | `0.70.52` |
| Framework workspaces | `0.70.161` |
| Runtime | Bun `^1.3.0` |
| System requirements | Git `^2.47.0`, SQLite `^3.47.2` |
| Protocol status | 1.0 working draft |

## Quick start

The supplied source recommends Pantry for toolchain provisioning:

```bash
curl -fsSL https://pantry.dev | bash
panx @stacksjs/buddy new my-project
cd my-project
buddy dev
```

Use `buddy list` and `buddy <command> --help` for the installed version’s command surface.

## Next steps

- [Get started with Stacks.js](/introduction/getting-started)
- [Understand the protocol and framework boundary](/introduction/overview)
- [Review the technical architecture](/architecture/)
- [Audit Pantry package, registry, and Redis boundaries](/reference/pantry-redis)
- [Read the full white paper](https://github.com/stacksjs/white-paper#readme)
- [Inspect the reference source](https://github.com/stacksjs/stacks)

The Stacks.js source is MIT-licensed. The white paper recommends publishing an explicit specification license before Protocol 1.0 ratification.
