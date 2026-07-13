# `I18nProvider` / `useLocale`

Locale + reading-direction context **and** the component-message resolver — the headless replacement
for the Angular calendar's `I18nService` (locale + `t()`) and `@angular/cdk` `Directionality`
(direction), in one module. A calendar (or any locale-aware component) reads `useLocale()` for the
locale that feeds its `Intl` date formatters, the direction that feeds `createGridNavigation`, and
`t` for its own screen-reader labels/announcements.

## API

```tsx
interface I18nContextValue {
  locale: Accessor<string>;
  direction: Accessor<Direction>;
  t: TranslateFn; // resolve a component message for the current locale (see translate.md)
}

function I18nProvider(props: {
  locale?: string;
  translate?: I18nTranslateOverride; // delegate to the app's own pipeline
  messages?: Partial<Record<string, Partial<Record<I18nMessageKey, string>>>>; // per-locale/key override
  children?: JSX.Element;
}): JSX.Element;
function useLocale(): I18nContextValue;
```

- `<I18nProvider locale?>` — provides the locale to descendants. With `locale`, direction is derived
  from it via `getReadingDirection`. Without, it tracks the browser locale via `createDefaultLocale`
  (SSR-safe). In SolidJS 2.0 `createContext` returns the Provider directly.
- `translate` / `messages` — overlay the built-in catalogs (resolution order in `translate.md`).
  `translate` delegates a key to the app's pipeline; `messages` is a coarse per-locale/per-key map.
- `useLocale()` — the current `{ locale, direction, t }`. Returns the **browser default** (and a `t`
  bound to the built-in catalog) when no provider is mounted.

The Angular `I18nService`'s reactive-`locale`-signal-vs-imperative-`setLocale` duality collapses here
to a single reactive `locale` prop: the prop is already reactive, so passing a signal-derived value
(`locale={lang()}`) is the whole story. There is intentionally no `setLocale`.

## SSR / hydration

Wrap the app (or subtree) in `<I18nProvider>` for the SSR-safe path: it renders `en-US`/`ltr` on the
server and during the hydrating client render, then adopts the detected locale after hydration
settles — so locale-derived visible text never mismatches. See `default-locale.md`.

The **no-provider default** reads the browser locale eagerly (per access), which is *not*
hydration-safe for locale-derived visible text. For SSR, either mount an `I18nProvider` or pass an
explicit `locale`/`dir` to the component (the calendar accepts both).

## Provenance

The locale/direction context is ported from the maintainer's Kobalte i18n work (`@kobalte/core/i18n`),
derived from React Spectrum (`@react-aria/i18n`, Apache-2.0, © 2020 Adobe); see the CLAUDE.md Kobalte
carve-out note. The message resolver (`t`, catalog, `translate`/`messages` overlay) is ported from the
maintainer's Angular predecessor — see `messages.md` and `translate.md`. There is **no**
`@solid-primitives/i18n` dependency; the catalog + resolver are in-house.
