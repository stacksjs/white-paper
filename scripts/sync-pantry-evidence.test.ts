import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { hash, type PantryEvidenceLock, validateEvidenceFiles } from './sync-pantry-evidence'

const root = resolve(import.meta.dir, '..')
const evidenceRoot = resolve(root, 'evidence/pantry')
const lock = JSON.parse(readFileSync(resolve(evidenceRoot, 'evidence.lock.json'), 'utf8')) as PantryEvidenceLock
const read = (name: string) => readFileSync(resolve(evidenceRoot, name))

describe('Pantry evidence lock', () => {
  it('matches every copied source artifact', () => {
    expect(validateEvidenceFiles(lock, () => true, read)).toEqual([])
  })

  it('detects modified and missing evidence', () => {
    const first = Object.keys(lock.files)[0]
    expect(validateEvidenceFiles(lock, name => name !== first, read)).toContain(`missing: ${first}`)
    expect(validateEvidenceFiles(lock, () => true, name => name === first ? `${read(name)}tampered` : read(name))).toContain(`modified: ${first}`)
  })

  it('uses an explicit SHA-256 digest format', () => {
    expect(hash('pantry')).toMatch(/^sha256:[a-f0-9]{64}$/)
  })

  it('pins the complete Redis lifecycle and its executable checks', () => {
    const sources = Object.values(lock.files).map(file => file.source)
    expect(sources).toEqual(expect.arrayContaining([
      'packages/action/action.yml',
      'packages/action/src/services.ts',
      'packages/action/src/services.test.ts',
      'packages/action/src/index.ts',
      'packages/action/src/post.ts',
      'packages/zig/src/cli/commands/services.zig',
      'packages/zig/src/services/definitions.zig',
    ]))
    expect(lock.verification.actionTests).toMatch(/passed, 0 failed/)
    expect(lock.verification.actionRedisService).toContain('Redis 8.8.0')
  })

  it('pins npm publication implementation and source-linked contracts', () => {
    const sources = Object.values(lock.files).map(file => file.source)
    expect(sources).toContain('packages/zig/src/cli/commands/package.zig')
    expect(lock.verification.documentationContracts).toContain('source-linked markers')
    expect(lock.verification.targetedBunTests).toMatch(/passed, 0 failed/)
    expect(read('package-manager.md').toString()).toContain('## npm publication semantics')
  })

  it('renders a source-pinned Redis consumer contract', () => {
    const page = readFileSync(resolve(root, 'docs/reference/pantry-redis.md'), 'utf8')
    expect(page).toContain(`uses: pantry-pm/pantry/packages/action@${lock.revision}`)
    expect(page).toContain(`version: '${lock.version}'`)
    expect(page).toContain('A failed setup never converts to a')
    expect(page).toContain('Pantry issue 211')
  })
})
