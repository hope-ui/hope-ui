# `MESSAGES_FR` — French catalog

The built-in **French** message catalog, available with zero configuration. Selected by the resolver
when the active locale's primary subtag is `fr` (`fr`, `fr-FR`, `fr-CA`, …); any key it somehow
omitted would fall back to `MESSAGES_EN`. Matching is on the **primary subtag, not a prefix** — see
the rejected alternative in `../catalogs.md`, where `frr` (North Frisian) is the case that rules
prefix matching out.

- **Shape + key list:** `../messages.md` (the `I18nMessageMap` contract).
- **Parity:** must mirror every key in `en.ts` — enforced by the `I18nCatalog` type at compile time and
  by the parity test in `fr.test.ts`.
- **Plural rule:** French treats `count <= 1` as singular (so both `0` and `1` stay singular), unlike
  English's singular-only-at-`1`. That is why the count-bearing keys (`calendar.datesSelected`,
  `combobox.countAnnouncement`) are per-locale functions rather than a shared template. Both inflect
  the noun *and* its participle/adjective: `2 dates sélectionnées`, `2 options disponibles`.

<!-- no-rejected-alternatives: catalog data — the argued choice this file illustrates,
per-locale plural *functions* rather than one shared template, belongs to `../messages.md`; catalog
selection and fallback belong to `../catalogs.md`. -->
