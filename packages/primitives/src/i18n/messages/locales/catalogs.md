# Locale registry (`catalogs.ts`)

`CATALOGS` maps each built-in catalog to its BCP-47 **primary language subtag**, and `resolveCatalog`
picks one for a given locale. This is the single place that enumerates the shipped locales.

## Exports

| Symbol | Purpose |
| --- | --- |
| `CATALOGS` | `Record<string, I18nCatalog>` keyed by primary subtag (`en`, `fr`, `de`, `it`, `es`, `pt`, `pl`, `sv`, `fi`, `da`, `el`). |
| `resolveCatalog(locale)` | Select a catalog by primary subtag, case-insensitively (`"de-AT"` → `de`, `"PT-BR"` → `pt`); falls back to `MESSAGES_EN` for any unshipped locale. |

The resolver in `../../translate/translate.ts` calls `resolveCatalog(locale())`, then falls back to
`MESSAGES_EN` per key. Selection is by **primary subtag only** — regional variants share one catalog
(`de-AT`/`de-CH` → German; `pt-PT`/`pt-BR` → Portuguese), which apps can override per key via the
`I18nProvider` `translate`/`messages` config.

## Adding a locale

1. Create `<code>.ts` exporting `MESSAGES_<CODE>: I18nCatalog` (copy `en.ts`, translate every value —
   the `I18nCatalog` type enforces completeness).
2. Add `<code>.test.ts` + `<code>.md` (Definition of Done).
3. Register it in `CATALOGS` here and export it from the i18n barrel.

`catalogs.test.ts` asserts every registered catalog has full key parity with English, and pins the
`resolveCatalog` subtag/fallback behavior.
