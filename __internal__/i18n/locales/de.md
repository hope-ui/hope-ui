# `MESSAGES_DE` — German catalog

Built-in **German** catalog, selected when the active locale's primary subtag is `de` (`de`, `de-AT`,
`de-CH`, …). Shape + key list: `../messages.md`. Selection + fallback: `catalogs.md`.

- Both count-bearing keys: singular only at `1` — `1 Datum` / `2 Daten`, `1 Option` / `2 Optionen`.
  *verfügbar* is a predicative adjective, so it stays uninflected.
- Nav labels use the idiomatic pager pair *Zurück* / *Weiter* rather than literal *Vorheriger* /
  *Nächster*; an app can override any string via the `I18nProvider` `messages` config.

<!-- no-rejected-alternatives: catalog data — wording is a translation call, and the
question this file raises (whether `de-AT`/`de-CH` deserve their own catalogs rather than sharing
one) is decided in `../catalogs.md`. -->
