# i18n message catalog (`messages.ts`)

The message **contract**: the closed set of user-facing strings hope-ui's components emit (screen-reader
labels, live-region announcements) that the consuming app does **not** author, plus the `{{param}}`
interpolator. Ported from the maintainer's Angular predecessor. The built-in catalogs themselves live
one file per locale in [`./locales/`](./locales) (`en.ts`, `fr.ts`, …) — this file only defines their
shape.

## Source of truth

An internal **nested** `I18nMessageMap` groups keys by component and gives each leaf its params type
(`undefined` = no params):

```ts
interface I18nMessageMap {
  dialog: { close: undefined };
  calendar: { label: undefined; /* … */ selectedDate: { date: string }; datesSelected: { count: number } };
}
```

Everything else is **derived** from it, so a key is declared exactly once:

| Symbol | Derived as | Purpose |
| --- | --- | --- |
| `I18nMessageKey` | dotted paths of the map | The union `t()` accepts — `"dialog.close"`, `"calendar.today"`, … |
| `ParamsFor<K>` | the map leaf for `K` | The params object for a key, or `undefined`. |
| `I18nMessageEntry<K>` | from `ParamsFor<K>` | `string` (optionally with `{{param}}`) or `(params) => string` (plural rule). |
| `I18nCatalog` | nested mirror of the map | `{ dialog: { close: … }, calendar: { … } }` — the shape each locale catalog in `./locales/` is typed against. |
| `interpolate(template, params?)` | — | Replace `{{name}}` placeholders, coercing each param to a string. |

The catalogs `MESSAGES_EN` / `MESSAGES_FR` are exported from `locales/en.ts` and
`locales/fr.ts` (see [`locales/en.md`](./locales/en.md), [`locales/fr.md`](./locales/fr.md)); each is typed as
`I18nCatalog`, so it must carry every key or it fails to compile.

## Design

- **Nested catalog, dotted access.** Catalogs are authored as nested objects (`calendar.today` lives at
  `MESSAGES_EN.calendar.today`) for readability, but `t()` and overrides use the flat dotted key
  `"calendar.today"` — the standard i18n shape (nested definition, dotted lookup). The resolver splits
  the key on its single `.` to traverse the catalog (see `translate.md`).
- **One place to add a key.** Add a group/key to `I18nMessageMap`, then to every locale catalog in
  `./locales/`. Because `I18nCatalog` is derived from the map, a catalog missing the key — or drifting
  a param type — is a **compile error**, not a runtime miss.
- **Plurals are functions.** Count-bearing keys (`calendar.datesSelected`) are functions so each
  locale encodes its own rule: English is singular only at `1`; French treats `count <= 1` as
  singular. Everything else is a plain string with optional `{{param}}` placeholders.
- **Dates are not i18n's job.** Months/weekdays/day-numbers are already locale-formatted upstream by
  `@internationalized/date` + `Intl` (keyed off the calendar's `locale`); the interpolated keys
  receive those **already-formatted strings** as params.
- **English string values match the pre-port calendar defaults** so the committed calendar SSR fixture
  (pinned to `en-US`) stays byte-for-byte valid.

Resolution (overlay → catalog → key) lives in `translate.ts`; see `translate.md`.

## Tests

`messages.test.ts` (unit) covers the shared `interpolate`. Each catalog is tested beside its file:
`locales/en.test.ts` (frozen English values + English plural rule) and `locales/fr.test.ts` (en/fr
**key parity** + French values + the `count <= 1` plural rule).
