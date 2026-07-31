# Month-view date math (`month-view.ts`)

Builds the month grid and the localized names the month view needs. Pure functions over
`@internationalized/date` + `Intl`.

## API

```ts
interface CalendarCellModel { date: CalendarDate; label: string; isOutside: boolean; key: string }
interface Weekday { short: string; long: string; narrow: string }
const DAYS_PER_WEEK = 7;

function buildMonthCells(visibleMonth, locale, firstDayOfWeek?): CalendarCellModel[][];
function clampDateToMonth(date, month): CalendarDate;
function getWeekdays(locale, timeZone, firstDayOfWeek?): Weekday[];
function formatFullDate(date, locale, timeZone): string;
function formatMonthYear(date, locale, timeZone): string;
```

- `buildMonthCells` — a **variable** 4–6 week grid (only the weeks the month spans, `getWeeksInMonth`;
  the react-day-picker/shadcn default, *not* fixed-6). Leading/trailing days of the first/last partial
  week are flagged `isOutside`. Day labels are localized (`Intl.NumberFormat`).
- `clampDateToMonth` — move a date into a month, clamping the day to the month's last (Jan 31 → Feb 28).
  The focus-target math for "next month from the 31st lands on a sensible date."
- `getWeekdays` / `formatFullDate` / `formatMonthYear` — localized names (`@internationalized/date`
  doesn't format names, so these use `Intl.DateTimeFormat`).

`CalendarCellModel` is the view-agnostic cell shape reused by year/decade views. State flags
(`isToday`/`isSelected`/…) are computed in the cell from calendar state, not stored here.

Ported verbatim from the Angular calendar's `utils/month-view.ts`. See the SSR note in the calendar
root doc: variable weeks means the SSR seed (`defaultFocusedValue`) must be deterministic.

## Rejected alternatives

### Leaving `Intl`'s `calendar` option to the locale's default
**Why not:** the grid's day numbers come from the `CalendarDate`'s own calendar system, so an
Islamic/Japanese/Buddhist date under a plain (non `-u-ca-`) locale rendered Islamic day numbers under a
Gregorian "January 2026" heading, with `aria-label`s to match. Every formatter here passes
`date.calendar.identifier` instead (React Aria's approach; a no-op for the common Gregorian case, and
it also keeps a Gregorian date Gregorian under a locale like `fa-IR`). `getWeekdays` is the one
exception, and deliberately so: the 7-day week is shared across calendar systems.

### A fixed six-week grid (react-day-picker's `fixedWeeks`)
**Why not:** a short, week-aligned month then renders a whole trailing row of next-month days that are
greyed and inert. `getWeeksInMonth` renders only the 4–6 weeks the month spans (react-day-picker /
shadcn's default). The price is the variable row count, which is exactly why the SSR seed has to be
deterministic — a server and client that disagree on the seed disagree on the number of rows, a
structural hydration mismatch rather than a reactive one.
