---
title: Stacks.js - A Full-Stack Framework & Protocol
description: A comprehensive framework and open protocol for building full-stack TypeScript applications with Bun
layout: home
hero:
  name: Stacks.js
  text: Framework & Protocol
  tagline: An open protocol and reference implementation for building full-stack TypeScript applications. The conventions of Laravel & Rails, the type safety of TypeScript, powered by Bun.
  actions:
    - theme: brand
      text: Get Started
      link: /introduction/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/stacksjs/stacks
features:
  - title: Open Protocol
    details: Stacks defines conventions, interfaces, and specifications for full-stack TypeScript development. The framework is both the protocol and its reference implementation.
  - title: Interoperable Modules
    details: 77 independently usable packages following shared specifications. Use the complete stack or integrate individual modules with any TypeScript project.
  - title: Bun-Native Runtime
    details: Built exclusively for Bun, achieving exceptional startup times and request throughput that surpass traditional Node.js frameworks.
  - title: AI-First Development
    details: Deep integration with Claude, OpenAI, and Ollama enables AI-powered code generation and intelligent development assistance.
  - title: Zero-Dependency Cloud
    details: Deploy with ts-cloud's driver-based IaC—no SDK required. AWS support today, with GCP, Azure, Cloudflare, DigitalOcean, and Hetzner drivers coming soon.
  - title: End-to-End Type Safety
    details: Types flow seamlessly from database schemas to API responses to frontend components. The compiler is your documentation.
---

# Stacks.js White Paper

**Version 0.70.23 | Closed Beta (January 2026)**

## Abstract

Stacks.js is both an **open protocol** and its **reference implementation** for building full-stack TypeScript applications. As a protocol, it defines conventions, interfaces, and specifications that standardize how TypeScript applications handle routing, data modeling, validation, authentication, and more. As a framework, it provides a batteries-included implementation of this protocol, built from the ground up for the Bun runtime.

This white paper presents the architectural foundations, design philosophy, and technical capabilities of Stacks.js. We examine how the protocol addresses the fragmentation and complexity inherent in modern JavaScript/TypeScript development by establishing consistent conventions, shared type contracts, and interoperable module specifications comprising 77 specialized packages.

## Executive Summary

Modern web development has become increasingly fragmented. Developers must orchestrate dozens of tools, libraries, and frameworks—each with its own configuration, conventions, and learning curve. The JavaScript ecosystem, while rich, lacks both the cohesive frameworks and the **standardized protocols** that have made platforms like Laravel (PHP) and Ruby on Rails paradigmatically successful.

**Stacks.js addresses this gap as both a protocol and framework:**

### As a Protocol

Stacks defines open specifications for:

- **Type Contracts**: Standardized interfaces for models, requests, responses, and services
- **Convention Patterns**: File structures, naming conventions, and architectural patterns
- **Module Interfaces**: APIs that allow any compliant implementation to integrate
- **Validation Schemas**: A fluent, type-safe validation specification
- **Driver Patterns**: Pluggable backends for databases, caches, queues, and cloud providers

### As a Framework

The reference implementation provides:

1. **Unified Full-Stack Architecture**: A single framework encompassing frontend UI, backend APIs, database ORM, cloud infrastructure, real-time communication, authentication, payments, and more—all working in concert with shared conventions and types.

2. **Bun-Native Performance**: Built exclusively for Bun, Stacks leverages the runtime's exceptional speed for both development and production, achieving startup times and request throughput that surpass traditional Node.js frameworks.

3. **AI-First Development**: Deep integration with leading AI providers (Anthropic Claude, OpenAI, Ollama) enables AI-powered code generation, natural language codebase modification, and intelligent development assistance through the "Buddy" AI system.

The protocol is structured around 77 focused modules, each with a defined interface that can be implemented independently. This enables developers to adopt Stacks incrementally—using individual packages with any TypeScript project, or the complete framework for new applications.

## Quick Start

```bash
bunx stacks new my-project
cd my-project
buddy dev
```

## Resources

- **Documentation**: [stacksjs.org](https://stacksjs.org)
- **GitHub**: [github.com/stacksjs/stacks](https://github.com/stacksjs/stacks)
- **Discord**: Community support and discussions

## Sponsors

Stacks is currently in Closed Beta (January 2026), with active development supported by sponsors including JetBrains and the Solana Foundation. Both the protocol specifications and reference implementation are open-source, licensed under MIT, and designed for adoption by indie developers, enterprise teams, and framework authors building on the Stacks protocol.
