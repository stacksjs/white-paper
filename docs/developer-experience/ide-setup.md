---
title: IDE Setup
description: Configure your development environment for optimal Stacks.js development
---

# IDE Setup

Optimize your development experience with proper IDE configuration for Stacks.js projects.

## Visual Studio Code

### Recommended Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "oven.bun-vscode",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "vue.volar",
    "usernamehw.errorlens",
    "eamodio.gitlens",
    "christian-kohler.path-intellisense",
    "formulahendry.auto-rename-tag",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

### Workspace Settings

```json
// .vscode/settings.json
{
  // Editor
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.wordWrap": "on",
  "editor.bracketPairColorization.enabled": true,

  // TypeScript
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.tsdk": "node_modules/typescript/lib",

  // Tailwind CSS
  "tailwindCSS.includeLanguages": {
    "stx": "html"
  },
  "tailwindCSS.experimental.classRegex": [
    ["class\\s*=\\s*[\"']([^\"']*)[\"']", "([^\"'\\s]*)"]
  ],

  // File Associations
  "files.associations": {
    "*.stx": "html",
    "*.config.ts": "typescript"
  },

  // Search Exclusions
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/storage": true,
    "**/.stacks": true,
    "**/bun.lockb": true
  },

  // ESLint
  "eslint.validate": [
    "javascript",
    "typescript",
    "html"
  ],

  // Emmet
  "emmet.includeLanguages": {
    "stx": "html"
  }
}
```

### Debug Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Bun: Debug",
      "type": "bun",
      "request": "launch",
      "program": "${workspaceFolder}/app/server.ts",
      "cwd": "${workspaceFolder}",
      "stopOnEntry": false,
      "watchMode": false
    },
    {
      "name": "Bun: Debug Watch",
      "type": "bun",
      "request": "launch",
      "program": "${workspaceFolder}/app/server.ts",
      "cwd": "${workspaceFolder}",
      "watchMode": true
    },
    {
      "name": "Bun: Debug Tests",
      "type": "bun",
      "request": "launch",
      "program": "${workspaceFolder}/tests/index.test.ts",
      "cwd": "${workspaceFolder}"
    },
    {
      "name": "Attach to Process",
      "type": "bun",
      "request": "attach",
      "url": "ws://localhost:6499/",
      "stopOnEntry": false
    }
  ]
}
```

### Tasks Configuration

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "shell",
      "command": "buddy dev",
      "group": "build",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      },
      "problemMatcher": []
    },
    {
      "label": "build",
      "type": "shell",
      "command": "buddy build",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "test",
      "type": "shell",
      "command": "buddy test",
      "group": {
        "kind": "test",
        "isDefault": true
      },
      "problemMatcher": []
    },
    {
      "label": "lint",
      "type": "shell",
      "command": "buddy lint",
      "problemMatcher": ["$eslint-stylish"]
    },
    {
      "label": "typecheck",
      "type": "shell",
      "command": "buddy typecheck",
      "problemMatcher": ["$tsc"]
    }
  ]
}
```

### Snippets

```json
// .vscode/stacks.code-snippets
{
  "Stacks Model": {
    "prefix": "smodel",
    "body": [
      "import { Model } from '@stacksjs/orm'",
      "",
      "export default class ${1:ModelName} extends Model {",
      "  static table = '${2:table_name}'",
      "",
      "  static fields = {",
      "    $0",
      "  }",
      "}"
    ],
    "description": "Create a new Stacks model"
  },
  "Stacks Controller": {
    "prefix": "scontroller",
    "body": [
      "import type { Request } from '@stacksjs/router'",
      "",
      "export default {",
      "  async index(request: Request) {",
      "    $0",
      "  },",
      "",
      "  async show(request: Request) {",
      "    const { id } = request.params",
      "  },",
      "",
      "  async store(request: Request) {",
      "    const data = await request.validate()",
      "  },",
      "",
      "  async update(request: Request) {",
      "    const { id } = request.params",
      "  },",
      "",
      "  async destroy(request: Request) {",
      "    const { id } = request.params",
      "  },",
      "}"
    ],
    "description": "Create a new Stacks controller"
  },
  "Stacks Middleware": {
    "prefix": "smiddleware",
    "body": [
      "import type { Request, Next } from '@stacksjs/router'",
      "",
      "export async function ${1:middlewareName}(request: Request, next: Next) {",
      "  $0",
      "  return next()",
      "}"
    ],
    "description": "Create a new Stacks middleware"
  },
  "STX Component": {
    "prefix": "sstx",
    "body": [
      "<template>",
      "  <div>",
      "    $0",
      "  </div>",
      "</template>",
      "",
      "<script>",
      "export default {",
      "  props: {",
      "    ${1:propName}: { type: ${2:String}, required: ${3:true} }",
      "  }",
      "}",
      "</script>"
    ],
    "description": "Create a new STX component"
  },
  "Stacks Action": {
    "prefix": "saction",
    "body": [
      "import { Action } from '@stacksjs/actions'",
      "",
      "export default new Action({",
      "  name: '${1:ActionName}',",
      "  description: '${2:Action description}',",
      "",
      "  async handle(data: ${3:any}) {",
      "    $0",
      "  }",
      "})"
    ],
    "description": "Create a new Stacks action"
  },
  "Stacks Event": {
    "prefix": "sevent",
    "body": [
      "import { Event } from '@stacksjs/events'",
      "",
      "export default new Event({",
      "  name: '${1:EventName}',",
      "",
      "  listeners: [",
      "    '${2:ListenerName}'",
      "  ]",
      "})"
    ],
    "description": "Create a new Stacks event"
  }
}
```

## WebStorm / IntelliJ IDEA

### Project Setup

1. **Open Project:**
   - File > Open > Select your Stacks project

2. **Configure Bun:**
   - Settings > Languages & Frameworks > Node.js
   - Set Node interpreter to Bun
   - Enable "Coding assistance for Node.js"

3. **Configure TypeScript:**
   - Settings > Languages & Frameworks > TypeScript
   - Ensure "Use TypeScript Service" is enabled
   - Point to project's TypeScript version

### File Type Associations

```
Settings > Editor > File Types
```

Add `.stx` extension to HTML file type for syntax highlighting.

### Run Configurations

```xml
<!-- .idea/runConfigurations/dev.xml -->
<component name="ProjectRunConfigurationManager">
  <configuration name="dev" type="js.build_tools.npm">
    <package-json value="$PROJECT_DIR$/package.json" />
    <command value="run</command>
    <scripts>
      <script value="dev" />
    </scripts>
    <node-interpreter value="bun" />
  </configuration>
</component>
```

### Live Templates

**Model Template:**
```
// Abbreviation: smodel
import { Model } from '@stacksjs/orm'

export default class $NAME$ extends Model {
  static table = '$TABLE$'

  static fields = {
    $END$
  }
}
```

**Controller Template:**
```
// Abbreviation: scontroller
import type { Request } from '@stacksjs/router'

export default {
  async index(request: Request) {
    $END$
  },
}
```

### Plugins

- **Tailwind CSS** - Tailwind class completion
- **Prettier** - Code formatting
- **ESLint** - Linting support
- **Database Tools** - Database management

## Neovim

### Basic Setup with LazyVim

```lua
-- lua/plugins/stacks.lua
return {
  -- TypeScript support
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        tsserver = {
          settings = {
            typescript = {
              inlayHints = {
                includeInlayParameterNameHints = "all",
                includeInlayFunctionParameterTypeHints = true,
              },
            },
          },
        },
      },
    },
  },

  -- Tailwind CSS
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        tailwindcss = {
          filetypes_include = { "stx" },
        },
      },
    },
  },

  -- STX file type
  {
    "nvim-treesitter/nvim-treesitter",
    opts = function(_, opts)
      vim.filetype.add({
        extension = {
          stx = "html",
        },
      })
    end,
  },

  -- Formatting
  {
    "stevearc/conform.nvim",
    opts = {
      formatters_by_ft = {
        typescript = { "prettier" },
        html = { "prettier" },
        stx = { "prettier" },
      },
    },
  },
}
```

### Key Mappings

```lua
-- lua/config/keymaps.lua
local map = vim.keymap.set

-- Stacks commands
map("n", "<leader>sd", "<cmd>!buddy dev<cr>", { desc = "Stacks Dev" })
map("n", "<leader>sb", "<cmd>!buddy build<cr>", { desc = "Stacks Build" })
map("n", "<leader>st", "<cmd>!buddy test<cr>", { desc = "Stacks Test" })
map("n", "<leader>sm", "<cmd>!buddy migrate<cr>", { desc = "Stacks Migrate" })
```

## Zed

### Settings

```json
// settings.json
{
  "languages": {
    "TypeScript": {
      "tab_size": 2,
      "formatter": "prettier"
    }
  },
  "file_types": {
    "HTML": ["stx"]
  },
  "lsp": {
    "tailwindcss": {
      "settings": {
        "includeLanguages": {
          "stx": "html"
        }
      }
    }
  }
}
```

## EditorConfig

All IDEs should respect this configuration:

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 2
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false

[*.{yml,yaml}]
indent_size = 2

[Makefile]
indent_style = tab
```

## Git Hooks with Husky

```bash
# Install husky
bun add -d husky lint-staged

# Initialize
bunx husky install

# Add pre-commit hook
bunx husky add .husky/pre-commit "bunx lint-staged"
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{stx,html}": ["prettier --write"],
    "*.{css,scss}": ["prettier --write"]
  }
}
```

## TypeScript Configuration

```json
// tsconfig.json (IDE-relevant settings)
{
  "compilerOptions": {
    // Editor support
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // Path resolution
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"],
      "@config/*": ["./config/*"],
      "@models/*": ["./app/Models/*"],
      "@controllers/*": ["./app/Controllers/*"]
    },

    // Strict checks (better IDE feedback)
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    // Modern features
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["app/**/*", "config/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Troubleshooting IDE Issues

### TypeScript Errors Not Showing

1. Restart TypeScript server:
   - VS Code: `Cmd/Ctrl + Shift + P` > "TypeScript: Restart TS Server"
   - WebStorm: Invalidate caches and restart

2. Check `tsconfig.json` includes your files

3. Ensure `node_modules` is installed

### Tailwind Completion Not Working

1. Verify `tailwind.config.ts` exists
2. Check file associations for `.stx` files
3. Restart Tailwind CSS extension/plugin

### Path Aliases Not Resolving

1. Verify `paths` in `tsconfig.json`
2. Ensure `baseUrl` is set correctly
3. Restart language server

### Slow Performance

1. Add heavy folders to `search.exclude`
2. Disable unnecessary extensions
3. Increase TypeScript memory limit:
   ```json
   "typescript.tsserver.maxTsServerMemory": 4096
   ```
