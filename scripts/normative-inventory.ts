/**
 * Inventory Part I's normative statements.
 *
 * Ratification needs every MUST, MUST NOT, SHOULD, SHOULD NOT and MAY in the
 * normative text to be either carried by a requirement in the protocol catalog
 * or explicitly marked informative (stacksjs/stacks#2050). Neither half of that
 * was observable: the catalog links *to* sections of this document, nothing
 * links back, and nothing counts what is here.
 *
 * This counts what is here. It deliberately does not decide which statements
 * ought to be requirements - that is a change to a normative specification and
 * belongs to the maintainers - it just makes the surface a number rather than
 * an impression, so a statement added later cannot slip past unnoticed.
 *
 * Run `bun scripts/normative-inventory.ts` for the listing, or `--check` to
 * fail when the counts move.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

export type NormativeLevel = 'MUST NOT' | 'MUST' | 'SHOULD NOT' | 'SHOULD' | 'MAY'

export interface NormativeStatement {
  line: number
  level: NormativeLevel
  /** The `## `/`### ` heading the statement sits under, for locating it. */
  section: string
  text: string
}

/**
 * Longest first, so `MUST NOT` is never reported as a `MUST`. The word
 * boundaries matter as much: "MAYBE" and "MUSTARD" are not normative, and
 * neither is prose that happens to contain a lowercase "may".
 */
const LEVELS: NormativeLevel[] = ['MUST NOT', 'SHOULD NOT', 'MUST', 'SHOULD', 'MAY']
const PATTERN = new RegExp(`\\b(${LEVELS.join('|')})\\b`)

/**
 * The one line that defines the keywords rather than using them. Counting RFC
 * 2119 boilerplate as a requirement is how an inventory starts lying about its
 * own size.
 */
const BOILERPLATE = /terms \*\*MUST\*\*/

export function normativeStatements(markdown: string): NormativeStatement[] {
  const statements: NormativeStatement[] = []
  let inCodeFence = false
  let section = '(preamble)'

  for (const [index, line] of markdown.split('\n').entries()) {
    // A fenced block is an example, not a requirement. Toggling on the fence
    // rather than stripping blocks keeps line numbers usable for locating a
    // statement in the source.
    if (line.trimStart().startsWith('```')) {
      inCodeFence = !inCodeFence
      continue
    }
    if (inCodeFence)
      continue

    if (line.startsWith('#')) {
      section = line.replace(/^#+\s*/, '').trim()
      continue
    }

    if (BOILERPLATE.test(line))
      continue

    const match = PATTERN.exec(line)
    if (match)
      statements.push({ line: index + 1, level: match[1] as NormativeLevel, section, text: line.trim() })
  }

  return statements
}

export function countByLevel(statements: NormativeStatement[]): Record<NormativeLevel, number> {
  const counts = { 'MUST': 0, 'MUST NOT': 0, 'SHOULD': 0, 'SHOULD NOT': 0, 'MAY': 0 }
  for (const statement of statements)
    counts[statement.level]++
  return counts
}

/**
 * The surface as it stood when this was written, against catalog revision 1.
 *
 * The catalog carries 47 requirements, every one of them MUST or MUST NOT. So
 * the 15 SHOULD and MAY statements below are, today, neither catalogued nor
 * marked informative - which is the gap #2050 exists to close. Updating this
 * snapshot is the moment to ask which of the two a new statement is.
 */
export const SNAPSHOT: Record<NormativeLevel, number> = {
  'MUST': 45,
  'MUST NOT': 5,
  'SHOULD': 8,
  'SHOULD NOT': 0,
  'MAY': 7,
}

if (import.meta.main) {
  const statements = normativeStatements(readFileSync(resolve(import.meta.dir, '..', 'README.md'), 'utf8'))
  const counts = countByLevel(statements)
  const check = process.argv.includes('--check')

  if (!check) {
    for (const statement of statements)
      console.log(`${String(statement.line).padStart(5)}  ${statement.level.padEnd(10)}  ${statement.section.slice(0, 40).padEnd(40)}  ${statement.text.slice(0, 90)}`)
    process.stdout.write('\n')
  }

  console.log(LEVELS.map(level => `${level}: ${counts[level]}`).join('  ·  '))

  if (check) {
    const drifted = LEVELS.filter(level => counts[level] !== SNAPSHOT[level])
    if (drifted.length) {
      console.error(
        `\n✗ The normative surface moved: ${drifted.map(level => `${level} ${SNAPSHOT[level]} → ${counts[level]}`).join(', ')}.\n`
        + `\n  Each new statement needs a requirement id in the protocol catalog\n`
        + `  (stacksjs/rfcs protocol/1.0-draft/catalog.json) or an explicit note\n`
        + `  that it is informative. Then update SNAPSHOT here.\n`,
      )
      process.exit(1)
    }
    process.stdout.write('✓ matches the recorded snapshot\n')
  }
}
