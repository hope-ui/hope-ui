# Calendar — React Aria parity (naming + model + keyboard auto-advance)

Status: **planned, not started.** Decided 2026-07-24. Everything below was verified against
React Aria `main` and against this repo; nothing here is from memory.

The calendar diverged from React Aria on three axes at once: the **paint attribute vocabulary**,
the **selection model** those attributes describe, and a **missing keyboard affordance**. They are
one change, not three — the sections below explain why splitting them creates a worse intermediate
state than either endpoint.

---

## 0. What React Aria actually does (verified source)

Two layers, and the split matters — it is the reason the divergence went unnoticed:

- `packages/react-aria/src/calendar/` (the **hooks**) and `packages/react-stately/src/calendar/`
  expose **no** endpoint flags at all. `useCalendarCell` returns only
  `{isSelected, isDisabled, isUnavailable, isOutsideVisibleRange, isInvalid, isPressed, isFocused, formattedDate}`.
- `packages/react-aria-components/src/Calendar.tsx` (the **component**) computes them and emits the
  attributes:

```tsx
// react-aria-components/src/Calendar.tsx  (~:717)
let isSelectionStart = false;
let isSelectionEnd = false;
if ('highlightedRange' in state && state.highlightedRange) {
  isSelectionStart = isSameDay(date, state.highlightedRange.start);
  isSelectionEnd = isSameDay(date, state.highlightedRange.end);
}
// …emitted at ~:748
'data-outside-month':  isOutsideMonth || undefined,
'data-selected':       states.isSelected || undefined,
'data-selection-start': isSelectionStart || undefined,
'data-selection-end':   isSelectionEnd || undefined,
```

There is **no** `data-range-*` and **no** middle attribute anywhere in React Aria. RAC's own styling
derives the middle in CSS: `[data-selected]:not([data-selection-start]):not([data-selection-end])`.

### The model behind the vocabulary

`useRangeCalendarState.highlightedRange` is **one field with two phases**:

```
highlightedRange = anchorDate ? makeRange(anchorDate, focusedDate) : (value && makeRange(value.start, value.end))
```

Tentative while anchored, committed when idle. `isSelected(date)` is membership in *that*. One band
→ one vocabulary → "selection" is the natural noun and nothing collides.

hope-ui currently paints **two** bands simultaneously (`packages/primitives/src/calendar/calendar-root.ts:562-593`):
committed (`isSelected` + `isRange{Start,Middle,End}`, read off `value`) and tentative
(`isHighlighted` + `isHighlighted{Start,End}`, read off `highlightedRange()` = anchor → roving
cursor). Two coexisting bands is *why* the names had to diverge — `data-selection-start` would have
been ambiguous.

### The keyboard auto-advance

```ts
// react-aria/src/calendar/useCalendarCell.ts:300
} else if (e.pointerType === 'keyboard' && !state.anchorDate) {
  // For range selection, auto-advance the focused date by one if using keyboard.
  // This gives an indication that you're selecting a range rather than a single date.
  // For mouse, this is unnecessary because users will see the indication on hover. …
  state.selectDate(date);
  state.focusNearestAvailableDate(date);
} else if (e.pointerType === 'virtual') {   // :307 — screen reader: select, do NOT advance
  state.selectDate(date);
  state.setFocusedDate(date);
  state.setFocused(true);
}
```

```ts
// react-stately/src/calendar/useRangeCalendarState.ts:261
focusNearestAvailableDate(anchorDate) {
  let availableRange = getAvailableRange(anchorDate);
  let isDateInvalid = (date) => this.isInvalid(date) || isInvalid(date, availableRange?.start, availableRange?.end);
  let nextDay = anchorDate.add({days: 1});
  if (isDateInvalid(nextDay)) nextDay = anchorDate.subtract({days: 1});
  if (!isDateInvalid(nextDay)) { this.setFocusedDate(nextDay); this.setFocused(true); }
}
```

**+1 day, fall back to −1, bounded by the anchor's contiguous available run; if both are invalid,
don't move.** Three-way pointerType split: `keyboard` advances, `mouse`/`touch` don't, `virtual`
deliberately doesn't.

---

## Why these are one change

hope-ui writes a degenerate `{date, date}` value on the first click
(`calendar-root.ts:742`, rationale at `:704`) so the anchor carries a solid `data-selected` pill.
That pill is hope-ui's substitute for the affordance RA's auto-advance provides — RA's comment
("gives an indication that you're selecting a range rather than a single date") names the same UX
problem. Ours is the weaker answer: a one-day pill is visually **identical to a committed single
selection**, whereas the advance produces a two-day band that reads as "range in progress".

Adopting the one-band model deletes the degenerate write. That removes the only keyboard anchoring
signal — so the auto-advance stops being optional. Do not land Phase 2 without Phase 3, or keyboard
range selection ships with no feedback at all.

## Decided trade-off

While a new range is being dragged, the **previously committed range stops painting** (RA behaves
this way; today we overlay the new tentative band on the old committed one). This is accepted —
confirmed 2026-07-24. It is the only user-visible regression.

## A real bug this fixes (independent of naming)

`activate` writes `value` on the first click (`calendar-root.ts:742`) but correctly withholds
`onValueChange` (`:745`). For a **controlled** consumer, `createControllableState` therefore holds a
value its owner was never told about, for the entire duration of a range selection. RA never writes
`value` until commit. Phase 2 closes that window.

---

## Phase 1 — Record the reference-porting rule (docs only, no code)

Do this first; it governs the rest.

**The rule.** When the reference implementation for a piece of work is React Aria (or any
adapt-and-credit reference), and that source composes a hook we do not have, **port the missing hook
first, as its own primitive with its own DoD**. Do not substitute a narrower hand-rolled stand-in for
the behavior the hook provides.

Worked example — the one that motivated the rule: RA's calendar auto-advance is gated on
`e.pointerType === 'keyboard'`, which comes from `usePress`. Detecting "was this keyboard?" with an
ad-hoc `onKeyDown` handler, or with `event.detail === 0`, was **proposed and rejected**: `detail === 0`
conflates keyboard with screen-reader virtual clicks, which RA deliberately routes down a *different*
branch (`useCalendarCell.ts:307`). The cheap hatch would have silently shipped the wrong behavior for
AT users. The correct move is the one taken here — use the real press primitive
(`packages/primitives/src/internal/create-press.ts`, which already models
`mouse|pen|touch|keyboard|virtual`). Generalized: if a port needs `useLongPress`, port `createLongPress`
first; don't approximate it with a `setTimeout` in the consumer.

Corollary: when the needed hook exists in this repo already, **check `internal/` before inventing a
mechanism**. `createPress` existed throughout the design discussion that produced this plan and was
nearly missed.

**Where it goes:**
1. `__internal__/reference-implementations.md` — expand the **References policy** block at the top
   (currently lines 8-15). That file is already the "where to look when porting" doc and already
   carries the adapt-and-credit + prefer-fine-grained-reactive-port rules; this is the third rule in
   the same family.
2. `CLAUDE.md` — one short entry in the reference/architecture area pointing at the above, per
   CLAUDE.md's own "this file is the operative index, the deepest rationale lives in `__internal__/`"
   contract. Keep it to two or three sentences with the `useLongPress`-style example.

---

## Phase 2 — One band: the iso model + naming (`@hope-ui/primitives`)

**2.1 — `utils/range-selection.ts`.** Add RA's fallback branch to `highlightedRange` (today it
returns `null` with no anchor, `:64-69`):

```ts
highlightedRange(state, endpoint) {
  if (state.anchor === null) return asRange(state.value);
  return endpoint === null ? null : order(state.anchor, endpoint);
}
```

Keep the period-overlap generalization (`periodContains`/`periodsOverlap`, `:30-34`, `:44-62`) — that
is `isSameDay` generalized for the year/decade views RA doesn't have, not a divergence. `isRangeMiddle`
disappears from the strategy interface; the endpoints stay, renamed.

**2.2 — `calendar-root.ts`.** Point the predicates at `highlightedRange()` instead of `value`, and
rename: `isRangeStart` → `isSelectionStart`, `isRangeEnd` → `isSelectionEnd`, drop `isRangeMiddle`,
drop `isHighlighted` / `isHighlightedStart` / `isHighlightedEnd` (`:562-593`). Keep `paintsSelection`
(`:556`) — it is RA's disabled/unavailable gate and stays. Then delete:

- the degenerate `{date, date}` write path (`:742` and the `previous.anchor === null` snapshot at `:737-741`)
- `valueBeforeAnchor` entirely (`:708`)
- `clearAnchor`'s restore (`:766`) → collapses to RA's `setAnchorDate(null)`
- `clearSelection`'s `lastEmitted` dance (`:787-789`)

`commitBehavior`'s three verbs all survive; `"reset"` gets simpler.

**2.3 — `calendar-cell.ts`.** Emit `data-selected` + `data-selection-start` + `data-selection-end`
on **both** the `<td>` (`:204`) and the `<button>` (`:240`). Note the `<td>` currently carries no
`data-selected` — adding it is required for the CSS-derived middle in Phase 4, and is itself more
iso than today. Drop `data-range-{start,middle,end}` and `data-highlighted{,-start,-end}`.

`CalendarDayState` (`:10-37`) becomes RAC's render-props shape:
`{date, label, isToday, isOutside, isSelected, isSelectionStart, isSelectionEnd, isFocused, isUnavailable, isDisabled}`.
Consumers wanting "middle" compute `isSelected && !isSelectionStart && !isSelectionEnd`.

Also update the `aria-label` builder (`:143-162`) — it branches on `isRangeStart`/`isRangeEnd` for the
`calendar.rangeStart` / `calendar.rangeEnd` messages.

---

## Phase 3 — `createPress` adoption + keyboard auto-advance

**3.1 — `calendar-root.ts`,** add to the return:

```ts
const focusNearestAvailableDate = (anchor: CalendarDate) => {
  const next = anchor.add({ days: 1 });
  const target = isDateSelectable(next) ? next : anchor.subtract({ days: 1 });
  if (isDateSelectable(target)) setFocusedDate(target);
};
```

RA's two-term `isDateInvalid` collapses to one `isDateSelectable` call here because `min()`/`max()`
already narrow to the anchored available run the moment the anchor is set (`:352-368`, from `c3fb5c0`).
`order()` already normalizes the backwards case where the advance makes the anchor the range *end*.

**3.2 — `calendar-cell.ts`,** replace the raw `onClick` (`:171-177`) with `createPress`:

```ts
const press = createPress<HTMLButtonElement>({
  ref: triggerRef,
  nativeButton: () => true,      // the trigger is a real <button type="button">
  disabled: isNonFocusable,      // replaces the manual guard inside onClick
  onPress: (event) => {
    const wasAnchored = state.anchorDate() !== null;
    state.activate(date());
    if (event.pointerType === "keyboard" && !wasAnchored) {
      state.focusNearestAvailableDate(date());
    }
  },
});
```

RA's structure verbatim, including the `!state.anchorDate` read *before* selecting. `virtual` falls
through to plain select with no advance (matching `useCalendarCell.ts:307`) for free, since
`virtual !== keyboard`.

Surface `press.isPressed` as `data-pressed` on the trigger — RAC emits it, we don't. Free iso gain.

**Two things to establish while doing this:**
- Whether the unconditional `event.preventDefault()` in the current `onClick` (`:172`) is
  load-bearing, before composing it with `pressProps.onClick`.
- **Keep** the `onMouseDown` guard (`:164-170`). `disabled` stops `createPress` focusing on press,
  but native click-focus on an inert cell still needs blocking.

**No `_hk` shift from this phase.** `createPress`'s only reactive state is a plain-value
`createSignal(false)`, documented as consuming no hydration id (`create-press.ts:140-148`), so
adding it to every cell does not move the SSR snapshot.

---

## Phase 4 — Preset + recipe (`@hope-ui/presets`)

**4.1 — `src/_base/_variants.css`.** `data-selection-start` and `data-selection-end` are **already
registered** (in the Calendar block, right after the `data-range-*` trio) and currently emitted by
nothing — no new registration needed. Repoint the middle variant so the recipe keeps its authoring
name at zero DOM cost:

```css
@custom-variant data-range-middle (&:where([data-selected]:not([data-selection-start]):not([data-selection-end])));
```

Remove the `data-range-start` / `data-range-end` registrations. **Keep `data-highlighted`,
`data-highlighted-start`, `data-highlighted-end` registered** — the comment there records that
`data-highlighted` is shared with the forthcoming Listbox/Menu active-item state. Only the calendar
stops emitting them; update that comment to say so.

**4.2 — `src/hope/recipes/calendar.ts`.** Rewrite the `cell` slot (`:51-78`) and the `cellTrigger`
cascade (`:93-113`). The cascade gets materially **shorter**: every `:not([data-highlighted])` chain
collapses now that there is one band. Watch the two specificity notes already in the file — the
zero-specificity `:where()` tie that forced `[&[data-highlighted-start]]:rounded-s-md` (`:73-78`) has
the same shape for the selection endpoints, so the arbitrary-variant form is likely still needed for
the corner-radius repair.

Re-run `pnpm check:recipe-purity`.

---

## Phase 5 — Tests, docs, verification

- Re-record the inline SSR snapshot in
  `packages/components/src/calendar/__tests__/calendar.ssr.test.tsx:55` (attribute renames only —
  Phases 2 and 3 add no reactive nodes, so `_hk` values must be **unchanged**; if they shift, something
  created a signal/memo and that is a bug, not a snapshot to accept).
- Update `packages/primitives/src/calendar/__tests__/calendar-cell.browser.test.tsx` (asserts
  `data-range-start` at `:121` and `data-range-end` at `:229`) and the root/grid browser tests.
- **New browser tests required:** (a) keyboard `Enter` on an unanchored range calendar advances focus
  to the next available day and paints a two-day band; (b) the same press via mouse does **not**
  advance; (c) the advance falls back to −1 day when +1 is unavailable, and does not move when both
  are; (d) a controlled calendar's `value` prop is untouched until commit.
- Docs to update: `__internal__/primitives/calendar/calendar-cell.md` (the attribute inventory at
  `:52-79`), `__internal__/primitives/calendar/calendar-root.md` (the "tentative range band rides the
  roving cursor" section at `:126-152`, and the `highlightedRange` line at `:129` — its meaning
  broadens to RA's), and the docs-site Calendar page if it documents the data attributes.
- `pnpm check:coverage-parity`, `pnpm typecheck`, all three test projects.
- **Open the Storybook stories** — `packages/components/src/calendar/calendar.stories.tsx` has a story
  specifically pinning the cascade ordering (`:19`). Green tests do not prove the paint is right.

---

## Explicitly out of scope

- **Drag-select.** RA's `usePress` `shouldCancelOnPointerExit: !!state.anchorDate`
  (`useCalendarCell.ts:205`) plus stately's `isDragging`, touch-drag timer, and
  `isRangeBoundaryPressed` (press an existing range's endpoint to re-anchor and drag it).
  `createPress` has no `shouldCancelOnPointerExit`; this is a real feature, not a rewiring, and by the
  Phase 1 rule it starts by extending `createPress`.
- `data-outside-visible-range` and `data-invalid` — RAC emits both, we emit neither. `data-invalid`
  needs a validation-state concept the calendar doesn't have yet.
