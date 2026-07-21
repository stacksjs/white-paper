---
title: Authentication & Security
description: Securing your Stacks.js application
---

# Authentication & Security

Stacks authentication is passwordless-first (WebAuthn/passkeys with TOTP MFA) while also shipping session, JWT, and OAuth — covering the full range of authentication flows from a single contract.

> **Protocol context** — This guide covers the Stacks.js implementation of the draft [Authentication and authorization contract](https://github.com/stacksjs/white-paper#46-authentication-and-authorization). Mechanisms and APIs are implementation-specific; no formal conformance report exists yet.

## ts-auth Integration

Stacks authentication is powered by `ts-auth`, a comprehensive, passwordless-first authentication library. It leads with WebAuthn (passkeys) and TOTP-based multi-factor authentication, and also ships session-based authentication, JWT tokens (with access + refresh and a revocation blacklist), and OAuth providers (11 built-in). Per-account login rate limiting and a 50+ event audit log are included.

```typescript
// config/auth.ts
export default {
  defaults: {
    guard: 'web',
  },

  guards: {
    web: {
      driver: 'session',
      provider: 'users',
    },
    api: {
      driver: 'jwt',
      provider: 'users',
    },
  },

  providers: {
    users: {
      driver: 'database',
      table: 'users',
    },
  },

  tokens: {
    expiry: '1h',
    refresh: true,
    refreshExpiry: '7d',
    algorithm: 'HS256',
  },

  session: {
    driver: 'file', // 'file' | 'cookie' | 'database' | 'redis' | 'memory'
    lifetime: 120,
    cookie: 'session',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
  },

  webauthn: {
    rpName: 'My Application',
    rpID: 'example.com',
  },

  totp: {
    issuer: 'My Application',
  },
}
```

## Guards & Providers Pattern

ts-auth implements Laravel's guards and providers pattern for flexible authentication:

```typescript
import { createAuthManager, createSession } from '@stacksjs/auth'

// Create auth manager
const auth = createAuthManager(config)

// Set up session (for session-based auth)
const session = createSession(config.session)
auth.setSession(session)

// Use the default guard
const user = await auth.guard().user()

// Use a specific guard
const apiUser = await auth.guard('api').user()

// Attempt authentication
const success = await auth.guard('web').attempt({
  email: 'user@example.com',
  password: 'secret',
})

// Check authentication status
if (await auth.guard().check()) {
  // User is authenticated
}
```

## Session-Based Authentication

Traditional session authentication with CSRF protection:

```typescript
import { createAuthManager, createSession, sessionMiddleware, csrfMiddleware } from '@stacksjs/auth'

// Middleware setup for Bun.serve
const handleSession = sessionMiddleware({
  config: {
    driver: 'file',
    lifetime: 120,
    cookie: 'session',
    secure: true,
  },
})

// Apply CSRF protection
const handleCsrf = csrfMiddleware({
  except: ['/api/webhooks/*'], // Paths to exclude
})

// Login endpoint
async function login(request: Request) {
  const { email, password } = await request.json()

  const success = await auth.guard('web').attempt({ email, password })

  if (success) {
    const user = await auth.guard('web').user()
    return Response.json({ user })
  }

  return Response.json({ error: 'Invalid credentials' }, { status: 401 })
}

// Logout endpoint
async function logout(request: Request) {
  await auth.guard('web').logout()
  return Response.json({ success: true })
}

// Protected route
async function dashboard(request: Request) {
  if (await auth.guard('web').guest()) {
    return Response.redirect('/login')
  }

  const user = await auth.guard('web').user()
  return Response.json({ user })
}
```

## JWT Authentication

Stateless token-based authentication for APIs:

```typescript
import { createAuthManager, createTokenManager, JwtGuard } from '@stacksjs/auth'

// Configure token manager
const tokenManager = createTokenManager('your-secret-key', {
  expiry: '1h',
  refresh: true,
  refreshExpiry: '7d',
  algorithm: 'HS256',
  issuer: 'my-app',
})

auth.setTokenManager(tokenManager)

// Issue tokens after login
async function login(request: Request) {
  const { email, password } = await request.json()
  const jwtGuard = auth.guard('api') as JwtGuard

  const tokens = await jwtGuard.attemptAndIssue({ email, password })

  if (tokens) {
    return Response.json({
      access_token: tokens.accessToken,
      token_type: tokens.tokenType,
      expires_in: tokens.expiresIn,
      refresh_token: tokens.refreshToken,
    })
  }

  return Response.json({ error: 'Invalid credentials' }, { status: 401 })
}

// Refresh tokens
async function refresh(request: Request) {
  const { refresh_token } = await request.json()
  const jwtGuard = auth.guard('api') as JwtGuard

  const tokens = await jwtGuard.refreshTokens(refresh_token)

  return Response.json({
    access_token: tokens.accessToken,
    expires_in: tokens.expiresIn,
    refresh_token: tokens.refreshToken,
  })
}

// Protected API endpoint
async function protectedEndpoint(request: Request) {
  const jwtGuard = auth.guard('api') as JwtGuard
  jwtGuard.setRequest(request) // Extract token from Authorization header

  if (await jwtGuard.guest()) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await jwtGuard.user()
  const payload = jwtGuard.getPayload()

  return Response.json({ user, claims: payload })
}
```

### JWT Features

- **Multiple Algorithms**: HS256, HS384, HS512, RS256, RS384, RS512, ES256, ES384, ES512
- **Automatic Refresh**: Built-in refresh token support
- **Custom Claims**: Add any claims to your tokens
- **Clock Tolerance**: Handle server time differences

```typescript
// Sign with custom claims
const tokens = await jwtGuard.issueTokens(user, {
  role: 'admin',
  permissions: ['read', 'write'],
})

// Access claims in protected routes
const role = jwtGuard.getClaim<string>('role')
const permissions = jwtGuard.getClaim<string[]>('permissions')
```

## Personal Access Tokens (Sanctum-style)

API tokens with granular abilities:

```typescript
import { TokenGuard } from '@stacksjs/auth'

const tokenGuard = auth.guard('api') as TokenGuard

// Create a token for a user
const { token, plainTextToken } = await tokenGuard.createToken(
  user,
  'api-token',
  ['read', 'write'], // Abilities
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
)

// Return token to user (only shown once)
return Response.json({ token: plainTextToken })

// Check abilities in protected routes
if (await tokenGuard.tokenCan('write')) {
  // Allow write operations
}

if (await tokenGuard.tokenCannot('admin')) {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}

// Revoke tokens
tokenGuard.revokeToken(tokenId)
tokenGuard.revokeAllTokens(userId)
```

## OAuth Authentication

Built-in support for 11 OAuth providers:

| Provider | Status | Features |
|----------|--------|----------|
| **Google** | Full | OpenID Connect, profile, email |
| **GitHub** | Full | Profile, email, organizations |
| **Facebook** | Full | Profile, email, friends |
| **Twitter/X** | Full | OAuth 2.0 with PKCE |
| **LinkedIn** | Full | OpenID Connect |
| **Apple** | Full | Sign in with Apple |
| **Microsoft** | Full | Azure AD / personal accounts |
| **Discord** | Full | Profile, email, guilds |
| **Slack** | Full | Profile, team info |
| **GitLab** | Full | Self-hosted support |
| **Bitbucket** | Full | Profile, email |

```typescript
import {
  createOAuthManager,
  createGoogleProvider,
  createGitHubProvider,
} from '@stacksjs/auth'

// Create OAuth manager
const oauth = createOAuthManager()

// Register providers
oauth.register('google', createGoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: 'https://myapp.com/auth/google/callback',
  scopes: ['openid', 'email', 'profile'],
}))

oauth.register('github', createGitHubProvider({
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  redirectUri: 'https://myapp.com/auth/github/callback',
}))

// Redirect to provider
async function redirectToGoogle(request: Request) {
  const url = oauth.driver('google').getAuthorizationUrl()
  return Response.redirect(url)
}

// Handle callback
async function handleGoogleCallback(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  // Verify state parameter
  if (!oauth.driver('google').verifyState(state)) {
    return Response.json({ error: 'Invalid state' }, { status: 400 })
  }

  // Exchange code for tokens
  const tokens = await oauth.driver('google').getAccessToken(code)

  // Get user info
  const oauthUser = await oauth.driver('google').getUser(tokens.accessToken)

  // Find or create user in your database
  let user = await User.findByEmail(oauthUser.email)

  if (!user) {
    user = await User.create({
      email: oauthUser.email,
      name: oauthUser.name,
      avatar: oauthUser.avatar,
      provider: 'google',
      providerId: oauthUser.id,
    })
  }

  // Log the user in
  await auth.guard('web').login(user)

  return Response.redirect('/dashboard')
}
```

## WebAuthn & Passkeys

Passwordless authentication using platform authenticators:

```typescript
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  startRegistration,
  browserSupportsWebAuthn,
} from '@stacksjs/auth'

// Server: Generate registration options
const registrationOptions = generateRegistrationOptions({
  rpName: 'My App',
  rpID: 'example.com',
  userID: user.id,
  userName: user.email,
  attestationType: 'none',
  authenticatorSelection: {
    userVerification: 'preferred',
    residentKey: 'preferred',
  },
})

// Client: Create credential
if (browserSupportsWebAuthn()) {
  const credential = await startRegistration(registrationOptions)
  // Send credential to server for verification
}

// Server: Verify registration
const verification = await verifyRegistrationResponse(
  credential,
  expectedChallenge,
  expectedOrigin,
  expectedRPID
)

if (verification.verified) {
  // Store credential: verification.registrationInfo.credential
}
```

## TOTP Multi-Factor Authentication

Time-based One-Time Passwords for second-factor authentication:

```typescript
import { generateTOTPSecret, generateTOTP, verifyTOTP, totpKeyUri, generateQRCodeDataURL } from '@stacksjs/auth'

// Generate secret for user
const secret = generateTOTPSecret()

// Generate QR code URI for authenticator apps
const uri = totpKeyUri(user.email, 'My App', secret)
const qrCode = await generateQRCodeDataURL(uri)

// Verify user-provided code
const isValid = verifyTOTP(userCode, { secret, window: 1 })

if (isValid) {
  // Enable 2FA for user
  await user.update({ totpSecret: secret, totpEnabled: true })
}
```

## Browser Support Detection

```typescript
import {
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
  platformAuthenticatorIsAvailable
} from '@stacksjs/auth'

// Check WebAuthn availability
const hasWebAuthn = browserSupportsWebAuthn()

// Check for conditional UI (autofill integration)
const hasAutofill = await browserSupportsWebAuthnAutofill()

// Check for built-in authenticator (Face ID, Touch ID, Windows Hello)
const hasPlatformAuth = await platformAuthenticatorIsAvailable()
```

## Security Features

Stacks includes comprehensive security features:

### CSRF Protection

```html
<!-- Automatic for all state-changing requests -->
<form method="POST">
  <x-csrf />
  ...
</form>
```

### Rate Limiting

```typescript
// config/security.ts
export default {
  rateLimit: {
    api: {
      maxRequests: 60,
      windowMs: 60_000, // 1 minute
    },
    auth: {
      maxRequests: 5,
      windowMs: 300_000, // 5 minutes
    },
  },
}
```

### Security Headers

```typescript
export default {
  headers: {
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
    xss: true,
    noSniff: true,
    frameOptions: 'DENY',
  },
}
```

### Encryption

```typescript
import { encrypt, decrypt, hash, verify } from '@stacksjs/security'

// Encryption
const encrypted = await encrypt(sensitiveData)
const decrypted = await decrypt(encrypted)

// Hashing (for passwords)
const hashed = await hash(password)
const valid = await verify(password, hashed)
```

## ts-security Suite

Stacks integrates `ts-security` for comprehensive cryptography tooling:

### Key Management

```typescript
import { generateKeyPair, deriveKey, exportKey } from 'ts-security'

// Generate asymmetric key pair
const { publicKey, privateKey } = await generateKeyPair('rsa', {
  modulusLength: 4096,
  hashAlgorithm: 'sha-256',
})

// Derive key from password (PBKDF2)
const key = await deriveKey(password, salt, {
  iterations: 100000,
  algorithm: 'sha-512',
  keyLength: 256,
})

// Export keys in various formats
const pem = await exportKey(publicKey, 'pem')
const jwk = await exportKey(publicKey, 'jwk')
```

### Digital Signatures

```typescript
import { sign, verify } from 'ts-security'

// Sign data
const signature = await sign(data, privateKey, {
  algorithm: 'RSA-PSS',
  hash: 'sha-256',
})

// Verify signature
const isValid = await verify(data, signature, publicKey)
```

### Symmetric Encryption

```typescript
import { aesEncrypt, aesDecrypt, generateIV } from 'ts-security'

// AES-256-GCM encryption
const iv = generateIV()
const encrypted = await aesEncrypt(plaintext, key, iv, {
  algorithm: 'AES-GCM',
  tagLength: 128,
})

const decrypted = await aesDecrypt(encrypted, key, iv)
```

## TLS & Certificate Management (tlsx)

`tlsx` provides zero-dependency TLS automation for secure connections:

### Auto-Generated Certificates

```typescript
import { generateCertificate, TLSConfig } from 'tlsx'

// Generate development certificates
const cert = await generateCertificate({
  domains: ['localhost', '*.localhost'],
  ips: ['127.0.0.1', '::1'],
  validityDays: 365,
  keyType: 'ec', // or 'rsa'
  curve: 'P-256',
})

// Certificate includes
console.log(cert.certificate) // PEM-encoded certificate
console.log(cert.privateKey)  // PEM-encoded private key
console.log(cert.fingerprint) // SHA-256 fingerprint
```

### System Trust Integration

```typescript
import { addToTrustStore, removeFromTrustStore } from 'tlsx'

// Add certificate to system trust store
await addToTrustStore(cert, {
  platform: 'auto', // Detects macOS, Linux, Windows
  sudo: true,       // Request elevated privileges if needed
})

// Remove when no longer needed
await removeFromTrustStore(cert)
```

### HTTPS Server Setup

```typescript
import { createSecureServer } from 'tlsx'

// Auto-configured HTTPS server
const server = await createSecureServer({
  hostname: 'my-app.localhost',
  port: 443,
  handler: (req) => new Response('Secure!'),
})

// Or with Bun.serve
import { loadCertificates } from 'tlsx'

const tls = await loadCertificates('my-app.localhost')
Bun.serve({
  port: 443,
  tls,
  fetch(req) {
    return new Response('Secure!')
  },
})
```

### ACME / Let's Encrypt

```typescript
import { AcmeClient } from 'tlsx'

// Production certificate issuance
const acme = new AcmeClient({
  directoryUrl: 'https://acme-v02.api.letsencrypt.org/directory',
  accountKey: privateKey,
})

const order = await acme.createOrder({
  domains: ['example.com', 'www.example.com'],
})

// Complete challenge (HTTP-01 or DNS-01)
await acme.completeChallenge(order)

// Get signed certificate
const certificate = await acme.finalizeCertificate(order)
```

## Advanced Rate Limiting

`ts-rate-limiter` provides enterprise-grade rate limiting:

### Multi-Algorithm Support

```typescript
import { RateLimiter } from 'ts-rate-limiter'

// Fixed window (simple, memory efficient)
const fixedLimiter = new RateLimiter({
  algorithm: 'fixed-window',
  max: 100,
  window: 60000, // 1 minute
})

// Sliding window (smoother distribution)
const slidingLimiter = new RateLimiter({
  algorithm: 'sliding-window',
  max: 100,
  window: 60000,
})

// Token bucket (burst-friendly)
const tokenLimiter = new RateLimiter({
  algorithm: 'token-bucket',
  capacity: 100,
  refillRate: 10, // 10 tokens per second
})

// Leaky bucket (consistent rate)
const leakyLimiter = new RateLimiter({
  algorithm: 'leaky-bucket',
  capacity: 100,
  leakRate: 10, // 10 requests per second
})
```

### Distributed Rate Limiting

```typescript
import { DistributedRateLimiter } from 'ts-rate-limiter'

const limiter = new DistributedRateLimiter({
  driver: 'redis',
  redis: {
    host: 'localhost',
    port: 6379,
  },
  max: 1000,
  window: 60000,
  keyPrefix: 'ratelimit:',
})

// Works across multiple server instances
const result = await limiter.consume('user:123')
if (result.blocked) {
  return new Response('Too Many Requests', {
    status: 429,
    headers: {
      'Retry-After': String(result.retryAfter),
      'X-RateLimit-Limit': String(result.limit),
      'X-RateLimit-Remaining': String(result.remaining),
      'X-RateLimit-Reset': String(result.reset),
    },
  })
}
```

### Tiered Rate Limiting

```typescript
const limiter = new RateLimiter({
  tiers: {
    anonymous: { max: 10, window: 60000 },
    free: { max: 100, window: 60000 },
    pro: { max: 1000, window: 60000 },
    enterprise: { max: 10000, window: 60000 },
  },
})

// Apply based on user tier
const tier = user?.subscription ?? 'anonymous'
const result = await limiter.consume(`user:${userId}`, { tier })
```

### Route-Specific Limits

```typescript
// Middleware configuration
export const rateLimits = {
  // Strict limits for auth endpoints
  'POST /api/login': { max: 5, window: 300000 },
  'POST /api/register': { max: 3, window: 3600000 },
  'POST /api/forgot-password': { max: 3, window: 3600000 },

  // Standard API limits
  'GET /api/*': { max: 100, window: 60000 },
  'POST /api/*': { max: 50, window: 60000 },

  // Expensive operations
  'POST /api/export': { max: 5, window: 3600000 },
  'POST /api/import': { max: 10, window: 3600000 },
}
```

## Input Validation (ts-validation)

Type-safe request validation:

```typescript
import { validate, schema } from 'ts-validation'

const userSchema = schema({
  name: 'string|required|min:2|max:100',
  email: 'email|required|unique:users',
  password: 'string|required|min:8|confirmed',
  age: 'number|optional|min:13|max:120',
  role: 'enum:user,admin,moderator',
})

// Validate request
const result = await validate(request.body, userSchema)

if (result.failed) {
  return Response.json({ errors: result.errors }, { status: 422 })
}

// result.data is fully typed
const user = await User.create(result.data)
```

## Security Best Practices

Stacks enforces security best practices by default:

```typescript
// config/security.ts
export default {
  // Automatic HTTPS in development
  https: {
    enabled: true,
    autoGenerate: true,
  },

  // Content Security Policy
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'strict-dynamic'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'wss:', 'https:'],
    frameAncestors: ["'none'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: true,
  },

  // CORS configuration
  cors: {
    origin: ['https://app.example.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    maxAge: 86400,
  },

  // Cookie security
  cookies: {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    encrypt: true,
  },

  // Request body limits
  body: {
    maxSize: '10mb',
    jsonLimit: '1mb',
    formLimit: '10mb',
  },
}
```
