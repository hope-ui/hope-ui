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

Both the provider (with no `locale` prop) and the **no-provider context default** read the same gated
accessor, `readDetectedLocale` — `en-US`/`ltr` while a hydration pass is in flight, the detected
locale immediately otherwise. So mounting a provider is how you *choose* a locale, not how you make
one correct: zero-config is SSR-safe on its own. See `default-locale.md` for the gate and the silent
mismatch it prevents.

Passing an explicit `locale` bypasses detection entirely, which is the fully deterministic form: the
server and client render the same locale and nothing re-renders after hydration. Prefer it whenever
the locale is something the app decides rather than something it detects — most so for date-heavy UI,
where the post-hydration re-render rebuilds a whole grid. A component may also take the locale
directly (the calendar accepts `locale`/`dir`).

## Provenance

The locale/direction context is derived from React Spectrum
(`@react-aria/i18n`, Apache-2.0, © 2020 Adobe); see the CLAUDE.md i18n provenance
note. The message resolver (`t`, catalog, `translate`/`messages` overlay) is hope-ui's own — see
`messages.md` and `translate.md`. There is **no**
`@solid-primitives/i18n` dependency; the catalog + resolver are in-house.

## Rejected alternatives

### An imperative `setLocale` on the context
**Why not:** the `locale` prop is already reactive, so a setter would be a second writer for one
value — precisely the Angular `I18nService`'s reactive-signal-plus-imperative-setter duality this
module collapsed into a single prop (see the `I18nService` note above). `locale={lang()}` is the
whole control surface.

### A wrapper element carrying a locale-derived `dir`
**Why not:** `useLocale().direction()` never returns "nothing", so writing it would stamp
`dir="ltr"` on an `en-US` browser and override the `<div dir="rtl">` the tree was rendered into.
The provider therefore renders no DOM at all, and mirroring `dir` onto the document root stays the
app's job, in an effect beside the provider. Full reasoning:
`__internal__/primitives/internal/create-text-direction-warning.md`.
