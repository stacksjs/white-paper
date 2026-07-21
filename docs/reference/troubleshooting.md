---
title: Troubleshooting & FAQ
description: Common issues, solutions, and frequently asked questions
---

# Troubleshooting & FAQ

## Common Issues

### Installation Issues

#### Bun not found

```bash
# Error: bun: command not found
```

**Solution:** Install Bun globally:

```bash
curl -fsSL https://bun.sh/install | bash
# Then restart your terminal or run:
source ~/.bashrc  # or ~/.zshrc
```

#### Permission denied during installation

```bash
# Error: EACCES: permission denied
```

**Solution:** Don't use `sudo` with Bun. Fix npm permissions:

```bash
mkdir -p ~/.bun
chown -R $(whoami) ~/.bun
```

#### Stacks CLI not found after installation

```bash
# Error: buddy: command not found
```

**Solution:** Ensure Bun's bin directory is in your PATH:

```bash
export PATH="$HOME/.bun/bin:$PATH"
# Add to ~/.bashrc or ~/.zshrc for persistence
```

### Development Server Issues

#### Port already in use

```bash
# Error: Port 3000 is already in use
```

**Solution:** Either kill the process or use a different port:

```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
buddy dev --port 3001
```

#### Hot reload not working

**Possible causes and solutions:**

1. **File watcher limit reached (Linux):**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

2. **File saved outside project:**
Ensure you're editing files within the project directory.

3. **Ignored files:**
Check if the file is in `.gitignore` or `bunfig.toml` ignore patterns.

#### HTTPS certificate errors in development

```bash
# Error: NET::ERR_CERT_AUTHORITY_INVALID
```

**Solution:** Trust the development certificate:

```bash
buddy dev:cert --trust
# Or manually add to system trust store
```

### Database Issues

#### Connection refused

```bash
# Error: ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

1. **Ensure database is running:**
```bash
# With Pantry
pantry service start postgres

# Or check status
pantry service status postgres
```

2. **Verify connection settings in `.env`:**
```bash
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=myapp
DB_USERNAME=postgres
DB_PASSWORD=password
```

#### Migration failed

```bash
# Error: relation "users" already exists
```

**Solution:** Reset migrations (development only):

```bash
buddy migrate:fresh  # Drops all tables and re-runs migrations
# Or rollback and retry
buddy migrate:rollback
buddy migrate
```

#### SQLite database locked

```bash
# Error: SQLITE_BUSY: database is locked
```

**Solution:** Enable WAL mode in config:

```typescript
// config/database.ts
sqlite: {
  journal: 'wal',
  busyTimeout: 5000,
}
```

### Build Issues

#### TypeScript errors

```bash
# Error: Type 'X' is not assignable to type 'Y'
```

**Solutions:**

1. **Run type check for details:**
```bash
buddy typecheck
```

2. **Clear TypeScript cache:**
```bash
rm -rf node_modules/.cache
bun run build
```

3. **Regenerate types:**
```bash
buddy types:generate
```

#### Out of memory during build

```bash
# Error: JavaScript heap out of memory
```

**Solution:** Increase Node.js memory limit:

```bash
NODE_OPTIONS="--max-old-space-size=4096" buddy build
```

#### Module not found

```bash
# Error: Cannot find module '@/components/Button'
```

**Solutions:**

1. **Check path aliases in `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./app/*"]
    }
  }
}
```

2. **Reinstall dependencies:**
```bash
rm -rf node_modules bun.lockb
bun install
```

### Authentication Issues

#### Session not persisting

**Solutions:**

1. **Check session driver:**
```bash
# .env
SESSION_DRIVER=redis  # Ensure Redis is running
```

2. **Verify cookie settings:**
```typescript
// config/auth.ts
session: {
  secure: process.env.NODE_ENV === 'production', // false for http://localhost
  sameSite: 'lax',
}
```

#### CSRF token mismatch

```bash
# Error: CSRF token mismatch
```

**Solutions:**

1. **Include CSRF token in forms:**
```stx
<form method="POST">
  <x-csrf />
  <!-- form fields -->
</form>
```

2. **Include header in AJAX requests:**
```typescript
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN'),
  },
})
```

### Deployment Issues

#### Cloud deployment fails

**Common causes:**

1. **Missing environment variables:**
```bash
buddy cloud:check  # Validates deployment config
```

2. **Build errors:**
```bash
buddy build --production  # Test production build locally
```

3. **Insufficient permissions:**
```bash
# Verify AWS credentials
aws sts get-caller-identity
```

#### Application crashes in production

**Debugging steps:**

1. **Check logs:**
```bash
buddy logs:tail --env=production
```

2. **Verify environment:**
```bash
buddy cloud:ssh
cat .env  # Check production environment
```

3. **Health check:**
```bash
curl https://your-app.com/health
```

## Frequently Asked Questions

### General

**Q: What version of Bun is required?**

A: The audited Stacks source declares Bun `^1.3.0`, Git `^2.47.0`, and SQLite `^3.47.2`. Use the project-pinned toolchain rather than upgrading Bun independently. With Pantry-managed projects:

```bash
pantry install
buddy doctor
```

**Q: Can I use npm or yarn instead of Bun?**

A: No, Stacks is built specifically for Bun and uses Bun-specific features. While some packages may work with Node.js, the framework requires Bun.

**Q: Is Stacks production-ready?**

A: Stacks.js is pre-1.0 and capability-specific. Web/API, database, auth, queue, real-time, provider, cloud, and desktop paths do not share one maturity level. Pin the exact source/package versions, consult the white paper’s maturity matrix, and test the selected drivers and topology under your workload. No formal Stacks Protocol conformance report exists yet.

**Q: How do I update Stacks?**

A: Review the installed command help and upgrade guide before changing a 0.x version:

```bash
buddy upgrade --help
buddy doctor
buddy test
buddy test:types
```

### Architecture

**Q: Can I use React or Vue components?**

A: Stacks uses STX, a Blade-inspired templating engine. While you cannot directly use React/Vue components, STX provides similar component capabilities with a simpler mental model.

**Q: Does Stacks support GraphQL?**

A: GraphQL support is planned for a future release. Currently, Stacks focuses on REST APIs with full type safety.

**Q: Can I use Stacks for just the backend?**

A: Yes. Stacks can run an API without application STX views. Create a normal project with the current recommended command, then configure only the services your API needs:

```bash
panx @stacksjs/buddy new my-api
cd my-api
buddy dev api
```

**Q: How do I add a custom database driver?**

A: Implement the `DatabaseDriver` interface and register it:
```typescript
// drivers/CustomDriver.ts
export class CustomDriver implements DatabaseDriver {
  // Implementation
}

// config/database.ts
import { CustomDriver } from './drivers/CustomDriver'
connections: {
  custom: {
    driver: CustomDriver,
    // config
  }
}
```

### Performance

**Q: How does Stacks compare to Express/Fastify?**

A: There is no framework-wide multiplier that applies across workloads. Compare pinned production builds with equivalent routing, validation, serialization, database work, payloads, hardware, concurrency, and error accounting. Publish the load script and raw results; see the performance methodology page.

**Q: How do I enable caching?**

A:
```typescript
// Using cache helper
const users = await cache.remember('users:all', 3600, async () => {
  return await User.all()
})
```

**Q: Why is my development server slow?**

A: Common causes:
- Large node_modules (use Bun's faster resolution)
- Too many file watchers (increase limit)
- Sync operations blocking event loop (use async)

### Database

**Q: Which databases are supported?**

A: PostgreSQL, MySQL, SQLite, and DynamoDB. MongoDB support is planned.

**Q: How do I run raw SQL queries?**

A:
```typescript
const results = await DB.raw('SELECT * FROM users WHERE age > ?', [18])
```

**Q: Can I use multiple databases?**

A: Yes, define multiple connections and specify which to use:
```typescript
const user = await User.on('replica').find(1)
```

### Deployment

**Q: Where can I deploy Stacks apps?**

A:
- **Serverless:** AWS Lambda (via ts-cloud)
- **Containers:** Any Docker host, Kubernetes
- **VMs:** Any Linux server with Bun installed
- **Edge:** Cloudflare Workers (planned)

**Q: How do I set up CI/CD?**

A: Example GitHub Actions workflow:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test
      - run: bun run build
      - run: buddy deploy --env=production
```

**Q: How do I handle secrets in production?**

A: Use environment variables, never commit secrets:
```bash
# Set via ts-cloud
buddy cloud:secret set DATABASE_PASSWORD "your-password"

# Or use AWS Secrets Manager/Parameter Store
```

### Debugging

**Q: How do I debug Stacks applications?**

A:
1. **VS Code:** Use the Bun debugger extension
2. **CLI:** Use `buddy tinker` for REPL
3. **Logging:** Use Clarity for structured logs

**Q: How do I inspect database queries?**

A:
```typescript
// Enable query logging
// config/database.ts
export default {
  logging: {
    queries: true,
    slowQueryThreshold: 100, // ms
  }
}
```

**Q: How do I profile performance?**

A:
```bash
# Built-in profiler
buddy profile --duration=60

# Or use Bun's built-in profiler
bun --inspect run start
```

## Error Reference

### Common Error Codes

| Code | Message | Solution |
|------|---------|----------|
| `E_VALIDATION` | Validation failed | Check request data against validation rules |
| `E_AUTH` | Authentication required | Ensure user is logged in |
| `E_FORBIDDEN` | Access denied | Check user permissions |
| `E_NOT_FOUND` | Resource not found | Verify resource exists |
| `E_RATE_LIMIT` | Too many requests | Wait and retry, or increase limits |
| `E_DATABASE` | Database error | Check connection and query |
| `E_CONFIG` | Configuration error | Verify config files |

### Stack Trace Reading

When you see an error like:

```
Error: Cannot find user
    at UserController.show (/app/Controllers/UserController.ts:25:11)
    at Router.handle (/node_modules/@stacksjs/router/src/index.ts:142:20)
    at processRequest (/node_modules/@stacksjs/server/src/index.ts:89:15)
```

1. **First line:** The error message
2. **Second line:** Where the error originated in YOUR code
3. **Following lines:** Framework internals (usually less relevant)

Focus on the first file path in your application code (not in `node_modules`).

## Getting Help

If you can't find a solution:

1. **Search existing issues:** [GitHub Issues](https://github.com/stacksjs/stacks/issues)
2. **Ask on Discord:** Real-time community help
3. **Create an issue:** Include reproduction steps, error messages, and environment info
