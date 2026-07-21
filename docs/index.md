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
    details: Implementation statements are pinned to Stacks source revision ce19440 from 21 July 2026, with root and workspace versions recorded separately.
  - title: Honest Maturity
    details: Capabilities are labeled Implemented, Partial, Experimental, Planned, or Not Audited. Configured providers are not assumed to be working drivers.
  - title: Model–View–Action
    details: Models define domain data, Views project prepared data, and transport-independent Actions hold reusable application behavior.
  - title: Testable Conformance
    details: Core, Standard, and Complete profiles have requirement IDs and minimum evidence. Formal conformance awaits a public suite and report.
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

[Stacks.js](https://github.com/stacksjs/stacks) is the first reference implementation. It is written in TypeScript for Bun and spans 77 `@stacksjs/*` workspace package manifests. The current paper audits the supplied source at commit [`ce19440`](https://github.com/stacksjs/stacks/tree/ce19440cd6cbdb2913ff5bd821b10830eeae8e96), rather than presenting moving package counts and product claims as timeless facts.

## Read this first

The protocol is a **working draft**, not a ratified standard. Stacks.js is an **unverified Complete candidate**, not a certified implementation: no independent protocol conformance suite or machine-readable report exists yet.

The audit found substantial implemented surfaces for routing, Actions, Models, migrations, validation, auth, queues, real-time messaging, notifications, AI, logging, and health. It also found important boundaries:

- queue execution supports `sync`, database, and Redis; some other configured names are not implemented;
- OpenAPI generation is explicit, so checked-in output can be stale or empty;
- analytics provides integrations and a client script, not the previously claimed complete reporting system;
- environment encryption exists, but its source describes the public/private-key construction as simplified rather than full ECIES;
- Craft desktop launch/build paths require an external Craft binary and remain experimental;
- native mobile delivery is not established by the audited Stacks source.

The full paper turns those findings into a concrete maturity matrix and a testable conformance design.

## Reference snapshot

| Field | Value |
|---|---|
| Source revision | [`ce19440cd6cb2913ff5bd821b10830eeae8e96`](https://github.com/stacksjs/stacks/tree/ce19440cd6cbdb2913ff5bd821b10830eeae8e96) |
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
- [Read the full white paper](https://github.com/stacksjs/white-paper#readme)
- [Inspect the reference source](https://github.com/stacksjs/stacks)

The Stacks.js source is MIT-licensed. The white paper recommends publishing an explicit specification license before Protocol 1.0 ratification.
