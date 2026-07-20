# Year-view date math (`year-view.ts`)

Builds the year view's 4×3 month grid. Pure.

## API

```ts
const MONTHS_PER_YEAR = 12;
function buildYearCells(visibleMonth, locale, timeZone): CalendarCellModel[][];
function formatYear(date, locale, timeZone): string;
```

- `buildYearCells` — a fixed 4×3 = 12-cell grid, each cell a month start of the visible year, labelled
  with the locale's short month name (the full "Month yyyy" name rides the cell `aria-label`). No
  outside cells (the whole year fits). Row-major, so a cell's index equals its month-of-year — the
  grid's coordinate roving (ArrowRight = +1 month, ArrowDown = +3 = +1 quarter) matches the date math.
- `formatYear` — the year-view heading label ("2026"), localized digits.

Ported verbatim from the Angular calendar's `utils/year-view.ts`.
