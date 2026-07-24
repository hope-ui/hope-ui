# `multipleSelection`

Multiple `SelectionStrategy`: each activate toggles a day in/out of a set. No anchor, no hover band,
`extend` is ignored, and `highlightedRange` is always `null`. But each selected day is its own
**degenerate one-day band**, so it caps **both** endpoints: `isSelectionStart` and `isSelectionEnd`
match `isSelected` for every day in the set. Pure + stateless.

## Shape

```ts
multipleSelection.select(state, date)             // toggles `date`; the set stays sorted (deterministic payloads)
multipleSelection.isSelected(state, period)       // any day in the set falls in the cell's period
multipleSelection.isSelectionStart(state, period) // same as isSelected — each day caps its own band…
multipleSelection.isSelectionEnd(state, period)   // …at both ends
multipleSelection.highlightedRange(…)             // always null
```

Each day capping both its ends is the same reasoning as single mode: the band interior is derived as
`isSelected && !isSelectionStart && !isSelectionEnd` (the preset's `data-selection-middle` variant), so
reporting both endpoints keeps that middle empty and every selected day paints as a discrete pill rather
than band interior.

`period` is what the cell stands for (`cellPeriod` — see `utils/view.md`): in year/decade view every
month/year holding a selected day lights up, and in month view the degenerate `{date, date}` period
makes `isSelected` the same-day membership test it has always been.

The toggled `CalendarDate[]` is kept sorted so `onValueChange` payloads are deterministic. Ported
verbatim from the Angular calendar.
