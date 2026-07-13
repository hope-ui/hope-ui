# `createCalendar`

The shared state kernel of a calendar — the one call at the root of the tree, modeled on
`createDialog`. It owns the view state machine (month / year / decade), the roving cursor, the
selection (via the pure `SelectionStrategy` seam), all date math + predicates, the shared navigation
kernel (`createCollection` + `createListFocus`) the grid + cell part hooks compose, and the
live-region announcer. It renders **no JSX and no host element**.

## API (abridged)

```ts
function createCalendar(options?: CreateCalendarOptions): CreateCalendarReturn;
```

`CreateCalendarOptions` — config (`locale`/`dir`/`timeZone`/`firstDayOfWeek`/`min`/`max`/
`isDateDisabled`/`disabled`/`readOnly`/`selectionMode`), the controlled/uncontrolled selection pair
(`value`/`defaultValue`/`onValueChange`), the roving-cursor pair (`focusedValue`/
`defaultFocusedValue`/`onFocusedValueChange`), a `label`, and `messages` overrides.

`CreateCalendarReturn` — resolved config accessors; state (`view`, `visibleMonth`, `focusedDate`,
`selectionValue`, `previewDate`, `rangeAnchor`, `todayDate`); computeds (`cells`, `weekdays`,
`headingLabel`, `isPrev/NextDisabled`, `canDrillUp`); `headingId`; the navigation verbs (`navigate`,
`prev`, `next`, `drillUp`, `drillDownTo`, `setView`, `setFocusedDate`, `activate`, `setPreviewDate`,
`clearPreview`); the per-date predicates; and the shared `collection` / `listFocus` / `announce` the
part hooks use.

## The view machine

`view` selects what `visibleMonth` is shown *as*; `cells`/`headingLabel`/boundary math/predicates all
switch on it. `drillUp` climbs month→year→decade (no-op at decade); `drillDownTo` descends; `activate`
**selects in month view but drills in year/decade**. The cursor (`focusedDate`) is kept **normalized
to the active view's cell granularity** (`normalizeFocusForView`), so `isFocused` is a plain
`isSameDay` in every view, and the visible scope **follows the cursor** when it leaves — one effect
does this for both internal roving moves and controlled `focusedValue` updates.

## Two disabled states (React Aria)

- **non-focusable** = outside the visible scope OR a whole out-of-range period (`isDateNonFocusable`)
  → the cell registers `disabled: true` (grid skips it) and click is guarded.
- **unavailable** = the `isDateDisabled` predicate (month view only) → stays focusable + announced,
  blocked only in `activate`.

## Selection

`onValueChange` fires when the selection **commits** — every activate in single/multiple, but only on
range **completion** (not the in-progress anchor). This is why the value pair is not wired straight
through `createControllableState`'s `onChange`.

## SSR / hydration

- The month grid is **variable 4–6 weeks**, so its row count depends on `visibleMonth`. `visibleMonth`
  seeds from `defaultFocusedValue ?? firstDateOf(value ?? defaultValue) ?? today(timeZone)`. When it
  derives from a prop it is deterministic; the bare `today()` fallback can disagree across a
  server/client midnight boundary. **For SSR, pass a stable `defaultFocusedValue`** (the fixture pins
  one). `today()`-derived attributes (`data-today`) are reactive, re-evaluated on hydrate — never
  structural.
- `headingId` is a single `createUniqueId`, SSR-stable and identical on server + client, so the grid's
  `aria-labelledby`→heading IDREF is valid in the server markup.
- The announcer only builds its live regions where a `document` exists (browser), so it is a no-op
  during SSR and in the Node `unit` project (which runs the client build without a DOM).

Ported from the Angular calendar's `CalendarContext` (419 LOC) + its root directive.
