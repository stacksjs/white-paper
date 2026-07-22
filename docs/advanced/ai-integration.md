---
title: AI Integration
description: Leveraging AI capabilities in Stacks.js applications
---

# AI Integration

## Multi-Provider Support

Stacks provides a unified API for multiple AI providers:

```typescript
// config/ai.ts
export default {
  default: 'claude',

  providers: {
    claude: {
      driver: 'anthropic',
      model: 'claude-sonnet-4-20250514', // or claude-opus-4-20250514
      apiKey: env('ANTHROPIC_API_KEY'),
    },
    openai: {
      driver: 'openai',
      model: 'gpt-4o',
      apiKey: env('OPENAI_API_KEY'),
    },
    ollama: {
      driver: 'ollama',
      model: 'llama2',
      baseUrl: 'http://localhost:11434',
    },
  },
}
```

### Unified Usage

```typescript
import { AI } from '@stacksjs/ai'

// Simple completion
const response = await AI.complete('Explain TypeScript generics')

// Chat conversation
const chat = AI.chat()
await chat.send('Hello!')
const reply = await chat.send('What is Stacks.js?')

// Streaming
const stream = await AI.stream('Write a poem about coding')
for await (const chunk of stream) {
  process.stdout.write(chunk)
}

// Structured output
const analysis = await AI.complete({
  prompt: 'Analyze this code for bugs',
  context: codeSnippet,
  format: 'json',
  schema: BugReportSchema,
})

// Provider switching
const response = await AI.using('openai').complete('...')
```

## AI-efficient application authoring

Provider calls and authoring context are separate concerns. `@stacksjs/ai`
connects a running application to configured models. `buddy ai:context` prepares
a compact, deterministic description of a Stacks application for an external
coding assistant and does not require an application AI key.

```bash
# Human-readable, bounded context
buddy ai:context

# Machine-readable contract for an agent or editor integration
buddy ai:context --json --output .stacks/ai-context.json

# Choose an explicit prompt budget and record the target model name
buddy ai:context --max-chars 4000 --model claude-sonnet
```

The versioned output describes MVA roles, override order, application scripts,
dependency names, capability surfaces, and representative application files.
Its ordering is stable so the same project state produces reviewable diffs.

The scanner excludes dependency trees such as `node_modules`, lockfiles, build
output, caches, environment files, credentials, private keys, and common secret
files. This does not mean Stacks has no dependencies. It means installed package
source is package-manager state, not application-owned code that an LLM should
regenerate or ingest by default.

## Why conventions save code tokens

An LLM working in a composition-first project may need to generate adapters,
validation glue, schema copies, routing wrappers, test setup, and provider wiring
before it reaches domain behavior. Stacks supplies much of that recurring shape
through Models, Actions, traits, defaults, generators, and override conventions.
The generated code can therefore focus on what is unique to the application.

That can reduce both output tokens and prompt tokens:

- fewer app-owned files and repeated declarations need to be generated;
- less framework glue needs to be reread during later edits;
- compact context preserves application intent without copying dependencies;
- conventional locations make generated changes easier for humans and tools to review.

The command reports character counts and a documented heuristic token estimate
for the compact representation and a broad legacy comparison. Those values are
input-size diagnostics, not provider billing, correctness, model quality, or
latency benchmarks. Always retain normal review, tests, type checks, and security
controls for AI-generated changes.
