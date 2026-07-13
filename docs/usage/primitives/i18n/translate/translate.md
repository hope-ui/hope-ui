# i18n message resolver (`translate.ts`)

hope-ui's headless equivalent of the Angular predecessor's `I18nService.t()`: build a reactive
message resolver bound to a locale, with the built-in catalogs (`../messages/locales/`) as the guaranteed floor and the
app's own pipeline as an overlay. There is **no** `@solid-primitives/i18n` dependency.

## Exports

| Symbol | Purpose |
| --- | --- |
| `TranslateFn` | `<K>(key, ...params) => string`. Params are **required + typed** for param-bearing keys, **forbidden** otherwise (conditional variadic tuple). |
| `I18nTranslateOverride` | `(key, params, locale) => string \| null \| undefined` — delegate to the app pipeline; return `null`/`undefined` to fall through. |
| `I18nMessagesConfig` | `{ translate?; messages? }` — the config an `I18nProvider` forwards. |
| `createTranslate(locale, config)` | Build a `TranslateFn`. `locale` is an accessor; `config` is a getter. |

## Resolution order

`createTranslate` reads `locale()` on **every call** (so `t()` is reactive in JSX and correct for
imperative callers like the announcer) and resolves — first non-null wins:

1. `config().translate?.(key, params, locale)` — the app pipeline overlay.
2. `config().messages?.[locale]?.[key]` — a coarse per-locale/per-key override (flat dotted key), then
   `interpolate`d.
3. Built-in catalog — `resolveCatalog(locale)` (`../messages/locales/catalogs.ts`) picks the catalog by
   BCP-47 primary subtag, then falls back to `MESSAGES_EN` per key. The catalog is **nested**, so the
   dotted key is split on its single `.` (`group.name`) to traverse it; function entries are called with
   params, string entries are `interpolate`d.
4. The key itself, dev-warned **once** (per-instance `Set`).

## Notes

- **Plain function, never a `createMemo`.** `t()` reads a signal and returns a string; it never
  creates a compute-form signal/memo, so it never participates in a hydration key. This is why the
  calendar can call `t()` directly in its render path (unlike a memoized `translator`), and a key
  reason `@solid-primitives/i18n` was dropped — see `docs/solid-primitives-eval.md`.
- **No module-scope state.** The warn-dedup `Set` is created inside `createTranslate`, so it is
  per-instance and never becomes cross-realm shared state (per the CLAUDE.md rule).
- The dev-warning path is essentially unreachable for well-typed calls (the `I18nCatalog` mapped type
  guarantees every built-in key resolves); it is a runtime safety net for `as`-cast/invalid keys.

## Tests

`translate.test.ts` (unit): the full resolution order, `startsWith('fr')` catalog selection, param
interpolation through both the catalog and a `messages` override, and reactivity by construction.
Reactive re-render through the provider is covered in `i18n-provider.browser.test.tsx`.
