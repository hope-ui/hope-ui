# `MESSAGES_PL` — Polish catalog

Built-in **Polish** catalog, selected when the active locale's primary subtag is `pl`. Shape + key
list: `../messages.md`. Selection + fallback: `catalogs.md`.

- Both count-bearing keys implement the **three Polish plural forms**: `1` → singular; `2–4` (except
  `12–14`) → paucal; everything else including `0` and `5–21` → genitive plural.
  - `calendar.datesSelected`: `datę` / `daty` / `dat`. The announcement uses the impersonal
    *Wybrano N …* to avoid gender agreement.
  - `combobox.countAnnouncement`: the feminine *opcja* carries its adjective through the same three
    forms — `1 opcja dostępna` / `2 opcje dostępne` / `5 opcji dostępnych`.

<!-- no-rejected-alternatives: catalog data — the three-form rule is Polish grammar, and
the decision to express plurals as per-locale functions at all belongs to `../messages.md`. -->
