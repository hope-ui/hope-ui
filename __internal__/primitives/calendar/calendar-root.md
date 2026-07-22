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
`defaultFocusedValue`/`onFocusedValueChange`), a `label` (overrides the built-in `calendar.label`), and
the native-form trio (`name`/`form`/`required`) documented under **Native form** below.

All other localized strings — nav-button `aria-label`s, cell `aria-label` suffixes, and the
live-region announcements — resolve through `@hope-ui/i18n` (the `t` accessor exposed on the
return, backed by the built-in catalogs). Translate them app-wide by wrapping the tree in
`<I18nProvider locale translate messages>` — there is no per-instance `messages` prop.

`CreateCalendarReturn` — resolved config accessors (incl. the native-form `name`/`form`/`required` +
the derived `formValues`); the `t` message resolver (used by the part hooks
for their labels/announcements); state (`view`, `visibleMonth`, `focusedDate`,
`selectionValue`, `anchorDate`, `highlightedRange`, `todayDate`); computeds (`cells`, `weekdays`,
`headingLabel`, `isPrev/NextDisabled`, `canDrillUp`); `headingId`; the navigation verbs (`navigate`,
`prev`, `next`, `drillUp`, `drillDownTo`, `setView`, `setFocusedDate`, `activate`, `highlightDate`);
the per-date predicates (incl. `isHighlighted`); and the shared `collection` / `listFocus` /
`announce` the part hooks use. Range naming mirrors React Aria's `RangeCalendarState` (`anchorDate`,
`highlightedRange`, `highlightDate`).

## Native form

Opt-in native `<form>` submission, mirroring the shipped Listbox pattern. The primitive renders no DOM
itself — it only exposes the state the styled component's hidden `<input>`s consume:

- **`name?: string`** — the form field name. **Opt-in**: with `name` unset, `formValues()` is `[]` and
  nothing is submitted.
- **`form?: string`** — associates the hidden field(s) with a `<form>` by id (the input's `form`
  attribute), for inputs rendered outside that form.
- **`required?: boolean`** (default `false`) — marks the field required for native validation.

`formValues(): { name: string; value: string }[]` derives one entry per hidden input from
`selectionValue()`, with each `value` an ISO `YYYY-MM-DD` string (`CalendarDate.toString()`):

- **single** → `[{ name, value }]` — empty (`[]`) when the value is `null`.
- **multiple** → one entry per selected date, all sharing `name` (sorted, as the selection is).
- **range** → `[{ name: `${name}Start`, value: startISO }, { name: `${name}End`, value: endISO }]`.
  Empty until the range **completes**: mid-selection (while `anchorDate()` is set) the value is a
  degenerate `{ start, end }`, so `formValues()` deliberately stays `[]` until the second endpoint
  commits and the anchor clears.

`formValues` is a plain accessor (not a `createMemo`) — like `highlightedRange`, the sibling
predicates, and the Listbox `formValues` — so it adds no reactive node to the render and stays
hydration-neutral.

## Calendar-aware formatting (non-Gregorian systems)

The grid **math** is already calendar-system-aware (`@internationalized/date`'s
`startOfWeek`/`getWeeksInMonth`/`add`/`isSameMonth` respect a `CalendarDate`'s calendar) and day
numbers localize to the numbering system. The `Intl.DateTimeFormat` formatters
(`utils/month-view.ts`'s `formatMonthYear`/`formatFullDate`, plus the year/decade formatters) also
derive their **`calendar` from the date itself** (`date.calendar.identifier`), React-Aria style —
they are **not** left to the locale's default calendar. This means:

- An Islamic / Japanese / Buddhist `CalendarDate` (built via `toCalendar(today(tz), …)`) reads out its
  **own** month/year/era in the heading + `aria-label` — matching the grid's day numbers — **even under
  a plain locale** without a `-u-ca-` extension (e.g. `en-US` → "Rajab 1447 AH", not "January 2026").
- A Gregorian date under a non-Gregorian-default locale (e.g. `fa-IR`, whose default is Persian) still
  reads Gregorian, matching its Gregorian day numbers.
- It is a **no-op for the common Gregorian case** (`calendar: "gregory"` ≡ omitting it for `en-US`).

`getWeekdays` takes **no** `calendar` option: the 7-day week is shared across calendar systems, so
weekday names don't depend on it (only month/year/era do). For the fully-localized experience, still
pair a non-Gregorian date with a matching `-u-ca-` locale (e.g. `ar-SA-u-ca-islamic-umalqura`) so the
numbering system and directionality line up too — but the calendar system alone no longer requires it.

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
