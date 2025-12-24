---
title: Testing & Quality
description: Testing and code quality tools in Stacks.js
---

# Testing & Quality

## Testing Framework

Stacks uses Bun's test runner with additional utilities:

```typescript
// tests/unit/CreatePostAction.test.ts
import { test, expect, describe, beforeEach } from 'bun:test'
import { createTestContext } from '@stacksjs/testing'
import CreatePostAction from '@/Actions/CreatePostAction'

describe('CreatePostAction', () => {
  let context: TestContext

  beforeEach(async () => {
    context = await createTestContext()
    await context.migrate()
  })

  test('creates a post with valid data', async () => {
    const user = await context.factory.user.create()

    const result = await context.actingAs(user).handle(CreatePostAction, {
      title: 'Test Post',
      content: 'This is test content',
    })

    expect(result.title).toBe('Test Post')
    expect(result.author_id).toBe(user.id)
  })

  test('fails without authentication', async () => {
    await expect(
      context.handle(CreatePostAction, { title: 'Test' })
    ).rejects.toThrow('Unauthorized')
  })

  test('validates required fields', async () => {
    const user = await context.factory.user.create()

    await expect(
      context.actingAs(user).handle(CreatePostAction, {})
    ).rejects.toThrow('title is required')
  })
})
```

## Feature Tests (E2E)

```typescript
// tests/feature/posts.test.ts
import { test, expect } from '@playwright/test'

test('user can create a post', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')

  await page.goto('/posts/create')
  await page.fill('[name="title"]', 'My New Post')
  await page.fill('[name="content"]', 'Post content here')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL(/\/posts\/\d+/)
  await expect(page.locator('h1')).toContainText('My New Post')
})
```

## Linting & Code Quality

Stacks includes preconfigured code quality tools:

```bash
# Run all linters
buddy lint

# Auto-fix issues
buddy lint:fix

# Type checking
buddy typecheck

# Format code
buddy format
```

### Configuration

```typescript
// config/lint.ts
export default {
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
  },

  ignore: [
    'storage/framework/**',
    'node_modules/**',
  ],
}
```

## CI/CD Integration

GitHub Actions workflow (auto-generated):

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - run: bun install
      - run: bun run lint
      - run: bun run typecheck
      - run: bun run test
      - run: bun run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1

      - run: bun install
      - run: bun run deploy:prod
```
