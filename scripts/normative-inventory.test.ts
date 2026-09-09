import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { SNAPSHOT, countByLevel, normativeStatements } from './normative-inventory'

const readme = readFileSync(resolve(import.meta.dir, '..', 'README.md'), 'utf8')

describe('normative inventory', () => {
  it('ignores fenced code, where a keyword is an example rather than a requirement', () => {
    const found = normativeStatements([
      '# Section',
      'An implementation MUST do the thing.',
      '```ts',
      '// a comment saying MUST, inside code',
      'const x = "MAY"',
      '```',
      'and a SHOULD after the fence.',
    ].join('\n'))

    expect(found.map(s => s.level)).toEqual(['MUST', 'SHOULD'])
    expect(found[0]!.section).toBe('Section')
  })

  it('reads MUST NOT as itself, not as a MUST', () => {
    expect(normativeStatements('A Model MUST NOT depend on a renderer.')[0]!.level).toBe('MUST NOT')
    expect(normativeStatements('Reports SHOULD NOT omit the revision.')[0]!.level).toBe('SHOULD NOT')
  })

  it('does not count the RFC 2119 boilerplate as a requirement', () => {
    // The one line that defines the keywords rather than using them. Counting
    // it is how an inventory starts lying about its own size.
    expect(normativeStatements('The terms **MUST**, **MUST NOT**, **SHOULD** are to be interpreted...')).toEqual([])
  })

  it('needs a word boundary, so MAYBE and MUSTARD are prose', () => {
    expect(normativeStatements('This MAYBE works and MUSTARD is yellow.')).toEqual([])
  })

  /**
   * The catalog at revision 1 carries 47 requirements, all MUST or MUST NOT.
   * These 15 are therefore neither catalogued nor marked informative, which is
   * the gap stacksjs/stacks#2050 exists to close. The number is pinned so a new
   * one cannot arrive unnoticed.
   */
  it('still has 15 SHOULD/MAY statements the catalog does not carry', () => {
    const counts = countByLevel(normativeStatements(readme))

    expect(counts.SHOULD + counts.MAY + counts['SHOULD NOT']).toBe(15)
    expect(counts).toEqual(SNAPSHOT)
  })
})
