---
title: Roadmap & Evidence Gaps
description: Completed foundations, governance gates, and remaining evidence work for Protocol 1.0 and Stacks.js.
---

# Roadmap & Evidence Gaps

This page records evidence and stabilization work, not promised delivery dates.
Program tracking: [stacksjs/stacks#2060](https://github.com/stacksjs/stacks/issues/2060).

## Current status

The white paper is a governed **Protocol 1.0 working draft**. RFC 0001 is
accepted; RFCs 0002–0005 are proposed with review ending 20 August 2026. Reference
implementation code does not bypass that review window.

Stacks.js is a pre-1.0 reference implementation with **no profile claim**. The
[generated evidence page](/reference/source-evidence) pins source
`bf1245e336ab14551e22cb7d88284f93e649a1a2`, evidence commit
`6008859d6e3d75e115261d6b7de76826324788da`, and RFC commit
`cda56fb8f967ca9f7522b119425a3f438f7f2fe9`.

## Completed foundations

- RFC 0001 publishes maintainers, sponsorship, quorum, voting, conflicts,
  appeals, security handling, compatibility classes, and review windows.
- Specification text is CC BY 4.0; fixtures/runner material is MIT-licensed.
- RFC 0002 proposes 47 stable requirement IDs and Core ← Standard ← Complete
  inheritance with pass-only claim semantics.
- RFC 0003 proposes 16 deterministic runner-neutral fixtures and database,
  queue, cache, storage, mail, realtime, and deployment contracts.
- RFC 0004 proposes a JSON Schema plus semantic checks for attributable reports.
- An independent standard-library Python runner consumes the shared suite and
  reports 15 passes without claiming a profile.
- Stacks CI pins the RFC revision, rejects suite drift, runs its adapter, validates
  the report, and retains JSON/Markdown artifacts. Its claim remains `null`.
- A deterministic source manifest, runtime driver registry, and Craft support
  matrix now feed this paper through a checksummed evidence lock.
- Deterministic, budgeted `buddy ai:context` output now excludes dependency
  trees, locks, build state, environment files, credentials, and private keys;
  its source contract is retained in the evidence lock.

## Governance gates

- [#2050](https://github.com/stacksjs/stacks/issues/2050) and
  [#2051](https://github.com/stacksjs/stacks/issues/2051) stay open until their
  RFC review/vote records are complete. The report schema and generated
  Stacks.js report tracked by
  [#2052](https://github.com/stacksjs/stacks/issues/2052) are complete, but do
  not constitute ratification or a profile claim.
- [RFC 0005](https://github.com/stacksjs/rfcs/issues/6) and
  [#2061](https://github.com/stacksjs/stacks/issues/2061) block broad production
  claims for environment encryption.
- A profile claim requires every inherited requirement to pass; skipped,
  unsupported, exception, and experimental results never satisfy it.

## Reference implementation evidence still needed

- After ratification, freeze the implemented fixture corpus against the accepted
  requirement catalog and update retained per-driver service versions or
  topologies for any fixtures added during review.
- Finish capability metadata coverage plus broader internal-link and executable
  snippet verification. OpenAPI/declaration freshness, the Buddy command
  reference, and the compact AI context path are already covered
  ([#2056](https://github.com/stacksjs/stacks/issues/2056),
  [#2032](https://github.com/stacksjs/stacks/issues/2032)).
- Complete independent review and disposition for environment envelope v2
  ([#2058](https://github.com/stacksjs/stacks/issues/2058),
  [#2061](https://github.com/stacksjs/stacks/issues/2061)).
- Provision platform signing/notarization and retain signed launch, update, and
  uninstall evidence before any Craft row becomes stable. Native packaging,
  install, and rollback CI tracked by #2063 is complete
  ([#2059](https://github.com/stacksjs/stacks/issues/2059),
  [#2062](https://github.com/stacksjs/stacks/issues/2062),
  [#2063](https://github.com/stacksjs/stacks/issues/2063)).

## Documentation quality still needed

- Tag remaining capability pages with maturity and last-verified evidence.
- Test selected commands/snippets and internal links in CI.
- Keep provider-specific claims tied to exact provider revisions.
- Keep protocol requirements in the RFC repository and Stacks.js syntax in
  implementation guides.
- Continue removing unsupported benchmark and legal-compliance conclusions.

## Extension work

AI, analytics, desktop, CMS, commerce, search, and internationalization are
independent extension badges. Craft is currently reported as experimental; the
other extensions remain unsupported by the Stacks protocol adapter until their
specific evidence is executed.

## Licenses and community

- Specification: [CC BY 4.0](https://github.com/stacksjs/rfcs/blob/main/LICENSE-SPECIFICATION.md)
- Fixtures and runner: [MIT](https://github.com/stacksjs/rfcs/blob/main/LICENSE-FIXTURES.md)
- Stacks.js implementation: [MIT](https://github.com/stacksjs/stacks/blob/main/LICENSE.md)
- Governance: [RFC 0001](https://github.com/stacksjs/rfcs/blob/main/rfcs/0001-protocol-governance.md)
- Discussions: [github.com/stacksjs/stacks/discussions](https://github.com/stacksjs/stacks/discussions)
