# Third-party notices — `@hope-ui/primitives`

`@hope-ui/primitives` is released under the MIT License (see [`LICENSE.md`](./LICENSE.md)). Portions
of this package are derived from the work listed below and remain subject to its original license.
Nothing here relicenses those portions.

## Adobe React Spectrum

- **Project:** https://github.com/adobe/react-spectrum (`@react-aria/interactions`)
- **License:** Apache License, Version 2.0 — full text in [`LICENSE-APACHE-2.0.txt`](./LICENSE-APACHE-2.0.txt)
- **Copyright:** Copyright 2020 Adobe. All rights reserved.

The following file is derived from this work. **It has been modified**, and carries an attribution
header naming its upstream source:

| File | Derived from |
| ---- | ------------ |
| `src/internal/create-press.ts` | `src/usePress.ts` — the unified pointer/touch/mouse/keyboard/virtual press model |

The principal modifications are re-expression for SolidJS 2.0's reactive model, firing `onPress`
from the `click` event, and a single plain-value signal surface for hydration safety. They are
documented inline in the file.

`@internationalized/date` is also an Adobe Apache-2.0 work. It is an ordinary npm dependency,
resolved as a bare specifier in the published output and never bundled — it ships with its own
license.

## Other references

`@floating-ui/dom` (MIT) and `@tanstack/virtual-core` (MIT) are optional peer dependencies, consumed
as published and never bundled. The kernel's list-behavior and positioning primitives were designed
against the public APIs of Angular Aria (MIT, © Google LLC), Base UI (MIT, © Material-UI SAS) and
Floating UI (MIT); no source from those projects is reproduced here. Full details, including the
per-behavior source map, are in the repository's root `NOTICE.md`.

## Trademarks

Adobe, React Spectrum, and React Aria are trademarks of Adobe. hope-ui is an independent project,
not affiliated with, sponsored by, or endorsed by Adobe.
