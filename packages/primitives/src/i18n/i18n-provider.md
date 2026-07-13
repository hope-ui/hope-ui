# `I18nProvider` / `useLocale`

Locale + reading-direction context — the headless replacement for the Angular calendar's
`I18nService` (locale) and `@angular/cdk` `Directionality` (direction), in one module. A calendar
(or any locale-aware component) reads `useLocale()` for the locale that feeds its `Intl` date
formatters and the direction that feeds `createGridNavigation`.

## API

```tsx
interface I18nContextValue {
  locale: Accessor<string>;
  direction: Accessor<Direction>;
}

function I18nProvider(props: { locale?: string; children?: JSX.Element }): JSX.Element;
function useLocale(): I18nContextValue;
```

- `<I18nProvider locale?>` — provides the locale to descendants. With `locale`, direction is derived
  from it via `getReadingDirection`. Without, it tracks the browser locale via `createDefaultLocale`
  (SSR-safe). In SolidJS 2.0 `createContext` returns the Provider directly.
- `useLocale()` — the current `{ locale, direction }`. Returns the **browser default** when no
  provider is mounted.

## SSR / hydration

Wrap the app (or subtree) in `<I18nProvider>` for the SSR-safe path: it renders `en-US`/`ltr` on the
server and during the hydrating client render, then adopts the detected locale after hydration
settles — so locale-derived visible text never mismatches. See `default-locale.md`.

The **no-provider default** reads the browser locale eagerly (per access), which is *not*
hydration-safe for locale-derived visible text. For SSR, either mount an `I18nProvider` or pass an
explicit `locale`/`dir` to the component (the calendar accepts both).

## Provenance

Ported from the maintainer's Kobalte i18n work (`@kobalte/core/i18n`), derived from React Spectrum
(`@react-aria/i18n`, Apache-2.0, © 2020 Adobe). The `@hope-ui/primitives/i18n` barrel also re-exports
the `@solid-primitives/i18n` translator seam (`translator`, `flatten`, `resolveTemplate`, …) for
authoring localized dictionaries. See the CLAUDE.md Kobalte carve-out note.
