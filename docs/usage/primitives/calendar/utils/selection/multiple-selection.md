# `multipleSelection`

Multiple `SelectionStrategy`: each activate toggles a day in/out of a set. No range, no anchor, no
preview — the range/preview predicates are all `false` and `extend` is ignored. Pure + stateless.

## Shape

```ts
multipleSelection.select(state, date)     // toggles `date`; the set stays sorted (deterministic payloads)
multipleSelection.isSelected(state, date) // date is in the set (isSameDay)
```

The toggled `CalendarDate[]` is kept sorted so `onValueChange` payloads are deterministic. Ported
verbatim from the Angular calendar.
