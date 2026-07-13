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
function isInViewScope(view: CalendarView, date: CalendarDate, visibleMonth: CalendarDate): boolean;
```

- `decadeStart(year)` — the first calendar year of the decade block containing `year` (2026 → 2020).
- `normalizeFocusForView(view, date)` — collapse a date to the view's cell granularity (month keeps
  the day; year snaps to the month start; decade to Jan 1). This is what keeps the roving cursor
  (`focusedDate`) aligned to a rendered cell under `isSameDay` in every view.
- `isInViewScope(view, date, visibleMonth)` — is `date` inside the scope the grid currently shows
  (same month / year / decade). Drives keyboard scope-crossing detection and the outside-scope flag.

Ported verbatim from the Angular calendar's `utils/view.ts`; framework-free.
