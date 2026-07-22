import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dir, '..')
const workflow = readFileSync(resolve(root, '.github/workflows/deploy.yml'), 'utf8')
const packageJson = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
  scripts: Record<string, string>
}

describe('production push-to-deploy contract', () => {
  it('deploys only main pushes into the production environment', () => {
    expect(workflow).toContain('branches: ["main"]')
    expect(workflow).toContain("if: github.ref_name == 'main'")
    expect(workflow).toContain('name: "production"')
    expect(workflow).not.toContain('branches: ["stage"]')
    expect(workflow).not.toContain('branches: ["dev"]')
  })

  it('keeps GitHub Actions behind the repository deployment abstraction', () => {
    expect(workflow).toContain('run: bun run deploy:ci')
    expect(packageJson.scripts['deploy:ci']).toBe('cloud deploy --env production --site whitepaper --skip-dns-verification --yes')
  })

  it('pins the Pantry Action source and downloaded runtime independently', () => {
    expect(workflow).toContain('uses: pantry-pm/pantry/packages/action@c5e15260ccde34206082756a14d03e30cf1d7d5e')
    expect(workflow).toContain("version: '0.10.43'")
    expect(workflow).toContain("install: 'true'")
    expect(workflow).not.toContain("install: 'false'")
    expect(workflow).not.toContain('packages/action@main')
  })
})
