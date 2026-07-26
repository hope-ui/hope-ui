# Third-party notices

hope-ui is released under the MIT License (see [`LICENSE.md`](LICENSE.md)). Portions of this
software are derived from the projects listed below and remain subject to their original licenses.
Nothing here relicenses those portions; the MIT grant in `LICENSE.md` covers hope-ui's own code.

Where a file is derived from an Apache-2.0 work, it carries an attribution header naming the
upstream and stating that it has been modified.

---

## Adobe React Spectrum

- **Project:** https://github.com/adobe/react-spectrum (`@react-aria/*`, `@react-stately/*`)
- **License:** Apache License, Version 2.0 — full text in [`licenses/LICENSE-APACHE-2.0.txt`](licenses/LICENSE-APACHE-2.0.txt)
- **Copyright:** Copyright 2020 Adobe. All rights reserved.

The following files are derived from this work. **All of them have been modified**, and each
carries an attribution header naming its upstream source:

| File | Derived from |
| ---- | ------------ |
| `packages/i18n/src/direction.ts` | `@react-aria/i18n` — `src/i18n/utils.ts` (RTL script/language tables, direction resolution) |
| `packages/i18n/src/default-locale.ts` | `@react-aria/i18n` — `src/i18n/useDefaultLocale.ts` |
| `packages/i18n/src/i18n-provider.tsx` | `@react-aria/i18n` — `src/i18n/context.tsx` |
| `packages/primitives/src/internal/create-press.ts` | `@react-aria/interactions` — `src/usePress.ts` |

`@internationalized/date` is also an Adobe Apache-2.0 work. hope-ui consumes it as an ordinary npm
dependency and never bundles it — it is resolved as a bare specifier in the published output and
ships with its own license.

## Base UI

- **Project:** https://github.com/mui/base-ui
- **License:** MIT License
- **Copyright:** Copyright (c) 2019 Material-UI SAS

hope-ui's overlay and anchor-positioning option vocabulary (`side`, `align`, `sideOffset`,
`alignOffset`, collision padding, and the anchor/positioner split) follows Base UI's public API
design, and several component behaviors were cross-checked against its implementation. No Base UI
source is reproduced in this repository.

```
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

## Angular Components

- **Project:** https://github.com/angular/components (Angular CDK, Angular Aria)
- **License:** MIT License
- **Copyright:** Copyright (c) 2026 Google LLC.

hope-ui's list-behavior kernel (`createListFocus`, `createListNavigation`, `createListTypeahead`,
`createListSelection`, `createListExpansion`, `createGridNavigation`, `createKeyboardHandler`)
follows the architectural decomposition of Angular Aria's signal-based behaviors, re-expressed for
SolidJS. No Angular source is reproduced in this repository.

```
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT
OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

## Floating UI

- **Project:** https://github.com/floating-ui/floating-ui
- **License:** MIT License
- **Copyright:** Copyright (c) 2021-present Floating UI contributors

`@floating-ui/dom` is an optional peer dependency, consumed as published and never bundled.
`createFloating`'s reactive structure follows the `@floating-ui/vue` binding, whose lifecycle maps
onto Solid's almost directly. No Floating UI source is reproduced in this repository.

---

## Trademarks

Adobe, React Spectrum, React Aria, MUI, Base UI, Google, and Angular are trademarks of their
respective owners. hope-ui is an independent project; it is not affiliated with, sponsored by, or
endorsed by any of them. References to these projects in this repository are descriptive, made to
credit prior art and to document where a behavior was researched.
