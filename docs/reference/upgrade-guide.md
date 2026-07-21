---
title: Upgrade Guide
description: How to upgrade between Stacks.js versions
---

# Upgrade Guide

This guide covers upgrading between Stacks.js versions, including breaking changes and migration steps.

## General Upgrade Process

### Step 1: Check Current Version

```bash
buddy --version
# or
bun pm ls @stacksjs/stacks
```

### Step 2: Review Release Notes

Before upgrading, review the [changelog](https://github.com/stacksjs/stacks/blob/main/CHANGELOG.md) for:
- Breaking changes
- Deprecation notices
- New features
- Bug fixes

### Step 3: Update Dependencies

Use the framework-aware upgrade path so generated files, migrations, and the declared toolchain are considered together:

```bash
buddy upgrade --help
buddy upgrade
```

### Step 4: Run Upgrade Command

```bash
# Run automated migrations and updates
buddy upgrade

# Check for issues
buddy doctor
```

### Step 5: Test Your Application

```bash
# Run tests
buddy test

# Type check
buddy test:types

# Build
buddy build
```

## Version-Specific Upgrades

### Upgrading to 1.0 (from 0.x)

When Stacks 1.0 is released, this section will contain specific migration instructions.

**Anticipated changes:**
- API stabilization
- Potential breaking changes from alpha/beta feedback
- New features and improvements

### Pre-1.0 Upgrades

During the pre-1.0 line, breaking changes may occur more frequently. Always:

1. Pin your version in `package.json`
2. Test thoroughly before deploying
3. Review all changelog entries between versions

## Common Breaking Changes

### Configuration Changes

When configuration structure changes:

```typescript
// Old structure (example)
export default {
  database: 'mysql',
  host: 'localhost',
}

// New structure (example)
export default {
  driver: 'mysql',
  connection: {
    host: 'localhost',
  },
}
```

**Migration:**
```bash
# The upgrade command typically handles this
buddy upgrade

# Or manually update config files
```

### API Changes

When method signatures change:

```typescript
// Old API
User.find(1, ['name', 'email'])

// New API
User.select('name', 'email').find(1)
```

**Migration:**
1. Search codebase for old patterns
2. Update to new syntax
3. Run tests to verify

### Import Path Changes

When package structure changes:

```typescript
// Old import
import { Router } from '@stacksjs/framework'

// New import
import { Router } from '@stacksjs/router'
```

**Migration:**
```bash
# Find and replace across project
grep -r "@stacksjs/framework" --include="*.ts" app/
```

### Database Migrations

When schema changes are required:

```bash
# Check migration status
buddy migrate:status

# Run pending migrations
buddy migrate

# If issues occur, check migration files
ls database/migrations/
```

## Automated Codemods

Stacks provides codemods for common migrations:

```bash
# List available codemods
buddy codemod --list

# Run specific codemod
buddy codemod update-imports-v1

# Dry run (show changes without applying)
buddy codemod update-imports-v1 --dry-run
```

## Handling Deprecations

### Deprecation Warnings

When running your app, you may see deprecation warnings:

```bash
[DEPRECATED] User.find() with array parameter is deprecated.
Use User.select().find() instead. Will be removed in v1.0.
```

**Actions:**
1. Note the version where removal occurs
2. Update code before that version
3. Test the new implementation

### Finding Deprecated Usage

```bash
# Search for deprecated patterns
buddy deprecations:check

# Output example:
# ┌─────────────────────────────────────────────────────────┐
# │ Deprecated Usage Found                                   │
# ├─────────────────────────────────────────────────────────┤
# │ File: app/Controllers/UserController.ts:25              │
# │ Pattern: User.find(id, fields)                          │
# │ Replace with: User.select(...fields).find(id)           │
# │ Removal: v1.0                                           │
# └─────────────────────────────────────────────────────────┘
```

## Rollback Procedures

### If Upgrade Fails

```bash
# Restore previous dependencies
git checkout bun.lockb
bun install

# Or restore specific package version
bun add @stacksjs/stacks@0.x.x
```

### Database Rollback

```bash
# Rollback last migration batch
buddy migrate:rollback

# Rollback specific number of batches
buddy migrate:rollback --step=3

# Rollback all migrations
buddy migrate:reset
```

### Git-based Rollback

```bash
# View recent commits
git log --oneline -10

# Revert to previous state
git revert HEAD

# Or hard reset (destructive)
git reset --hard HEAD~1
```

## Dependency Compatibility

### Bun Version

```bash
# Check Bun version
bun --version

# Install the version declared by the project toolchain
pantry install

# The audited source declares Bun ^1.3.0
buddy doctor
```

### TypeScript Version

```bash
# Run the project-owned typecheck path
buddy test:types
```

Do not add or upgrade TypeScript independently when the project receives it through the shared `better-dx` toolchain.

### Node.js Compatibility

While Stacks runs on Bun, some tools may require Node.js:

```bash
# For tools requiring Node.js
node --version  # Should be 18+ for compatibility
```

## Best Practices

### Before Upgrading

1. **Backup your database**
   ```bash
   buddy db:backup
   ```

2. **Commit current state**
   ```bash
   git add -A
   git commit -m "chore: pre-upgrade checkpoint"
   ```

3. **Create upgrade branch**
   ```bash
   git checkout -b upgrade/stacks-x.x
   ```

4. **Review breaking changes**
   - Read full changelog
   - Check GitHub issues for known problems

### During Upgrade

1. **Upgrade incrementally**
   - Don't skip major versions
   - Test after each upgrade

2. **Fix issues as they appear**
   - Address deprecation warnings
   - Update deprecated APIs

3. **Run full test suite**
   ```bash
   buddy test
   buddy typecheck
   buddy lint
   ```

### After Upgrading

1. **Verify in staging**
   - Deploy to staging environment
   - Run smoke tests

2. **Monitor production**
   - Watch error rates
   - Check performance metrics

3. **Document changes**
   - Note any custom migrations
   - Update team documentation

## Troubleshooting Upgrades

### Type Errors After Upgrade

```bash
# Regenerate types
buddy types:generate

# Clear TypeScript cache
rm -rf node_modules/.cache

# Restart TypeScript server in IDE
```

### Module Resolution Issues

```bash
# Clean install
rm -rf node_modules bun.lockb
bun install

# Verify lockfile
bun install --frozen-lockfile
```

### Configuration Validation Errors

```bash
# Validate configuration
buddy config:validate

# Show current configuration
buddy config:show
```

### Database Compatibility

```bash
# Check database version
buddy db:version

# Verify connection
buddy db:ping

# Run fresh migrations (development only)
buddy migrate:fresh
```

## Getting Help

If you encounter issues during upgrade:

1. **Search existing issues**: [GitHub Issues](https://github.com/stacksjs/stacks/issues)
2. **Check Discord**: Real-time community help
3. **Create detailed issue**: Include versions, error messages, and steps to reproduce
