# `selection`

The shared selection contract for the calendar family: the `SelectionStrategy` interface plus the
`CalendarSelectionMode` / `CalendarValue` / `DateRange` / `SelectionState` / `SelectionResult` /
`SelectOptions` types, and the `selectionStrategyFor(mode)` / `firstDateOf(value)` helpers. Cells and
nav call the stable `SelectionStrategy` interface and **never branch on `mode`** — the active mode's
strategy (`singleSelection` / `rangeSelection` / `multipleSelection`) implements it. Every strategy
method is pure, so the whole seam unit-tests as plain functions.

## Shape

```ts
selectionStrategyFor(mode)   // → the pure, stateless strategy singleton for "single" | "range" | "multiple"
firstDateOf(value)           // → a representative seed date (single → date, range → start, multiple → first), or null
```

### `SelectionState` — what a strategy reads

```ts
interface SelectionState {
  value: CalendarValue;          // the committed selection (union keyed by mode)
  anchor: CalendarDate | null;   // range mode: the in-progress endpoint (null once complete / in single·multiple)
  endpoint: CalendarDate | null; // the roving cursor — the range's *moving* end while anchored
}
```

`endpoint` is the calendar's roving cursor (`focusedDate`), carried in the snapshot so a strategy can
derive the whole painted band — anchor → endpoint while anchored, the committed value otherwise — from
the state **alone**, with no second argument. That mirrors React Aria, where `isSelected` reads its
state object's own `highlightedRange`.

### `SelectionResult` — what a `select` transition returns

```ts
type SelectionResult = Pick<SelectionState, "value" | "anchor">;
```

Deliberately narrower than `SelectionState`: the roving cursor is the calendar's to move, never the
strategy's, so a `select` transition returns only the next `value` + `anchor` and can never return an
`endpoint`.

## The paint predicates take a period, not a date

`isSelected` / `isSelectionStart` / `isSelectionEnd` are asked about the **period a cell stands for**
(`cellPeriod(view, date)` — see `utils/view.md`), so they are overlap tests:

| view | a cell's period | `isSelected` means |
| --- | --- | --- |
| month | `{ date, date }` | the selection covers that day |
| year | the whole month | the selection reaches into that month |
| decade | the whole year | the selection reaches into that year |

`isSelection{Start,End}` ask which period **holds** the band's corresponding endpoint (one period can
hold both, when the band fits inside it — as it always does on a one-day band). There is **no** middle
predicate: range mode paints exactly one band, so a consumer derives the interior as
`isSelected && !isSelectionStart && !isSelectionEnd`. The degenerate month-view period collapses every
one of them back to the day-level test it generalizes, so month view is unchanged. Only these three take
a period — the `endpoint` on `SelectionState` and `select`'s `date` stay bare `CalendarDate`, since a
moving endpoint and an activated cell are single days in every view.

`SelectionStrategy` is explicitly an **unstable seam** (`CLAUDE.md` § Architecture); this signature
change is sanctioned churn, not an accident.

The three strategy singletons live beside this module (`single-selection.ts`, `range-selection.ts`,
`multiple-selection.ts`) and `import type` the contract from here. Ported verbatim from the Angular
calendar.

## Rejected alternatives

### A standalone `types.ts` for the shared selection types
**Why not:** a type-only module is still a source file to `pnpm check:coverage-parity`, which would
then demand its own test *and* usage doc for a file with no runtime behavior. Keeping the types in this
barrel costs nothing instead: the strategies `import type` them from here, and a type import is erased,
so this module can import the strategy singletons back without a runtime cycle.

### `select` returning a full `SelectionState`
**Why not:** it would let a strategy write the calendar's roving cursor, which is the calendar's to
move — the cursor is an *input* to the pure predicates, not an output of a transition. `SelectionResult`
is `Pick<SelectionState, "value" | "anchor">` precisely so that an `endpoint` write is unrepresentable
rather than merely discouraged.
