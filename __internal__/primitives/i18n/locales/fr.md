# `MESSAGES_FR` — French catalog

The built-in **French** message catalog, available with zero configuration. Selected by the resolver
when the active locale starts with `fr` (e.g. `fr`, `fr-FR`, `fr-CA`); any key it somehow omitted would
fall back to `MESSAGES_EN`.

- **Shape + key list:** `../messages.md` (the `I18nMessageMap` contract).
- **Parity:** must mirror every key in `en.ts` — enforced by the `I18nCatalog` type at compile time and
  by the parity test in `fr.test.ts`.
- **Plural rule:** French treats `count <= 1` as singular (so both `0` and `1` stay singular), unlike
  English's singular-only-at-`1`. That is why `calendar.datesSelected` is a per-locale function rather
  than a shared template.
