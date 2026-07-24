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
  corner paint; `highlightedRange(state, endpoint)` returns the tentative `[anchor … endpoint]` span
  while selecting (null otherwise), which the root derives cell membership from.

The first four take the **period a cell stands for** (`cellPeriod` — a day, a month or a year), so they
are overlap tests: `isSelected` is "the range passes through this period", `isRange{Start,End}` are
"this period holds that endpoint" (one period holds both when the range fits inside it), and
`isRangeMiddle` is "overlaps, holds neither". Month view's degenerate `{date, date}` period collapses
each back to the day-level test it generalizes — containment, equality, and strictly-between — so month
view is unchanged. See `utils/view.md`.

`endpoint` is the range's **moving end**, and `createCalendar` passes its **roving cursor**
(`focusedDate`) — never a separate hover signal — so hover and keyboard produce the same band, as in
React Aria's `RangeCalendarState`. The strategy itself stays agnostic: it only needs an anchor and an
endpoint, and returns `null` if either is missing. See `calendar-root.md`.

Ranges are always ordered (`start <= end`). Ported verbatim from the Angular calendar.
