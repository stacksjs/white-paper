---
title: STX Components
description: Built-in UI components available in Stacks.js
---

# STX Components

Stacks.js includes a broad component set built with STX and styled with Crosswind. Treat component count, tree-shaking, accessibility, and dark-mode behavior as version-specific properties to verify against the selected package and application build.

> **Protocol context** — This guide covers the Stacks.js View implementation. The draft [Model–View–Action architecture](https://github.com/stacksjs/white-paper#21-modelviewaction) defines portable responsibilities; STX and Crosswind remain TypeScript/Bun-specific choices.

## Form Input Components

### TextInput

Versatile text input with icons, clear button, and character counter:

```stx
<x-text-input
  label="Username"
  placeholder="Enter your username"
  :value="username"
  @change="username = $event"
  left-icon="user"
  clearable
  :max-length="20"
  show-count
/>

<x-text-input
  label="Email"
  type="email"
  :error="errors.email"
  helper-text="We'll never share your email"
  required
/>
```

**Props:** `value`, `placeholder`, `disabled`, `readonly`, `size` (sm/md/lg), `error`, `label`, `helperText`, `required`, `leftIcon`, `rightIcon`, `clearable`, `maxLength`, `showCount`

### EmailInput

Email input with built-in validation:

```stx
<x-email-input
  label="Email Address"
  :value="email"
  @change="email = $event"
  required
/>
```

### PasswordInput

Password input with visibility toggle and strength indicator:

```stx
<x-password-input
  label="Password"
  :value="password"
  @change="password = $event"
  show-strength
  required
/>
```

**Props:** `showStrength` enables the password strength indicator

### NumberInput

Number input with increment/decrement controls:

```stx
<x-number-input
  label="Quantity"
  :value="quantity"
  @change="quantity = $event"
  :min="1"
  :max="100"
  :step="1"
  show-controls
/>
```

### SearchInput

Search input with debounced callback and loading state:

```stx
<x-search-input
  placeholder="Search products..."
  :value="query"
  @search="handleSearch"
  :loading="isSearching"
/>
```

### Textarea

Multi-line input with auto-resize:

```stx
<x-textarea
  label="Description"
  :value="description"
  @change="description = $event"
  :rows="4"
  auto-resize
  :max-rows="10"
  :max-length="500"
  show-count
/>
```

### Checkbox

Checkbox with indeterminate state support:

```stx
<x-checkbox
  :checked="agreeToTerms"
  @change="agreeToTerms = $event"
  label="I agree to the terms and conditions"
  description="By checking this box, you agree to our Terms of Service"
/>

<!-- Indeterminate state for "select all" -->
<x-checkbox
  :checked="allSelected"
  :indeterminate="someSelected"
  @change="toggleAll"
  label="Select All"
/>
```

### Radio

Radio button with description:

```stx
<x-radio
  :checked="plan === 'pro'"
  @change="plan = 'pro'"
  value="pro"
  name="plan"
  label="Pro Plan"
  description="$29/month - Unlimited projects"
/>
```

### Select

Native-style select dropdown:

```stx
<x-select
  label="Country"
  :value="country"
  @change="country = $event"
  :options="countries"
  placeholder="Select a country"
  required
/>
```

## Buttons & Actions

### Button

Versatile button with multiple variants:

```stx
<!-- Variants -->
<x-button variant="primary">Primary</x-button>
<x-button variant="secondary">Secondary</x-button>
<x-button variant="outline">Outline</x-button>
<x-button variant="ghost">Ghost</x-button>
<x-button variant="danger">Danger</x-button>

<!-- Sizes -->
<x-button size="xs">Extra Small</x-button>
<x-button size="sm">Small</x-button>
<x-button size="md">Medium</x-button>
<x-button size="lg">Large</x-button>
<x-button size="xl">Extra Large</x-button>

<!-- States -->
<x-button :loading="isSubmitting">Submit</x-button>
<x-button :disabled="!isValid">Save</x-button>

<!-- With icons -->
<x-button left-icon="plus">Add Item</x-button>
<x-button right-icon="arrow-right">Continue</x-button>

<!-- Full width -->
<x-button full-width>Full Width Button</x-button>
```

## Layout Components

### Card

Content card with image support:

```stx
<x-card variant="elevated" hover clickable>
  <x-card-image src="/product.jpg" alt="Product" />
  <x-card-header>
    <h3>Product Name</h3>
    <p class="text-gray-500">$99.00</p>
  </x-card-header>
  <x-card-content>
    <p>Product description goes here.</p>
  </x-card-content>
  <x-card-footer>
    <x-button>Add to Cart</x-button>
  </x-card-footer>
</x-card>
```

**Variants:** `default`, `outlined`, `elevated`, `flat`

### Accordion

Expandable content sections:

```stx
<x-accordion :items="faqItems" allow-multiple>
  @foreach(faqItems as item)
    <x-accordion-item :key="item.id">
      <x-accordion-trigger>{{ item.question }}</x-accordion-trigger>
      <x-accordion-content>{{ item.answer }}</x-accordion-content>
    </x-accordion-item>
  @endforeach
</x-accordion>
```

### Tabs

Tabbed content interface:

```stx
<x-tabs :default-tab="'overview'" variant="pills">
  <x-tab-list>
    <x-tab value="overview">Overview</x-tab>
    <x-tab value="features">Features</x-tab>
    <x-tab value="pricing">Pricing</x-tab>
  </x-tab-list>

  <x-tab-panels>
    <x-tab-panel value="overview">
      Overview content here...
    </x-tab-panel>
    <x-tab-panel value="features">
      Features content here...
    </x-tab-panel>
    <x-tab-panel value="pricing">
      Pricing content here...
    </x-tab-panel>
  </x-tab-panels>
</x-tabs>
```

**Variants:** `line`, `pills`, `enclosed`

### Breadcrumb

Navigation breadcrumbs:

```stx
<x-breadcrumb :items="breadcrumbs" :max-items="4">
  <template #separator>
    <span class="mx-2">/</span>
  </template>
</x-breadcrumb>
```

### Stepper

Multi-step progress indicator:

```stx
<x-stepper :current-step="currentStep" orientation="horizontal">
  <x-step :step="1" title="Account" description="Create your account" />
  <x-step :step="2" title="Profile" description="Set up your profile" />
  <x-step :step="3" title="Complete" description="Review and confirm" />
</x-stepper>
```

### Table

Responsive table component:

```stx
<x-table striped hoverable>
  <x-table-head>
    <x-table-row>
      <x-table-header>Name</x-table-header>
      <x-table-header>Email</x-table-header>
      <x-table-header>Role</x-table-header>
    </x-table-row>
  </x-table-head>
  <x-table-body>
    @foreach(users as user)
      <x-table-row :key="user.id" hoverable>
        <x-table-cell>{{ user.name }}</x-table-cell>
        <x-table-cell>{{ user.email }}</x-table-cell>
        <x-table-cell>
          <x-badge>{{ user.role }}</x-badge>
        </x-table-cell>
      </x-table-row>
    @endforeach
  </x-table-body>
</x-table>
```

## Dropdown & Selection

### Dropdown

Menu dropdown component:

```stx
<x-dropdown>
  <x-dropdown-button>
    Options
  </x-dropdown-button>

  <x-dropdown-items>
    <x-dropdown-item @click="edit">Edit</x-dropdown-item>
    <x-dropdown-item @click="duplicate">Duplicate</x-dropdown-item>
    <x-dropdown-divider />
    <x-dropdown-item @click="delete" class="text-red-500">Delete</x-dropdown-item>
  </x-dropdown-items>
</x-dropdown>
```

### Listbox

Custom select with keyboard support:

```stx
<x-listbox :value="selected" @change="selected = $event">
  <x-listbox-label>Assign to</x-listbox-label>
  <x-listbox-button>{{ selected.name }}</x-listbox-button>
  <x-listbox-options>
    @foreach(people as person)
      <x-listbox-option :key="person.id" :value="person">
        {{ person.name }}
      </x-listbox-option>
    @endforeach
  </x-listbox-options>
</x-listbox>
```

### Combobox

Searchable select with filtering:

```stx
<x-combobox :value="selected" @change="selected = $event">
  <x-combobox-input
    :display-value="(item) => item?.name"
    @change="query = $event.target.value"
  />
  <x-combobox-button />
  <x-combobox-options>
    @foreach(filteredItems as item)
      <x-combobox-option :key="item.id" :value="item">
        {{ item.name }}
      </x-combobox-option>
    @endforeach
  </x-combobox-options>
</x-combobox>
```

### RadioGroup

Radio button group:

```stx
<x-radio-group :value="plan" @change="plan = $event">
  <x-radio-group-label>Select a plan</x-radio-group-label>

  @foreach(plans as p)
    <x-radio-group-option :key="p.id" :value="p">
      <x-radio-group-label>{{ p.name }}</x-radio-group-label>
      <x-radio-group-description>{{ p.description }}</x-radio-group-description>
    </x-radio-group-option>
  @endforeach
</x-radio-group>
```

## Display & Feedback

### Badge

Labels and tags:

```stx
<x-badge>Default</x-badge>
<x-badge variant="primary">Primary</x-badge>
<x-badge variant="success">Success</x-badge>
<x-badge variant="warning">Warning</x-badge>
<x-badge variant="danger">Danger</x-badge>

<!-- With dot indicator -->
<x-badge variant="success" dot>Active</x-badge>

<!-- Removable -->
<x-badge removable @remove="removeTag(tag)">{{ tag }}</x-badge>
```

### Avatar

User avatars with fallback:

```stx
<!-- With image -->
<x-avatar src="/user.jpg" alt="John Doe" size="lg" />

<!-- With initials fallback -->
<x-avatar initials="JD" size="md" />

<!-- With status indicator -->
<x-avatar src="/user.jpg" status="online" />

<!-- Square shape -->
<x-avatar src="/user.jpg" shape="square" />
```

**Sizes:** `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
**Status:** `online`, `offline`, `away`, `busy`

### Spinner

Loading spinners:

```stx
<x-spinner />
<x-spinner variant="dots" />
<x-spinner variant="bars" />
<x-spinner variant="ring" />

<!-- With label -->
<x-spinner label="Loading..." />

<!-- Custom color -->
<x-spinner color="primary" />
```

### Skeleton

Loading placeholders:

```stx
<x-skeleton variant="text" />
<x-skeleton variant="title" />
<x-skeleton variant="avatar" />
<x-skeleton variant="thumbnail" />
<x-skeleton variant="button" />
<x-skeleton variant="card" />

<!-- Multiple lines -->
<x-skeleton variant="text" :count="3" />

<!-- Custom size -->
<x-skeleton width="200px" height="20px" />
```

### Progress

Progress indicators:

```stx
<!-- Linear -->
<x-progress :value="75" :max="100" show-label />

<!-- Circular -->
<x-progress :value="75" variant="circular" size="lg" />

<!-- Indeterminate -->
<x-progress indeterminate />
```

### Notification

Toast notifications:

```stx
<x-notification
  :show="showNotification"
  title="Success!"
  message="Your changes have been saved."
  type="success"
  position="top-right"
  :duration="5000"
  @close="showNotification = false"
/>
```

**Types:** `info`, `success`, `warning`, `error`
**Positions:** `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`

### Tooltip

Contextual tooltips:

```stx
<x-tooltip content="This is helpful information" position="top">
  <x-button>Hover me</x-button>
</x-tooltip>
```

## Overlay Components

### Dialog

Modal dialog:

```stx
<x-dialog :open="isOpen" @close="isOpen = false">
  <x-dialog-backdrop />

  <x-dialog-panel>
    <x-dialog-title>Confirm Action</x-dialog-title>
    <x-dialog-description>
      Are you sure you want to delete this item?
    </x-dialog-description>

    <div class="mt-4 flex gap-2">
      <x-button variant="danger" @click="confirmDelete">Delete</x-button>
      <x-button variant="ghost" @click="isOpen = false">Cancel</x-button>
    </div>
  </x-dialog-panel>
</x-dialog>
```

### Drawer

Slide-out panel:

```stx
<x-drawer :open="isOpen" @close="isOpen = false" position="right" title="Settings">
  <div class="p-4">
    <!-- Drawer content -->
  </div>
</x-drawer>
```

**Positions:** `right`, `left`, `top`, `bottom`

### Popover

Floating panel:

```stx
<x-popover>
  <x-popover-button>
    <x-button>Open Popover</x-button>
  </x-popover-button>

  <x-popover-panel position="bottom">
    <div class="p-4">
      Popover content here...
    </div>
  </x-popover-panel>
</x-popover>
```

## Media Components

### Image

Optimized images with lazy loading:

```stx
<x-image
  src="/photo.jpg"
  webp-src="/photo.webp"
  alt="Description"
  :width="800"
  :height="600"
  lazy
  placeholder="blur"
  :blur-data-url="blurDataUrl"
  aspect-ratio="16/9"
  object-fit="cover"
  rounded
  zoom-on-hover
/>
```

### Video

Video player:

```stx
<x-video
  src="/video.mp4"
  poster="/poster.jpg"
  controls
  :autoplay="false"
  :loop="false"
  aspect-ratio="16/9"
/>
```

### Audio

Audio player:

```stx
<x-audio
  src="/audio.mp3"
  controls
  show-waveform
  title="Podcast Episode 1"
/>
```

## Advanced Components

### VirtualList

Windowed list for large datasets:

```stx
<x-virtual-list
  :items="largeDataset"
  :item-height="50"
  :height="400"
  :overscan="5"
>
  <template #item="{ item, index }">
    <div class="p-4 border-b">
      {{ item.name }}
    </div>
  </template>
</x-virtual-list>
```

### VirtualTable

Windowed table for large datasets:

```stx
<x-virtual-table
  :columns="columns"
  :data="largeDataset"
  :row-height="48"
  :height="600"
  striped
  hoverable
/>
```

### CommandPalette

Searchable command menu (Cmd+K style):

```stx
<x-command-palette
  :open="isOpen"
  @close="isOpen = false"
  :query="searchQuery"
  @query-change="searchQuery = $event"
>
  <x-command-group heading="Actions">
    <x-command-item @select="createNew">Create New...</x-command-item>
    <x-command-item @select="search">Search...</x-command-item>
  </x-command-group>

  <x-command-group heading="Navigation">
    <x-command-item @select="goToDashboard">Dashboard</x-command-item>
    <x-command-item @select="goToSettings">Settings</x-command-item>
  </x-command-group>
</x-command-palette>
```

## Business Components

### Form

Form wrapper with validation:

```stx
<x-form
  :validation-schema="schema"
  :initial-values="formData"
  @submit="handleSubmit"
  @error="handleError"
>
  <x-text-input name="name" label="Name" required />
  <x-email-input name="email" label="Email" required />
  <x-textarea name="message" label="Message" />

  <x-button type="submit">Submit</x-button>
</x-form>
```

### Auth Components

Pre-built authentication forms:

```stx
<!-- Login -->
<x-login
  show-logo
  show-social-login
  show-remember-me
  show-forgot-password
  show-signup
  @submit="handleLogin"
/>

<!-- Signup -->
<x-signup
  show-social-signup
  @submit="handleSignup"
/>

<!-- Two-Factor Challenge -->
<x-two-factor-challenge
  :code-length="6"
  @submit="handleTwoFactor"
  @use-recovery-code="showRecoveryForm = true"
/>
```

### Payment Components

Stripe integration components:

```stx
<!-- Checkout -->
<x-checkout
  :products="cartItems"
  :stripe-public-key="stripeKey"
  api-url="/api/checkout"
  @submit="handleCheckout"
  @remove-product="removeFromCart"
  shipping
  taxes
/>

<!-- Subscription Checkout -->
<x-subscription-checkout
  :products="subscriptionPlans"
  :stripe-public-key="stripeKey"
  api-url="/api/subscribe"
/>

<!-- Payment Methods -->
<x-payment-methods
  :stripe-public-key="stripeKey"
  api-url="/api/payment-methods"
/>
```

## Transition Component

Animation wrapper for enter/leave transitions:

```stx
<x-transition
  :show="isVisible"
  preset="fade"
  :duration="300"
>
  <div>Content to animate</div>
</x-transition>

<!-- Custom transitions -->
<x-transition
  :show="isVisible"
  enter="transition-opacity duration-300"
  enter-from="opacity-0"
  enter-to="opacity-100"
  leave="transition-opacity duration-300"
  leave-from="opacity-100"
  leave-to="opacity-0"
>
  <div>Custom animated content</div>
</x-transition>
```

**Presets:** `fade`, `slide`, `slideLeft`, `slideRight`, `scale`, `rotate`, `zoom`

## Component Theming

All components support theming via Crosswind:

```typescript
// crosswind.config.ts
export default {
  theme: {
    extend: {
      components: {
        button: {
          primary: 'bg-blue-600 hover:bg-blue-700 text-white',
          secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        },
        input: {
          base: 'border border-gray-300 rounded-lg',
          focus: 'ring-2 ring-blue-500',
          error: 'border-red-500',
        },
      },
    },
  },
}
```
