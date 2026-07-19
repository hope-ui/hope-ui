# `createCalendarGrid`

The view-agnostic grid engine for the `<table role="grid">`. Composes `createGridNavigation` (over the
calendar's shared `createListFocus` + `createCollection`) and layers the calendar keyboard on top.

## API

```ts
function createCalendarGrid(
  state: CreateCalendarReturn,
  props: JSX.HTMLAttributes<HTMLTableElement>,
): { props: JSX.HTMLAttributes<HTMLTableElement> };
```

Spread `props` onto the `<table>`. The component renders the rows/cells inside it; the returned props
carry `role="grid"`, `aria-labelledby` (the heading id), `data-view`, the container `tabindex`, and the
composed `onKeyDown` / `onPointerLeave`.

## Keyboard

| Key | Behavior |
| --- | --- |
| `Arrow*` | Roving move. In-scope moves flow day-by-day across weeks (`colWrap="continuous"`, RTL-aware). A move off the visible scope's edge **crosses** into the adjacent period (the cursor + visible scope follow). |
| `Home` / `End` | First / last cell of the current row. |
| `Ctrl`/`Cmd`+`Home` / `End` | First / last cell of the grid. |
| `PageUp` / `PageDown` | Page one period (±month / ±year / ±decade by view). |
| `Shift`+`PageUp` / `PageDown` | ±1 year in month view (APG). |
| `Shift`+`Arrow` | Extend a range (month view + range mode). |
| `Enter` / `Space` | The cell button's native activation (handled by the cell, not here). |

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
