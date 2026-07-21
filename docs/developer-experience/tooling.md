---
title: Developer Tooling
description: Development automation and productivity tools in the Stacks ecosystem
---

# Developer Tooling

Stacks provides a comprehensive suite of developer tools that automate common tasks and improve productivity.

## Version Management (bumpx)

Automated version bumping and release management:

```bash
# Bump version based on conventional commits
bunx bumpx

# Specify version type
bunx bumpx patch  # 1.0.0 -> 1.0.1
bunx bumpx minor  # 1.0.0 -> 1.1.0
bunx bumpx major  # 1.0.0 -> 2.0.0

# Prerelease versions
bunx bumpx prepatch --preid alpha  # 1.0.0 -> 1.0.1-alpha.0
bunx bumpx preminor --preid beta   # 1.0.0 -> 1.1.0-beta.0
```

### Configuration

```typescript
// bumpx.config.ts
export default {
  // Files to update version in
  files: [
    'package.json',
    'jsr.json',
    'src/version.ts',
  ],

  // Git tag configuration
  tag: {
    prefix: 'v',
    sign: true,
  },

  // Changelog generation
  changelog: {
    enabled: true,
    file: 'CHANGELOG.md',
  },

  // Execute scripts after bump
  scripts: {
    postbump: 'bun run build',
    prerelease: 'bun run test',
  },

  // Commit message format
  commit: {
    message: 'chore(release): v%s',
    sign: true,
  },
}
```

### Monorepo Support

```typescript
// bumpx.config.ts
export default {
  // Workspace configuration
  workspaces: true,

  // Version strategy
  strategy: 'independent', // or 'fixed'

  // Package-specific overrides
  packages: {
    '@stacksjs/core': {
      bumpDependents: true,
    },
    '@stacksjs/utils': {
      private: true, // Skip publishing
    },
  },
}
```

## Git Commit Linting (gitlint)

Enforce consistent commit message format:

```bash
# Install as git hook
bunx gitlint install

# Lint a commit message
bunx gitlint "feat: add user authentication"

# Lint all commits since main
bunx gitlint --from main
```

### Configuration

```typescript
// gitlint.config.ts
export default {
  // Conventional commit types
  types: [
    'feat',     // New feature
    'fix',      // Bug fix
    'docs',     // Documentation
    'style',    // Formatting
    'refactor', // Code restructuring
    'perf',     // Performance
    'test',     // Testing
    'build',    // Build system
    'ci',       // CI/CD
    'chore',    // Maintenance
    'revert',   // Revert commit
  ],

  // Scopes (optional)
  scopes: [
    'core',
    'cli',
    'api',
    'ui',
    'docs',
  ],

  // Message rules
  rules: {
    'header-max-length': [2, 'always', 100],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-case': [2, 'always', 'sentence-case'],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },

  // Custom patterns
  patterns: {
    issue: /(?:closes?|fixes?|resolves?)\s+#\d+/i,
  },
}
```

### Git Hooks Integration

```typescript
// git-hooks.config.ts
export default {
  'pre-commit': 'bunx pickier --staged',
  'commit-msg': 'bunx gitlint --edit $1',
  'pre-push': 'bun run test',
}
```

## Changelog Generation (logsmith)

Generate beautiful changelogs from commits:

```bash
# Generate changelog
bunx logsmith

# Generate for specific version
bunx logsmith --from v1.0.0 --to v2.0.0

# Output to different file
bunx logsmith --output HISTORY.md
```

### Configuration

```typescript
// logsmith.config.ts
export default {
  // Changelog file
  output: 'CHANGELOG.md',

  // Commit grouping
  groups: {
    'Features': ['feat'],
    'Bug Fixes': ['fix'],
    'Performance': ['perf'],
    'Documentation': ['docs'],
    'Maintenance': ['chore', 'build', 'ci'],
  },

  // Include/exclude scopes
  scopes: {
    include: ['*'],
    exclude: ['deps'],
  },

  // Formatting
  format: {
    header: '## [{{version}}]({{compareUrl}}) ({{date}})',
    commit: '- {{subject}} ([{{shortHash}}]({{commitUrl}}))',
    breaking: '### BREAKING CHANGES\n\n{{changes}}',
  },

  // Repository info for links
  repository: {
    url: 'https://github.com/stacksjs/stacks',
    compare: '{{base}}...{{head}}',
    commit: 'commit/{{hash}}',
  },

  // Authors
  authors: {
    include: true,
    format: '{{name}}',
  },
}
```

### GitHub Release Integration

```bash
# Create GitHub release with changelog
bunx logsmith release

# Draft release (don't publish)
bunx logsmith release --draft

# Include assets
bunx logsmith release --assets dist/*.zip
```

## Dependency Bot (buddy-bot)

Self-hosted dependency update automation (like Renovate/Dependabot):

```typescript
// buddy-bot.config.ts
export default {
  // Repository settings
  repository: 'stacksjs/stacks',

  // Update schedule
  schedule: {
    automerge: '0 4 * * 1', // Monday 4 AM
    security: 'immediate',
  },

  // Package managers
  packageManagers: ['bun', 'npm'],

  // Dependency rules
  rules: [
    {
      match: ['*'],
      automerge: false,
      groupName: 'all dependencies',
    },
    {
      match: ['@types/*', 'typescript'],
      automerge: true,
      groupName: 'TypeScript',
    },
    {
      match: ['@stacksjs/*'],
      automerge: true,
      groupName: 'Stacks',
    },
  ],

  // Version constraints
  versioning: {
    major: false,        // Don't auto-bump major
    minor: true,
    patch: true,
    pinDigests: true,
  },

  // PR settings
  pullRequest: {
    title: 'chore(deps): {{updateType}} {{packageName}} to {{newVersion}}',
    labels: ['dependencies', 'automated'],
    assignees: ['maintainer'],
    reviewers: ['team:core'],
  },

  // Lockfile maintenance
  lockfile: {
    enabled: true,
    schedule: '0 3 * * 0', // Sunday 3 AM
  },
}
```

### Security Scanning

```typescript
export default {
  security: {
    // Vulnerability scanning
    vulnerabilities: {
      enabled: true,
      severity: ['critical', 'high'],
      autofix: true,
    },

    // License compliance
    licenses: {
      allowed: ['MIT', 'Apache-2.0', 'BSD-3-Clause'],
      denied: ['GPL-3.0', 'AGPL-3.0'],
    },

    // Dependency age warnings
    stale: {
      warn: '1 year',
      critical: '2 years',
    },
  },
}
```

## Code Quality (pickier)

Fast linting and formatting in one tool. Pickier is Stacks' alternative to ESLint and Prettier, providing:

- Zero-config defaults with typed `pickier.config.ts` when customization is needed
- Import organization: splits type/value imports, sorts modules/specifiers, removes unused
- Markdown linting with 53 rules for documentation quality
- ESLint-style plugin system for custom lint rules
- 100+ built-in rules across general, quality, style, TypeScript, and regexp categories

```bash
# Lint everything with pretty output
bunx pickier lint .

# Auto-fix issues (safe fixes only)
bunx pickier lint . --fix

# Preview fixes without writing
bunx pickier lint . --fix --dry-run --verbose

# Format and write changes
bunx pickier format . --write

# Check formatting without writing (CI-friendly)
bunx pickier format . --check
```

### Configuration

```typescript
// pickier.config.ts
import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  verbose: false,
  ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],

  lint: {
    extensions: ['ts', 'js'],
    reporter: 'stylish',  // stylish | json | compact
    cache: false,
    maxWarnings: -1,      // -1 disables, otherwise fail when warnings exceed
  },

  format: {
    extensions: ['ts', 'js', 'json', 'md', 'yaml', 'yml'],
    trimTrailingWhitespace: true,
    maxConsecutiveBlankLines: 1,
    finalNewline: 'one',  // one | two | none
    indent: 2,
    quotes: 'single',     // single | double
    semi: false,          // when true, removes stylistic semicolons
  },

  rules: {
    noDebugger: 'error',
    noConsole: 'warn',
  },

  // Plugin rules for markdown, style, sorting, etc.
  pluginRules: {
    'markdown/heading-increment': 'error',
    'markdown/no-trailing-spaces': 'error',
    'markdown/fenced-code-language': 'error',
    'pickier/no-unused-vars': 'error',
    'ts/no-explicit-any': 'warn',
  },
}

export default config
```

### Available Plugin Categories

| Plugin | Description | Rules |
|--------|-------------|-------|
| `general/` | Error detection and possible problems | 35+ rules |
| `quality/` | Best practices and code quality | 40+ rules |
| `pickier/` | Sorting and import organization | 17 rules |
| `style/` | Code style enforcement | 7 rules |
| `ts/` | TypeScript-specific rules | 9 rules |
| `regexp/` | Regular expression safety | 3 rules |
| `markdown/` | Markdown documentation linting | 53+ rules |

### Import Organization

Pickier automatically organizes imports:

```typescript
// Before
import { z } from 'zod'
import type { User } from './types'
import { computed, ref } from 'vue'
import { User as UserModel } from './models'

// After (pickier format --write)
import type { User } from './types'

import { computed, ref } from 'vue'
import { z } from 'zod'

import { User as UserModel } from './models'
```

Features:
- Splits type-only specifiers into `import type { ... }`
- Groups: type imports, external packages, relative imports
- Sorts modules A→Z within each group
- Removes unused named imports
- Merges multiple imports from the same module

### Git Hooks Integration

```typescript
// git-hooks.config.ts
export default {
  'pre-commit': 'bunx pickier lint --staged --fix',
  'commit-msg': 'bunx gitlint --edit $1',
}
```

## DNS Tools (dnsx)

DNS client library and CLI:

```bash
# Query DNS records
bunx dnsx example.com A
bunx dnsx example.com MX
bunx dnsx example.com TXT

# All records
bunx dnsx example.com ANY

# Specific resolver
bunx dnsx example.com A --resolver 8.8.8.8

# JSON output
bunx dnsx example.com --json
```

### Library Usage

```typescript
import { query, resolve, lookup } from 'dnsx'

// Query specific record type
const records = await query('example.com', 'MX')
console.log(records)
// [{ exchange: 'mail.example.com', priority: 10 }]

// Resolve to IP
const ips = await resolve('example.com')
// ['93.184.216.34']

// Full lookup with all record types
const result = await lookup('example.com')
console.log(result.a)    // IPv4 addresses
console.log(result.aaaa) // IPv6 addresses
console.log(result.mx)   // Mail servers
console.log(result.txt)  // Text records
console.log(result.ns)   // Name servers
```

## Local Tunnels (localtunnels)

Expose local servers to the internet:

```bash
# Start tunnel to local port
bunx localtunnels 3000

# Custom subdomain
bunx localtunnels 3000 --subdomain myapp

# Output: https://myapp.localtunnel.me -> localhost:3000
```

### Self-Hosted Server

```typescript
// Run your own tunnel server
import { createServer } from 'localtunnels/server'

const server = await createServer({
  port: 443,
  domain: 'tunnel.example.com',
  tls: {
    cert: './cert.pem',
    key: './key.pem',
  },
})
```

## Backup Solution (backupx)

Database and file backup automation:

```typescript
// backupx.config.ts
export default {
  // Backup sources
  sources: {
    database: {
      driver: 'postgres',
      connection: process.env.DATABASE_URL,
      tables: ['*'],
      exclude: ['sessions', 'cache'],
    },

    files: {
      paths: ['./uploads', './storage'],
      exclude: ['*.tmp', '*.log'],
    },
  },

  // Backup destinations
  destinations: {
    local: {
      path: './backups',
      retention: '30 days',
    },

    s3: {
      bucket: 'my-backups',
      region: 'us-east-1',
      retention: '90 days',
    },
  },

  // Schedule
  schedule: {
    full: '0 2 * * 0',        // Weekly full backup
    incremental: '0 2 * * *', // Daily incremental
  },

  // Encryption
  encryption: {
    enabled: true,
    algorithm: 'aes-256-gcm',
    key: process.env.BACKUP_KEY,
  },

  // Notifications
  notify: {
    success: false,
    failure: ['email:admin@example.com', 'slack:#ops'],
  },
}
```

## Testing (besting)

Modern, performant testing framework:

```typescript
import { describe, it, expect, beforeEach, mock } from 'besting'

describe('UserService', () => {
  let service: UserService

  beforeEach(() => {
    service = new UserService()
  })

  it('creates a user', async () => {
    const user = await service.create({
      name: 'John',
      email: 'john@example.com',
    })

    expect(user.id).toBeDefined()
    expect(user.name).toBe('John')
  })

  it('validates email format', () => {
    expect(() => service.create({
      name: 'John',
      email: 'invalid',
    })).toThrow('Invalid email')
  })
})
```

### Browser Testing

```typescript
import { browser, page } from 'besting/browser'

describe('Login Page', () => {
  it('logs in successfully', async () => {
    await page.goto('/login')

    await page.fill('#email', 'user@example.com')
    await page.fill('#password', 'password')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toHaveText('Welcome back!')
  })
})
```

### API Testing

```typescript
import { api, expect } from 'besting/api'

describe('Users API', () => {
  it('lists users', async () => {
    const response = await api.get('/users')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(10)
    expect(response.body[0]).toMatchShape({
      id: expect.any(Number),
      name: expect.any(String),
      email: expect.email(),
    })
  })
})
```

## Package Summary

| Tool | Purpose | Install |
|------|---------|---------|
| bumpx | Version bumping | `bunx bumpx` |
| gitlint | Commit linting | `bunx gitlint` |
| logsmith | Changelog generation | `bunx logsmith` |
| buddy-bot | Dependency updates | Self-hosted |
| pickier | Lint & format | `bunx pickier` |
| dnsx | DNS queries | `bunx dnsx` |
| localtunnels | Local tunneling | `bunx localtunnels` |
| backupx | Backup automation | `bunx backupx` |
| besting | Testing framework | `bun add -d besting` |
