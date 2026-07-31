# `MESSAGES_PT` — Portuguese catalog

Built-in **Portuguese** catalog, selected when the active locale's primary subtag is `pt` (`pt`,
`pt-PT`, `pt-BR`, …). Shape + key list: `../messages.md`. Selection + fallback: `catalogs.md`.

- Uses European Portuguese wording (e.g. *Seguinte*, *Vista de mês*); Brazilian variants map here too
  and can be overridden per key via the `I18nProvider` `messages` config.
- Both count-bearing keys: singular only at `1`, with feminine agreement — `1 data selecionada` /
  `2 datas selecionadas`, `1 opção disponível` / `2 opções disponíveis`.

<!-- no-rejected-alternatives: catalog data — the European-versus-Brazilian wording
question is the regional-variant decision owned by `../catalogs.md` (one catalog per primary subtag,
overridable per key), not a rejection recorded here. -->
