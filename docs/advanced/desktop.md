---
title: Desktop Applications
description: Experimental Craft desktop launch and bundle paths in the audited Stacks.js source.
---

# Desktop Applications

> **Maturity: Experimental · verified against Stacks source `bf1245e3` · stable targets: 0**

Stacks.js includes a Craft-based native-window integration. The audited source can:

- resolve a Craft executable from `CRAFT_BIN`, a recognized local checkout, or `PATH`;
- construct a native development-window command for a Stacks URL;
- pass window, hot-reload, developer-tools, dark-mode, and system-tray flags;
- compile a Stacks launcher and bundle it with a Craft runtime;
- emit a `desktop.json` manifest containing the application URL and window defaults.
- emit exact source/runtime provenance and per-file SHA-256 checksums;
- require Ed25519-signed update manifests before checksum-verified staging;
- refuse a stable release channel unless the target's support row has complete
  native evidence and enforced signing/notarization.

The machine-readable matrix explicitly lists macOS arm64/x64, Linux x64, and
Windows x64 as experimental unpackaged bundles. It establishes **no stable OS
version, installer, or mobile target**. Platform identities and retained native
install/update/rollback evidence are tracked in Stacks #2062 and #2063.

## Prerequisites

You need a working Craft binary. Set its absolute path when it is not available as `craft` on `PATH`:

```bash
export CRAFT_BIN=/absolute/path/to/craft
```

The build path also requires `APP_URL` or `DESKTOP_URL`, because the current desktop bundle opens a deployed or locally served Stacks URL.

## Development window

```bash
buddy dev:desktop
```

Programmatic use:

```typescript
import { openDevWindow } from '@stacksjs/desktop'

await openDevWindow(3000, {
  url: 'https://stacks.test',
  title: 'My App',
  width: 1280,
  height: 800,
  hotReload: true,
  devTools: true,
  systemTray: false,
})
```

`openDevWindow()` launches the Craft process and returns `true` after dispatching it. That return value does not prove that the native window remained healthy; development tooling should still surface the child process output.

## Command construction

For diagnostics or custom launchers:

```typescript
import {
  craftDevCommand,
  resolveCraftBinary,
  resolveDevWindowUrl,
} from '@stacksjs/desktop'

const binary = resolveCraftBinary(process.env.CRAFT_BIN)
const url = resolveDevWindowUrl(3000, { url: process.env.APP_URL })
const command = craftDevCommand(3000, {
  craftBin: binary,
  url,
  title: 'My App',
  systemTray: true,
  hideDockIcon: true,
})
```

The URL resolver validates the port and normalizes the configured URL. The command builder supports:

- `title`, `width`, and `height`;
- hot reload and developer tools;
- dark mode;
- system tray, dock-icon hiding, and menubar-only mode;
- an explicit Craft binary.

## Build output

```bash
APP_URL=https://app.example.com \
CRAFT_BIN=/absolute/path/to/craft \
buddy build:desktop
```

At the audited revision, the build Action:

1. builds `@stacksjs/desktop`;
2. compiles `desktop/src/launcher.ts` with Bun;
3. copies the Craft runtime next to the launcher;
4. writes `desktop.json`;
5. writes `provenance.json` and `checksums.sha256`;
6. places output under `storage/framework/desktop-dist`.

This is a runtime bundle, not evidence of a signed/notarized installer. Setting
`DESKTOP_RELEASE_CHANNEL=stable` fails while the target remains experimental.

## Production checklist

Before distributing a desktop application:

- test on every supported OS and architecture;
- decide whether the remote URL model meets offline and update requirements;
- sign and notarize artifacts where the platform requires it;
- verify system-tray and dock behavior per OS;
- define automatic-update signing and rollback;
- restrict navigation and external URL handling;
- review the web/native trust boundary;
- publish checksums and a supported-version matrix.

## Current boundary

The Stacks desktop package is useful for local native-window development and experimental Craft bundles. Treat native mobile delivery and universal desktop packaging as planned work until release evidence says otherwise.

- [Desktop source at the audited revision](https://github.com/stacksjs/stacks/tree/bf1245e336ab14551e22cb7d88284f93e649a1a2/storage/framework/core/desktop/src)
- [Generated support matrix](/reference/source-evidence#craft-desktop-evidence)
- [White paper maturity matrix](https://github.com/stacksjs/white-paper#7-capability-evidence-and-maturity)
