# `createCalendarCell`

A single calendar cell: a `<td role="gridcell">` wrapping the inner `<button>` that is the roving focus
target. One `createCalendarCell` per rendered cell.

## API

```ts
function createCalendarCell(
  state: CreateCalendarReturn,
  options: {
    date: Accessor<CalendarDate>;
    label?: Accessor<string>;
    isOutside?: Accessor<boolean>;
  },
): {
  props: JSX.HTMLAttributes<HTMLTableCellElement>;      // the <td>
  triggerProps: JSX.ButtonHTMLAttributes<HTMLButtonElement>; // the inner <button>
  setTriggerRef: (element: HTMLButtonElement) => void;
  dayState: Accessor<CalendarDayState>;
};
```

Render `<td {...props}><button {...triggerProps} ref={setTriggerRef}>{label}</button></td>`. `dayState`
is the render seam for a custom cell body (the same flags the default cell derives).

## Behavior

- Registers the button into the calendar's shared collection, `disabled` when the date is
  non-focusable (outside-scope / whole out-of-range), so the grid skips it.
- `onClick` (which native `Enter`/`Space`/pointer all fire) → `activate`, refused on an inert cell.
- `onMouseDown` prevents native click-focus landing on an inert cell.
- `onFocus` syncs the roving cursor (`setFocusedDate`), guarded off inert cells. It is untracked
  because `createListFocus` may fire it synchronously from inside its own effect.
- `onMouseEnter` feeds the range hover preview.

## Attributes

- `<td>`: `role="gridcell"` and `aria-selected` — the ARIA grid-cell semantics only. **No `data-*`
  paint hooks live here.**
- `<button>`: the view-aware `aria-label` (with Today / selected / range-start / range-end / unavailable
  suffixes), `aria-disabled` for unavailable days, `tabindex` — `0` on the focused cell, `-1` elsewhere
  (the tab stop derives from `isFocused`, a date comparison, so it is correct on the server too,
  independent of the client-only collection) — **and every `data-*` day-state paint hook**: `data-today`,
  `data-outside-month`, `data-unavailable` (the `isDateDisabled` predicate hit — struck through, still
  interactive), `data-disabled` (a whole out-of-range period — inert + dimmed), `data-selected`,
  `data-range-{start,middle,end}`, `data-highlighted` (the tentative hover-range band), `data-focused`
  (present-when-true).

The paint hooks live on the **button**, not the `<td>`, on purpose: a styled recipe paints the day on
the button (`cellTrigger`), and the registered day-state custom variants in `@hope-ui/presets`
`_base/_variants.css` are **self-based** (`&:where([data-today])`) — a hook on the `<td>` would never
fire a `data-today:` utility on its child button. Names match that canonical variant list.

`data-unavailable` and `data-disabled` are **distinct** (React-Aria's `isUnavailable` vs `isDisabled`
split), never both on one day: an unavailable day is focusable + announced (aria-disabled) but stays
pointer-interactive; an out-of-range day is fully inert. So a recipe can strike the former and dim the
latter without the two treatments stacking.
