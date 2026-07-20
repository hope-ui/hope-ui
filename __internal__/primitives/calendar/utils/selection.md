# `selection`

The shared selection contract for the calendar family: the `SelectionStrategy` interface plus the
`CalendarSelectionMode` / `CalendarValue` / `DateRange` / `SelectionState` / `SelectOptions` types, and
the `selectionStrategyFor(mode)` / `firstDateOf(value)` helpers. Cells and nav call the stable
`SelectionStrategy` interface and **never branch on `mode`** — the active mode's strategy
(`singleSelection` / `rangeSelection` / `multipleSelection`) implements it. Every strategy method is
pure, so the whole seam unit-tests as plain functions.

## Shape

```ts
selectionStrategyFor(mode)   // → the pure, stateless strategy singleton for "single" | "range" | "multiple"
firstDateOf(value)           // → a representative seed date (single → date, range → start, multiple → first), or null
```

The three strategy singletons live beside this module (`single-selection.ts`, `range-selection.ts`,
`multiple-selection.ts`) and `import type` the contract from here. Ported verbatim from the Angular
calendar.
