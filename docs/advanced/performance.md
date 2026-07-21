---
title: Performance Tuning
description: A measurement-first workflow for Stacks.js applications across requests, data, queues, rendering, and providers.
---

# Performance Tuning

Performance work should begin with a workload, a production-like build, and a measurable objective. Generic targets such as “50,000 requests per second” are not useful without payloads, consistency requirements, hardware, dependencies, and error rates.

## 1. Define the workload

For each important user journey, record:

- request and response size;
- authentication state;
- database reads/writes and consistency requirements;
- cacheability;
- external provider calls;
- background work created;
- acceptable p50/p95/p99 latency and error rate;
- expected concurrency and burst behavior.

## 2. Establish a reproducible baseline

```bash
buddy test
buddy test:types
buddy build
```

Run the production artifact with pinned environment, data volume, runtime, OS, and hardware. Save the load script and raw output with the application revision.

Measure:

- latency percentiles and throughput;
- non-2xx responses and timeouts;
- CPU, memory, and event-loop delay;
- database query count and time;
- cache hit rate;
- remote-call time;
- queue age, retries, failures, and worker saturation.

## 3. Trace before changing

Stacks request IDs and structured logs can correlate a slow response with its queries and background work. Ensure the incoming or generated `X-Request-ID` appears in:

- response headers;
- application logs;
- error records;
- Jobs spawned by the request.

Do not log credentials, session tokens, raw request bodies, or sensitive query values while profiling.

## 4. Data access

Common high-value checks:

- eliminate N+1 relationship access with eager loading;
- select only fields needed by the Action/resource;
- index columns used in filters, joins, ordering, and uniqueness checks;
- paginate unbounded lists;
- inspect query plans;
- keep transactions short;
- size connection pools for the deployment model;
- load-test with realistic row counts and distributions.

Model-derived migrations should be reviewed to confirm that expected unique and secondary indexes are present.

## 5. Serialization and views

- use API resources to avoid returning unused fields;
- bound nested relationship depth;
- avoid repeated expensive work inside templates;
- compress appropriate response types;
- cache immutable assets with content hashes;
- measure server rendering separately from client hydration and asset transfer.

## 6. Caching

Cache only after identifying repeated expensive work. For every cache entry, define:

- key and tenant scope;
- source of truth;
- TTL;
- invalidation trigger;
- stampede behavior;
- failure fallback;
- maximum size and serialization cost.

Test the selected Stacks cache driver. A driver name in configuration is not sufficient evidence.

## 7. Queues

The default `sync` queue executes work in the request process; it does not improve response latency by moving work to a background worker. Select and test database or Redis for asynchronous execution at the audited revision.

Tune with:

- end-to-end Job latency, not only worker throughput;
- bounded concurrency;
- idempotency for retries;
- timeout shorter than visibility/retry windows where relevant;
- backoff and dead-letter policy;
- payload size limits;
- queue-age and failure alerts.

Callbacks stored only in process memory should not be relied on across worker restarts.

## 8. External providers

AI, email, SMS, storage, payment, search, and cloud APIs often dominate latency. Apply:

- explicit connect/request deadlines;
- bounded retries with jitter;
- idempotency keys where supported;
- circuit breaking or graceful degradation;
- concurrency and spend limits;
- queueing for work that does not need to block the response.

Record provider latency separately from application processing.

## 9. Real-time systems

Measure:

- concurrent connections per process;
- connection churn;
- messages per second and payload size;
- backpressure and dropped/failed delivery;
- authorization cost;
- Redis/adapter latency for scale-out;
- reconnect behavior during deploys.

Use the configured connection, message, and payload limits as safety bounds, then test them under the real topology.

## 10. Optimize one bottleneck at a time

For each change:

1. state the hypothesis;
2. change one material variable;
3. rerun the same workload;
4. compare latency, throughput, errors, CPU, memory, and cost;
5. keep the change only if the improvement is meaningful and correctness is unchanged.

Performance regressions should become automated tests or benchmark thresholds where stable enough.

## Reporting template

```text
Application revision:
Stacks revision/package:
Bun version:
OS / hardware:
Database and data volume:
Queue/cache/providers:
Build command:
Server command:
Load script:
Warm-up:
Duration / concurrency:
p50 / p95 / p99:
Throughput:
Error rate:
CPU / RSS:
Notes and raw-results link:
```

This makes performance a reproducible engineering artifact rather than a framework adjective.
