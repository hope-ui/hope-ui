# `MESSAGES_AR` — Arabic catalog

Built-in **Arabic** (Modern Standard Arabic) catalog, selected when the active locale's primary
subtag is `ar` (`ar`, `ar-EG`, `ar-SA`, …). Shape + key list: `../messages.md`. Selection + fallback:
`catalogs.md`.

- **Right-to-left.** `getReadingDirection("ar")` is `rtl`; consumers lay out accordingly.
- Both count-bearing keys (`calendar.datesSelected`, `combobox.countAnnouncement`) implement the full
  six-category Arabic CLDR cardinal rule — `zero` (0), `one` (1), `two` (2), `few` (`n % 100` = 3–10),
  `many` (`n % 100` = 11–99), `other` (everything else, e.g. 100/101/102/200…). `zero`/`one`/`two`
  read as fixed phrases; `few`/`many`/`other` interpolate the count, and inflect the noun with it
  (`3 خيارات` plural, `11 خيارًا` accusative singular, `100 خيار` genitive singular).

<!-- no-rejected-alternatives: catalog data — the six CLDR cardinal categories are the
Arabic rule itself, and expressing plurals as per-locale functions is decided in `../messages.md`;
right-to-left resolution belongs to `../direction.md`. -->
