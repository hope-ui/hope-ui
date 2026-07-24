# `singleSelection`

Single-date `SelectionStrategy`: activating a day replaces the selection with it. No range, no anchor,
no hover highlight — every range predicate is `false`, `highlightedRange` is `null`, and `extend` is
ignored. Pure + stateless (a shared singleton).

## Shape

```ts
singleSelection.select(state, date)            // → { value: date, anchor: null }
singleSelection.isSelected(state, period)      // the selected day falls in the cell's period
singleSelection.isRange{Start,Middle,End}(…)   // always false
singleSelection.highlightedRange(…)            // always null
```

`period` is what the cell stands for (`cellPeriod` — see `utils/view.md`): in year/decade view the
month/year holding the selected day lights up, and in month view the degenerate `{date, date}` period
makes `isSelected` the same-day test it has always been.

The `SelectionStrategy` interface + `CalendarValue`/`SelectionState` types, and the
`selectionStrategyFor(mode)` / `firstDateOf(value)` helpers, live in the sibling `selection.ts` module
(the strategies `import type` them from there). Ported verbatim from the Angular calendar.
