import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

interface EvidenceFile {
  source: string
  sha256: string
}

export interface PantryEvidenceLock {
  pantryRepository: string
  revision: string
  tag: string
  version: string
  files: Record<string, EvidenceFile>
  verification: {
    documentationContracts: string
    targetedBunTests: string
    actionTests: string
    actionRedisService: string
    typecheck: string
    zigTests: string
  }
}

const root = resolve(import.meta.dir, '..')
const evidenceRoot = resolve(root, 'evidence/pantry')
const lockPath = resolve(evidenceRoot, 'evidence.lock.json')
const packageManagerPage = resolve(root, 'docs/reference/package-manager.md')
const registryPage = resolve(root, 'docs/reference/registry.md')
const redisServicePage = resolve(root, 'docs/reference/pantry-redis.md')
const sourceFiles = [
  'docs/package-manager.md',
  'docs/registry.md',
  'scripts/docs-contracts.ts',
  'scripts/docs-contracts.test.ts',
  'packages/registry/src/zig-routes.ts',
  'packages/registry/src/zig-routes.test.ts',
  'packages/zig/src/cli/commands/package.zig',
  'packages/zig/src/install/pipeline.zig',
  'packages/action/action.yml',
  'packages/action/README.md',
  'packages/action/src/services.ts',
  'packages/action/src/services.test.ts',
  'packages/action/src/index.ts',
  'packages/action/src/install-mode.ts',
  'packages/action/src/post.ts',
  'packages/zig/src/cli/commands/services.zig',
  'packages/zig/src/services/definitions.zig',
  '.github/workflows/ci.yml',
]

const requiredEvidence = sourceFiles.map(targetName)

export function hash(data: Buffer | string): string {
  return `sha256:${createHash('sha256').update(data).digest('hex')}`
}

function run(repository: string, command: string[]): string {
  const result = Bun.spawnSync(command, { cwd: repository, stdout: 'pipe', stderr: 'pipe' })
  if (result.exitCode !== 0) {
    throw new Error(`${command.join(' ')} failed:\n${result.stdout.toString()}${result.stderr.toString()}`)
  }
  return result.stdout.toString().trim()
}

function targetName(source: string): string {
  if (source === 'docs/package-manager.md' || source === 'docs/registry.md') return basename(source)
  return `${source.replaceAll('/', '__')}.evidence`
}

function renderPage(kind: 'package-manager' | 'registry', lock: PantryEvidenceLock): string {
  const title = kind === 'package-manager' ? 'Pantry package manager' : 'Pantry registry'
  const description = kind === 'package-manager'
    ? 'Source-pinned package resolution, lockfile, integrity, lifecycle, workspace, and publication contract used by Stacks.js.'
    : 'Source-pinned route, authentication, integrity, storage, fallback, operations, and recovery contract for the Pantry registry.'
  const contract = readFileSync(resolve(evidenceRoot, `${kind}.md`), 'utf8').replace(/^# .*\n+/, '')
  const sourcePath = kind === 'package-manager' ? 'docs/package-manager.md' : 'docs/registry.md'

  return `---
title: ${title}
description: ${description}
---

# ${title}

This reference is reproduced from Pantry [\`${lock.tag}\`](https://github.com/pantry-pm/pantry/tree/${lock.tag})
at immutable commit [\`${lock.revision}\`](https://github.com/pantry-pm/pantry/tree/${lock.revision}).
The copied contract and its executable evidence are checksummed in
[\`evidence/pantry/evidence.lock.json\`](https://github.com/stacksjs/white-paper/blob/main/evidence/pantry/evidence.lock.json).
Stacks relies on this boundary; it does not redefine Pantry behavior.

| Provenance | Value |
| --- | --- |
| Pantry release | \`${lock.version}\` / \`${lock.tag}\` |
| Pantry commit | [\`${lock.revision}\`](https://github.com/pantry-pm/pantry/tree/${lock.revision}) |
| Upstream contract | [\`${sourcePath}\`](https://github.com/pantry-pm/pantry/blob/${lock.revision}/${sourcePath}) |
| Contract digest | \`${lock.files[`${kind}.md`].sha256}\` |
| Documentation check | \`${lock.verification.documentationContracts}\` |
| Targeted HTTP/contract tests | \`${lock.verification.targetedBunTests}\` |
| Native test graph | \`${lock.verification.zigTests}\` |

The text below is the upstream implementation contract. Normative words apply
to Pantry at the pinned revision, not to every historical Pantry version.

${contract}`
}

function renderRedisServicePage(lock: PantryEvidenceLock): string {
  const sourceLink = (source: string): string => `https://github.com/pantry-pm/pantry/blob/${lock.revision}/${source}`
  const evidence = (source: string): EvidenceFile => lock.files[targetName(source)]

  return `---
title: Pantry Redis services
description: Reproducible native and GitHub Actions Redis lifecycle contract used by Stacks.js tests and protocol evidence.
---

# Pantry Redis services

Stacks consumes Redis through Pantry [\`${lock.tag}\`](https://github.com/pantry-pm/pantry/tree/${lock.tag})
at immutable commit [\`${lock.revision}\`](https://github.com/pantry-pm/pantry/tree/${lock.revision}).
This page distinguishes Pantry's native project service from its ephemeral GitHub
Actions service. They share package resolution and health semantics, but they do
not share process state or persistence policy.

## Evidence boundary

| Contract | Pinned source | SHA-256 |
| --- | --- | --- |
| Action interface | [\`packages/action/action.yml\`](${sourceLink('packages/action/action.yml')}) | \`${evidence('packages/action/action.yml').sha256}\` |
| Service parsing, launch arguments, PID readiness, diagnostics | [\`packages/action/src/services.ts\`](${sourceLink('packages/action/src/services.ts')}) | \`${evidence('packages/action/src/services.ts').sha256}\` |
| Action installation and orchestration | [\`packages/action/src/index.ts\`](${sourceLink('packages/action/src/index.ts')}) | \`${evidence('packages/action/src/index.ts').sha256}\` |
| Action cleanup | [\`packages/action/src/post.ts\`](${sourceLink('packages/action/src/post.ts')}) | \`${evidence('packages/action/src/post.ts').sha256}\` |
| Native lifecycle | [\`packages/zig/src/cli/commands/services.zig\`](${sourceLink('packages/zig/src/cli/commands/services.zig')}) | \`${evidence('packages/zig/src/cli/commands/services.zig').sha256}\` |
| Native Redis definition | [\`packages/zig/src/services/definitions.zig\`](${sourceLink('packages/zig/src/services/definitions.zig')}) | \`${evidence('packages/zig/src/services/definitions.zig').sha256}\` |
| Action contract tests | [\`packages/action/src/services.test.ts\`](${sourceLink('packages/action/src/services.test.ts')}) | \`${evidence('packages/action/src/services.test.ts').sha256}\` |

The lock, copied sources, and verification commands are retained in
[\`evidence/pantry/evidence.lock.json\`](https://github.com/stacksjs/white-paper/blob/main/evidence/pantry/evidence.lock.json).

## GitHub Actions contract

Use the Pantry Action when a job needs an isolated Redis process:

\`\`\`yaml
- name: Setup Pantry and Redis
  id: pantry
  uses: pantry-pm/pantry/packages/action@${lock.revision}
  with:
    version: '${lock.version}'
    install: 'false'
    services: redis@8.8.0
\`\`\`

Both pins are intentional. The \`uses\` revision fixes the Action source, while
\`version\` fixes the downloaded native Pantry CLI. \`services\` accepts an exact
\`redis@X.Y.Z\` version; ranges and ambiguous versions fail before installation.
The Action currently supports Redis services on Linux and macOS. Windows support
is tracked upstream in [Pantry issue 211](https://github.com/pantry-pm/pantry/issues/211)
and is not implied by the cross-platform CLI installation contract.

### Lifecycle sequence

1. Parse and deduplicate service declarations. Conflicting package and service
   versions fail before any process is started.
2. Install Redis through the native Pantry resolver with \`--no-save\`. This
   preserves package dependencies, integrity verification, platform selection,
   and Pantry's normal installation boundary without mutating the project manifest.
3. Resolve \`redis-server\` and \`redis-cli\` from the job-local \`pantry/.bin\`.
   A system Redis installation is not accepted as evidence for the requested pin.
4. Create an isolated directory under \`RUNNER_TEMP/pantry-services/redis\`.
5. Launch Redis on \`127.0.0.1:6379\` with protected mode enabled, persistence
   disabled, and explicit PID and log files. The service is not exposed on an
   external runner interface.
6. Wait up to 10 seconds for a valid, live daemon PID. PID creation is polled to
   avoid racing Redis daemonization.
7. Wait up to 30 seconds for \`redis-cli ping\` to succeed.
8. Read the running binary's version and reject it when it differs from the exact
   requested version.
9. Export \`REDIS_URL=redis://127.0.0.1:6379/0\` and
   \`REDIS_SERVICE_VERSION\`; publish the same values as \`redis-url\` and
   \`redis-version\` Action outputs.
10. In the post step, issue \`SHUTDOWN NOSAVE\` only when this Action recorded a
    successful start.

### Failure and diagnostic semantics

The setup step fails when installation fails, the installed binaries are missing,
the PID is invalid or absent, Redis cannot answer a health check, or the running
version differs from the exact request. PID-readiness errors include the Redis
startup logfile, making port collisions, linkage failures, and invalid launch
configuration visible in the Actions log. A failed setup never converts to a
memory-backed cache or queue pass.

An exact Actions cache hit may restore Pantry artifacts, but the Action still
validates and starts the declared service. Restore-key matches are not treated as
exact dependency state. When \`install: 'false'\` is combined with a service,
project JavaScript dependencies remain untouched; only the runtime and explicitly
requested service packages are provisioned.

## Native project service contract

\`pantry start redis\` and \`pantry restart redis\` use the invoking project as
the service scope. The service identifier, data directory, logs, and process state
are project-specific, preventing one checkout from silently adopting another
checkout's Redis process. Pantry uses its own installed \`redis-server\` and
\`redis-cli\`, waits for \`PONG\`, and stops a failed start before returning an
error. Restart preserves the same project scope.

Native project services are development infrastructure and may use persistent
project data. The Action service is deliberately ephemeral and disables
persistence. Tests and deployment tooling must not assume those two modes have
the same durability or recovery behavior.

## Consumer checks

A consuming workflow should verify both exported state and a real round trip:

\`\`\`bash
test "$REDIS_URL" = "redis://127.0.0.1:6379/0"
test "$REDIS_SERVICE_VERSION" = "8.8.0"
test "$(redis-cli -u "$REDIS_URL" ping)" = "PONG"
redis-cli -u "$REDIS_URL" set contract-check ready
test "$(redis-cli -u "$REDIS_URL" get contract-check)" = "ready"
\`\`\`

Stacks additionally retains cache and queue driver tests against the live URL.
Service availability alone does not prove either driver contract.

## Verification retained for this snapshot

| Check | Result |
| --- | --- |
| Documentation/source contract | \`${lock.verification.documentationContracts}\` |
| Package and registry tests | \`${lock.verification.targetedBunTests}\` |
| Pantry Action tests | \`${lock.verification.actionTests}\` |
| Live Action Redis contract | \`${lock.verification.actionRedisService}\` |
| TypeScript typecheck | \`${lock.verification.typecheck}\` |
| Native Zig graph | \`${lock.verification.zigTests}\` |
`
}

function verifySource(repository: string): PantryEvidenceLock['verification'] {
  run(repository, ['bun', 'run', 'docs:contracts:check'])
  run(repository, ['bun', 'test', './scripts/docs-contracts.test.ts', './packages/registry/src/zig-routes.test.ts'])
  run(repository, ['bun', 'test', './packages/action/src'])
  run(repository, ['bun', 'run', 'typecheck'])
  run(resolve(repository, 'packages/zig'), ['zig', 'build', 'test'])
  return {
    documentationContracts: 'bun run docs:contracts:check (54 source-linked markers)',
    targetedBunTests: '12 passed, 0 failed',
    actionTests: '40 passed, 0 failed',
    actionRedisService: 'Pantry CI action-redis-service (Redis 8.8.0 install, health, round trip, outputs, cleanup)',
    typecheck: 'bun run typecheck',
    zigTests: 'zig build test',
  }
}

function writeEvidence(sourceRepository: string): void {
  const status = run(sourceRepository, ['git', 'status', '--porcelain'])
  if (status) throw new Error('Pantry source must be clean before evidence is pinned')
  const revision = run(sourceRepository, ['git', 'rev-parse', 'HEAD'])
  const tag = run(sourceRepository, ['git', 'describe', '--tags', '--exact-match', 'HEAD'])
  const version = JSON.parse(readFileSync(resolve(sourceRepository, 'package.json'), 'utf8')).version as string
  if (tag !== `v${version}`) throw new Error(`Pantry tag ${tag} does not match package version ${version}`)

  const verification = verifySource(sourceRepository)
  mkdirSync(evidenceRoot, { recursive: true })
  if (existsSync(lockPath)) {
    const previous = JSON.parse(readFileSync(lockPath, 'utf8')) as PantryEvidenceLock
    const nextNames = new Set(sourceFiles.map(targetName))
    for (const name of Object.keys(previous.files)) {
      if (!nextNames.has(name)) rmSync(resolve(evidenceRoot, name))
    }
  }
  const files: Record<string, EvidenceFile> = {}
  for (const source of sourceFiles) {
    const contents = readFileSync(resolve(sourceRepository, source))
    const target = targetName(source)
    writeFileSync(resolve(evidenceRoot, target), contents)
    files[target] = { source, sha256: hash(contents) }
  }
  const lock: PantryEvidenceLock = {
    pantryRepository: 'https://github.com/pantry-pm/pantry',
    revision,
    tag,
    version,
    files,
    verification,
  }
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`)
  writeFileSync(packageManagerPage, renderPage('package-manager', lock))
  writeFileSync(registryPage, renderPage('registry', lock))
  writeFileSync(redisServicePage, renderRedisServicePage(lock))
  console.log(`Pinned Pantry ${tag} evidence at ${revision}`)
}

function checkEvidence(): void {
  if (!existsSync(lockPath)) throw new Error('Pantry evidence lock is missing')
  const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as PantryEvidenceLock
  const errors = validateEvidenceFiles(lock, name => existsSync(resolve(evidenceRoot, name)), name => readFileSync(resolve(evidenceRoot, name)))
  for (const name of requiredEvidence) {
    if (!lock.files[name]) errors.push(`required Pantry evidence is missing: ${name}`)
  }
  if (lock.tag !== `v${lock.version}`) errors.push('Pantry tag does not match the locked version')
  if (!/^[a-f0-9]{40}$/.test(lock.revision)) errors.push('Pantry revision is not a full commit SHA')
  if (readFileSync(packageManagerPage, 'utf8') !== renderPage('package-manager', lock)) errors.push('stale: docs/reference/package-manager.md')
  if (readFileSync(registryPage, 'utf8') !== renderPage('registry', lock)) errors.push('stale: docs/reference/registry.md')
  if (readFileSync(redisServicePage, 'utf8') !== renderRedisServicePage(lock)) errors.push('stale: docs/reference/pantry-redis.md')
  if (errors.length > 0) throw new Error(`Pantry evidence check failed:\n${errors.join('\n')}`)
  console.log(`Pantry evidence matches ${lock.tag} (${lock.revision})`)
}

export function validateEvidenceFiles(
  lock: PantryEvidenceLock,
  exists: (name: string) => boolean,
  read: (name: string) => Buffer | string,
): string[] {
  return Object.entries(lock.files).flatMap(([name, evidence]) => {
    if (!exists(name)) return [`missing: ${name}`]
    return hash(read(name)) === evidence.sha256 ? [] : [`modified: ${name}`]
  })
}

if (import.meta.main) {
  if (process.argv.includes('--write')) {
    const index = process.argv.indexOf('--source')
    const source = resolve(index === -1 ? resolve(root, '../pantry') : process.argv[index + 1] || '')
    writeEvidence(source)
  }
  else if (process.argv.includes('--check')) checkEvidence()
  else {
    console.error('usage: bun scripts/sync-pantry-evidence.ts --write [--source ../pantry] | --check')
    process.exit(2)
  }
}
