# `rangeSelection`

Range `SelectionStrategy` — anchor → complete, with hover preview and Shift+Arrow extension. Pure +
stateless.

## Transitions (`select`)

- **First activate** (no anchor): begins a collapsed range at `date` (`value = {date, date}`,
  `anchor = date`) — "selecting". The caller emits nothing yet.
- **Second activate** (anchor set, not extending): completes — `value = order(anchor, date)`,
  `anchor = null`. The caller emits the committed, ordered range.
- **`extend`** (Shift+Arrow): keeps the anchor and slides the moving endpoint, staying "selecting" so
  repeated extensions grow from one anchor; a later plain activate commits. With no anchor it re-opens
  from the committed start.

## Predicates

- `isSelected` covers the whole committed span; `isRange{Start,Middle,End}` refine endpoints for
  corner paint; `highlightedRange` returns the tentative `[anchor … highlightEnd]` span while
  selecting (null otherwise), which the root derives cell membership from.

Ranges are always ordered (`start <= end`). Ported verbatim from the Angular calendar.
