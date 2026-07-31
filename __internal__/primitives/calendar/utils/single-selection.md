# `singleSelection`

Single-date `SelectionStrategy`: activating a day replaces the selection with it. No anchor, no hover
band, `extend` is ignored, and `highlightedRange` is always `null`. But the selected day is a
**degenerate one-day band**, so it caps **both** endpoints: `isSelected`, `isSelectionStart` and
`isSelectionEnd` are all true on it. Pure + stateless (a shared singleton).

## Shape

```ts
singleSelection.select(state, date)               // → { value: date, anchor: null }
singleSelection.isSelected(state, period)         // the selected day falls in the cell's period
singleSelection.isSelectionStart(state, period)   // same as isSelected — the day caps the band's start…
singleSelection.isSelectionEnd(state, period)     // …and its end (a one-day band caps both ends)
singleSelection.highlightedRange(…)               // always null
```

Capping both ends is deliberate. The band interior is derived as
`isSelected && !isSelectionStart && !isSelectionEnd` (which is also how the preset's
`data-selection-middle` variant computes it), so reporting *both* endpoints is what keeps that derived
middle empty in this mode.

`period` is what the cell stands for (`cellPeriod` — see `utils/view.md`): in year/decade view the
month/year holding the selected day lights up, and in month view the degenerate `{date, date}` period
makes `isSelected` the same-day test it has always been.

The `SelectionStrategy` interface + `CalendarValue`/`SelectionState` types, and the
`selectionStrategyFor(mode)` / `firstDateOf(value)` helpers, live in the sibling `selection.ts` module
(the strategies `import type` them from there). Ported verbatim from the Angular calendar.

## Rejected alternatives

### Reporting neither endpoint for a selected day
**Why not:** it is the natural reading of "single mode has no band", and it silently loses the endpoint
paint — with the middle derived as `isSelected && !isSelectionStart && !isSelectionEnd`, a selected day
carrying no endpoint matches the preset's `data-selection-middle` variant and paints as band *interior*
instead of a pill. Treating the day as a degenerate one-day band that caps both ends is what keeps the
derived middle empty outside range mode.
