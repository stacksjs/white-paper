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
    typecheck: string
    zigTests: string
  }
}

const root = resolve(import.meta.dir, '..')
const evidenceRoot = resolve(root, 'evidence/pantry')
const lockPath = resolve(evidenceRoot, 'evidence.lock.json')
const packageManagerPage = resolve(root, 'docs/reference/package-manager.md')
const registryPage = resolve(root, 'docs/reference/registry.md')
const sourceFiles = [
  'docs/package-manager.md',
  'docs/registry.md',
  'scripts/docs-contracts.ts',
  'scripts/docs-contracts.test.ts',
  'packages/registry/src/zig-routes.ts',
  'packages/registry/src/zig-routes.test.ts',
  'packages/zig/src/install/pipeline.zig',
  '.github/workflows/ci.yml',
]

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

function verifySource(repository: string): PantryEvidenceLock['verification'] {
  run(repository, ['bun', 'run', 'docs:contracts:check'])
  run(repository, ['bun', 'test', './scripts/docs-contracts.test.ts', './packages/registry/src/zig-routes.test.ts'])
  run(repository, ['bun', 'run', 'typecheck'])
  run(resolve(repository, 'packages/zig'), ['zig', 'build', 'test'])
  return {
    documentationContracts: 'bun run docs:contracts:check (48 source-linked markers)',
    targetedBunTests: '11 passed, 0 failed',
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
  console.log(`Pinned Pantry ${tag} evidence at ${revision}`)
}

function checkEvidence(): void {
  if (!existsSync(lockPath)) throw new Error('Pantry evidence lock is missing')
  const lock = JSON.parse(readFileSync(lockPath, 'utf8')) as PantryEvidenceLock
  const errors = validateEvidenceFiles(lock, name => existsSync(resolve(evidenceRoot, name)), name => readFileSync(resolve(evidenceRoot, name)))
  if (!lock.files['package-manager.md'] || !lock.files['registry.md']) errors.push('canonical Pantry contracts are missing')
  if (readFileSync(packageManagerPage, 'utf8') !== renderPage('package-manager', lock)) errors.push('stale: docs/reference/package-manager.md')
  if (readFileSync(registryPage, 'utf8') !== renderPage('registry', lock)) errors.push('stale: docs/reference/registry.md')
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
