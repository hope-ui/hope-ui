# `MESSAGES_PT` — Portuguese catalog

Built-in **Portuguese** catalog, selected when the active locale's primary subtag is `pt` (`pt`,
`pt-PT`, `pt-BR`, …). Shape + key list: `../messages.md`. Selection + fallback: `catalogs.md`.

- Uses European Portuguese wording (e.g. *Seguinte*, *Vista de mês*); Brazilian variants map here too
  and can be overridden per key via the `I18nProvider` `messages` config.
- `datesSelected` plural: singular only at `1`, with feminine agreement (`1 data selecionada` /
  `2 datas selecionadas`).
