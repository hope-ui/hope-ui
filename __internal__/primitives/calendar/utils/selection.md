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

## The paint predicates take a period, not a date

`isSelected` / `isRangeStart` / `isRangeMiddle` / `isRangeEnd` are asked about the **period a cell
stands for** (`cellPeriod(view, date)` — see `utils/view.md`), so they are overlap tests:

| view | a cell's period | `isSelected` means |
| --- | --- | --- |
| month | `{ date, date }` | the selection covers that day |
| year | the whole month | the selection reaches into that month |
| decade | the whole year | the selection reaches into that year |

`isRange{Start,End}` ask which period **holds** the endpoint (one period can hold both, when the range
fits inside it); `isRangeMiddle` is "overlaps but holds neither". The degenerate month-view period
collapses every one of them back to the day-level test it generalizes, so month view is unchanged. Only
these four take a period — `highlightedRange`'s `endpoint` and `select`'s `date` stay `CalendarDate`,
since a moving endpoint and an activated cell are single days in every view.

`SelectionStrategy` is explicitly an **unstable seam** (`CLAUDE.md` § Architecture); this signature
change is sanctioned churn, not an accident.

The three strategy singletons live beside this module (`single-selection.ts`, `range-selection.ts`,
`multiple-selection.ts`) and `import type` the contract from here. Ported verbatim from the Angular
calendar.
