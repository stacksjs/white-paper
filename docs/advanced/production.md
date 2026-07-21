---
title: Production & Operations
description: A verification-first checklist for operating a pre-1.0 Stacks.js application.
---

# Production & Operations

Stacks.js capabilities do not share one maturity level. A production decision must name the exact Stacks/Bun revision, database dialect, queue/cache/storage drivers, providers, delivery target, and deployment topology.

## Release gate

Use project-owned commands and inspect their installed help:

```bash
buddy --version
buddy doctor
buddy lint
buddy test
buddy test:types
buddy generate:migrations
buddy migrate --diff
buddy build
buddy deploy --help
```

Do not run `buddy migrate` or `buddy deploy` merely because the checks above pass. Review generated schema and infrastructure changes first.

## Pin the environment

Record:

- Stacks source/package revision;
- Bun, Git, and SQLite versions;
- operating system and architecture;
- database dialect/version;
- queue, cache, session, storage, mail, real-time, and cloud drivers;
- companion-package versions such as ts-cloud and Craft;
- generated migration/OpenAPI/declaration revision.

The white paper’s audited source contains different root and workspace versions, so the commit hash is the strongest provenance identifier.

## Configuration and secrets

- set `APP_ENV=production` and disable development error output;
- generate a unique application key through the project CLI;
- validate required environment variables at startup;
- inject secrets through a reviewed deployment secret store;
- redact secrets from logs, error pages, plans, and shell output;
- ensure no server-only secret reaches client bundles;
- rotate tokens and provider credentials during an incident exercise.

The environment-file encryption commands are experimental at the audited revision. Their source describes a simplified public/private-key construction rather than full ECIES. Do not treat committed ciphertext as a reviewed production secret-management boundary.

## Request security

Verify in the deployed topology:

- HTTPS redirect and HSTS behavior at the actual TLS terminator;
- proxy trust and client-IP resolution;
- CORS allowlist;
- Content Security Policy;
- CSRF enforcement for browser-authenticated writes;
- secure, HTTP-only, same-site cookie settings where sessions are used;
- authentication rate limits and shared-store behavior;
- authorization failures for every protected Action;
- production error redaction;
- body/upload limits and timeouts;
- request ID propagation.

Framework defaults are inputs to this review, not evidence that the deployed system is secure.

## Authentication and sessions

Test the complete lifecycle:

- login success/failure and throttling;
- token expiry, refresh rotation, and revocation;
- logout from one and all devices as intended;
- password reset and email verification;
- TOTP/passkey enrollment, recovery, and disable paths if enabled;
- gates/policies/RBAC after direct database changes;
- multi-process behavior.

The audited session implementation includes in-memory behavior. Multi-instance applications need a shared, tested session strategy where session auth is selected.

## Database and migrations

Before each release:

1. back up the production database;
2. restore the backup in a rehearsal environment;
3. generate migrations from the pinned Model source;
4. inspect the SQL/diff and destructive operations;
5. test against production-like data volume;
6. define rollback or forward-fix strategy;
7. apply under an appropriate lock/maintenance procedure;
8. verify constraints and application health afterward.

Test the exact database dialect. A type or connection option is not a provider certification.

## Queues and schedules

At the audited revision, use and test `database` or `redis` for background execution; `sync` runs inline. Do not select queue `sqs`, `memory`, or `beanstalkd` based solely on configuration names.

Verify:

- worker startup and graceful shutdown;
- retry, timeout, backoff, and failed-job recording;
- Job idempotency;
- poison/dead-letter behavior;
- queue-age and failure alerts;
- scheduler locking and overlap prevention;
- trace IDs from requests into Jobs;
- deploy behavior while Jobs are active.

## External providers

For email, SMS, payments, storage, search, analytics, AI, chat, and push:

- use restricted credentials;
- set timeouts and bounded retries;
- validate webhook signatures and replay windows;
- test sandbox and failure paths;
- define data egress and retention;
- set quotas/spend alerts;
- document provider outage behavior;
- verify idempotency for writes.

## Real-time

- initialize and health-check the broadcast server;
- test private/presence authorization;
- enforce connection, message-rate, and payload limits;
- verify Redis/adapter behavior when scaling horizontally;
- test reconnects and deploy draining;
- confirm that process-local state is not mistaken for cluster state.

## Observability

Minimum production signals:

- liveness and readiness;
- request rate, latency percentiles, errors, and saturation;
- database latency/pool usage;
- queue depth, age, retries, and failures;
- provider latency and errors;
- process restarts and memory growth;
- deployment revision in logs;
- request/trace ID in every incident-facing error.

Health endpoints should not expose secrets or detailed internals publicly.

## Deployment safety

For the installed deployment integration:

- inspect provider and version-specific help;
- require a reviewable plan/diff;
- identify added, updated, replaced, and removed resources;
- protect stateful resources from accidental deletion;
- use least-privilege deployment credentials;
- smoke-test from outside the provider network;
- practice application and infrastructure rollback;
- set cost and quota alerts.

Cloud breadth belongs to the pinned ts-cloud/provider implementation, not to Stacks.js in the abstract.

## Desktop production boundary

Craft desktop output is experimental in the audited Stacks source. Before distribution, establish:

- supported OS/architecture matrix;
- signed/notarized installers;
- update signing and rollback;
- navigation and native-bridge restrictions;
- offline behavior;
- release checksums;
- reproducible platform tests.

## Backup and disaster recovery

Define recovery objectives and test:

- database restore;
- object-storage version recovery;
- secret/key loss and rotation;
- queue replay and deduplication;
- DNS/certificate recovery;
- redeploy from pinned source and artifacts;
- audit/log retention.

A backup that has not been restored in a rehearsal is not a proven recovery path.

## Release record

Keep a machine-readable record:

```json
{
  "applicationRevision": "...",
  "stacksRevision": "...",
  "bunVersion": "...",
  "database": "...",
  "drivers": {
    "queue": "redis",
    "cache": "...",
    "storage": "..."
  },
  "migrationPlan": "...",
  "infrastructurePlan": "...",
  "testRun": "...",
  "deployedAt": "..."
}
```

This is the operational analogue of the protocol conformance report: claims remain tied to exact evidence.
