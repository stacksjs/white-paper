---
title: Runtime & Performance
description: The efficient-abstraction objective, and how to measure Stacks.js performance and energy use without unsupported framework-wide benchmark claims.
---

# Runtime & Performance

Stacks.js targets Bun for runtime, package management, builds, and tests. That unified toolchain can simplify application operation, but runtime choice alone does not determine application performance.

## The efficient-abstraction objective

Stacks aims for abstractions that are as close to ideal as possible for the humans who write and review code, the AI models that generate and read it, and the machines that execute it. For machines, ideal means doing no work the application did not ask for: no avoidable copies, serializations, round trips, or idle processes. Lower latency, memory, compute, data transfer, and energy use are the intended results.

Two rules keep the objective honest:

- an abstraction that saves authoring effort but adds hidden runtime work has moved cost, not removed it;
- an optimization that weakens validation, security, durability, or observability is not an efficiency gain.

The objective is a design input. Claims that it has been met require the measurements below.

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
- energy per request or per 1,000 requests, with the measurement source named;
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
| cold-start time | Scale-to-zero and deploy cost |
| bytes transferred per request | Network cost and client energy |
| energy per request at stated load | Operating cost and environmental impact |
| idle power | Cost of capacity that serves no traffic |

## Measuring energy

Energy is the common denominator of runtime cost, so it is reported with the same discipline as latency:

- **Name the source.** RAPL counters on Linux, `powermetrics` on macOS, and an external power meter measure different boundaries (CPU package, system on chip, or wall power). Say which one was used.
- **Normalize to work.** Report joules per request or per 1,000 requests at a stated concurrency, not raw watts.
- **Subtract or report idle.** Separate the baseline power of the host from the marginal energy of the workload.
- **Label estimates.** Cloud energy or carbon figures derived from instance types or billing are models, not measurements.
- **Include the build path.** Build, test, and CI energy matter for frequently changed applications and for AI-assisted loops that rerun them.

The same measurement applies to AI-assisted development: provider-tokenizer token counts, context size, and generation attempts until tests pass are the authoring-side signals that pair with runtime energy.

## Performance is a conformance non-goal

The protocol standardizes behavior, not speed. Efficiency is a protocol goal, but implementations publish performance and energy profiles separately, using reproducible harnesses. A faster implementation that changes error, transaction, or lifecycle semantics is not conformant merely because it is faster.

- [Performance tuning](/advanced/performance)
- [Request lifecycle](/architecture/request-lifecycle)
