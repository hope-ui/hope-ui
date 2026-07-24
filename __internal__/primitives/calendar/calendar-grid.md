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
| `Shift`+`Arrow` | Extend a range (month view + range mode). |
| `Escape` | Cancel the range in progress — `state.clearAnchor()`, so the previously committed range comes back. |
| `Enter` / `Space` | The cell button's native activation (handled by the cell, not here). |

`Escape` consumes the key (`preventDefault` + `stopPropagation`) **only when there was a range to
cancel**; with no anchor the event is left entirely untouched, so it still reaches an enclosing
popover or dialog. When there *is* one, stopping it is the point: the same keypress must not also close
the surface the user is still selecting in. It is always a cancel and never consults the calendar's
`commitBehavior` — that policy is for *walking away* (see `calendar-group.md`), while `Escape` is an
explicit refusal. React Aria splits it the same way (`useCalendarGrid` → `setAnchorDate(null)`).

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
