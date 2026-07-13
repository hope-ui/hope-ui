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

- `<td>`: `role="gridcell"`, `aria-selected`, and the `data-*` paint hooks (`data-today`, `data-outside`,
  `data-selected`, `data-range-{start,middle,end}`, `data-preview`, `data-focused`, `data-disabled` —
  present-when-true).
- `<button>`: the view-aware `aria-label` (with Today / selected / range-start / range-end / unavailable
  suffixes), `aria-disabled` for unavailable days, and `tabindex` — `0` on the focused cell, `-1`
  elsewhere. The tab stop derives from `isFocused` (a date comparison), so it is correct on the server
  too, independent of the client-only collection.
