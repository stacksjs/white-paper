---
title: Desktop Applications
description: Build cross-platform desktop apps with Stacks.js and Craft
---

# Desktop Applications

Stacks.js integrates with Craft, a lightweight high-performance desktop framework built in Zig, to create cross-platform desktop and mobile applications with minimal footprint.

## Overview

Craft is Stacks.js's native desktop solution that competes with Electron and Tauri. Built entirely in Zig with direct OS bindings, it delivers exceptional performance with minimal resource consumption.

### Key Benefits

| Metric | Craft | Electron | Tauri |
|--------|-------|----------|-------|
| **Startup Time** | 50ms | 230ms | 100ms |
| **Idle Memory** | 14KB | 68MB | ~80MB |
| **Binary Size** | 3MB | 135MB | ~2MB |
| **IPC Throughput** | 2.89µs | 2.16ms | varies |

**Supported Platforms:**

| Platform | Status | WebView | Binary Size |
|----------|--------|---------|-------------|
| **macOS** | Production | WKWebView | ~1.4MB |
| **Windows** | Production | WebView2 (Edge) | ~1.6MB |
| **Linux** | Production | WebKit2GTK | ~1.5MB |
| **iOS** | Beta | WKWebView + UIKit | Native |
| **Android** | Beta | Android WebView | Native |

- **Tiny Binaries**: 1.4-3MB vs Electron's 135MB+
- **Instant Startup**: 50ms cold start (4.5x faster than Electron)
- **Minimal Memory**: 14KB idle (4857x less than Electron)
- **Native Performance**: Direct OS bindings via Zig
- **Cross-Platform**: Windows, macOS, Linux, iOS, Android
- **35+ Native Components**: Built-in UI widgets
- **TypeScript-First**: No Zig knowledge required

## Getting Started

### Installation

```bash
# Create new desktop app
bun create craft my-app
cd my-app
bun run dev
```

### Simple Example

```typescript
import { show } from 'ts-craft'

const html = `
<!DOCTYPE html>
<html>
<body style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <h1 style="color: white; text-align: center; padding-top: 40%;">
    ⚡ My First Craft App
  </h1>
</body>
</html>
`

await show(html, {
  title: 'My App',
  width: 800,
  height: 600,
})
```

### CLI Quick Prototyping

```bash
# Point to any URL
craft http://localhost:3000

# With options
craft http://localhost:3000 \
  --title "My App" \
  --width 1200 \
  --height 800 \
  --dev-tools
```

## Configuration

### Craft Configuration

```toml
# craft.toml
[window]
title = "My Application"
width = 1200
height = 800
min_width = 800
min_height = 600
resizable = true
frameless = false
transparent = false
always_on_top = false
center = true
fullscreen = false

[webview]
dev_tools = true
user_agent = "MyApp/1.0"
url = "http://localhost:3000"

[app]
hot_reload = true
system_tray = false
log_level = "info"

[build]
output_dir = "dist"
```

### TypeScript Configuration

```typescript
// config/desktop.ts
export default {
  // Application info
  productName: 'My App',
  identifier: 'com.mycompany.myapp',
  version: '1.0.0',

  // Window configuration
  window: {
    title: 'My Application',
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    frameless: false,
    transparent: false,
    alwaysOnTop: false,
    center: true,
  },

  // Development
  dev: {
    hotReload: true,
    devTools: true,
  },

  // System tray
  tray: {
    enabled: false,
    icon: 'icons/tray.png',
  },

  // Build
  build: {
    targets: ['macos', 'windows', 'linux'],
  },
}
```

## Window Management

### Creating Windows

```typescript
import { Window } from 'ts-craft'

// Create main window
const mainWindow = await Window.create({
  title: 'Main Window',
  url: '/index.html',
  width: 1200,
  height: 800,
  center: true,
})

// Create secondary window
const settingsWindow = await Window.create({
  title: 'Settings',
  url: '/settings.html',
  width: 600,
  height: 400,
  parent: mainWindow, // Makes it a child window
})
```

### Window Operations

```typescript
// Show/hide
await window.show()
await window.hide()
await window.toggle()

// Size and position
await window.setSize(800, 600)
await window.setPosition(100, 100)
await window.center()

// State
await window.minimize()
await window.maximize()
await window.fullscreen(true)
await window.setAlwaysOnTop(true)

// Close
await window.close()
```

### Window Properties

```typescript
// Get window state
const isVisible = await window.isVisible()
const isMaximized = await window.isMaximized()
const isFullscreen = await window.isFullscreen()
const size = await window.getSize()
const position = await window.getPosition()
```

### Frameless Windows

```typescript
const window = await Window.create({
  title: 'Frameless',
  frameless: true,
  transparent: true,
  width: 400,
  height: 300,
})

// Add custom title bar in HTML
const html = `
<div style="-webkit-app-region: drag; height: 30px; background: #333;">
  <button style="-webkit-app-region: no-drag;" onclick="window.craft.window.close()">×</button>
</div>
<div>Content here</div>
`
```

## System Tray / Menubar Apps

Craft excels at building lightweight system tray applications.

### Basic Tray App

```typescript
import { Tray, Window } from 'ts-craft'

// Create tray icon
const tray = await Tray.create({
  icon: 'icons/tray.png',
  tooltip: 'My App',
})

// Create hidden window
const window = await Window.create({
  title: 'Tray App',
  width: 300,
  height: 400,
  show: false,
})

// Toggle window on click
tray.onClick(() => {
  window.toggle()
})

// Right-click menu
tray.setMenu([
  { label: 'Show', click: () => window.show() },
  { label: 'Hide', click: () => window.hide() },
  { type: 'separator' },
  { label: 'Quit', click: () => process.exit(0) },
])
```

### Menubar Timer Example

```typescript
import { Tray } from 'ts-craft'

let seconds = 0
let running = false

const tray = await Tray.create({
  icon: 'icons/timer.png',
})

function updateTitle() {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  tray.setTitle(`${mins}:${secs.toString().padStart(2, '0')}`)
}

tray.onClick(() => {
  running = !running
  if (running) {
    setInterval(() => {
      seconds++
      updateTitle()
    }, 1000)
  }
})

tray.setMenu([
  { label: running ? 'Pause' : 'Start', click: () => tray.click() },
  { label: 'Reset', click: () => { seconds = 0; updateTitle() } },
  { type: 'separator' },
  { label: 'Quit', click: () => process.exit(0) },
])
```

## Native Components

Craft includes 35+ native UI components that render using platform-native widgets.

### Available Components

**Input Components:**
- Button, TextInput, Checkbox, RadioButton
- Slider, ColorPicker, DatePicker, TimePicker
- Autocomplete, Toggle

**Display Components:**
- Label, ImageView, ProgressBar, Spinner
- Avatar, Badge, Chip, Card
- Tooltip, Toast

**Layout Components:**
- ScrollView, SplitView, Accordion
- Stepper, Modal, Tabs, Dropdown

**Data Components:**
- ListView, Table, TreeView
- DataGrid, Chart (line/bar/pie)

**Navigation:**
- TabView, Menu, Toolbar, StatusBar

**Advanced:**
- Rating, CodeEditor, MediaPlayer

### Using Native Components

```typescript
import { Button, TextInput, ListView } from 'ts-craft/components'

// Create native button
const button = new Button({
  label: 'Click Me',
  onClick: () => console.log('Clicked!'),
})

// Create native text input
const input = new TextInput({
  placeholder: 'Enter text...',
  onChange: (value) => console.log(value),
})

// Create native list
const list = new ListView({
  items: ['Item 1', 'Item 2', 'Item 3'],
  onSelect: (index) => console.log('Selected:', index),
})
```

## JavaScript Bridge

Craft automatically injects `window.craft` for seamless JS↔Zig communication.

### Available APIs

```typescript
// Wait for Craft to be ready
window.addEventListener('craft:ready', async () => {
  // Window operations
  await window.craft.window.show()
  await window.craft.window.hide()
  await window.craft.window.minimize()
  await window.craft.window.close()

  // Clipboard
  const text = await window.craft.clipboard.getText()
  await window.craft.clipboard.setText('Hello')

  // Dialogs
  const file = await window.craft.dialog.openFile({
    filters: [{ name: 'Images', extensions: ['png', 'jpg'] }],
  })
  const savePath = await window.craft.dialog.saveFile({
    defaultPath: 'document.txt',
  })

  // Notifications
  await window.craft.notification.show({
    title: 'Hello',
    body: 'This is a notification',
  })

  // System tray (if enabled)
  await window.craft.tray.setTitle('Status')
  await window.craft.tray.setTooltip('Tooltip text')

  // App
  await window.craft.app.quit()
  const info = await window.craft.app.getInfo()
})
```

### File System

```typescript
// Read file
const content = await window.craft.fs.readFile('/path/to/file.txt')

// Write file
await window.craft.fs.writeFile('/path/to/file.txt', 'content')

// Check if exists
const exists = await window.craft.fs.exists('/path/to/file.txt')

// Directory operations
const files = await window.craft.fs.readDir('/path/to/dir')
await window.craft.fs.createDir('/path/to/new-dir')
```

### Network

```typescript
// HTTP requests
const response = await window.craft.network.fetch('https://api.example.com/data')

// WebSocket
const ws = await window.craft.network.websocket('wss://example.com/socket')
ws.onMessage((data) => console.log(data))
ws.send('Hello')
```

## Notifications

```typescript
import { Notification } from 'ts-craft'

// Simple notification
await Notification.show({
  title: 'Download Complete',
  body: 'Your file has been downloaded',
})

// With icon and actions
await Notification.show({
  title: 'New Message',
  body: 'You have a new message from John',
  icon: 'icons/message.png',
  actions: [
    { id: 'reply', title: 'Reply' },
    { id: 'dismiss', title: 'Dismiss' },
  ],
})

// Handle action clicks
Notification.onAction((actionId) => {
  if (actionId === 'reply') {
    openMessageWindow()
  }
})
```

## Keyboard Shortcuts

```typescript
import { Shortcut } from 'ts-craft'

// Register global shortcut
await Shortcut.register('CommandOrControl+Shift+Space', () => {
  window.show()
  window.focus()
})

// Unregister
await Shortcut.unregister('CommandOrControl+Shift+Space')

// Available modifiers: Command, Control, Alt, Shift, Meta
// Available keys: 90+ key codes (A-Z, 0-9, F1-F12, arrows, etc.)
```

## Hot Reload

Craft includes built-in hot reload with state preservation:

```typescript
// State is preserved across reloads
// - Scroll position
// - Form inputs
// - Focus state
// - Custom state via API

// Save custom state before reload
window.craft.hotReload.saveState({ counter: 42 })

// Restore after reload
window.addEventListener('craft:ready', () => {
  const state = window.craft.hotReload.getState()
  console.log(state.counter) // 42
})
```

## Mobile Support

Craft supports iOS and Android with platform-specific features.

### iOS Features

```typescript
import { iOS } from 'ts-craft/mobile'

// Haptic feedback (7 types)
await iOS.haptic('impact') // light, medium, heavy, soft, rigid
await iOS.haptic('notification') // success, warning, error
await iOS.haptic('selection')

// Device permissions
const cameraGranted = await iOS.requestPermission('camera')
const locationGranted = await iOS.requestPermission('location')
// Also: notifications, photos, contacts, microphone

// Orientation
await iOS.lockOrientation('portrait')
await iOS.lockOrientation('landscape')
```

### Android Features

```typescript
import { Android } from 'ts-craft/mobile'

// Vibration/haptic
await Android.vibrate(100) // milliseconds

// Permissions
const granted = await Android.requestPermission('camera')
// Uses Android's permission system
```

## Building & Distribution

### Build Commands

```bash
# Build for current platform
buddy desktop:build

# Build for specific platform
buddy desktop:build --target macos
buddy desktop:build --target windows
buddy desktop:build --target linux

# Build with optimization
buddy desktop:build --release-small  # Smallest binary
buddy desktop:build --release-fast   # Maximum performance
```

### Output

```
dist/
├── macos/
│   └── MyApp.app          # ~1.4MB
├── windows/
│   └── MyApp.exe          # ~1.6MB
└── linux/
    └── MyApp              # ~1.5MB
```

### Platform Dependencies

| Platform | WebView | Notes |
|----------|---------|-------|
| **macOS** | WKWebView | Built-in, no install needed |
| **Linux** | WebKit2GTK | `apt install libwebkit2gtk-4.0-dev` |
| **Windows** | WebView2 | Edge-based, auto-installs |

## Accessibility

Craft is built with WCAG 2.1 AAA compliance in mind:

- 40+ ARIA roles supported
- Focus management
- Keyboard navigation
- Screen reader support
- 69 accessibility tests in CI

```typescript
import { Accessibility } from 'ts-craft'

// Set accessibility label
button.setAccessibilityLabel('Submit form')

// Announce to screen reader
await Accessibility.announce('Form submitted successfully')

// Focus management
await Accessibility.moveFocus(nextElement)
```

## Theming

```typescript
import { Theme } from 'ts-craft'

// Built-in themes
await Theme.set('nord')
await Theme.set('dracula')
await Theme.set('gruvbox')

// Custom theme
await Theme.set({
  primary: '#3B82F6',
  secondary: '#10B981',
  background: '#1F2937',
  text: '#F9FAFB',
})
```

## Animations

Craft includes 31 easing functions and animation primitives:

```typescript
import { animate } from 'ts-craft'

// Basic animation
await animate(element, {
  opacity: [0, 1],
  transform: ['translateY(20px)', 'translateY(0)'],
}, {
  duration: 300,
  easing: 'easeOutCubic',
})

// Spring animation
await animate(element, {
  scale: [0.8, 1],
}, {
  type: 'spring',
  stiffness: 300,
  damping: 20,
})
```

## Plugin System

Craft supports WASM plugins with sandboxing:

```typescript
import { Plugin } from 'ts-craft'

// Load plugin
const plugin = await Plugin.load('my-plugin.wasm', {
  permissions: ['filesystem', 'network'],
})

// Call plugin function
const result = await plugin.call('processData', data)
```

## GPU & Graphics

For advanced graphics applications:

```typescript
import { GPU } from 'ts-craft'

// Check GPU support
const hasVulkan = await GPU.supports('vulkan')
const hasMetal = await GPU.supports('metal')

// Create renderer
const renderer = await GPU.createRenderer({
  backend: 'auto', // vulkan, metal, or direct3d
})

// Built-in effects
await renderer.addEffect('bloom')
await renderer.addEffect('blur', { radius: 5 })
await renderer.addEffect('vignette')
```

## Real-World Examples

Craft is ideal for:

- **System tray utilities**: Timers, monitors, quick actions
- **Developer tools**: CLI wrappers, dashboards
- **Desktop productivity**: Notes, task managers
- **Lightweight alternatives**: Replace heavy Electron apps
- **Cross-platform tools**: Single codebase for all platforms
