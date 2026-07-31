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
is the render seam for a custom cell body — the same flags the default cell paints with, so a custom
body can mirror the default look exactly:

```ts
interface CalendarDayState {
  date: CalendarDate;         // the date this cell represents
  label: string;             // localized, view-aware short label (day number / month name / year)
  isToday: boolean;          // view-aware: today's day / month / year
  isOutside: boolean;        // a leading/trailing filler cell outside the visible scope
  isSelected: boolean;       // inside the painted band (any mode)
  isSelectionStart: boolean; // holds the band's start endpoint (both endpoints true on a one-day band)
  isSelectionEnd: boolean;   // holds the band's end endpoint
  isFocused: boolean;        // the roving cursor is on this cell
  isUnavailable: boolean;    // `isDateDisabled` hit — focusable + announced, but not selectable
  isDisabled: boolean;       // inert (out-of-range / whole calendar disabled); distinct from unavailable
}
```

There is **no** `isRange*` or `isHighlighted*` flag, and no "middle": range mode paints one band
(tentative while anchored, committed when idle — see `calendar-root.md`), so a consumer derives the
interior as `isSelected && !isSelectionStart && !isSelectionEnd`.

## Behavior

- Registers the button into the calendar's shared collection, `disabled` when the date is
  non-focusable (outside-scope / whole out-of-range / whole calendar `disabled`), so the grid skips it.
- Activation runs through `createPress`, not a raw `onClick`: `onPress` → `activate`, refused on an
  inert cell (the press engine's `disabled` short-circuits every interaction, so a forced click still
  never selects). The press engine reports the `pointerType`, and that is what gates the keyboard-only
  **range auto-advance**: after a **keyboard** press that *begins* a range (`activate` returns "began a
  range"), the cursor steps one day past the anchor (`focusNearestAvailableDate` — see
  `calendar-root.md`) so the two-day band reads as "range in progress". A pointer press gets that signal
  from hover instead and does not advance; a screen reader's **virtual** click selects but does **not**
  advance — React Aria routes it down a distinct branch, and gating on the press engine's `pointerType`
  (never `event.detail`, which a virtual click shares with `Enter`) is what keeps AT users out of the
  sighted-keyboard path. See the porting rule in `__internal__/reference-implementations.md`.
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
  **plus the band-level selection hooks**: `data-selected` and its two endpoints `data-selection-start`
  / `data-selection-end`. (The `<td>` now carries `data-selected` — it did not before — because the
  CSS-derived middle keys off `[data-selected]` on the same element as the endpoints.) The per-day hooks
  (`data-today`, `data-outside-month`, `data-unavailable`, `data-disabled`, `data-focused`,
  `data-pressed`) deliberately stay off it.
- `<button>`: the view-aware `aria-label` (with Today / selected / range-start / range-end / unavailable
  suffixes), `aria-disabled` again, `tabindex` — `0` on the focused cell, `-1` elsewhere and on **every**
  non-focusable cell (both halves are date comparisons, so the tab stop is correct on the server too,
  independent of the client-only collection) — **and every `data-*` day-state paint hook**: `data-today`,
  `data-outside-month`, `data-unavailable` (the `isDateDisabled` predicate hit — struck through, still
  interactive), `data-disabled` (`isCellDisabled` — a whole out-of-range period, or the whole calendar
  `disabled`: inert + dimmed), `data-selected`, `data-selection-start`, `data-selection-end`,
  `data-focused` (present-when-true), and `data-pressed` (`createPress`'s pressed state,
  present-when-true — React Aria emits it, and adopting the press engine gets it for free).

`aria-disabled` lands on **both** elements, as React Aria does, so the state reads the same whether an
assistive technology lands on the grid cell or on its inner control.

The split is what lets one range read as one shape: the registered day-state custom variants in
`@hope-ui/presets` `_base/_variants.css` are **self-based** (`&:where([data-today])`), so a hook fires
utilities only on the element carrying it. The `<td>` (`cell` slot) paints the continuous band that
spans cells — hence the selection hooks (`data-selected` + its two endpoints) are mirrored there — while
the `<button>` (`cellTrigger`) paints the solid endpoint pills and per-day marks on top of it. Names
match that canonical variant list.

There is **no** middle attribute — React Aria emits none. A recipe derives the band interior in CSS as
`[data-selected]:not([data-selection-start]):not([data-selection-end])`; the preset registers exactly
that chain as the `data-selection-middle` custom variant, so a recipe keeps an authoring name at zero
DOM cost. Range mode paints **one** band — tentative (anchor → roving cursor) while a selection is
anchored, the committed range when it is not — so a "highlight" and a "selection" are no longer two
things to disambiguate but one band in two phases (see `calendar-root.md`); that is why the old
`data-range-*` / `data-highlighted*` two-band vocabulary is gone.

On a **one-day** band both endpoints fall on the same cell, so `data-selection-start` and
`data-selection-end` are both present and the derived middle is empty. That is the normal state of every
single- and multiple-mode selection (each selected day is a degenerate one-day band that caps both its
ends — see `utils/single-selection.md` / `utils/multiple-selection.md`) and of a range the instant it
anchors, before the cursor has moved off the anchor.

The selection hooks — `aria-selected`, `data-selected`, `data-selection-{start,end}` and the
`aria-label`'s "selected" / range-endpoint suffixes — are **absent on a day the calendar cannot
select**, because `createCalendar` gates all three predicates on `!isCellDisabled && !isDateUnavailable`
(see `calendar-root.md`). An unavailable or out-of-range day inside a committed range therefore reads
`data-unavailable` / `data-disabled` alone, and the band visibly breaks around it. The outside-month
filler days are *not* gated out, so a range crossing the month boundary still paints as one band.

`data-unavailable` and `data-disabled` are **distinct** (React-Aria's `isUnavailable` vs `isDisabled`
split) and **independent, not mutually exclusive**: an unavailable day is focusable + announced
(aria-disabled) but stays pointer-interactive, while an out-of-range or whole-calendar-disabled day is
fully inert — and a day that is *both* carries both at once. That is any unavailable day the bounds also
put out of range, which — since a contiguous range narrows the bounds to the anchor's available run — is
routinely the unavailable day bounding that run, for as long as the range is in progress (see
`calendar-root.md`). So a recipe must make the two readable **together** (struck *and* dimmed) rather
than assume one excludes the other.

## Rejected alternatives

### `event.detail === 0` as the keyboard discriminator
**Why not:** a screen reader's **virtual click** carries `detail === 0` exactly as `Enter` does, and
React Aria routes that case down a deliberately different branch — select the date, but do **not**
advance the cursor (`useCalendarCell.ts:307`). Gating the auto-advance on `detail` would have silently
given AT users the sighted-keyboard behavior, and no sighted-keyboard test would have caught it. The
episode is what the porting rule in `__internal__/reference-implementations.md` was written from.

### An ad-hoc `onKeyDown` handler instead of `createPress`
**Why not:** it re-derives a slice of a press state machine the kernel already ships — `createPress`
already models `mouse | pen | touch | keyboard | virtual` — and it still cannot tell a virtual click
from `Enter`, which is the one distinction the auto-advance turns on. Same porting rule: a narrower
hand-rolled substitute is not a cheaper route to the same behavior, it is a different behavior.

### React Aria's pre-select `!state.anchorDate` read
**Why not:** RA decides the auto-advance by reading the anchor *before* selecting; here that answer is
wrong twice over. `createCalendar` is one hook for all three selection modes where RA has a separate
range state object, so "there was no anchor" is not the same as "a range began" (single/multiple, a
refused day and a year/decade drill all clear the first bar). And re-reading `anchorDate()` *after*
`activate` cannot work either: under solid-js 2.0's client build a signal write is invisible to a
plain read until the next flush. Hence `activate` returns the fact itself.

### The old click handler's unconditional `preventDefault()`
**Why not:** a `<button type="button">` has no default click action to suppress, and
`defaultPrevented` is `createPress`'s cancel channel — keeping the call would have cancelled every
activation. The inert-cell guard it used to carry is now `createPress`'s `disabled`, which
short-circuits every interaction including the click.

### Band hooks on the `<button>` alone
**Why not:** the registered day-state custom variants are **self-based** (`&:where([data-today])`), so
a hook fires utilities only on the element carrying it — with the selection hooks on the trigger only,
the `cell` slot could not paint the continuous band that spans cells, and the endpoints rendered with
notches while a hover washed the band out. Hence `data-selected` + its two endpoints are mirrored onto
the `<td>`, while the per-day hooks stay off it.
