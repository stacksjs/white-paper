---
title: Security
description: Source-audited Stacks.js security controls, limitations, and verification guidance.
---

# Security

> **Protocol context** — This guide covers Stacks.js security surfaces in relation to the draft [Security baseline](https://github.com/stacksjs/white-paper#56-security-baseline). Framework features do not replace a deployment-specific threat model, application review, or independent security testing.

The audited source includes meaningful controls for requests, authentication, hashing, application encryption, errors, and deployment diagnostics. Their effectiveness depends on configuration and topology.

## Maturity summary

| Area | Snapshot status | Boundary |
|---|---|---|
| Parameterized queries | Implemented default path | Raw SQL still requires review. |
| CSRF | Implemented in router lifecycle | Verify browser/session topology and exemptions. |
| Security headers | Implemented/configurable | CSP and proxy/TLS behavior require deployment checks. |
| Auth tokens and revocation | Implemented | Test expiry, refresh rotation, stores, and multi-process behavior. |
| Password hashing | Implemented | bcrypt default; Argon2 configurable. |
| Application encryption | Implemented | AES-GCM with versioned format and legacy fallback. |
| Environment-file encryption | Experimental | Version 2 uses X25519, HKDF-SHA-256, and AES-256-GCM; RFC ratification and independent review remain open. |
| Production error redaction | Implemented | Verify custom middleware/providers do not reintroduce secrets. |
| Rate limiting | Implemented in several paths | Store scope and multi-instance behavior must be checked. |
| Audit/security events | Implemented surface | Persistence and alert routing are application/provider concerns. |

## Threat model first

Identify:

- trusted proxies and networks;
- public, authenticated, administrative, and webhook endpoints;
- browser, API token, and background-worker identities;
- tenant boundaries;
- sensitive fields and regulated data;
- external providers and data egress;
- secrets and key custody;
- process-local versus shared state;
- restore, rotation, revocation, and incident paths.

Security defaults cannot compensate for an undefined trust boundary.

## Password hashing

`@stacksjs/security` exposes password-hashing helpers and algorithm detection:

```typescript
import {
  check,
  detectAlgorithm,
  info,
  make,
  needsRehash,
} from '@stacksjs/security'

const digest = await make('correct horse battery staple')
const valid = await check('correct horse battery staple', digest)

if (valid && needsRehash(digest, { rounds: 14 })) {
  const replacement = await make('correct horse battery staple', { rounds: 14 })
  // Persist replacement after successful authentication.
}

console.log(detectAlgorithm(digest), info(digest))
```

The supplied hashing configuration defaults to bcrypt with 12 rounds and includes Argon2 options. Benchmark the selected parameters on production-like hardware and set an authentication latency budget. Do not use MD5/base64 compatibility helpers for password storage.

## Application encryption

```typescript
import { decrypt, encrypt } from '@stacksjs/security'

const ciphertext = await encrypt('sensitive value')
const plaintext = await decrypt(ciphertext)
```

The audited implementation:

- derives an AES-256-GCM key from `APP_KEY` or an explicit passphrase;
- uses a fresh salt and IV;
- emits a versioned ciphertext format;
- uses PBKDF2-SHA-256 for new ciphertexts;
- retains fallback decryption for earlier formats.

Operational requirements remain:

- keep `APP_KEY` outside source control and client bundles;
- back up keys separately from ciphertext;
- define key rotation and re-encryption;
- distinguish application encryption from database/storage encryption;
- avoid exposing decrypted values in logs and errors.

## Environment-file encryption

Stacks includes commands such as:

```bash
buddy env:keypair
buddy env:set SECRET_NAME value
buddy env:encrypt
buddy env:decrypt
buddy env:rotate
```

New writes use `encrypted:v2:<base64url>` with a recipient X25519 key, fresh
ephemeral X25519 key, 16-byte HKDF salt, 12-byte AES-GCM nonce, and authenticated
envelope metadata. Wrong keys, modified components, malformed input, and unknown
versions produce one non-secret failure. New encryption rejects legacy public
keys; the old unversioned reader exists only so `buddy env:rotate` can decrypt in
memory and re-encrypt to version 2 without writing plaintext to disk.

> **Security warning:** this corrects the audited simplified construction, but it
> is still experimental. [RFC 0005](https://github.com/stacksjs/rfcs/issues/6)
> and [independent review #2061](https://github.com/stacksjs/stacks/issues/2061)
> are open. The envelope does not protect a compromised encryption host, CI job,
> runtime, deployment host, or recipient private key, and it is not a substitute
> for access control, audit, revocation, or incident response.

Prefer a deployment secret store with restricted access, audit logs, rotation,
and incident controls. If the envelope is used, keep `.env.keys` uncommitted,
separate pairs by environment, retain the prior ciphertext/key generation during
canary validation, revoke old CI/deployment secrets after success, and restore
ciphertext plus its matching key together during rollback.

## Request lifecycle controls

The router path includes:

- request IDs;
- middleware short-circuiting;
- body parsing and validation;
- CSRF checks for applicable state-changing routes;
- Action authorization before `handle()`;
- response/error sanitization;
- security/CORS header handling.

Test the observable outcomes rather than assuming a middleware is active:

| Test | Expected result |
|---|---|
| Browser-authenticated write without CSRF token | Rejected before Action |
| Invalid Action input | `422` field errors; Action not executed |
| Unauthenticated protected route | `401` |
| Authenticated but unauthorized Action | `403` |
| Missing resource | `404` stable envelope |
| Production internal error | No stack, raw query, path, or secret |
| Request with/without `X-Request-ID` | One correlation ID returned and logged |

Route-level CSRF opt-outs exist for legitimate non-browser/webhook cases. Each exemption should be narrow and paired with an alternative authenticator such as a timing-safe webhook signature.

## Authentication and authorization

The auth package contains:

- bearer access tokens and refresh tokens;
- rotation, expiry, and revocation;
- token abilities/scopes;
- gates and policies;
- RBAC with a configurable store;
- password reset and email verification;
- TOTP/two-factor helpers;
- passkey/WebAuthn helpers;
- session authentication.

Important boundaries:

- session behavior includes in-memory state and must be evaluated for multi-process deployment;
- RBAC requires the intended store and cache invalidation after direct database changes;
- rate-limit stores may be process-local unless configured otherwise;
- default wildcard token abilities should be narrowed for least privilege;
- recovery and revocation are as important as successful login.

## Queries and injection

Use Model/query-builder parameter binding for untrusted values. The source guards raw-query paths and prefers tagged/parameterized construction, but application code can still create vulnerabilities by:

- concatenating SQL outside the guarded API;
- interpolating identifiers without allowlists;
- passing user-controlled sort/column names;
- executing provider-specific raw clients;
- logging sensitive parameters.

Add injection fixtures for filters, sorting, search, and administrative query tools.

## XSS and content security

STX should escape ordinary expressions by default. Any raw-HTML path must accept only trusted or rigorously sanitized content.

Verify:

- text, attribute, URL, style, and script contexts separately;
- Markdown/HTML sanitizer configuration;
- CSP without unnecessary `unsafe-inline`/`unsafe-eval`;
- upload content types and download disposition;
- user-controlled redirect and external-link targets;
- serialization inside inline scripts.

## Headers, CORS, proxies, and TLS

Security headers are only as effective as the final response leaving the edge. Test through the production load balancer/CDN:

```text
Strict-Transport-Security
Content-Security-Policy
X-Content-Type-Options
X-Frame-Options or CSP frame-ancestors
Referrer-Policy
Permissions-Policy where applicable
```

Restrict CORS origins, methods, and credentials. Configure trusted proxies before using client IPs for authorization, auditing, or rate limiting.

## Webhooks

For every webhook provider:

- preserve the raw body required by signature verification;
- use timing-safe comparison;
- enforce timestamp/replay tolerance;
- deduplicate event IDs;
- return quickly and queue idempotent processing;
- store enough audit metadata without storing secrets;
- test invalid, replayed, duplicate, and out-of-order events.

## Production error handling

The router error path distinguishes development and production behavior and redacts common secret fields. Verify custom loggers, exception reporters, mail/SMS providers, and AI tools separately. A secret can leak before the framework error handler sees it.

## Release security checklist

- [ ] Pinned Stacks/Bun/provider versions
- [ ] Threat model reviewed
- [ ] Tests for validation, CSRF, authn, authz, and rate limits
- [ ] Production error-redaction snapshots
- [ ] Least-privilege tokens and cloud credentials
- [ ] Secret-store rotation/revocation exercise
- [ ] Dependency and source review
- [ ] Database backup/restore rehearsal
- [ ] Webhook replay/idempotency tests
- [ ] CORS/CSP/TLS/proxy tests at the edge
- [ ] Queue retry and duplicate-processing tests
- [ ] Logs inspected for personal data and credentials
- [ ] Incident owner, alerts, and rollback documented

- [Security source at the audited revision](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/security/src)
- [Auth source at the audited revision](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/auth/src)
- [Environment encryption source](https://github.com/stacksjs/stacks/blob/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/env/src/crypto.ts)
- [Environment encryption threat model](https://github.com/stacksjs/stacks/blob/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/env/SECURITY.md)
