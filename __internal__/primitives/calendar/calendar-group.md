# `createCalendarGroup`

The `role="group"` container part: the calendar's accessible name, its calendar-wide state hooks, and
React Aria's **`commitBehavior`** — what becomes of a range the user walks away from mid-selection
(`useRangeCalendar`).

## API

```ts
function createCalendarGroup(
  state: CreateCalendarReturn,
  props?: JSX.HTMLAttributes<HTMLElement>,
): {
  props: JSX.HTMLAttributes<HTMLElement>; // the role="group" container
  setRef: (element: HTMLElement) => void; // what "outside" is measured against
};
```

`props` is optional. The styled `Calendar.Root` passes its consumer's leftover native attributes here
(everything that isn't a `createCalendar` option or a recipe input — `id`, `style`, `data-*`,
`aria-labelledby`, event handlers, `ref`) rather than merging them onto the element itself, because
this hook is what owns the precedence: its own `role`/`data-*` win, its `aria-label` *defers* to a
consumer's, and its `focusout` is composed with — not replaced by — one.

`dir` is **not** among them: it is a `createCalendar` option, and the component writes it onto the
element itself. `direction()` drives the keymap and is never written to the DOM — see
`calendar-root.md` § Reading direction.

Spread the returned `props` onto the container and hand it `setRef`: **without the ref the
outside-pointer half stays dormant** (the focus half still works, since it reads the event's own
`currentTarget`) **and the dev direction warning stays silent** (`setRef` also feeds
`state.setGroupElement`, the element `createTextDirectionWarning` measures the layout against).

| Prop | Source |
| --- | --- |
| `role="group"` | Owned. A calendar is an ARIA *group*, deliberately not a `<fieldset>` (WAI-ARIA APG / React Aria's `useCalendar`). |
| `aria-label` | The consumer's own, else `state.groupLabel()` (the `label` option, else the i18n `calendar.label`). |
| `data-disabled` / `data-readonly` / `data-required` | The calendar-wide flags, present only when true. |
| `onFocusOut` | Composed after the consumer's, which can cancel it with `preventDefault()`. |

## Why this part exists

A range with an anchor and no second endpoint is a state the user can neither see nor leave: the next
click *anywhere* completes a range they had forgotten starting. So both ways of walking away resolve
it, per `state.commitBehavior()`:

| `commitBehavior` | Effect | `createCalendar` verb |
| --- | --- | --- |
| `"select"` (default) | Complete the tentative range at the roving cursor. | `commitSelection()` |
| `"reset"` | Drop the anchor, restoring the selection committed before it. | `clearAnchor()` |
| `"clear"` | Empty the selection. | `clearSelection()` |

The two triggers:

- **A pointer released outside**, while focus is still inside the calendar (React Aria's `isFocusWithin`
  guard — once focus has left, the focus branch owns the decision and running both would resolve the
  range twice). A press on a `button` (or `[role="button"]`) **inside** the calendar is exempt: paging
  the month or drilling the view mid-selection is not walking away.
- **Focus settling outside** the calendar.

`Escape` is the third exit and deliberately does **not** consult `commitBehavior` — it always cancels,
as React Aria's `useCalendarGrid` does. It lives on the grid's keymap (`calendar-grid.md`), where the
roving cursor's keyboard already is.

The window `pointerup` listener is attached **only while a range is anchored**, so a single/multiple
calendar — or an idle range one — carries none. Arming it that late is safe: the anchor is set by the
day cell's `click`, which fires *after* the `pointerup` that produced it, so the gesture that anchors
can never be the gesture that commits.

## `focusout` decides on the next task, not from `relatedTarget`

React Aria reads `event.relatedTarget` and commits when it is outside. hope-ui cannot: React **reuses**
the day cells across a month change, while Solid's `<For>` rebuilds them — so paging destroys the
focused day button, and Chrome reports that blur with **no `relatedTarget`**, indistinguishable at that
instant from tabbing away. Measured, not theoretical: reading `relatedTarget` ended the range on every
`PageDown` (pinned by *"keeps the range in progress when the keyboard pages the month"*).

So the handler only *schedules*: on the next task it asks where focus actually **is**
(`container.contains(document.activeElement)`). The re-render and the grid's deferred focus nudge share
one flush, so by then focus is back on the replacement cell — while a genuine tab-away has settled
outside. One rule covers both, and it also covers the case `relatedTarget` cannot express at all: a
press on non-focusable content outside the calendar, which sends focus to `<body>`.

The deferred callback re-checks `state.anchorDate()` (the pointer branch may have resolved it already)
and `container.isConnected` (the calendar may be gone), and runs `untrack`ed — like the synchronous
anchor read, because `createListFocus` moves DOM focus from inside its own effect, so `focusout` fires
in that effect's tracking scope (the same reason `createCalendarCell`'s `onFocus` untracks).

## SSR

Nothing runs on the server: the ref is never set, so the effect returns before it reaches `window`, and
`focusout` cannot fire. The returned props are plain getters. The same holds in the DOM-less `unit`
test project, which is what lets `calendar-group.test.ts` cover the props surface there while
`calendar-group.browser.test.tsx` owns every focus/pointer decision.

## Rejected alternatives

### `createDismissable` (`internal/create-dismissable.ts`)
**Why not:** it fires on outside **pointerdown** with a single `onDismiss` covering both `Escape` and
the pointer, where this part needs pointer**up**, a three-way split between committing, resetting and
clearing, and the in-calendar `button` exemption. Reshaping it to fit would have made a dialog-shaped
primitive carry a calendar-shaped policy; keeping them apart leaves `createDismissable` free to grow
the layered dismiss stack Popover/Tooltip will want.

### React Aria's VoiceOver virtual-click guard
**Why not:** it skips a `pointerdown` of zero width/height because their cell activates through
`usePress`, whose ordering the synthetic pointer sequence breaks. hope-ui's cell activates on `click`,
and a virtual click lands on a day button *inside* the calendar — already exempt from the
outside-pointer branch, so the guard would only re-exempt what is exempt.

### React Aria's `relatedTarget` read on `focusout`
**Why not:** React reuses the day cells across a month change while Solid's `<For>` rebuilds them, so
paging destroys the focused day button and Chrome reports that blur with **no** `relatedTarget` —
measured, it ended the range on every `PageDown`. See *`focusout` decides on the next task, not from
`relatedTarget`* above.
