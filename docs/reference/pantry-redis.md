---
title: Pantry Redis services
description: Reproducible native and GitHub Actions Redis lifecycle contract used by Stacks.js tests and protocol evidence.
---

# Pantry Redis services

Stacks consumes Redis through Pantry [`v0.10.42`](https://github.com/pantry-pm/pantry/tree/v0.10.42)
at immutable commit [`7f563c6fcb53ad73f2dadcb9e3fea0866f4cd7f3`](https://github.com/pantry-pm/pantry/tree/7f563c6fcb53ad73f2dadcb9e3fea0866f4cd7f3).
This page distinguishes Pantry's native project service from its ephemeral GitHub
Actions service. They share package resolution and health semantics, but they do
not share process state or persistence policy.

## Evidence boundary

| Contract | Pinned source | SHA-256 |
| --- | --- | --- |
| Action interface | [`packages/action/action.yml`](https://github.com/pantry-pm/pantry/blob/7f563c6fcb53ad73f2dadcb9e3fea0866f4cd7f3/packages/action/action.yml) | `sha256:06f4ac3f3307a474e493abe56f1e8f7d99f7af8ce49cecbf3dfdd2e55333ea13` |
| Service parsing, launch arguments, PID readiness, diagnostics | [`packages/action/src/services.ts`](https://github.com/pantry-pm/pantry/blob/7f563c6fcb53ad73f2dadcb9e3fea0866f4cd7f3/packages/action/src/services.ts) | `sha256:7e88c89880bf1dc42cfee44f5a741b7659b2c2a1aced7da9c23520ed28a8afe9` |
| Action installation and orchestration | [`packages/action/src/index.ts`](https://github.com/pantry-pm/pantry/blob/7f563c6fcb53ad73f2dadcb9e3fea0866f4cd7f3/packages/action/src/index.ts) | `sha256:8ec03abb32f51041f13291101d0c77865fe7232b9c7a4753942b48b3b9609678` |
| Action cleanup | [`packages/action/src/post.ts`](https://github.com/pantry-pm/pantry/blob/7f563c6fcb53ad73f2dadcb9e3fea0866f4cd7f3/packages/action/src/post.ts) | `sha256:9dbfa452e86a61ec75da8c461d69d10a4f493765c19523ba999ee4f916ccde54` |
| Native lifecycle | [`packages/zig/src/cli/commands/services.zig`](https://github.com/pantry-pm/pantry/blob/7f563c6fcb53ad73f2dadcb9e3fea0866f4cd7f3/packages/zig/src/cli/commands/services.zig) | `sha256:7da9d6271b8dc755865db26a366202448cc408e0d2e3b0daa0a3b8cb917fd748` |
| Native Redis definition | [`packages/zig/src/services/definitions.zig`](https://github.com/pantry-pm/pantry/blob/7f563c6fcb53ad73f2dadcb9e3fea0866f4cd7f3/packages/zig/src/services/definitions.zig) | `sha256:faf362b6a9f037350b6baf7204f424e78b9bfe8704dfdfcf26e1daa1b5dce678` |
| Action contract tests | [`packages/action/src/services.test.ts`](https://github.com/pantry-pm/pantry/blob/7f563c6fcb53ad73f2dadcb9e3fea0866f4cd7f3/packages/action/src/services.test.ts) | `sha256:0e1330c614259a00a2a2c5b8768cca28098aed1bbbb41fa13a2d68e756e15658` |

The lock, copied sources, and verification commands are retained in
[`evidence/pantry/evidence.lock.json`](https://github.com/stacksjs/white-paper/blob/main/evidence/pantry/evidence.lock.json).

## GitHub Actions contract

Use the Pantry Action when a job needs an isolated Redis process:

```yaml
- name: Setup Pantry and Redis
  id: pantry
  uses: pantry-pm/pantry/packages/action@7f563c6fcb53ad73f2dadcb9e3fea0866f4cd7f3
  with:
    version: '0.10.42'
    install: 'false'
    services: redis@8.8.0
```

Both pins are intentional. The `uses` revision fixes the Action source, while
`version` fixes the downloaded native Pantry CLI. `services` accepts an exact
`redis@X.Y.Z` version; ranges and ambiguous versions fail before installation.
The Action currently supports Redis services on Linux and macOS. Windows support
is tracked upstream in [Pantry issue 211](https://github.com/pantry-pm/pantry/issues/211)
and is not implied by the cross-platform CLI installation contract.

### Lifecycle sequence

1. Parse and deduplicate service declarations. Conflicting package and service
   versions fail before any process is started.
2. Install Redis through the native Pantry resolver with `--no-save`. This
   preserves package dependencies, integrity verification, platform selection,
   and Pantry's normal installation boundary without mutating the project manifest.
3. Resolve `redis-server` and `redis-cli` from the job-local `pantry/.bin`.
   A system Redis installation is not accepted as evidence for the requested pin.
4. Create an isolated directory under `RUNNER_TEMP/pantry-services/redis`.
5. Launch Redis on `127.0.0.1:6379` with protected mode enabled, persistence
   disabled, and explicit PID and log files. The service is not exposed on an
   external runner interface.
6. Wait up to 10 seconds for a valid, live daemon PID. PID creation is polled to
   avoid racing Redis daemonization.
7. Wait up to 30 seconds for `redis-cli ping` to succeed.
8. Read the running binary's version and reject it when it differs from the exact
   requested version.
9. Export `REDIS_URL=redis://127.0.0.1:6379/0` and
   `REDIS_SERVICE_VERSION`; publish the same values as `redis-url` and
   `redis-version` Action outputs.
10. In the post step, issue `SHUTDOWN NOSAVE` only when this Action recorded a
    successful start.

### Failure and diagnostic semantics

The setup step fails when installation fails, the installed binaries are missing,
the PID is invalid or absent, Redis cannot answer a health check, or the running
version differs from the exact request. PID-readiness errors include the Redis
startup logfile, making port collisions, linkage failures, and invalid launch
configuration visible in the Actions log. A failed setup never converts to a
memory-backed cache or queue pass.

An exact Actions cache hit may restore Pantry artifacts, but the Action still
validates and starts the declared service. Restore-key matches are not treated as
exact dependency state. When `install: 'false'` is combined with a service,
project JavaScript dependencies remain untouched; only the runtime and explicitly
requested service packages are provisioned.

## Native project service contract

`pantry start redis` and `pantry restart redis` use the invoking project as
the service scope. The service identifier, data directory, logs, and process state
are project-specific, preventing one checkout from silently adopting another
checkout's Redis process. Pantry uses its own installed `redis-server` and
`redis-cli`, waits for `PONG`, and stops a failed start before returning an
error. Restart preserves the same project scope.

Native project services are development infrastructure and may use persistent
project data. The Action service is deliberately ephemeral and disables
persistence. Tests and deployment tooling must not assume those two modes have
the same durability or recovery behavior.

## Consumer checks

A consuming workflow should verify both exported state and a real round trip:

```bash
test "$REDIS_URL" = "redis://127.0.0.1:6379/0"
test "$REDIS_SERVICE_VERSION" = "8.8.0"
test "$(redis-cli -u "$REDIS_URL" ping)" = "PONG"
redis-cli -u "$REDIS_URL" set contract-check ready
test "$(redis-cli -u "$REDIS_URL" get contract-check)" = "ready"
```

Stacks additionally retains cache and queue driver tests against the live URL.
Service availability alone does not prove either driver contract.

## Verification retained for this snapshot

| Check | Result |
| --- | --- |
| Documentation/source contract | `bun run docs:contracts:check (54 source-linked markers)` |
| Package and registry tests | `12 passed, 0 failed` |
| Pantry Action tests | `40 passed, 0 failed` |
| Live Action Redis contract | `Pantry CI action-redis-service (Redis 8.8.0 install, health, round trip, outputs, cleanup)` |
| TypeScript typecheck | `bun run typecheck` |
| Native Zig graph | `zig build test` |
