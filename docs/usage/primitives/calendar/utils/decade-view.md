# Decade-view date math (`decade-view.ts`)

Builds the decade view's 4×3 year grid. Pure.

## API

```ts
function buildDecadeCells(visibleMonth, locale, timeZone): CalendarCellModel[][];
function formatDecadeRange(visibleMonth, locale, timeZone): string;
```

- `buildDecadeCells` — a 4×3 = 12-cell grid for the decade containing the visible year: the leading
  adjacent year, the decade's 10 years, then the trailing adjacent year, each a year start (Jan 1).
  The two adjacent years are flagged `isOutside` — greyed + inert, like month view's leading/trailing
  days, so crossing to an adjacent decade stays keyboard-only. Row-major (one cell = one year).
- `formatDecadeRange` — the decade heading ("2020 – 2029") via `Intl…formatRange` (note the localized
  range separator + digits; a hand-typed literal won't byte-match).

Ported verbatim from the Angular calendar's `utils/decade-view.ts`.
