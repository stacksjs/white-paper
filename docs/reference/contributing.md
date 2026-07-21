---
title: Contributing Guide
description: How to contribute to Stacks.js - code, documentation, and community
---

# Contributing Guide

Thank you for your interest in contributing to Stacks.js! This guide covers how to contribute code, documentation, and participate in the community.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) v1.0 or higher
- [Git](https://git-scm.com)
- A GitHub account

### Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/stacks.git
cd stacks

# Add upstream remote
git remote add upstream https://github.com/stacksjs/stacks.git

# Install dependencies
bun install

# Build the framework
bun run build

# Run tests
bun test
```

### Project Structure

```
stacks/
├── app/                    # Application code
├── config/                 # Configuration files
├── docs/                   # Documentation
├── storage/
│   └── framework/
│       └── core/           # Core modules (89 packages)
│           ├── actions/
│           ├── ai/
│           ├── auth/
│           ├── cache/
│           ├── database/
│           ├── ...
├── tests/                  # Test suites
├── buddy                   # CLI entry point
└── package.json
```

## Development Workflow

### Creating a Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/my-feature

# Or bugfix branch
git checkout -b fix/issue-123
```

### Making Changes

1. **Write code** following our style guide
2. **Add tests** for new functionality
3. **Update docs** if needed
4. **Run tests** before committing

```bash
# Run tests
bun test

# Run specific test file
bun test tests/auth.test.ts

# Run linter
bun run lint

# Fix linting issues
bun run lint:fix

# Type check
bun run typecheck
```

### Committing Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <description>

git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(database): resolve connection pooling issue"
git commit -m "docs(readme): update installation instructions"
git commit -m "refactor(router): simplify route matching logic"
git commit -m "test(queue): add tests for failed job handling"
git commit -m "chore(deps): update typescript to 5.3"
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `style`: Code style (formatting, etc.)

### Submitting a Pull Request

1. Push your branch to your fork:
```bash
git push origin feature/my-feature
```

2. Open a Pull Request on GitHub

3. Fill out the PR template:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added tests for new functionality

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed my code
- [ ] Updated documentation
- [ ] No breaking changes (or documented)
```

4. Wait for review and address feedback

## Code Style

### TypeScript Guidelines

```typescript
// Use explicit types for function parameters and returns
function processUser(user: User): ProcessedUser {
  // ...
}

// Use interfaces for object shapes
interface UserConfig {
  name: string
  email: string
  options?: UserOptions
}

// Use type for unions and intersections
type Status = 'active' | 'inactive' | 'pending'

// Use const assertions for literals
const ROLES = ['admin', 'user', 'guest'] as const

// Prefer async/await over .then()
async function fetchData() {
  const response = await fetch(url)
  return response.json()
}

// Use early returns
function validateUser(user: User) {
  if (!user) {
    return { valid: false, error: 'User required' }
  }

  if (!user.email) {
    return { valid: false, error: 'Email required' }
  }

  return { valid: true }
}
```

### File Organization

```typescript
// 1. Imports (external, then internal)
import { something } from 'external-package'
import { helper } from '@stacksjs/utils'
import { localThing } from './local'

// 2. Types/Interfaces
interface Options {
  // ...
}

// 3. Constants
const DEFAULT_OPTIONS: Options = {
  // ...
}

// 4. Main exports
export class MyClass {
  // ...
}

export function myFunction() {
  // ...
}

// 5. Helper functions (private)
function helperFunction() {
  // ...
}
```

### Naming Conventions

```typescript
// Classes: PascalCase
class UserController {}

// Functions/methods: camelCase
function getUserById(id: number) {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3

// Interfaces: PascalCase (no I prefix)
interface User {}

// Types: PascalCase
type UserStatus = 'active' | 'inactive'

// Files: kebab-case
// user-controller.ts
// send-email-job.ts

// Folders: kebab-case
// user-management/
// email-templates/
```

## Testing

### Writing Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { User } from '@/Models/User'

describe('User', () => {
  beforeEach(async () => {
    // Setup
    await DB.beginTransaction()
  })

  afterEach(async () => {
    // Cleanup
    await DB.rollback()
  })

  describe('create', () => {
    it('creates a user with valid data', async () => {
      const user = await User.create({
        name: 'John Doe',
        email: 'john@example.com',
      })

      expect(user.id).toBeDefined()
      expect(user.name).toBe('John Doe')
    })

    it('throws on invalid email', async () => {
      await expect(
        User.create({ name: 'John', email: 'invalid' })
      ).rejects.toThrow('Invalid email')
    })
  })

  describe('relationships', () => {
    it('loads posts relationship', async () => {
      const user = await User.factory().withPosts(3).create()
      await user.load('posts')

      expect(user.posts).toHaveLength(3)
    })
  })
})
```

### Test Coverage

```bash
# Run tests with coverage
bun test --coverage

# View coverage report
open coverage/index.html
```

We aim for:
- 80%+ code coverage
- 100% coverage on critical paths (auth, payments)

## Documentation

### Writing Documentation

Documentation lives in `docs/` and uses Markdown with BunPress.

```markdown
---
title: Page Title
description: Brief description for SEO
---

# Page Title

Introduction paragraph.

## Section

Content with code examples:

\`\`\`typescript
// Example code
const example = 'hello'
\`\`\`

## Another Section

More content...
```

### Documentation Guidelines

1. **Start with why** - Explain the purpose before the how
2. **Show, don't tell** - Use code examples
3. **Keep it current** - Update docs with code changes
4. **Be concise** - Respect readers' time
5. **Use consistent voice** - Second person ("you can...")

### Building Docs

```bash
# Development server
bun run docs:dev

# Build for production
bun run docs:build

# Preview build
bun run docs:serve
```

## Core Modules

### Creating a New Module

```bash
# Create module in storage/framework/core/
mkdir storage/framework/core/my-module
cd storage/framework/core/my-module

# Create package.json
cat > package.json << 'EOF'
{
  "name": "@stacksjs/my-module",
  "version": "0.0.1",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "bun build ./src/index.ts --outdir ./dist",
    "test": "bun test"
  }
}
EOF

# Create source file
mkdir src
cat > src/index.ts << 'EOF'
export function myFunction() {
  return 'hello'
}
EOF
```

### Module Guidelines

- Zero external dependencies (prefer Bun built-ins)
- Full TypeScript with strict mode
- Comprehensive tests
- Documentation in JSDoc
- Export types alongside implementation

## Issue Guidelines

### Reporting Bugs

Use the bug report template:

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Stacks version: x.x.x
- Bun version: x.x.x
- OS: macOS/Linux/Windows
- Node (if applicable): x.x.x

## Additional Context
Screenshots, logs, etc.
```

### Feature Requests

Use the feature request template:

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How might this work?

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Any other information
```

## Community

### Code of Conduct

We follow the [Contributor Covenant](https://www.contributor-covenant.org/). Be respectful, inclusive, and constructive.

### Getting Help

- **Discord**: [Join our Discord](https://discord.gg/stacksjs)
- **GitHub Discussions**: For questions and ideas
- **Stack Overflow**: Tag with `stacksjs`

### Recognition

Contributors are recognized in:
- Release notes
- Contributors page
- Special Discord role

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Workflow

1. Features merged to `main`
2. Changelog updated
3. Version bumped
4. Release tag created
5. Packages published to npm

## Quick Reference

### Common Commands

```bash
# Install dependencies
bun install

# Build everything
bun run build

# Run tests
bun test

# Lint code
bun run lint

# Type check
bun run typecheck

# Generate types
bun run types:generate

# Start dev server
bun run dev

# Build docs
bun run docs:build
```

### Useful Links

- [GitHub Repository](https://github.com/stacksjs/stacks)
- [Documentation](https://stacksjs.org)
- [Discord Community](https://discord.gg/stacksjs)
- [NPM Packages](https://www.npmjs.com/org/stacksjs)

## Thank You!

Every contribution matters, whether it's:
- Fixing a typo
- Reporting a bug
- Suggesting a feature
- Writing code
- Improving docs
- Helping others

We appreciate your time and effort in making Stacks.js better!
