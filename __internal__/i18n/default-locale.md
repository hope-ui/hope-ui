# `getDefaultLocale` / `createDefaultLocale`

The browser/system default locale, as a plain snapshot (`getDefaultLocale`) and as a reactive
accessor that tracks `languagechange` (`createDefaultLocale`). Backs `I18nProvider` when no explicit
`locale` is passed.

## API

```ts
interface Locale { locale: string; direction: Direction }

function getDefaultLocale(): Locale;
function createDefaultLocale(): { locale: () => string; direction: () => Direction };
```

- `getDefaultLocale()` — reads `navigator.language` (or `en-US` off-browser), validated against
  `Intl.DateTimeFormat.supportedLocalesOf`, plus its reading direction.
- `createDefaultLocale()` — a reactive `{ locale, direction }` that updates when the OS/browser
  language changes. Call inside a reactive owner (a component body / `createRoot`).

## SSR / hydration (two improvements over the original source)

1. **Seeded to the SSR default.** The internal client signal starts at `en-US`/`ltr` — *not* the
   detected locale — and `createMemo` returns the SSR default on the server. The detected locale is
   adopted only in `onSettled`, which runs **after** hydration. So the first client paint agrees
   with the server, and locale-derived visible text (month/weekday names) never mismatches on
   hydrate. (The original source seeds the signal with the real locale at module load, which can
   mismatch.)
2. **Dual-copy-safe subscription.** The shared `languagechange` listener set + the `current`
   snapshot live in a `Symbol.for("@hope-ui/i18n:locale-registry")` slot on `globalThis`,
   so two installed copies of `@hope-ui/i18n` observe one registry — the same reasoning as
   `createScrollLock`/`createHideOutside` storing their counts under a global symbol.

## Provenance

Derived from React Spectrum (`@react-aria/i18n`, Apache-2.0, © 2020 Adobe). See the CLAUDE.md
i18n provenance note.
