# `singleSelection`

Single-date `SelectionStrategy`: activating a day replaces the selection with it. No range, no anchor,
no hover highlight — every range predicate is `false`, `highlightedRange` is `null`, and `extend` is
ignored. Pure + stateless (a shared singleton).

## Shape

```ts
singleSelection.select(state, date)            // → { value: date, anchor: null }
singleSelection.isSelected(state, date)        // isSameDay(date, state.value)
singleSelection.isRange{Start,Middle,End}(…)   // always false
singleSelection.highlightedRange(…)            // always null
```

The `SelectionStrategy` interface + `CalendarValue`/`SelectionState` types, and the
`selectionStrategyFor(mode)` / `firstDateOf(value)` helpers, live in the `selection/index.ts` barrel
(the strategies `import type` them from there). Ported verbatim from the Angular calendar.
