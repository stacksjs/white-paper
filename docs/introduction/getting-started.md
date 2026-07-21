---
title: Getting Started
description: Evaluate the Stacks.js reference implementation with its declared Pantry, Bun, Git, and SQLite toolchain.
---

# Getting Started

This guide evaluates the full Stacks.js framework at a pre-1.0 revision. Pin versions for repeatability and verify the exact capabilities your application selects.

## Prerequisites

The audited source declares:

- Bun `^1.3.0`;
- Git `^2.47.0`;
- SQLite `^3.47.2`;
- macOS, Linux, or WSL for the full project workflow.

Stacks recommends [Pantry](https://pantry.dev) to provision the project toolchain.
The whitepaper pins Pantry's complete [package-manager contract](/reference/package-manager)
and [registry contract](/reference/registry), including resolution precedence,
lockfile and integrity behavior, authentication, storage, failure modes, and tests.

```bash
curl -fsSL https://pantry.dev | bash
```

Follow the installer’s shell-setup instructions before continuing.

## Create and run a project

```bash
panx @stacksjs/buddy new my-project
cd my-project
buddy dev
```

The exact development services and ports depend on project configuration. Use these commands to inspect the installed CLI rather than relying on a static list:

```bash
buddy list
buddy dev --help
buddy doctor
```

## Understand the project shape

```text
my-project/
├── app/
│   ├── Actions/          # reusable application behavior
│   ├── Models/           # model and persistence definitions
│   ├── Middleware/       # request middleware
│   ├── Jobs/             # deferred work
│   ├── Listeners/        # event listeners
│   ├── Mail/             # mail definitions
│   └── Commands/         # application CLI commands
├── config/               # typed capability configuration
├── database/
│   ├── migrations/       # ordered schema changes
│   └── seeders/          # seed data
├── resources/
│   ├── components/       # STX components
│   ├── views/            # view templates
│   └── functions/        # shared functions
├── routes/               # route files registered by app/Routes.ts
├── storage/              # framework defaults, generated artifacts, runtime data
└── tests/                # Bun tests
```

Application paths take precedence over framework defaults at the same logical path. Customize a default by creating the corresponding file under `app/`; do not edit framework storage unless you are developing Stacks itself.

## Safe first workflow

```bash
# Inspect the baseline.
buddy doctor
buddy test
buddy test:types

# Scaffold application behavior.
buddy make:model Product
buddy make:action CreateProduct

# Generate and review schema changes.
buddy generate:migrations
buddy migrate --diff
buddy migrate

# Verify before building.
buddy lint
buddy test
buddy test:types
buddy build
```

`buddy migrate:fresh` drops tables and is appropriate only when data loss is intended, normally in development or tests.

## Choose drivers deliberately

Do not infer working support from a configuration union. At the audited revision:

- queue `sync`, database, and Redis paths are implemented;
- queue `sqs`, `memory`, and `beanstalkd` execution paths fail as unimplemented;
- external mail, SMS, AI, storage, real-time scale-out, and cloud paths require their own services and credentials;
- Craft desktop workflows require a Craft binary or checkout.

Test the selected path in an environment that matches production.

## Next steps

- [Protocol and framework overview](/introduction/overview)
- [Technical architecture](/architecture/)
- [Backend guide](/guide/backend)
- [Database and ORM](/guide/database)
- [Security](/guide/security)
- [Testing](/developer-experience/testing)
