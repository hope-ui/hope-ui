# Calendar view geometry (`view.ts`)

The shared, view-agnostic geometry + cursor math that lets one grid/cell render all three views
(month / year / decade). Pure — no reactivity, no DOM.

## API

```ts
type FirstDayOfWeek = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
type CalendarView = "month" | "year" | "decade";

const VIEW_COLUMNS: Record<CalendarView, number>; // { month: 7, year: 3, decade: 3 }
const YEARS_PER_DECADE = 10;

function decadeStart(year: number): number;
function normalizeFocusForView(view: CalendarView, date: CalendarDate): CalendarDate;
function cellPeriod(view: CalendarView, date: CalendarDate): DateRange;
function periodContains(period: DateRange, date: CalendarDate): boolean;
function periodsOverlap(a: DateRange, b: DateRange): boolean;
function isInViewScope(view: CalendarView, date: CalendarDate, visibleMonth: CalendarDate): boolean;
```

- `decadeStart(year)` — the first calendar year of the decade block containing `year` (2026 → 2020).
- `normalizeFocusForView(view, date)` — collapse a date to the view's cell granularity (month keeps
  the day; year snaps to the month start; decade to Jan 1). This is what keeps the roving cursor
  (`focusedDate`) aligned to a rendered cell under `isSameDay` in every view.
- `isInViewScope(view, date, visibleMonth)` — is `date` inside the scope the grid currently shows
  (same month / year / decade). Drives keyboard scope-crossing detection and the outside-scope flag.

## Cell periods

`cellPeriod` is the **mirror of `normalizeFocusForView`**: where that collapses a period to its
representative date, this expands that date back into the span the cell stands for — month → the
single day `{date, date}`, year → the whole month, decade → the whole year.

`createCalendar` maps every cell date through it before consulting the `SelectionStrategy`, which is
what makes a year/decade cell paint whenever the selection **overlaps** its period. Tested by its first
day alone, a January cell stayed dark for a Jan 15 – Mar 10 range, and February wrongly took the range's
start corner. `periodContains` / `periodsOverlap` are the two questions asked of a period — inclusive at
both ends, so two adjacent-but-disjoint periods (Jan / Feb) do not overlap.

Month view yields the degenerate `{date, date}`, where `periodContains` collapses to a same-day test and
`periodsOverlap` to inclusive containment — the day-level tests these generalize. Month view therefore
behaves exactly as it did before periods existed. See `utils/selection.md` and `calendar-root.md`.

The `DateRange` import is **type-only** (`selection.ts`), so nothing here creates a runtime cycle with
the strategies, which import `periodContains` / `periodsOverlap` from this module.

Ported verbatim from the Angular calendar's `utils/view.ts` (`cellPeriod` and the two period predicates
are hope-ui's own — React Aria ships no year/decade view); framework-free.
