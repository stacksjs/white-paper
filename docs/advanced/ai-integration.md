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

## Buddy AI Assistant

Buddy is an AI-powered development assistant integrated into the Stacks CLI:

```bash
# Voice-activated code modifications
buddy ai chat

# Codebase exploration
buddy ai explore "How does authentication work?"

# Code generation
buddy ai generate "Create a REST API for blog posts"

# Code review
buddy ai review app/Actions/CreateUserAction.ts
```

### Buddy Capabilities

- **Natural Language Coding**: Describe changes in plain English
- **Codebase Understanding**: AI reads and understands your project structure
- **Intelligent Suggestions**: Context-aware recommendations
- **Voice Input**: Speak commands instead of typing
- **Multi-File Edits**: Coordinated changes across files

## AI-Powered Development

AI integration extends throughout the development workflow:

### Smart Scaffolding

```bash
buddy make:action "Create an action that processes refund requests"
# AI generates appropriate validation, authorization, and logic
```

### Documentation Generation

```bash
buddy docs:generate
# AI reads code and generates comprehensive documentation
```

### Test Generation

```bash
buddy test:generate app/Actions/CreateUserAction.ts
# AI creates relevant test cases based on action logic
```

### Error Explanation

When errors occur, Buddy can explain:

```
Error: Cannot read property 'id' of undefined at CreatePostAction.ts:23

Buddy: This error occurs because request.user is undefined.
       The route is missing the 'auth' middleware. Add it to
       routes/api.ts or the action's middleware property.
```
