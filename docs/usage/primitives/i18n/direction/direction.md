# `getReadingDirection` / `isRTL`

Reading-direction detection for a BCP-47 locale — the headless replacement for the Angular
calendar's `@angular/cdk` `Directionality`. Feeds `createGridNavigation`'s `textDirection` so the
grid flips Left/Right arrows under RTL.

## API

```ts
type Direction = "rtl" | "ltr";
function getReadingDirection(locale: string): Direction;
function isRTL(locale: string): boolean;
```

- `getReadingDirection(locale)` — `"rtl"` for right-to-left locales, else `"ltr"`.
- `isRTL(locale)` — the boolean form.

## How it decides

Prefers `Intl.Locale(locale).maximize().script` and checks it against the RTL script set
(`Arab`, `Hebr`, `Thaa`, …) — accurate even for locales whose direction isn't obvious from the
language subtag. Where `Intl.Locale` is unavailable it falls back to a right-to-left **language
subtag** set (`ar`, `he`, `fa`, `ur`, …).

## Provenance

Ported from the maintainer's Kobalte i18n work (`@kobalte/core/i18n`), which is derived from React
Spectrum (`@react-aria/i18n`, Apache-2.0, © 2020 Adobe). Behavior is verbatim; this repo owns only
the doc/formatting. See the CLAUDE.md Kobalte carve-out note for why copying this is allowed here.
