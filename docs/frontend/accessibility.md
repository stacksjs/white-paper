---
title: Accessibility
description: Building accessible applications with Stacks.js
---

# Accessibility

Stacks.js is designed with accessibility in mind. This guide covers best practices for building applications that work for everyone.

## WCAG Compliance

### Accessibility Levels

| Level | Description | Target |
|-------|-------------|--------|
| A | Minimum accessibility | Required |
| AA | Industry standard | Recommended |
| AAA | Enhanced accessibility | Aspirational |

Stacks default components are designed for **WCAG 2.1 Level AA** compliance.

## Semantic HTML

### Use Proper Elements

```stx
<!-- BAD: Divs for everything -->
<div class="button" onclick="submit()">Submit</div>
<div class="heading">Welcome</div>
<div class="nav">...</div>

<!-- GOOD: Semantic elements -->
<button type="submit">Submit</button>
<h1>Welcome</h1>
<nav>...</nav>
```

### Document Structure

```stx
<x-layout>
  <header>
    <nav aria-label="Main navigation">
      <x-nav-menu />
    </nav>
  </header>

  <main id="main-content">
    <h1>Page Title</h1>
    <article>
      <h2>Section Title</h2>
      <p>Content...</p>
    </article>
  </main>

  <aside aria-label="Sidebar">
    <x-sidebar />
  </aside>

  <footer>
    <x-footer />
  </footer>
</x-layout>
```

### Heading Hierarchy

```stx
<!-- GOOD: Logical heading order -->
<h1>Main Title</h1>
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
    <h3>Subsection 1.2</h3>
  <h2>Section 2</h2>
    <h3>Subsection 2.1</h3>

<!-- BAD: Skipped levels -->
<h1>Main Title</h1>
  <h3>Skipped h2!</h3>
```

## ARIA Attributes

### Roles and Labels

```stx
<!-- Search form -->
<form role="search" aria-label="Site search">
  <x-input
    type="search"
    name="q"
    aria-label="Search query"
    placeholder="Search..."
  />
  <x-button type="submit" aria-label="Submit search">
    <x-icon name="search" aria-hidden="true" />
  </x-button>
</form>

<!-- Navigation -->
<nav aria-label="Breadcrumb">
  <ol role="list">
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Current Product</li>
  </ol>
</nav>
```

### Live Regions

```stx
<!-- Announce dynamic content changes -->
<div
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
>
  {{ notification }}
</div>

<!-- Urgent announcements -->
<div
  role="alert"
  aria-live="assertive"
>
  {{ errorMessage }}
</div>
```

### Expanded/Collapsed State

```stx
<button
  aria-expanded="{{ isOpen }}"
  aria-controls="dropdown-menu"
  @click="toggle"
>
  Menu
  <x-icon :name="isOpen ? 'chevron-up' : 'chevron-down'" aria-hidden="true" />
</button>

<ul
  id="dropdown-menu"
  :hidden="!isOpen"
  role="menu"
>
  <li role="menuitem"><a href="/profile">Profile</a></li>
  <li role="menuitem"><a href="/settings">Settings</a></li>
</ul>
```

## Keyboard Navigation

### Focus Management

```stx
<!-- Skip link -->
<a href="#main-content" class="sr-only focus:not-sr-only">
  Skip to main content
</a>

<!-- Focus visible styling (included in defaults) -->
<style>
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
```

### Focus Trapping (Modals)

```stx
<x-modal
  :open="showModal"
  @close="showModal = false"
  trap-focus
>
  <x-modal-header>
    <h2 id="modal-title">Modal Title</h2>
  </x-modal-header>

  <x-modal-body>
    <p>Modal content...</p>
  </x-modal-body>

  <x-modal-footer>
    <x-button @click="showModal = false">Close</x-button>
  </x-modal-footer>
</x-modal>
```

### Keyboard Shortcuts

```typescript
// Provide keyboard shortcuts for common actions
document.addEventListener('keydown', (e) => {
  // Escape to close modals
  if (e.key === 'Escape') {
    closeModal()
  }

  // Ctrl/Cmd + K for search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  }
})
```

## Forms

### Labels and Descriptions

```stx
<x-form-group>
  <x-label for="email" required>Email Address</x-label>
  <x-input
    id="email"
    type="email"
    name="email"
    aria-describedby="email-hint email-error"
    :aria-invalid="errors.email ? 'true' : 'false'"
  />
  <x-hint id="email-hint">We'll never share your email.</x-hint>
  <x-error id="email-error" :show="errors.email">
    {{ errors.email }}
  </x-error>
</x-form-group>
```

### Error Handling

```stx
<form @submit="handleSubmit" novalidate>
  <!-- Error summary at top -->
  <x-alert
    v-if="hasErrors"
    type="error"
    role="alert"
    aria-live="assertive"
  >
    <h2>Please correct the following errors:</h2>
    <ul>
      @foreach(errors as error)
        <li><a href="#{{ error.field }}">{{ error.message }}</a></li>
      @endforeach
    </ul>
  </x-alert>

  <!-- Form fields... -->
</form>
```

### Required Fields

```stx
<!-- Visual and programmatic indication -->
<x-label for="name" required>
  Name <span aria-hidden="true" class="text-red-500">*</span>
</x-label>
<x-input
  id="name"
  name="name"
  required
  aria-required="true"
/>

<!-- Legend for required fields -->
<p class="text-sm text-gray-600">
  <span aria-hidden="true">*</span> Required fields
</p>
```

## Images and Media

### Image Alt Text

```stx
<!-- Informative images -->
<img
  src="/images/chart.png"
  alt="Sales increased 25% from Q1 to Q2 2024"
/>

<!-- Decorative images -->
<img src="/images/decoration.svg" alt="" role="presentation" />

<!-- Complex images with description -->
<figure>
  <img
    src="/images/org-chart.png"
    alt="Organization chart"
    aria-describedby="org-description"
  />
  <figcaption id="org-description">
    Detailed description of the organizational structure...
  </figcaption>
</figure>
```

### Video Accessibility

```stx
<x-video
  src="/videos/tutorial.mp4"
  poster="/images/tutorial-poster.jpg"
>
  <track
    kind="captions"
    src="/captions/tutorial-en.vtt"
    srclang="en"
    label="English"
    default
  />
  <track
    kind="captions"
    src="/captions/tutorial-es.vtt"
    srclang="es"
    label="Spanish"
  />
  <track
    kind="descriptions"
    src="/descriptions/tutorial.vtt"
    srclang="en"
    label="Audio descriptions"
  />
</x-video>
```

### Audio Content

```stx
<!-- Provide transcripts -->
<audio controls aria-describedby="audio-transcript">
  <source src="/audio/podcast.mp3" type="audio/mpeg" />
</audio>

<details id="audio-transcript">
  <summary>View transcript</summary>
  <div>
    Full transcript of the audio content...
  </div>
</details>
```

## Color and Contrast

### Color Contrast Requirements

| Element | Minimum Ratio (AA) | Enhanced Ratio (AAA) |
|---------|-------------------|---------------------|
| Normal text | 4.5:1 | 7:1 |
| Large text (18px+) | 3:1 | 4.5:1 |
| UI components | 3:1 | 3:1 |

### Don't Rely on Color Alone

```stx
<!-- BAD: Color only indication -->
<span class="text-red-500">Error occurred</span>

<!-- GOOD: Color + icon + text -->
<span class="text-red-500 flex items-center gap-2">
  <x-icon name="alert-circle" aria-hidden="true" />
  Error: Invalid email format
</span>

<!-- GOOD: Charts with patterns -->
<x-chart
  :data="data"
  use-patterns
  accessible-colors
/>
```

### Dark Mode Considerations

```typescript
// config/theme.ts
export default {
  colors: {
    light: {
      text: '#1a1a1a',      // High contrast on white
      background: '#ffffff',
    },
    dark: {
      text: '#f5f5f5',      // High contrast on dark
      background: '#1a1a1a',
    }
  }
}
```

## Tables

### Accessible Data Tables

```stx
<table>
  <caption>Monthly Sales Report - 2024</caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Revenue</th>
      <th scope="col">Growth</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">January</th>
      <td>$50,000</td>
      <td>+5%</td>
    </tr>
    <tr>
      <th scope="row">February</th>
      <td>$55,000</td>
      <td>+10%</td>
    </tr>
  </tbody>
</table>
```

### Complex Tables

```stx
<table>
  <caption>Quarterly Revenue by Region</caption>
  <thead>
    <tr>
      <td></td>
      <th scope="col" id="q1">Q1</th>
      <th scope="col" id="q2">Q2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row" id="north">North</th>
      <td headers="q1 north">$100k</td>
      <td headers="q2 north">$120k</td>
    </tr>
    <tr>
      <th scope="row" id="south">South</th>
      <td headers="q1 south">$80k</td>
      <td headers="q2 south">$90k</td>
    </tr>
  </tbody>
</table>
```

## Testing Accessibility

### Automated Testing

```bash
# Run accessibility audit
buddy a11y:check

# In tests
import { axe } from '@stacksjs/testing'

test('page is accessible', async () => {
  const page = await render('/dashboard')
  const results = await axe(page)

  expect(results.violations).toHaveLength(0)
})
```

### Manual Testing Checklist

- [ ] All content accessible via keyboard
- [ ] Focus order is logical
- [ ] Focus is visible
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets requirements
- [ ] Forms have proper labels
- [ ] Error messages are clear and announced
- [ ] Images have appropriate alt text
- [ ] Videos have captions
- [ ] No content flashes more than 3 times/second

### Screen Reader Testing

Test with:
- **macOS**: VoiceOver (built-in)
- **Windows**: NVDA (free), JAWS
- **Mobile**: VoiceOver (iOS), TalkBack (Android)

```bash
# Enable VoiceOver on macOS
# Cmd + F5

# Common VoiceOver shortcuts
# VO + Right Arrow: Move forward
# VO + Left Arrow: Move backward
# VO + Space: Activate element
```

## Utility Classes

### Screen Reader Only

```stx
<!-- Visually hidden but accessible to screen readers -->
<span class="sr-only">Loading, please wait</span>

<!-- CSS definition (included in defaults) -->
<style>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.not-sr-only {
  position: static;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
</style>
```

### Focus Styles

```stx
<!-- Visible focus on keyboard navigation -->
<style>
.focus-visible:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.focus-within:focus-within {
  ring: 2px solid var(--color-primary);
}
</style>
```

## Component Accessibility

All built-in STX components are accessible by default:

| Component | Accessibility Features |
|-----------|----------------------|
| `<x-button>` | Proper role, keyboard support |
| `<x-modal>` | Focus trap, escape to close, aria-modal |
| `<x-dropdown>` | Arrow key navigation, proper roles |
| `<x-tabs>` | Arrow key switching, proper roles |
| `<x-accordion>` | Expand/collapse with Enter/Space |
| `<x-alert>` | role="alert" for important messages |
| `<x-form-group>` | Associated labels and descriptions |

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Inclusive Components](https://inclusive-components.design/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
