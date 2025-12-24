---
title: Runtime & Performance
description: How Stacks.js leverages Bun for exceptional performance
---

# Runtime & Performance

## Bun Runtime Optimization

Stacks is built exclusively for Bun, leveraging its unique performance characteristics:

### Native TypeScript Execution

Bun executes TypeScript directly without a separate compilation step. This eliminates:

- Build watch processes during development
- Source map complexity
- Type stripping overhead

### Unified Tooling

Bun provides runtime, package manager, bundler, and test runner in one binary:

```bash
bun install          # Package management (faster than npm/yarn/pnpm)
bun run              # Script execution
bun test             # Test runner
bun build            # Production bundling
```

### Performance Characteristics

Bun's V8-alternative JavaScriptCore engine delivers:

- **Startup Time**: ~3x faster than Node.js
- **HTTP Throughput**: Higher requests/second for API workloads
- **Memory Usage**: Lower baseline memory footprint

## Zero-Config Defaults

Stacks ships with production-ready defaults:

```typescript
// Development server starts with one command
buddy dev

// Includes:
// - Hot module replacement
// - TypeScript compilation
// - API server
// - File watching
// - Error overlay
// - Request logging
```

Production builds require no additional configuration:

```bash
buddy build
# Outputs optimized bundles for deployment
```

## Build System

The build system supports multiple output targets:

### Web Applications

```bash
buddy build:web
# - STX component compilation
# - Asset optimization
# - Code splitting
# - Tree shaking
```

### API/Server

```bash
buddy build:api
# - Server bundle
# - Dependency bundling
# - Environment handling
```

### Desktop Applications

```bash
buddy build:desktop
# - Craft application packaging
# - Cross-platform binaries
# - Native integrations
```

### Library Publishing

```bash
buddy build:lib
# - ESM and CJS outputs
# - Type declarations
# - Package.json generation
```
