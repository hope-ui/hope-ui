# `createCalendarGrid`

The view-agnostic grid engine for the `<table role="grid">`. Composes `createGridNavigation` (over the
calendar's shared `createListFocus` + `createCollection`) and layers the calendar keyboard on top.

## API

```ts
function createCalendarGrid(
  state: CreateCalendarReturn,
  props: JSX.HTMLAttributes<HTMLTableElement>,
): {
  props: JSX.HTMLAttributes<HTMLTableElement>;             // the <table role="grid">
  headerProps: JSX.HTMLAttributes<HTMLTableSectionElement>; // the weekday <thead>
};
```

Spread `props` onto the `<table>`. The component renders the rows/cells inside it; the returned props
carry `role="grid"`, `aria-labelledby` (the heading id), `data-view`, the container `tabindex`, the
composed `onKeyDown`, and the grid's ARIA state below.

## Grid ARIA state

Each is emitted **only when true** — all three default to false in ARIA, so a `"false"` would be noise:

| Attribute | Source |
| --- | --- |
| `aria-readonly` | `state.readOnly()` — navigable and focusable, but nothing commits. |
| `aria-disabled` | `state.disabled()` — pairs with the container `tabindex="-1"` `createListFocus` already returns, so Tab skips the calendar entirely. |
| `aria-multiselectable` | `state.mode() !== "single"` — a range and a multiple-date calendar are equally "more than one cell may be selected". |

`headerProps` is `aria-hidden` (React Aria's `useCalendarGrid`): every day button's accessible name
already **leads with its weekday**, so an exposed column header makes a screen reader announce the
weekday twice per cell. It is a plain static object, but the component still routes the `<thead>`
through `renderElement` — spreading *any* hook props object onto a literal host element allocates its
subtree's `_hk` differently on client vs server (measured: all seven `<th>` came back unclaimed on
hydrate).

**No `onPointerLeave`.** The tentative range band is derived from the roving cursor
(`calendar-root.md`), so it belongs to the anchor, not to a hover: clearing it when the pointer leaves
the grid would erase a band the user is still drawing — and would erase it for the keyboard too. A
consumer's own `onPointerLeave` passes through untouched.

## Keyboard

| Key | Behavior |
| --- | --- |
| `Arrow*` | Roving move. In-scope moves flow day-by-day across weeks (`colWrap="continuous"`, RTL-aware). A move off the visible scope's edge **crosses** into the adjacent period (the cursor + visible scope follow). |
| `Home` / `End` | First / last cell of the current row. |
| `Ctrl`/`Cmd`+`Home` / `End` | First / last cell of the grid. |
| `PageUp` / `PageDown` | Page one period (±month / ±year / ±decade by view). |
| `Shift`+`PageUp` / `PageDown` | ±1 year in month view (APG). |
| `Shift`+`Arrow` | Extend a range (month view + range mode) — see below. |
| `Escape` | Cancel the range in progress — `state.clearAnchor()`, so the previously committed range comes back. |
| `Enter` / `Space` | The cell button's native activation (handled by the cell, not here). |

`Escape` consumes the key (`preventDefault` + `stopPropagation`) **only when there was a range to
cancel**; with no anchor the event is left entirely untouched, so it still reaches an enclosing
popover or dialog. When there *is* one, stopping it is the point: the same keypress must not also close
the surface the user is still selecting in. It is always a cancel and never consults the calendar's
`commitBehavior` — that policy is for *walking away* (see `calendar-group.md`), while `Escape` is an
explicit refusal. React Aria splits it the same way (`useCalendarGrid` → `setAnchorDate(null)`).

## `Shift`+`Arrow` extension

One arrow step from the roving cursor (±1 day horizontally, ±7 vertically, RTL-flipped), handed to
`state.activate(target, { extend: true })` — so the anchor stays put and repeated presses grow the
range from it, and a later plain `Enter` / click commits. What each press does with a day the calendar
would refuse depends on whether the range is allowed to contain one:

- **Contiguous (the default).** The extension stops: the target has to be selectable as it stands.
  Once a range is anchored, `min`/`max` have narrowed to the anchor's available run
  (`calendar-root.md` § Contiguous ranges), so "the run's edge" and "not selectable" are the same
  answer and one predicate covers both.
- **`allowsNonContiguousRanges: true`.** The extension **steps past** unavailable days, landing on the
  first selectable one in that direction (`firstSelectableDateFrom`, `utils/boundary.md`). Skipping is
  only sound here: a contiguous range would have to swallow every day it skipped over.

Either way the cursor and the extension move together or not at all. Before this, an unavailable
target passed the grid's `isOutOfRange` check and was then refused by `activate`, so the cursor did not
move **at all** — with the key already `preventDefault`ed, `Shift`+`Arrow` was simply dead from any day
next to an unavailable one, in both modes.

With nothing selected yet, the first press opens the range at the cursor — the day it is extending
*from* — rather than at the day it lands on; with a range already committed it re-opens **that** range
from its start. Both live in `activate` / `rangeSelection`, not here: see `calendar-root.md`.

## Crossing + deferred focus

Crossing is decided date-first: `resolveViewArrowMove` computes the target; if it stays in scope the
grid's own coordinate roving handles it, otherwise this intercepts *before* the grid sees it and
re-targets the cursor. Because the cursor is a single source of truth, there is no `event.target`
disambiguation (the Angular original needed it for two same-element listeners).

After a cross / page / drill, focus lands on the target cell once it renders — an armed effect that
reads the **settled** cursor (the client build defers the write, so it must not be captured
synchronously) and focuses the first *focusable* cell for that date once its element is connected
(skipping the outgoing scope's trailing outside cell, which shares the date key transiently). This
replaces the Angular `afterNextRender` nudge and is armed only by navigation, so the calendar never
steals focus on mount.

## Rejected alternatives

### An `onPointerLeave` that clears the tentative band
**Why not:** the band is derived from the roving cursor and belongs to the **anchor**, not to a hover,
so clearing it when the pointer leaves the grid erases a band the user is still drawing — and erases
it for the keyboard too, which never produced a `pointerleave` in the first place. It was the shipped
behavior while the preview lived in its own `highlightEnd` signal; see *No `onPointerLeave`* above.

### `Escape` consulting `commitBehavior`
**Why not:** the default policy is `"select"`, so `Escape` would *complete* the tentative range at the
cursor — the opposite of the explicit refusal it means. `commitBehavior` answers what happens when the
user **walks away** (`calendar-group.md`); React Aria splits it the same way (`useCalendarGrid` →
`setAnchorDate(null)`).

### `Escape` consuming the key unconditionally
**Why not:** with no range in progress there is nothing to cancel, and swallowing the key there stops
it reaching the popover or dialog the calendar is rendered in. It is consumed (`preventDefault` +
`stopPropagation`) **only** when there was an anchor — where stopping it is the point, since the same
keypress must not also close the surface the user is still selecting in.

### `Shift`+`Arrow` stepping past an unavailable day in a contiguous range
**Why not:** a contiguous range would have to swallow every day it skipped over, committing days the
calendar refuses to select. Skipping is sound only under `allowsNonContiguousRanges`, which is what
`firstSelectableDateFrom` serves; otherwise the extension stops at the edge of the anchor's available
run, which the narrowed bounds already report as unselectable.

### An exposed weekday `<thead>`
**Why not:** every day button's accessible name already leads with its weekday, so a column header in
the accessibility tree makes a screen reader announce the weekday twice per cell. React Aria's
`useCalendarGrid` hides it for the same reason.

### Spreading `headerProps` onto a literal `<thead>`
**Why not:** spreading *any* hook props object onto a literal host element allocates its subtree's
`_hk` differently on client vs server — measured, all seven `<th>` came back unclaimed on hydrate.
`headerProps` is a plain static object and still routes through `renderElement`.
