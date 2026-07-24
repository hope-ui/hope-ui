# `multipleSelection`

Multiple `SelectionStrategy`: each activate toggles a day in/out of a set. No range, no anchor, no
highlight — the range predicates are all `false`, `highlightedRange` is `null`, and `extend` is
ignored. Pure + stateless.

## Shape

```ts
multipleSelection.select(state, date)       // toggles `date`; the set stays sorted (deterministic payloads)
multipleSelection.isSelected(state, period) // any day in the set falls in the cell's period
```

`period` is what the cell stands for (`cellPeriod` — see `utils/view.md`): in year/decade view every
month/year holding a selected day lights up, and in month view the degenerate `{date, date}` period
makes `isSelected` the same-day membership test it has always been.

The toggled `CalendarDate[]` is kept sorted so `onValueChange` payloads are deterministic. Ported
verbatim from the Angular calendar.
