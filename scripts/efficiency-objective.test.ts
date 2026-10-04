import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const paper = readFileSync(resolve(root, 'README.md'), 'utf8')
const performance = readFileSync(resolve(root, 'docs/architecture/performance.md'), 'utf8')
const introduction = readFileSync(resolve(root, 'docs/introduction/index.md'), 'utf8')

describe('efficient-abstraction objective', () => {
  it('states the objective for human authors, AI models, and machines', () => {
    expect(paper).toContain('as close to ideal as possible for **both human and AI authors**')
    expect(paper).toContain('6. **Efficient abstractions.**')
    expect(introduction).toContain('Efficient abstractions for people, models, and machines')
    for (const document of [paper, performance])
      expect(document).toMatch(/energy/i)
  })

  it('keeps the objective a measured target rather than an unmeasured claim', () => {
    expect(paper).toContain('This is a design objective, not a demonstrated result.')
    expect(paper).toContain('no reproducible performance or energy report is part of')
    expect(paper).toContain('Efficiency evidence is reported beside conformance evidence, never inside it.')
    expect(performance).toContain('Label estimates.')
  })

  it('never lets an optimization trade away behavioral guarantees', () => {
    expect(paper).toContain('never by weakening validation, security, durability, or')
    expect(performance).toContain('an optimization that weakens validation, security, durability, or observability is not an efficiency gain')
  })
})
