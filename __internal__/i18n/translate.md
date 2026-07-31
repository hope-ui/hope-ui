# i18n message resolver (`translate.ts`)

Build a reactive message resolver bound to a locale, with the built-in catalogs (`./locales/`) as the guaranteed floor and the
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
3. Built-in catalog — `resolveCatalog(locale)` (`./catalogs.ts`) picks the catalog by
   BCP-47 primary subtag, then falls back to `MESSAGES_EN` per key. The catalog is **nested**, so the
   dotted key is split on its single `.` (`group.name`) to traverse it; function entries are called with
   params, string entries are `interpolate`d.
4. The key itself, dev-warned **once** (per-instance `Set`).

## Notes

- **Plain function, never a `createMemo`.** `t()` reads a signal and returns a string; it never
  creates a compute-form signal/memo, so it never participates in a hydration key. This is why the
  calendar can call `t()` directly in its render path (unlike a memoized `translator`), and a key
  reason `@solid-primitives/i18n` was dropped — see `__internal__/solid-primitives-eval.md`.
- **No module-scope state.** The warn-dedup `Set` is created inside `createTranslate`, so it is
  per-instance and never becomes cross-realm shared state (per the CLAUDE.md rule).
- The dev-warning path is essentially unreachable for well-typed calls (the `I18nCatalog` mapped type
  guarantees every built-in key resolves); it is a runtime safety net for `as`-cast/invalid keys.

## Tests

`translate.test.ts` (unit): the full resolution order, `startsWith('fr')` catalog selection, param
interpolation through both the catalog and a `messages` override, and reactivity by construction.
Reactive re-render through the provider is covered in `i18n-provider.browser.test.tsx`.

## Rejected alternatives

### `@solid-primitives/i18n`'s `translator` seam
**Why not:** `translator` memoizes, and a compute-form memo in a render path is the
transform-boundary hydration hazard this repo catalogs — which is why the calendar could not call it
in render at all and carried a plain `CalendarMessages` dictionary beside it. The in-house resolver
is a plain function, so the calendar calls `t("calendar.*")` directly and the dictionary is gone.
Full verdict, including the second reason (dropping the runtime dependency):
`__internal__/solid-primitives-eval.md`.

### Memoizing `t` — or the resolved catalog — per locale
**Why not:** a `createMemo` takes a hydration key, so one added here shifts `_hk` for everything
created after it; when `I18nProvider` *stopped* allocating a signal and a memo, the calendar SSR
snapshot had to be re-recorded for exactly that reason. Reading `locale()` per call is also what
keeps `t()` correct for imperative callers like the live-region announcer — see *Notes* above.

### A module-scope warn-dedup `Set`
**Why not:** module scope is shared across every `createTranslate` in the process, and across two
installed copies of the package, so the first resolver to warn about a missing key silences the
warning for every later one. Creating the `Set` inside `createTranslate` keeps it per-instance, per
the kernel's no-cross-realm-state rule.
