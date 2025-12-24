---
title: Bun Plugins Ecosystem
description: The Bun plugin system and Stacks.js integrations
---

# Bun Plugins Ecosystem

Stacks leverages Bun's powerful plugin architecture to extend bundling, module resolution, and runtime capabilities. The framework includes several Bun plugins out of the box and provides patterns for creating custom plugins.

## Plugin Architecture

Bun plugins hook into the bundler and module resolver to transform, load, or generate code during build time:

```typescript
import type { BunPlugin } from 'bun'

const myPlugin: BunPlugin = {
  name: 'my-plugin',
  setup(build) {
    // Called once when plugin is registered

    // Handle module resolution
    build.onResolve({ filter: /\.custom$/ }, (args) => {
      return { path: args.path, namespace: 'custom' }
    })

    // Handle module loading
    build.onLoad({ filter: /.*/, namespace: 'custom' }, async (args) => {
      const source = await Bun.file(args.path).text()
      return {
        contents: transformCustomFormat(source),
        loader: 'ts',
      }
    })
  },
}
```

## Built-in Stacks Plugins

### bun-plugin-stx

Compiles STX templates to optimized JavaScript:

```typescript
import { stxPlugin } from 'bun-plugin-stx'

await Bun.build({
  entrypoints: ['./app.ts'],
  plugins: [
    stxPlugin({
      componentDir: './components',
      layoutDir: './layouts',
      minify: true,
      sourceMap: true,
    }),
  ],
})
```

The plugin transforms STX syntax:

```stx
@component('UserCard')
  <div class="card">
    <h2>{{ name }}</h2>
    @if(verified)
      <span class="badge">Verified</span>
    @endif
  </div>
@endcomponent
```

Into optimized runtime code:

```typescript
export function UserCard(props: { name: string; verified: boolean }) {
  return h('div', { class: 'card' }, [
    h('h2', null, props.name),
    props.verified && h('span', { class: 'badge' }, 'Verified'),
  ])
}
```

### bun-plugin-headwind

Processes and optimizes Headwind CSS:

```typescript
import { headwindPlugin } from 'bun-plugin-headwind'

await Bun.build({
  entrypoints: ['./app.ts'],
  plugins: [
    headwindPlugin({
      config: './headwind.config.ts',
      purge: true,
      minify: true,
      sourceMap: false,
    }),
  ],
})
```

Features:

- **JIT Compilation**: Generates only used utility classes
- **Custom Theme**: Extends default design tokens
- **Variants**: Responsive, state, and custom variants
- **Plugins**: Extend with typography, forms, aspect-ratio

### bun-plugin-dts

Generates TypeScript declarations during build:

```typescript
import { dtsPlugin } from 'bun-plugin-dts'

await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  plugins: [
    dtsPlugin({
      outDir: './dist',
      bundle: true,
      respectExternal: true,
    }),
  ],
})
```

### bun-plugin-auto-imports

Enables auto-imports without explicit import statements. In Stacks, **everything is auto-importable by default** — functions, composables, components, and utilities are all available without manual imports:

```typescript
import { autoImportsPlugin } from 'bun-plugin-auto-imports'

await Bun.build({
  entrypoints: ['./app.ts'],
  plugins: [
    autoImportsPlugin({
      // Import from packages
      imports: [
        { from: '@stacksjs/utils', names: ['log', 'debug'] },
        { from: 'vue', names: ['ref', 'computed', 'watch'] },
      ],
      // Scan directories for auto-imports
      directories: ['./composables', './utils'],
      // Use presets (vue, solid-js, react, etc.)
      presets: ['vue'],
      // Generate TypeScript declaration file
      dts: './auto-imports.d.ts',
    }),
  ],
})
```

#### How Stacks Uses Auto-Imports

Stacks configures auto-imports out of the box, making all your code instantly available:

```typescript
// In Stacks, these directories are automatically scanned:
// - ./app/Actions       → Actions are auto-imported
// - ./app/Composables   → Composables are auto-imported
// - ./app/Utils         → Utility functions are auto-imported
// - ./components        → Components are auto-imported
// - ./resources/functions → Helper functions are auto-imported

// Example: No imports needed!
// useAuth() is auto-imported from ./app/Composables/useAuth.ts
const { user, login, logout } = useAuth()

// formatCurrency() is auto-imported from ./app/Utils/formatCurrency.ts
const price = formatCurrency(99.99)

// CreateUser action is auto-imported from ./app/Actions/CreateUser.ts
const result = await CreateUser.handle({ name: 'John', email: 'john@example.com' })
```

#### Configuration

Configure auto-imports in `config/app.ts`:

```typescript
// config/app.ts
export default {
  autoImports: {
    // Directories to scan for auto-imports
    dirs: [
      './app/Actions',
      './app/Composables',
      './app/Utils',
      './components',
      './resources/functions',
    ],

    // Package presets to include
    presets: [
      'vue',           // ref, computed, watch, etc.
      '@vueuse/core',  // useStorage, useFetch, etc.
    ],

    // Explicit imports from packages
    imports: [
      { from: 'zod', names: ['z'] },
      { from: '@stacksjs/validation', names: ['v'] },
    ],

    // Generate TypeScript declarations
    dts: './storage/framework/types/auto-imports.d.ts',
  },
}
```

#### Generated TypeScript Declarations

Auto-imports automatically generates a `.d.ts` file so TypeScript understands all available globals:

```typescript
// storage/framework/types/auto-imports.d.ts (auto-generated)
export {}
declare global {
  // From ./app/Composables
  const useAuth: typeof import('./app/Composables/useAuth')['default']
  const useCart: typeof import('./app/Composables/useCart')['default']

  // From ./app/Utils
  const formatCurrency: typeof import('./app/Utils/formatCurrency')['formatCurrency']
  const formatDate: typeof import('./app/Utils/formatDate')['formatDate']

  // From vue preset
  const ref: typeof import('vue')['ref']
  const computed: typeof import('vue')['computed']
  const watch: typeof import('vue')['watch']

  // From zod
  const z: typeof import('zod')['z']
}
```

#### Pickier Integration

Stacks uses [Pickier](https://github.com/stacksjs/pickier) for linting and formatting. Auto-imports work seamlessly with Pickier because:

1. **TypeScript declarations** - The generated `.d.ts` file tells TypeScript about all auto-imported globals
2. **No globals configuration needed** - Pickier relies on TypeScript for type checking, so the declarations are sufficient

```typescript
// The generated auto-imports.d.ts handles everything
// storage/framework/types/auto-imports.d.ts
declare global {
  const useAuth: typeof import('./app/Composables/useAuth')['default']
  const ref: typeof import('vue')['ref']
  // ... all auto-imported functions
}
```

For edge cases where you need to explicitly declare globals (e.g., runtime-injected variables), you can add them to your `pickier.config.ts`:

```typescript
// pickier.config.ts
import type { PickierConfig } from 'pickier'

const config: PickierConfig = {
  // ... other config
  pluginRules: {
    // Ignore specific patterns in no-unused-vars
    'pickier/no-unused-vars': ['error', {
      varsIgnorePattern: '^_',
      argsIgnorePattern: '^_',
    }],
  },
}

export default config
```

### bun-plugin-env

Handles environment variable injection and validation:

```typescript
import { envPlugin } from 'bun-plugin-env'

await Bun.build({
  entrypoints: ['./app.ts'],
  plugins: [
    envPlugin({
      envFile: '.env',
      prefix: 'VITE_',
      validate: {
        API_URL: { required: true, type: 'url' },
        DEBUG: { type: 'boolean', default: 'false' },
      },
    }),
  ],
})
```

## Creating Custom Plugins

### Basic Plugin Structure

```typescript
import type { BunPlugin } from 'bun'

export function createMyPlugin(options: MyPluginOptions = {}): BunPlugin {
  return {
    name: 'my-plugin',
    setup(build) {
      const { transform = true, minify = false } = options

      build.onLoad({ filter: /\.myext$/ }, async (args) => {
        const source = await Bun.file(args.path).text()

        let result = source
        if (transform) {
          result = await transformSource(result)
        }
        if (minify) {
          result = await minifySource(result)
        }

        return {
          contents: result,
          loader: 'js',
        }
      })
    },
  }
}
```

### Virtual Module Plugin

Create virtual modules that don't exist on disk:

```typescript
export function virtualModulePlugin(modules: Record<string, string>): BunPlugin {
  return {
    name: 'virtual-modules',
    setup(build) {
      build.onResolve({ filter: /^virtual:/ }, (args) => ({
        path: args.path,
        namespace: 'virtual',
      }))

      build.onLoad({ filter: /.*/, namespace: 'virtual' }, (args) => {
        const moduleName = args.path.replace('virtual:', '')
        const contents = modules[moduleName]

        if (!contents) {
          throw new Error(`Virtual module "${moduleName}" not found`)
        }

        return { contents, loader: 'ts' }
      })
    },
  }
}

// Usage
await Bun.build({
  plugins: [
    virtualModulePlugin({
      'virtual:build-info': `export const buildTime = "${new Date().toISOString()}"`,
      'virtual:version': `export const version = "${pkg.version}"`,
    }),
  ],
})
```

### Asset Transformation Plugin

Transform non-JS assets during build:

```typescript
export function svgPlugin(): BunPlugin {
  return {
    name: 'svg-component',
    setup(build) {
      build.onLoad({ filter: /\.svg$/ }, async (args) => {
        const svg = await Bun.file(args.path).text()
        const optimized = await optimizeSvg(svg)

        return {
          contents: `
            export default function SvgComponent(props) {
              return \`${optimized.replace(/<svg/, '<svg {...props}')}\`
            }
          `,
          loader: 'js',
        }
      })
    },
  }
}
```

## Plugin Composition

Stacks provides utilities for composing multiple plugins:

```typescript
import { composePlugins, withDefaults } from '@stacksjs/bun-plugins'

const stacksPlugins = composePlugins([
  stxPlugin(),
  headwindPlugin(),
  dtsPlugin(),
  autoImportsPlugin({
    directories: ['./composables'],
  }),
])

await Bun.build({
  entrypoints: ['./src/index.ts'],
  plugins: stacksPlugins,
})
```

## Runtime Plugins

Some plugins work at runtime rather than build time:

```typescript
import { plugin } from 'bun'

// Register runtime loader for custom file types
plugin({
  name: 'yaml-loader',
  setup(build) {
    build.onLoad({ filter: /\.ya?ml$/ }, async (args) => {
      const text = await Bun.file(args.path).text()
      const data = parseYaml(text)
      return {
        contents: `export default ${JSON.stringify(data)}`,
        loader: 'js',
      }
    })
  },
})

// Now you can import YAML files
import config from './config.yaml'
```

## Plugin Best Practices

1. **Use Specific Filters**: Narrow file filters improve performance
2. **Cache Results**: Store transformed results for repeated builds
3. **Handle Errors Gracefully**: Provide helpful error messages
4. **Support Source Maps**: Maintain debugging capability
5. **Document Options**: Clear configuration documentation
6. **Test Thoroughly**: Unit test transformation logic

```typescript
// Example with caching and error handling
export function robustPlugin(options: PluginOptions): BunPlugin {
  const cache = new Map<string, TransformResult>()

  return {
    name: 'robust-plugin',
    setup(build) {
      build.onLoad({ filter: options.filter }, async (args) => {
        const cacheKey = `${args.path}:${Bun.file(args.path).lastModified}`

        if (cache.has(cacheKey)) {
          return cache.get(cacheKey)!
        }

        try {
          const source = await Bun.file(args.path).text()
          const result = await transform(source, options)

          cache.set(cacheKey, result)
          return result
        } catch (error) {
          throw new Error(
            `[robust-plugin] Failed to transform ${args.path}: ${error.message}`
          )
        }
      })
    },
  }
}
```
