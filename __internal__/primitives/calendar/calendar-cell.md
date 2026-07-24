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
  non-focusable (outside-scope / whole out-of-range / whole calendar `disabled`), so the grid skips it.
- `onClick` (which native `Enter`/`Space`/pointer all fire) → `activate`, refused on an inert cell.
- `onMouseDown` prevents native click-focus landing on an inert cell.
- `onFocus` syncs the roving cursor (`setFocusedDate`), guarded off inert cells. It is untracked
  because `createListFocus` may fire it synchronously from inside its own effect.
- `onMouseEnter` → `highlightDate`, which moves the **roving cursor** (the tentative band's moving
  endpoint — see `calendar-root.md`). Gated on `isSelectable`: a non-focusable or unavailable day is
  skipped, so hovering a day the range could not end on neither previews a range the click would
  refuse nor drags the tab stop onto an inert cell.

## `isSelectable`

React Aria's single gate — `!isDateNonFocusable(date) && !isDateUnavailable(date)` — behind both
`aria-disabled` and the hover preview. It is true for a day this calendar could actually select, so it
is false for out-of-range, outside-month, unavailable **and** whole-calendar-`disabled` days alike.

The roving tab stop is gated one notch looser, on `isDateNonFocusable` alone: an *unavailable* day is
still reachable (that is the whole point of the unavailable/disabled split), so it can hold the cursor.

## Attributes

- `<td>`: `role="gridcell"`, `aria-selected` and `aria-disabled` — the ARIA grid-cell semantics —
  **plus the band-level hooks only**: `data-range-{start,middle,end}`, `data-highlighted` (the
  tentative anchor → cursor band) and its endpoints `data-highlighted-{start,end}`. The per-day hooks
  (`data-selected`, `data-today`, …) deliberately stay off it.
- `<button>`: the view-aware `aria-label` (with Today / selected / range-start / range-end / unavailable
  suffixes), `aria-disabled` again, `tabindex` — `0` on the focused cell, `-1` elsewhere and on **every**
  non-focusable cell (both halves are date comparisons, so the tab stop is correct on the server too,
  independent of the client-only collection) — **and every `data-*` day-state paint hook**: `data-today`,
  `data-outside-month`, `data-unavailable` (the `isDateDisabled` predicate hit — struck through, still
  interactive), `data-disabled` (`isCellDisabled` — a whole out-of-range period, or the whole calendar
  `disabled`: inert + dimmed), `data-selected`, `data-range-{start,middle,end}`, `data-highlighted`,
  `data-highlighted-{start,end}`, `data-focused` (present-when-true).

`aria-disabled` lands on **both** elements, as React Aria does, so the state reads the same whether an
assistive technology lands on the grid cell or on its inner control.

The split is what lets one range read as one shape: the registered day-state custom variants in
`@hope-ui/presets` `_base/_variants.css` are **self-based** (`&:where([data-today])`), so a hook fires
utilities only on the element carrying it. The `<td>` (`cell` slot) paints the continuous band that
spans cells — hence the range/highlight hooks are mirrored there — while the `<button>` (`cellTrigger`)
paints the solid endpoint pills and per-day marks on top of it. Names match that canonical variant list.

`data-highlighted-start` / `data-highlighted-end` mark the tentative band's two ends (both land on the
same date when the preview is one day — on the anchor the moment it is set, and again whenever the
cursor returns to it), so a recipe can cap the preview the way it caps the committed range instead of
leaving it squared off mid-drag.

The selection hooks — `aria-selected`, `data-selected`, `data-range-{start,middle,end}` and the
`aria-label`'s "selected" / range-endpoint suffixes — are **absent on a day the calendar cannot
select**, because `createCalendar` gates all four predicates on `!isCellDisabled && !isDateUnavailable`
(see `calendar-root.md`). An unavailable or out-of-range day inside a committed range therefore reads
`data-unavailable` / `data-disabled` alone, and the band visibly breaks around it. The outside-month
filler days are *not* gated out, so a range crossing the month boundary still paints as one band.

`data-unavailable` and `data-disabled` are **distinct** (React-Aria's `isUnavailable` vs `isDisabled`
split), never both on one day: an unavailable day is focusable + announced (aria-disabled) but stays
pointer-interactive; an out-of-range or whole-calendar-disabled day is fully inert. So a recipe can
strike the former and dim the latter without the two treatments stacking.
