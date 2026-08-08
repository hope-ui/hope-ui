# i18n message catalog (`messages.ts`)

The message **contract**: the closed set of user-facing strings hope-ui's components emit (screen-reader
labels, live-region announcements) that the consuming app does **not** author, plus the `{{param}}`
interpolator. The built-in catalogs themselves live
one file per locale in [`./locales/`](./locales) (`en.ts`, `fr.ts`, …) — this file only defines their
shape.

## Source of truth

An internal **nested** `I18nMessageMap` groups keys by component and gives each leaf its params type
(`undefined` = no params):

```ts
interface I18nMessageMap {
  common: { close: undefined };
  calendar: { label: undefined; /* … */ selectedDate: { date: string }; datesSelected: { count: number } };
  combobox: { triggerLabel: undefined; clearLabel: undefined; countAnnouncement: { count: number } };
  tagsInput: { removeLabel: undefined; removeDescription: undefined; clearLabel: undefined };
}
```

`common` (cross-component strings) stays first; component groups follow it, alphabetically.

Everything else is **derived** from it, so a key is declared exactly once:

| Symbol | Derived as | Purpose |
| --- | --- | --- |
| `I18nMessageKey` | dotted paths of the map | The union `t()` accepts — `"common.close"`, `"calendar.today"`, … |
| `ParamsFor<K>` | the map leaf for `K` | The params object for a key, or `undefined`. |
| `I18nMessageEntry<K>` | from `ParamsFor<K>` | `string` (optionally with `{{param}}`) or `(params) => string` (plural rule). |
| `I18nCatalog` | nested mirror of the map | `{ common: { close: … }, calendar: { … } }` — the shape each locale catalog in `./locales/` is typed against. |
| `interpolate(template, params?)` | — | Replace `{{name}}` placeholders, coercing each param to a string. |

One `MESSAGES_<CODE>` per locale file in `./locales/` — twelve today (`ar`, `da`, `de`, `el`, `en`,
`es`, `fi`, `fr`, `it`, `pl`, `pt`, `sv`), each with its own doc under [`locales/`](./locales/). Each
is typed as `I18nCatalog`, so it must carry every key or it fails to compile.

## Design

- **Nested catalog, dotted access.** Catalogs are authored as nested objects (`calendar.today` lives at
  `MESSAGES_EN.calendar.today`) for readability, but `t()` and overrides use the flat dotted key
  `"calendar.today"` — the standard i18n shape (nested definition, dotted lookup). The resolver splits
  the key on its single `.` to traverse the catalog (see `translate.md`).
- **One place to add a key.** Add a group/key to `I18nMessageMap`, then to every locale catalog in
  `./locales/`. Because `I18nCatalog` is derived from the map, a catalog missing the key — or drifting
  a param type — is a **compile error**, not a runtime miss.
- **Plurals are functions.** Count-bearing keys (`calendar.datesSelected`,
  `combobox.countAnnouncement`) are functions so each locale encodes its own rule: English is singular
  only at `1`; French treats `count <= 1` as singular. Everything else is a plain string with optional
  `{{param}}` placeholders.
- **Combobox vocabulary follows React Aria.** `combobox.triggerLabel` ("Show suggestions") and
  `combobox.countAnnouncement` mirror the *intent* of `@react-aria/combobox`'s `buttonLabel` and
  `countAnnouncement` — a proven pair of strings for the chevron's accessible name and the
  filtered-count live region. Only the vocabulary is borrowed: React Aria expresses its counts as ICU
  MessageFormat plurals in per-locale JSON, this contract as per-locale functions, and every
  translation here is authored from scratch. No copied expression, so no `@license` header and no
  `NOTICE.md` row — see `CLAUDE.md` § Third-party attribution.
- **The `tagsInput` strings were written, not ported.** React Aria ships the same three in
  `react-aria/intl/tag/` for 34 locales, and copying that JSON would make this package an Apache-2.0
  derivative owing an `@license` header, a `NOTICE.md` row in two places and
  `LICENSE-APACHE-2.0.txt` — for three short functional strings. Reproducing the *idea* of a
  keyboard-only `removeDescription` owes nothing, so all twelve catalogs are hand-authored.
  `removeLabel` stays a bare verb because the chip composes it with its own text through
  `aria-labelledby` (*"Remove Apple"*), and `ar` names the Delete key in Arabic rather than embedding
  a Latin key name, which reorders unpredictably inside an RTL announcement. Decision `D12` in
  `__internal__/components/decisions.md` § TagsInput.
- **Dates are not i18n's job.** Months/weekdays/day-numbers are already locale-formatted upstream by
  `@internationalized/date` + `Intl` (keyed off the calendar's `locale`); the interpolated keys
  receive those **already-formatted strings** as params.
- **English string values match the pre-port calendar defaults** so the committed calendar SSR fixture
  (pinned to `en-US`) stays byte-for-byte valid.

Resolution (overlay → catalog → key) lives in `translate.ts`; see `translate.md`.

## Tests

`messages.test.ts` (unit) covers the shared `interpolate`. Each of the twelve catalogs has a test
beside its file — `locales/en.test.ts` pins the frozen English values and the English plural rules,
and each other locale's covers its own values and plural rules. Cross-catalog **key parity** is
asserted once, for every registered catalog at once, in `catalogs.test.ts`.

## Rejected alternatives

### `clearLabel` in `common`, shared with every clearable field
**Why not:** it reads generic like `common.close`, but "Clear" is not one string across the surfaces
that will want it — a combobox clears a *selection*, a search field clears *the query*, a filter chip
clears *a facet*, and several locales inflect for that object (pl `Wyczyść` vs `Usuń`, de `Löschen`
vs `Zurücksetzen`). Promoting it to `common` would force one wording on all of them and make the
later split a breaking key rename. A group per component keeps each string retranslatable in place.
**Revisit if:** two component groups end up with a byte-identical `clearLabel` in all twelve
catalogs — then the duplication is real and `common` earns it. `tagsInput.clearLabel` is the first
second instance and it is **not** identical ("Clear all tags" vs `combobox`'s "Clear"), which is the
argument above holding rather than failing; `locales/__tests__/en.test.ts` pins the two apart.

### One shared plural template across locales
**Why not:** no single template spans the rules the shipped catalogs need — English is singular only
at `1`, French treats `count <= 1` as singular, Polish has three forms and Arabic the full six CLDR
cardinal categories. Count-bearing entries are per-locale functions instead; see *Plurals are
functions* above, and `locales/pl.md` / `locales/ar.md` for the two widest rules.

### Per-component message-override props (the calendar's `CalendarMessages` dictionary)
**Why not:** the pre-port shape, and the reason this contract exists. Strings were English-only
defaults overridden per instance, so localizing hope-ui meant handing a translated dictionary to
every component that rendered one, and no locale ever selected between them — zero-config
localization was impossible. The dictionary existed only so the calendar could keep the memoizing
`@solid-primitives/i18n` translator out of its render path; `t("calendar.*")` replaced both in one
change (`6b070d1`).
