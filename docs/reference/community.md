---
title: Community & Contributing
description: How to get involved with the Stacks.js community and contribute to the project
---

# Community & Contributing

Stacks.js is built by developers, for developers. We welcome contributions of all kinds—code, documentation, ideas, and feedback.

## Community Channels

### Discord

Join our Discord server for real-time discussions, help, and community interaction.

- **#general** - General discussion and announcements
- **#help** - Get help with Stacks.js questions
- **#showcase** - Share what you've built
- **#ideas** - Discuss feature ideas
- **#contributors** - Contributor coordination

### GitHub

- **[stacksjs/stacks](https://github.com/stacksjs/stacks)** - Main framework repository
- **[Issues](https://github.com/stacksjs/stacks/issues)** - Bug reports and feature requests
- **[Discussions](https://github.com/stacksjs/stacks/discussions)** - Q&A and general discussions
- **[Pull Requests](https://github.com/stacksjs/stacks/pulls)** - Code contributions

### Social

- **Twitter/X**: [@stacksjs](https://twitter.com/stacksjs)
- **Blog**: [stacksjs.org/blog](https://stacksjs.org/blog)

## Contributing Code

### Getting Started

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/stacks.git
cd stacks

# 3. Install dependencies
bun install

# 4. Create a feature branch
git checkout -b feature/my-awesome-feature

# 5. Make your changes and test
bun run test
bun run lint

# 6. Commit your changes (follow commit conventions)
git commit -m "feat: add awesome feature"

# 7. Push and create a pull request
git push origin feature/my-awesome-feature
```

### Development Setup

```bash
# Install Stacks CLI globally for development
bun link

# Run the development server
buddy dev

# Run tests in watch mode
bun run test:watch

# Build all packages
bun run build

# Lint and format
bun run lint:fix
```

### Code Style

We use automated tools to maintain consistent code style:

```bash
# Format code
bun run format

# Lint code
bun run lint

# Type check
bun run typecheck
```

**Guidelines:**
- TypeScript strict mode enabled
- No `any` types (use `unknown` and narrow)
- Prefer functional patterns where appropriate
- Write self-documenting code (minimal comments)
- Keep functions focused and small
- Use descriptive variable names

### Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Maintenance tasks

**Examples:**
```
feat(router): add wildcard route support
fix(orm): resolve N+1 query in belongsToMany
docs(readme): update installation instructions
perf(cache): optimize tag-based invalidation
```

### Pull Request Process

1. **Create a focused PR** - One feature or fix per PR
2. **Write a clear description** - Explain what and why
3. **Include tests** - All new code should have tests
4. **Update documentation** - If applicable
5. **Ensure CI passes** - All checks must be green
6. **Respond to feedback** - Address review comments

**PR Template:**
```markdown
## Summary
Brief description of changes

## Changes
- List of specific changes
- Another change

## Testing
How to test these changes

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Types are correct
- [ ] Follows code style
```

## RFC Process

Significant changes go through our RFC (Request for Comments) process:

### When to Write an RFC

- New major features
- Breaking changes
- Architectural changes
- Changes affecting public APIs

### RFC Template

```markdown
# RFC: Feature Name

## Summary
One paragraph explanation.

## Motivation
Why are we doing this? What problems does it solve?

## Detailed Design
Technical details of the implementation.

## Drawbacks
What are the downsides?

## Alternatives
What other designs were considered?

## Adoption Strategy
How will existing users adopt this?

## Unresolved Questions
What needs to be resolved before implementation?
```

### RFC Stages

1. **Draft** - Initial proposal, open for feedback
2. **Discussion** - Active community discussion
3. **Final Comment Period** - Last chance for feedback
4. **Accepted** - Approved for implementation
5. **Implemented** - Feature is complete

## Contributing Documentation

Documentation is crucial. Here's how to contribute:

### Documentation Types

- **Guides** - Step-by-step tutorials
- **API Reference** - Technical specifications
- **Examples** - Code samples
- **Explanations** - Conceptual content

### Writing Style

- **Be concise** - Get to the point
- **Use examples** - Show, don't just tell
- **Be accurate** - Test all code samples
- **Be inclusive** - Avoid jargon, explain terms
- **Use active voice** - "Run the command" not "The command should be run"

### Documentation Structure

```bash
docs/
├── introduction/     # Getting started content
├── guide/            # Core feature guides
├── advanced/         # Advanced topics
├── reference/        # API reference
└── examples/         # Complete examples
```

## Reporting Issues

### Bug Reports

Good bug reports help us fix issues faster:

```markdown
**Environment:**
- Stacks version: X.X.X
- Bun version: X.X.X
- OS: macOS/Linux/Windows
- Node version (if applicable): X.X.X

**Description:**
Clear description of the bug.

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen.

**Actual Behavior:**
What actually happens.

**Code Sample:**
```typescript
// Minimal reproduction
```

**Additional Context:**
Screenshots, logs, etc.
```

### Feature Requests

```markdown
**Problem:**
What problem are you trying to solve?

**Proposed Solution:**
How do you think it should work?

**Alternatives Considered:**
What other solutions have you thought about?

**Additional Context:**
Any other relevant information.
```

## Governance

### Core Team

The core team maintains the framework direction and reviews contributions. Current members are listed on GitHub.

### Decision Making

- **Minor changes**: Core team member approval
- **Moderate changes**: Two core team member approvals
- **Major changes**: RFC process + core team consensus

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **Patch (0.0.X)**: Bug fixes, no breaking changes
- **Minor (0.X.0)**: New features, backward compatible
- **Major (X.0.0)**: Breaking changes

### Release Schedule

- **Patch releases**: As needed
- **Minor releases**: Monthly (approximately)
- **Major releases**: When necessary (with ample notice)

## Sponsorship

### Why Sponsor?

Sponsoring Stacks.js helps:
- Fund full-time development
- Maintain infrastructure
- Support community events
- Ensure long-term sustainability

### Sponsor Tiers

**Individual Sponsors:**
- GitHub Sponsors
- Open Collective

**Corporate Sponsors:**
- Logo on website
- Priority support
- Feature input

**Current Sponsors:**
- JetBrains
- Solana Foundation

### Becoming a Sponsor

Visit our [GitHub Sponsors](https://github.com/sponsors/stacksjs) or [Open Collective](https://opencollective.com/stacksjs) page.

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone.

### Our Standards

**Positive behaviors:**
- Using welcoming language
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards others

**Unacceptable behaviors:**
- Harassment of any kind
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other unprofessional conduct

### Enforcement

Violations can be reported to the core team. All reports will be reviewed and investigated, and appropriate action will be taken.

## Recognition

We value all contributions! Contributors are recognized through:

- **Contributors page** on GitHub
- **Changelog mentions** for notable contributions
- **Shoutouts** in release notes and social media
- **Swag** for significant contributors

Thank you for being part of the Stacks.js community!
