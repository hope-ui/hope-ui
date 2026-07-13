# `Calendar`

A headless, accessible date calendar with month / year / decade views and single / range / multiple
selection. A thin compound JSX layer over the `createCalendar` hook family
(`@hope-ui/primitives/calendar`); it ships no styles. Behavior + ARIA follow React Aria's `useCalendar`.

## Anatomy

```tsx
import { Calendar } from "@hope-ui/components/calendar";
import { CalendarDate } from "@internationalized/date";

<Calendar.Root selectionMode="single" onValueChange={setValue}>
  <Calendar.Header>
    <Calendar.PrevButton>‹</Calendar.PrevButton>
    <Calendar.Heading />
    <Calendar.NextButton>›</Calendar.NextButton>
  </Calendar.Header>
  <Calendar.Grid />
</Calendar.Root>;
```

- **`Calendar.Root`** — provides state on context; renders the `role="group"` container. Takes all
  `createCalendar` options (below).
- **`Calendar.Header`** — a structural layout row (presentational).
- **`Calendar.PrevButton` / `Calendar.NextButton`** — page the visible period; auto-`disabled` at the
  `min`/`max` boundary. Accept `render`/`as`.
- **`Calendar.Heading`** — shows the current period label and drills **up** the view stack on click
  (month → year → decade); `disabled` at decade. Accepts `render`/`as`.
- **`Calendar.Grid`** — the `<table role="grid">`. Renders the weekday header (month view) and the
  day/month/year cells internally.

## Key props (on `Calendar.Root`)

| Prop | Type | Notes |
| --- | --- | --- |
| `selectionMode` | `"single" \| "range" \| "multiple"` | Default `"single"`. Keys the value union. |
| `value` / `defaultValue` / `onValueChange` | `CalendarDate \| {start,end} \| CalendarDate[] \| null` | Controlled / uncontrolled selection. `onValueChange` fires on **commit** (range: only on completion). |
| `focusedValue` / `defaultFocusedValue` / `onFocusedValueChange` | `CalendarDate` | The roving cursor. |
| `min` / `max` | `CalendarDate` | Out-of-range days are non-focusable + arrow-skipped. |
| `isDateDisabled` | `(date) => boolean` | "Unavailable" days — focusable + announced, but not selectable. |
| `locale` / `dir` / `timeZone` / `firstDayOfWeek` | | Default from `useLocale()` + the system zone. |
| `readOnly` / `disabled` | `boolean` | |
| `messages` | `Partial<CalendarMessages>` | Localized button labels + aria-label suffixes + announcements. |

## Keyboard

| Key | Behavior |
| --- | --- |
| `Arrow*` | Move the roving focus (day-by-day across weeks; RTL-aware). Off the visible edge, crosses into the adjacent period. |
| `Home` / `End` | First / last cell of the week (row). |
| `Ctrl`/`Cmd`+`Home` / `End` | First / last cell of the grid. |
| `PageUp` / `PageDown` | Previous / next period (±month / ±year / ±decade). |
| `Shift`+`PageUp` / `PageDown` | ±1 year in month view (APG). |
| `Enter` / `Space` | Select the day (month view); drill down (year/decade view). |
| `Shift`+`Arrow` | Extend a range (range mode, month view). |

## ARIA

`role="group"` (labelled by `messages.label`, default "Calendar") wraps a `<table role="grid">` named
via `aria-labelledby` the heading. Rows are `<tr>` (implicit `row`); cells are `<td role="gridcell">`
with `aria-selected`, wrapping the roving `<button>` whose `aria-label` is the full localized date plus
Today / selected / range / unavailable suffixes. Roving tabindex: only the focused cell is tabbable.
Two disabled states (React Aria): out-of-range/outside = non-focusable; `isDateDisabled` = focusable +
`aria-disabled`, not selectable.

## SSR / hydration

Renders + hydrates without a mismatch. Because the month grid uses **variable 4–6 week rows**, its
structure depends on the visible month — pass a stable `defaultFocusedValue` (or `value`) for
deterministic SSR, and wrap the app in `<I18nProvider locale=…>` (or pass an explicit `locale`) so
locale-derived month names agree on the server and the hydrating client. `data-today` is a reactive
paint hook, re-evaluated on the client, never structural. Consumers construct dates with
`@internationalized/date`.
