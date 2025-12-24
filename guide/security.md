---
title: Security
description: CSRF protection, XSS prevention, rate limiting, encryption, and security headers in Stacks.js
---

# Security

Stacks.js provides comprehensive security features out of the box, including CSRF protection, XSS prevention, rate limiting, encryption, and secure headers. This guide covers security best practices and configuration.

## Configuration

### Security Configuration

```typescript
// config/security.ts
export default {
  // Application key for encryption
  key: process.env.APP_KEY,

  // CSRF protection
  csrf: {
    enabled: true,
    excludePaths: ['/api/webhooks/*'],
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-XSRF-TOKEN',
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    maxRequests: 60,
    windowMs: 60000, // 1 minute
    keyGenerator: (request) => request.ip,
  },

  // Content Security Policy
  csp: {
    enabled: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
    reportUri: '/csp-report',
  },

  // CORS
  cors: {
    enabled: true,
    origin: ['https://myapp.com', 'https://admin.myapp.com'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
    exposedHeaders: ['X-Request-Id'],
    credentials: true,
    maxAge: 86400,
  },

  // Security headers
  headers: {
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    xXssProtection: '1; mode=block',
    referrerPolicy: 'strict-origin-when-cross-origin',
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
    permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
  },

  // Encryption
  encryption: {
    cipher: 'aes-256-gcm',
  },

  // Hashing
  hashing: {
    driver: 'argon2id',
    options: {
      memory: 65536,
      timeCost: 4,
      parallelism: 1,
    },
  },
}
```

## CSRF Protection

### How CSRF Works

CSRF (Cross-Site Request Forgery) tokens prevent malicious sites from making requests on behalf of authenticated users.

```typescript
// CSRF middleware is applied automatically to web routes
// POST, PUT, PATCH, DELETE requests require valid token

// Get token in controllers
const token = request.csrfToken()

// Regenerate after login
request.regenerateCsrfToken()
```

### Using CSRF in Forms

```stx
<!-- Token is automatically added to forms -->
<form method="POST" action="/profile">
  @csrf

  <x-input name="name" :value="user.name" />
  <x-button type="submit">Update</x-button>
</form>

<!-- Manual token field -->
<form method="POST" action="/profile">
  <input type="hidden" name="_token" value="{{ csrfToken() }}" />
  <!-- ... -->
</form>
```

### CSRF with JavaScript

```typescript
// Token is available in meta tag
// <meta name="csrf-token" content="{{ csrfToken() }}">

// Axios automatically sends token
import axios from 'axios'

axios.defaults.headers.common['X-XSRF-TOKEN'] =
  document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')

// Fetch API
fetch('/api/profile', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-XSRF-TOKEN': getCsrfToken(),
  },
  body: JSON.stringify(data),
})
```

### Excluding Routes from CSRF

```typescript
// config/security.ts
export default {
  csrf: {
    excludePaths: [
      '/api/webhooks/stripe',
      '/api/webhooks/github',
      '/api/external/*',
    ],
  },
}

// Or in middleware
export class VerifyCsrfToken extends Middleware {
  except = [
    '/api/webhooks/*',
  ]
}
```

## XSS Prevention

### Output Encoding

```stx
<!-- Automatically escaped (safe) -->
<p>{{ userInput }}</p>
<!-- Output: &lt;script&gt;alert('xss')&lt;/script&gt; -->

<!-- Raw output (use with caution) -->
<div>{!! trustedHtml !!}</div>

<!-- Only use raw for sanitized content -->
<div>{!! sanitize(userContent) !!}</div>
```

### HTML Sanitization

```typescript
import { sanitize, sanitizeHtml } from '@stacksjs/security'

// Sanitize user input
const clean = sanitize(userInput)

// Sanitize HTML with allowed tags
const cleanHtml = sanitizeHtml(userHtml, {
  allowedTags: ['p', 'br', 'strong', 'em', 'a', 'ul', 'li'],
  allowedAttributes: {
    a: ['href', 'title'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
})

// Strip all HTML
const textOnly = stripTags(userInput)
```

### Content Security Policy

```typescript
// config/security.ts
export default {
  csp: {
    enabled: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://cdn.example.com'],
      styleSrc: ["'self'", "'unsafe-inline'"], // For inline styles
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://api.example.com'],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: true,
    },
  },
}
```

```typescript
// Add nonce for inline scripts
// Layout adds nonce automatically
<script nonce="{{ cspNonce() }}">
  // Inline script with nonce
</script>
```

## Rate Limiting

### Global Rate Limiting

```typescript
// config/security.ts
export default {
  rateLimit: {
    enabled: true,
    maxRequests: 60,
    windowMs: 60000, // 1 minute
  },
}
```

### Route-Specific Rate Limiting

```typescript
// routes/api.ts
import { RateLimiter } from '@stacksjs/security'

// Apply rate limit to routes
router.post('/api/login', [
  RateLimiter.perMinute(5), // 5 attempts per minute
], AuthController.login)

router.post('/api/forgot-password', [
  RateLimiter.perHour(3), // 3 attempts per hour
], AuthController.forgotPassword)

router.post('/api/messages', [
  RateLimiter.perMinute(30).by((request) => request.user.id),
], MessageController.store)
```

### Custom Rate Limiters

```typescript
import { RateLimiter } from '@stacksjs/security'

// Define custom limiter
RateLimiter.for('api', (request) => {
  // Different limits for authenticated users
  if (request.user) {
    return RateLimiter.perMinute(100).by(request.user.id)
  }

  return RateLimiter.perMinute(20).by(request.ip)
})

// Premium users get higher limits
RateLimiter.for('premium-api', (request) => {
  if (request.user?.isPremium) {
    return RateLimiter.perMinute(1000)
  }

  return RateLimiter.perMinute(60)
})

// Apply to routes
router.group({ middleware: 'throttle:api' }, () => {
  router.get('/api/data', DataController.index)
})
```

### Rate Limit Headers

```typescript
// Response includes rate limit headers
// X-RateLimit-Limit: 60
// X-RateLimit-Remaining: 59
// X-RateLimit-Reset: 1640000000
// Retry-After: 60 (when limited)
```

### Handling Rate Limit Exceeded

```typescript
// Custom response when rate limited
RateLimiter.for('api', (request) => {
  return RateLimiter.perMinute(60)
    .response((request, headers) => {
      return response({
        message: 'Too many requests. Please slow down.',
        retryAfter: headers['Retry-After'],
      }, 429)
    })
})
```

## Encryption

### Encrypting Data

```typescript
import { Crypt } from '@stacksjs/security'

// Encrypt string
const encrypted = Crypt.encrypt('sensitive data')
// eyJpdiI6Ik...

// Decrypt
const decrypted = Crypt.decrypt(encrypted)
// 'sensitive data'

// Encrypt objects
const encrypted = Crypt.encrypt({ userId: 1, token: 'abc' })
const decrypted = Crypt.decrypt(encrypted)
// { userId: 1, token: 'abc' }
```

### Encrypted Model Fields

```typescript
// app/Models/User.ts
export default class User extends Model {
  static fields = {
    email: { type: 'string' },
    ssn: { type: 'string', encrypted: true },
    api_key: { type: 'string', encrypted: true },
    settings: { type: 'json', encrypted: true },
  }
}

// Data is automatically encrypted/decrypted
const user = await User.create({
  email: 'user@example.com',
  ssn: '123-45-6789', // Stored encrypted
})

console.log(user.ssn) // '123-45-6789' (decrypted)
```

### Signed URLs

```typescript
import { URL } from '@stacksjs/security'

// Create signed URL
const signedUrl = URL.signedRoute('download', {
  file: 'report.pdf',
}, { expiresIn: '1h' })

// Verify signed URL (middleware)
router.get('/download/:file', [
  'signed', // Validates signature
], DownloadController.show)

// Manual verification
if (!URL.hasValidSignature(request)) {
  throw new InvalidSignatureException()
}
```

## Password Hashing

### Hashing Passwords

```typescript
import { Hash } from '@stacksjs/security'

// Hash password
const hashed = await Hash.make('password123')

// Verify password
const matches = await Hash.check('password123', hashed)

// Check if rehash needed (algorithm changed)
if (Hash.needsRehash(hashed)) {
  const newHash = await Hash.make('password123')
  await user.update({ password: newHash })
}
```

### Password Validation

```typescript
import { Password } from '@stacksjs/validation'

// Validation rules
{
  password: [
    'required',
    Password.min(8)
      .mixedCase()      // Uppercase and lowercase
      .numbers()        // At least one number
      .symbols()        // At least one symbol
      .uncompromised(), // Check against breached passwords
  ],
}
```

## Security Headers

### Default Headers

```typescript
// Automatically set by Stacks.js
// X-Frame-Options: DENY
// X-Content-Type-Options: nosniff
// X-XSS-Protection: 1; mode=block
// Referrer-Policy: strict-origin-when-cross-origin
// Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Custom Headers

```typescript
// config/security.ts
export default {
  headers: {
    // Prevent clickjacking
    xFrameOptions: 'SAMEORIGIN', // or 'DENY'

    // Prevent MIME sniffing
    xContentTypeOptions: 'nosniff',

    // XSS filter
    xXssProtection: '1; mode=block',

    // Referrer policy
    referrerPolicy: 'strict-origin-when-cross-origin',

    // HSTS
    strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',

    // Permissions policy
    permissionsPolicy: 'camera=(), microphone=(), geolocation=(self)',

    // Custom headers
    custom: {
      'X-Custom-Header': 'value',
    },
  },
}
```

## SQL Injection Prevention

### Parameterized Queries

```typescript
// ORM automatically uses parameterized queries
const users = await User.where('email', email).get() // Safe

// Query builder is safe
const results = await DB
  .table('users')
  .where('email', '=', email)
  .get()

// Raw queries with bindings
const results = await DB.raw(
  'SELECT * FROM users WHERE email = ?',
  [email]
)

// NEVER do this
// const results = await DB.raw(`SELECT * FROM users WHERE email = '${email}'`)
```

### Input Validation

```typescript
// Always validate input
const validated = await validate(request.all(), {
  email: 'required|email',
  age: 'required|integer|min:0|max:150',
  status: 'required|in:active,inactive',
})

// Use validated data
const users = await User.where('status', validated.status).get()
```

## CORS Configuration

### CORS Settings

```typescript
// config/security.ts
export default {
  cors: {
    enabled: true,

    // Allowed origins
    origin: [
      'https://myapp.com',
      'https://admin.myapp.com',
    ],

    // Or use function for dynamic origins
    origin: (origin, callback) => {
      const allowed = ['myapp.com', 'admin.myapp.com']
      if (allowed.some(domain => origin?.endsWith(domain))) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed'))
      }
    },

    // Allowed methods
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Allowed headers
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-XSRF-TOKEN',
    ],

    // Headers to expose to browser
    exposedHeaders: ['X-Request-Id', 'X-RateLimit-Remaining'],

    // Allow credentials (cookies)
    credentials: true,

    // Preflight cache duration
    maxAge: 86400, // 24 hours
  },
}
```

## Authentication Security

### Session Security

```typescript
// config/session.ts
export default {
  // Secure cookie settings
  cookie: {
    name: 'session',
    httpOnly: true,     // Not accessible via JavaScript
    secure: true,       // HTTPS only
    sameSite: 'lax',    // CSRF protection
    maxAge: 7200,       // 2 hours
  },

  // Session regeneration
  regenerateOnLogin: true,
  regenerateOnLogout: true,

  // Concurrent session limit
  maxSessions: 5,
}
```

### Two-Factor Authentication

```typescript
import { TwoFactor } from '@stacksjs/auth'

// Enable 2FA
const secret = await TwoFactor.generateSecret(user)
const qrCode = await TwoFactor.generateQrCode(user, secret)

// Verify 2FA code
const valid = await TwoFactor.verify(user, code)

// Recovery codes
const codes = await TwoFactor.generateRecoveryCodes(user)
```

### Login Throttling

```typescript
// Automatic login throttling
// After 5 failed attempts: 1 minute lockout
// After 10 failed attempts: 5 minute lockout
// After 15 failed attempts: 15 minute lockout

// config/auth.ts
export default {
  throttle: {
    maxAttempts: 5,
    decayMinutes: 1,
    lockoutMinutes: [1, 5, 15, 60],
  },
}
```

## File Upload Security

```typescript
// Validate file uploads
const validated = await validate(request.files, {
  avatar: 'required|image|max:2048|dimensions:min_width=100,min_height=100',
  document: 'required|mimes:pdf,doc,docx|max:10240',
})

// Store securely
const path = await Storage.disk('private').put(
  'documents',
  validated.document,
  {
    visibility: 'private',
    contentType: validated.document.type,
  }
)

// Serve with signed URL
const url = await Storage.disk('private').temporaryUrl(path, '1h')
```

## Security Auditing

### Audit Logging

```typescript
import { Audit } from '@stacksjs/security'

// Log security events
Audit.log('login', {
  user: user.id,
  ip: request.ip,
  userAgent: request.userAgent,
})

Audit.log('permission_change', {
  user: user.id,
  admin: admin.id,
  changes: { role: ['user', 'admin'] },
})

// Query audit logs
const logs = await Audit
  .where('action', 'login')
  .where('user_id', userId)
  .recent(30, 'days')
  .get()
```

### Security Notifications

```typescript
// Notify on suspicious activity
if (await isNewDevice(user, request)) {
  await user.notify(new NewDeviceLoginNotification(request))
}

if (await isNewLocation(user, request)) {
  await user.notify(new NewLocationLoginNotification(request))
}
```

## CLI Security Commands

```bash
# Generate application key
buddy key:generate

# Rotate encryption key
buddy key:rotate

# Check for security issues
buddy security:check

# Update security dependencies
buddy security:update

# Audit security configuration
buddy security:audit
```

## Best Practices

### Security Checklist

```typescript
// 1. Always validate input
const validated = await validate(request.all(), rules)

// 2. Use parameterized queries
await User.where('id', id).first() // Good
// await DB.raw(`SELECT * FROM users WHERE id = ${id}`) // Bad

// 3. Escape output
{{ userInput }} // Good - escaped
{!! userInput !!} // Bad - raw

// 4. Use HTTPS in production
// config/app.ts
export default {
  url: 'https://myapp.com',
  forceHttps: true,
}

// 5. Keep secrets out of code
process.env.API_KEY // Good
const API_KEY = 'abc123' // Bad

// 6. Use secure session settings
export default {
  cookie: { secure: true, httpOnly: true, sameSite: 'lax' },
}

// 7. Implement rate limiting
router.post('/api/login', [RateLimiter.perMinute(5)], ...)

// 8. Log security events
Audit.log('sensitive_action', { user: user.id })
```
