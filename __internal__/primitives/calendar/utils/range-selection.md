# `rangeSelection`

Range `SelectionStrategy` — anchor → complete, with hover preview and Shift+Arrow extension. Pure +
stateless.

## Transitions (`select`)

- **First activate** (no anchor): anchors at `date` — "selecting". `value` is **not** written; it keeps
  whatever range was committed before, and the band is derived from the anchor and the roving cursor.
  The caller emits nothing yet.
- **Second activate** (anchor set, not extending): completes — `value = order(anchor, date)`,
  `anchor = null`. The caller emits the committed, ordered range.
- **`extend`** (Shift+Arrow): keeps the anchor and slides the moving endpoint, staying "selecting" so
  repeated extensions grow from one anchor; a later plain activate commits. With no anchor it re-opens
  the **committed** range, anchoring at its `start` — so extending out of a finished range grows it
  instead of replacing it. That branch is what `createCalendar`'s `activate` reaches on the first
  `Shift`+`Arrow` after a range completes; with nothing committed at all, `activate` seeds the range at
  its roving cursor *before* calling here, because the strategy sees no cursor and would otherwise
  anchor on the day being moved to (the `?? date` fallback that keeps this function total). See
  `calendar-root.md` § Extending a range.

`value` is therefore written on **exactly one** transition — the completing activate, never the
anchoring first click. That is React Aria's contract, and it is what keeps a controlled consumer from
holding a value it was never told about for the whole duration of a range selection.

## The one-band model

Range mode paints **one** band — React Aria's `highlightedRange`, a single field with two phases:
**tentative** while a selection is anchored (anchor → the roving cursor), and the **committed** value
when it is not. `highlightedRange(state)` returns exactly that band, and the three paint predicates are
membership in it:

- `isSelected` — the band passes through the cell's period.
- `isSelectionStart` / `isSelectionEnd` — the period holds the band's start / end endpoint (one period
  holds both when the band fits inside it, e.g. a one-day band).

There is **no** middle predicate: the interior is derived as
`isSelected && !isSelectionStart && !isSelectionEnd`. One band → one attribute vocabulary
(`data-selected` + `data-selection-{start,end}`) → no ambiguity about which band a "start" belongs to.
The consequence, and it is intended: while a new range is being dragged, the previously committed range
stops painting — the band always shows the selection the next activate would produce, exactly as React
Aria does.

All three predicates read the **period a cell stands for** (`cellPeriod` — a day, a month or a year), so
they are overlap tests: in year/decade view a month/year cell paints as soon as the band passes through
it, and it carries the start/end corner when it is the period that endpoint falls in. Month view's
degenerate `{date, date}` period collapses each back to the day-level test it generalizes — containment,
equality — so month view is unchanged. See `utils/view.md`.

The moving endpoint is carried on the `SelectionState` snapshot as `endpoint`, and `createCalendar` sets
it to the **roving cursor** (`focusedDate`) — never a separate hover signal — so hover and keyboard
produce the same band, as in React Aria's `RangeCalendarState`. The strategy stays agnostic: it needs
only the anchor and that endpoint, and `highlightedRange` returns `null` when nothing is anchored and
nothing is committed, or when the anchor is set but the endpoint is missing.

Ranges are always ordered (`start <= end`). Ported verbatim from the Angular calendar.

## Rejected alternatives

### Two coexisting bands (a committed range plus a separate tentative one)
**Why not:** two bands need two attribute vocabularies — `data-range-*` alongside
`data-highlighted{,-start,-end}` — and a cell carrying a "start" answers nothing about *which* band it
starts, so the preset had to cascade both. Collapsing to React Aria's single `highlightedRange` (one
field, two phases) leaves one vocabulary and one derived middle; the accepted cost is the one named in
*The one-band model* above — a range being dragged hides the previously committed one, exactly as RA
does.

### Writing `value` on the anchoring first activate (a degenerate `{ date, date }` range)
**Why not:** a controlled consumer then holds a one-day range its owner was never told about, for the
whole duration of the selection. It also forced a `valueBeforeAnchor` snapshot, a restore inside
`clearAnchor`, a `lastEmitted` dance in `clearSelection` and a mid-selection guard in `formValues` —
all of which collapsed once the write moved to the completing activate. The affordance it provided
(the first click visibly doing *something* from the keyboard) is now `focusNearestAvailableDate`'s
cursor advance instead.

### An independent hover signal for the moving endpoint (`highlightEnd`)
**Why not:** one endpoint too many, and it produced four defects at once — the keyboard previewed
nothing (arrowing from an anchor left `highlightedRange()` null), a hover that predated the anchor
froze a band that actively lied about what the next click would commit, `pointerleave` erased a band
the anchor still owned, and hovering an outside-month or unavailable day previewed a range the matching
click refuses. Deriving the band from the roving cursor makes hover and keyboard one code path that
cannot disagree, at React Aria's accepted side effect: while anchored, hovering moves the roving tab
stop.
