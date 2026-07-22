import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const paper = readFileSync(resolve(root, 'README.md'), 'utf8')
const aiGuide = readFileSync(resolve(root, 'docs/advanced/ai-integration.md'), 'utf8')
const cliGuide = readFileSync(resolve(root, 'docs/developer-experience/cli.md'), 'utf8')
const contextEvidence = readFileSync(resolve(root, 'evidence/stacks/ai-context.ts.evidence'), 'utf8')
const evidenceLock = JSON.parse(readFileSync(resolve(root, 'evidence/stacks/evidence.lock.json'), 'utf8')) as {
  evidenceRevision: string
  files: Record<string, string>
}

describe('AI-efficient authoring claims', () => {
  it('centers the claim on reduced application boilerplate and code tokens', () => {
    expect(paper).toContain('fewer application-owned tokens to generate')
    expect(paper).toContain('instead of repeatedly generating framework glue')
    expect(paper).toContain('fewer output tokens, a smaller review surface')
  })

  it('keeps dependencies distinct from application-owned prompt context', () => {
    for (const document of [paper, aiGuide, cliGuide]) {
      expect(document).toContain('node_modules')
      expect(document).toContain('package-manager state')
    }
    expect(paper).toContain('does not claim that `node_modules` disappears')
  })

  it('documents only the native bounded context command and its limits', () => {
    expect(aiGuide).toContain('buddy ai:context --json --output .stacks/ai-context.json')
    expect(cliGuide).toContain('buddy ai:context --max-chars 4000')
    expect(aiGuide).not.toContain('buddy ai generate')
    expect(aiGuide).toContain('not provider billing, correctness, model quality, or')
  })

  it('pins the implementation contract that enforces budget and exclusions', () => {
    expect(evidenceLock.evidenceRevision).toBe('6008859d6e3d75e115261d6b7de76826324788da')
    expect(evidenceLock.files['ai-context.ts.evidence']).toMatch(/^sha256:[a-f0-9]{64}$/)
    expect(contextEvidence).toContain("const DEFAULT_MAX_CHARS = 4000")
    expect(contextEvidence).toContain("'node_modules'")
    expect(contextEvidence).toContain('environment, credential, private-key, and secret files')
    expect(contextEvidence).toContain('estimatedTokenReductionPercent')
  })
})
