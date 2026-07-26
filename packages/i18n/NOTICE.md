# Third-party notices — `@hope-ui/i18n`

`@hope-ui/i18n` is released under the MIT License (see [`LICENSE.md`](./LICENSE.md)). Portions of
this package are derived from the work listed below and remain subject to its original license.
Nothing here relicenses those portions.

## Adobe React Spectrum

- **Project:** https://github.com/adobe/react-spectrum (`@react-aria/i18n`)
- **License:** Apache License, Version 2.0 — full text in [`LICENSE-APACHE-2.0.txt`](./LICENSE-APACHE-2.0.txt)
- **Copyright:** Copyright 2020 Adobe. All rights reserved.

The following files are derived from this work. **All of them have been modified**, and each
carries an attribution header naming its upstream source:

| File | Derived from |
| ---- | ------------ |
| `src/direction.ts` | `src/i18n/utils.ts` — RTL script/language tables and direction resolution |
| `src/default-locale.ts` | `src/i18n/useDefaultLocale.ts` |
| `src/i18n-provider.tsx` | `src/i18n/context.tsx` |

The principal modifications are re-expression for SolidJS 2.0's reactive model, hydration-gated
locale detection, and a `Symbol.for(...)` global registry for dual-copy safety. They are documented
inline in each file.

## Trademarks

Adobe, React Spectrum, and React Aria are trademarks of Adobe. hope-ui is an independent project,
not affiliated with, sponsored by, or endorsed by Adobe.
