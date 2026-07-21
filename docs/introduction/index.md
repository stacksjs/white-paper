---
title: Introduction
description: The problem Stacks addresses, the protocol/framework boundary, and the maturity of the current reference implementation.
---

# Introduction

Full-stack development is a coordination problem. Requests, validation, domain behavior, persistence, identity, jobs, views, and deployment all influence one another. Teams can assemble those concerns from independent libraries, but they then own the naming, configuration, lifecycle, error formats, type boundaries, and upgrades between them.

Opinionated frameworks reduce that work through convention. The convention is valuable knowledge, yet it is usually embedded in one language and implementation.

Stacks asks a narrower, more testable question:

> Which full-stack conventions and behavioral guarantees are portable enough to specify independently of their implementation?

## Two layers

### The Stacks Protocol

The protocol is a working draft. It proposes:

- Model–View–Action responsibilities;
- canonical application roles and deterministic override behavior;
- an ordered request lifecycle;
- routing, validation, data, configuration, authentication, queue, security, and observability contracts;
- driver rules that distinguish configured names from tested implementations;
- Core, Standard, and Complete conformance profiles;
- optional badges for AI, analytics, desktop, CMS, commerce, search, and internationalization.

The protocol leaves language, runtime, template syntax, database engine, cloud provider, and performance strategy open.

### Stacks.js

[Stacks.js](https://github.com/stacksjs/stacks) is the TypeScript/Bun reference implementation. At the white paper’s audited source revision, it contains 77 `@stacksjs/*` workspace package manifests and concrete surfaces for routing, Actions, Models, migrations, validation, auth, queues, real-time messaging, notifications, AI, logging, health, UI, and developer tooling.

It is also pre-1.0. Some configuration types include drivers that are not implemented; generated artifacts can become stale; selected provider and desktop paths require external infrastructure; and a formal protocol conformance suite has not yet been published.

## Design principles

### Portable understanding

Developers should recognize an application’s roles, resolution order, and request flow across conformant implementations.

### Progressive disclosure

A local baseline should work with documented prerequisites and defaults. External services should fail clearly when selected without the required infrastructure or credentials.

### Explicit boundaries

Models, Actions, Views, drivers, and adapters should have clear responsibilities. Dynamic resolution and generated artifacts should be documented rather than described as invisible magic.

### Evidence over adjectives

Package count, feature breadth, and test-file count describe scope. They do not prove production fitness, security, or performance. Conformance claims should link to fixtures, environments, and results.

### Batteries included, maturity disclosed

An integrated framework can reduce glue work, but each capability must still state whether it is implemented, partial, experimental, planned, or outside the audit.

## Current status

The paper targets Stacks source commit [`bf1245e3`](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2). The root manifest reports `0.70.52`, while framework workspaces report `0.70.161`; the [generated evidence](/reference/source-evidence) therefore records the exact source digest and every package path/version.

Stacks.js should currently be described as the **reference implementation with no profile claim**. The public suite and machine-readable report exist, but the report remains unverified until every inherited requirement has passing evidence.

## Continue

- [Framework and protocol overview](/introduction/overview)
- [Getting started](/introduction/getting-started)
- [Technical architecture](/architecture/)
- [Full white paper](https://github.com/stacksjs/white-paper#readme)
