---
title: Runtime & Performance
description: How to reason about Stacks.js performance without unsupported framework-wide benchmark claims.
---

# Runtime & Performance

Stacks.js targets Bun for runtime, package management, builds, and tests. That unified toolchain can simplify application operation, but runtime choice alone does not determine application performance.

## What the architecture affects

Performance depends on:

- route matching and middleware depth;
- validation and serialization cost;
- database query count, indexes, and result size;
- remote provider latency;
- queue driver and worker concurrency;
- template rendering and asset delivery;
- logging volume;
- process-local versus shared state;
- deployment topology and cold starts.

## No universal benchmark claim

This documentation does not claim a fixed multiplier over Node.js or another framework. Valid comparisons require:

- pinned runtime/framework versions;
- identical application behavior and payloads;
- warm-up policy;
- hardware and operating system;
- concurrency and connection settings;
- database location and state;
- percentiles, throughput, errors, CPU, and memory;
- public scripts and raw results.

## Built-in observability hooks

The audited source provides useful measurement inputs:

- `X-Request-ID` response correlation;
- `Server-Timing` handling in the router path;
- structured logging with trace IDs;
- request duration fields in framework models/actions;
- queue metrics and health checks;
- query tracking for error/debug context.

These are instrumentation surfaces, not a full distributed-observability backend.

## Measure the production build

```bash
buddy test
buddy test:types
buddy build
```

Benchmark the resulting production server and its real dependencies. Do not use a hot-reload development process as the production baseline.

Record at minimum:

| Signal | Why it matters |
|---|---|
| p50/p95/p99 latency | Typical and tail user experience |
| throughput | Capacity at a stated concurrency |
| error/timeout rate | Whether throughput is useful |
| CPU and resident memory | Cost and saturation |
| database queries/request | N+1 and chatty persistence |
| external-call time | Provider bottlenecks |
| event-loop delay | Runtime saturation |
| queue age and retry rate | Background-work health |

## Performance is a conformance non-goal

The protocol standardizes behavior, not speed. Implementations may publish performance profiles separately, using reproducible harnesses. A faster implementation that changes error, transaction, or lifecycle semantics is not conformant merely because it is faster.

- [Performance tuning](/advanced/performance)
- [Request lifecycle](/architecture/request-lifecycle)
