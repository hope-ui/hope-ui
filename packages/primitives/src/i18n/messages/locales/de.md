# `MESSAGES_DE` — German catalog

Built-in **German** catalog, selected when the active locale's primary subtag is `de` (`de`, `de-AT`,
`de-CH`, …). Shape + key list: `../messages.md`. Selection + fallback: `catalogs.md`.

- `datesSelected` plural: singular only at `1` (`1 Datum`), plural otherwise (`2 Daten`).
- Nav labels use the idiomatic pager pair *Zurück* / *Weiter* rather than literal *Vorheriger* /
  *Nächster*; an app can override any string via the `I18nProvider` `messages` config.
