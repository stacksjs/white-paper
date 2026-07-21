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
})
