---
title: Multimodal Deployment
description: Deploying Stacks.js applications across different platforms
---

# Multimodal Deployment

The Stacks.js reference implementation can target the web, desktop, CLIs, libraries, and serverless from a single codebase, with infrastructure managed by ts-cloud.

> **Protocol context** — This page describes how the **Stacks.js reference implementation** satisfies the **Infrastructure & deployment** contract (§7.5, §14) of the [Stacks Protocol white paper](/); the specific packages and Bun tooling shown here are TypeScript/Bun-specific.

## Web Applications

Standard web application deployment:

```bash
buddy build:web
buddy deploy
```

Output structure:

```
dist/
├── client/
│   ├── index.html
│   ├── assets/
│   │   ├── main-[hash].js
│   │   └── style-[hash].css
│   └── manifest.json
└── server/
    └── index.js
```

## Desktop Applications (Craft)

Build native desktop apps from web codebase using Craft, Stacks' Zig-based desktop framework:

```bash
buddy build:desktop
```

Generates:

- **macOS**: `.app` bundle and `.dmg` installer
- **Windows**: `.exe` installer and `.msi` package
- **Linux**: `.deb`, `.rpm`, and `.AppImage`

### Craft Configuration

```typescript
// config/desktop.ts
export default {
  productName: 'My App',
  identifier: 'com.example.myapp',

  windows: {
    main: {
      width: 1200,
      height: 800,
      resizable: true,
    },
  },

  security: {
    csp: "default-src 'self'",
  },
}
```

## APIs & Serverless

Standalone API deployment:

```bash
buddy build:api
buddy deploy:serverless
```

In serverless mode, ts-cloud packages a single build artifact into three coordinated AWS Lambda functions — rather than one function per route:

```
serverless artifact
├── http   → API Gateway HTTP API v2   (handles all routes)
├── queue  → SQS event-source worker   (background jobs)
└── cli    → EventBridge scheduler      (migrations, cron, commands)
```

## CLI Applications

Build and distribute CLI tools:

```bash
buddy build:cli
```

Output:

```
dist/
├── cli-linux-x64
├── cli-linux-arm64
├── cli-darwin-x64
├── cli-darwin-arm64
└── cli-windows-x64.exe
```

Publishing to npm:

```bash
buddy publish:cli
# Users install via: npm install -g @yourorg/cli
```

## Library Publishing

Publish reusable packages:

```bash
# Component library
buddy build:components
buddy publish:components

# Function library
buddy build:functions
buddy publish:functions
```

Generated package:

```json
{
  "name": "@yourorg/components",
  "exports": {
    ".": "./dist/index.js",
    "./Button": "./dist/Button.js",
    "./Card": "./dist/Card.js"
  },
  "types": "./dist/index.d.ts"
}
```

## Cross-Platform Binary Distribution

Stacks leverages Bun's native compilation to produce standalone executables for all major platforms. This enables zero-dependency distribution of your applications.

### Supported Platforms

| Platform | Architecture | Binary |
|----------|--------------|--------|
| Linux | x64 | `app-linux-x64` |
| Linux | arm64 | `app-linux-arm64` |
| macOS | x64 (Intel) | `app-darwin-x64` |
| macOS | arm64 (Apple Silicon) | `app-darwin-arm64` |
| Windows | x64 | `app-windows-x64.exe` |

### Building Binaries

```bash
# Build for current platform
buddy build:binary

# Build for all platforms
buddy build:binary --all

# Build for specific platform
buddy build:binary --target linux-x64
buddy build:binary --target darwin-arm64
buddy build:binary --target windows-x64
```

### Binary Configuration

```typescript
// config/binary.ts
export default {
  name: 'my-app',

  // Entry point
  entry: './src/cli.ts',

  // Output directory
  outDir: './dist/binaries',

  // Target platforms
  targets: [
    'linux-x64',
    'linux-arm64',
    'darwin-x64',
    'darwin-arm64',
    'windows-x64',
  ],

  // Embed assets
  assets: [
    './templates/**/*',
    './config/defaults.json',
  ],

  // Minification
  minify: true,

  // Source maps (for debugging)
  sourcemap: 'external',

  // Bun compile options
  compile: {
    bytecode: true,
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  },
}
```

### Asset Embedding

Binaries can embed static assets for truly self-contained distribution:

```typescript
// Access embedded assets at runtime
import template from './templates/default.html' with { type: 'file' }
import config from './config/defaults.json'

// Assets are available without external files
const html = await Bun.file(template).text()
```

### Distribution Strategies

**npm Distribution**:

```json
{
  "name": "@yourorg/cli",
  "bin": {
    "mycli": "./dist/cli.js"
  },
  "optionalDependencies": {
    "@yourorg/cli-linux-x64": "*",
    "@yourorg/cli-darwin-arm64": "*",
    "@yourorg/cli-windows-x64": "*"
  }
}
```

**GitHub Releases**:

```bash
# Upload binaries to GitHub release
buddy release --upload-binaries
```

**Homebrew Formula** (macOS/Linux):

```ruby
class MyApp < Formula
  desc "My application description"
  homepage "https://github.com/yourorg/my-app"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/yourorg/my-app/releases/download/v1.0.0/my-app-darwin-arm64.tar.gz"
    else
      url "https://github.com/yourorg/my-app/releases/download/v1.0.0/my-app-darwin-x64.tar.gz"
    end
  end

  on_linux do
    url "https://github.com/yourorg/my-app/releases/download/v1.0.0/my-app-linux-x64.tar.gz"
  end

  def install
    bin.install "my-app"
  end
end
```

### Binary Size Optimization

```typescript
// config/binary.ts
export default {
  // Tree-shaking
  treeshake: true,

  // Exclude unused modules
  external: ['fsevents'],

  // Minification level
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true,
  },

  // Strip debug info
  strip: true,
}
```

Typical binary sizes:

| Application Type | Approximate Size |
|------------------|------------------|
| Simple CLI | 15-25 MB |
| Full Framework App | 30-50 MB |
| With Embedded Assets | 35-60 MB |

### Code Signing

```typescript
// config/signing.ts
export default {
  darwin: {
    identity: 'Developer ID Application: Your Name',
    entitlements: './entitlements.plist',
    notarize: {
      appleId: process.env.APPLE_ID,
      teamId: process.env.APPLE_TEAM_ID,
    },
  },

  windows: {
    certificate: './cert.pfx',
    password: process.env.CERT_PASSWORD,
    timestampServer: 'http://timestamp.digicert.com',
  },
}
```

### Self-Update Mechanism

```typescript
import { checkForUpdates, downloadUpdate, applyUpdate } from '@stacksjs/self-update'

// Check for updates
const update = await checkForUpdates({
  currentVersion: '1.0.0',
  repository: 'yourorg/my-app',
})

if (update.available) {
  console.log(`Update available: ${update.version}`)

  // Download update binary
  await downloadUpdate(update)

  // Apply update (restart required)
  await applyUpdate()
}
```
