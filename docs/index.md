---
title: Stacks - A Protocol & Reference Implementation for Full-Stack Apps
description: An open, language-agnostic protocol for building full-stack applications, with Stacks.js as its TypeScript/Bun reference implementation.
layout: home
hero:
  name: Stacks
  text: Protocol & Reference Implementation
  tagline: An open, language-agnostic protocol for building full-stack applications — and Stacks.js, its batteries-included reference implementation in TypeScript on Bun. The conventions of Laravel & Rails, made portable.
  actions:
    - theme: brand
      text: Get Started
      link: /introduction/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/stacksjs/stacks
features:
  - title: Open Protocol
    details: A language-agnostic specification of the conventions, architecture, and interface contracts a full-stack framework needs. The protocol defines what; implementations decide how.
  - title: Reference Implementation
    details: Stacks.js is the first conformant implementation — Bun-native, MIT-licensed, batteries-included, with 77 independently usable packages.
  - title: Portable Conventions
    details: Directory layout, the Model–View–Action architecture, and naming rules learned once apply to every conformant implementation, in any language.
  - title: AI-First Development
    details: A provider-agnostic AI integration contract — Claude, OpenAI, and local models — powers in-app features and the Buddy development assistant.
  - title: Servers & Serverless, Built In
    details: ts-cloud manages both long-lived server fleets and serverless deployments from one config — the Forge + Vapor experience, open and free. Zero-dependency, AWS and Hetzner drivers today.
  - title: Privacy-First Analytics
    details: Cookieless, no-PII product analytics as a core capability (via ts-analytics) — daily-rotating-salt visitor hashing, no consent banner required.
  - title: Encrypted Secrets, Committed Safely
    details: A dotenvx-inspired encrypted .env — values sealed with AES-256-GCM under a committed public key, decrypted by a private key kept out of the repo. Version your whole config without leaking secrets.
  - title: End-to-End Type Safety
    details: An unbroken type contract from data definitions to API responses to views. In Stacks.js, the compiler is your documentation.
---

# Stacks White Paper

**Protocol Version 1.0 (Draft) · Reference Implementation `stacks.js` 0.70.45 · Closed Beta (January 2026)**

## Abstract

**Stacks is an open protocol for building full-stack applications** — a language-agnostic specification of the conventions, interface contracts, and architectural patterns that full-stack applications need: how requests are routed and validated, how data is modeled and persisted, how users are authenticated, how background work runs, and how applications deploy. The protocol defines *what* a conformant framework provides and *how its pieces fit together*, leaving *how* each piece is built to the host language and runtime.

**Stacks.js is the protocol's first reference implementation**, written in TypeScript and built from the ground up for the Bun runtime. It proves the protocol is buildable, complete, and pleasant to use, comprising 77 specialized packages that implement every contract the protocol defines.

This white paper is organized in three parts: **Part I** specifies the Stacks Protocol in language-agnostic terms; **Part II** describes Stacks.js and how it satisfies each contract; **Part III** defines conformance and guides new implementations in other languages.

## Executive Summary

Modern application development has become increasingly fragmented. Developers orchestrate dozens of tools, libraries, and frameworks—each with its own configuration and conventions. Opinionated frameworks like Laravel and Rails solved this *within* their languages by replacing configuration with convention, but their conventions are not portable: the knowledge does not travel across language boundaries because there is no specification, only code.

**Stacks addresses this at two layers.**

### The Protocol — language-agnostic

The Stacks Protocol specifies, independently of any single language:

- **Conventions**: directory layout, naming, and auto-discovery that make applications legible regardless of implementation language.
- **The Model–View–Action architecture**: a clear separation of data, presentation, and business logic.
- **Interface contracts**: routing, validation, data modeling, authentication, configuration, queues, real-time, and notifications.
- **The driver pattern**: a uniform way to swap databases, caches, queues, storage, and cloud providers behind stable interfaces.
- **A type-contract requirement**: types flow from data definitions to responses and views.
- **Conformance levels**: Core, Standard, and Complete, so implementations interoperate at the convention level.

Because these are specifications rather than code, they can be implemented in any language—conventions learned once travel to every conformant implementation.

### The Reference Implementation — Stacks.js

Stacks.js proves the protocol in practice. Built exclusively for **Bun** (`^1.3.0`, macOS/Linux/WSL), it provides a batteries-included framework—frontend UI, backend APIs, a typed ORM, cloud IaC, real-time messaging, passwordless authentication, payments, queues, and an AI-powered CLI—across 77 independently usable packages. Everything is MIT-licensed and built-in: no feature gates, no per-feature subscriptions, no vendor lock-in.

**Why a protocol, not just a framework?** Portability of knowledge (conventions apply everywhere), longevity (a specification outlives any runtime), and plurality (multiple implementations interoperate at the contract level). Stacks.js is the first conformant implementation; the protocol is explicitly designed so that implementations in other languages can satisfy the same contracts, with this white paper as the shared specification.

## Quick Start (Reference Implementation)

```bash
bunx buddy new my-project
cd my-project
buddy dev
```

## Resources

- **Documentation**: [stacksjs.org](https://stacksjs.org)
- **GitHub**: [github.com/stacksjs/stacks](https://github.com/stacksjs/stacks)
- **Discord**: Community support and discussions

## Sponsors

Stacks is currently in Closed Beta (January 2026), with active development supported by sponsors including JetBrains and the Solana Foundation. Both the protocol specifications and reference implementation are open-source, licensed under MIT, and designed for adoption by indie developers, enterprise teams, and framework authors building on the Stacks protocol.
