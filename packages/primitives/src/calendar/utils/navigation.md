# Arrow navigation math (`navigation.ts`)

Resolves an arrow keypress to a target date + whether it leaves the visible scope. Pure — the grid
hook uses this to decide when to intercept (period-crossing) vs. delegate to `createGridNavigation`.

## API

```ts
type ArrowDirection = "up" | "down" | "left" | "right";
interface ArrowMove { target: CalendarDate; crosses: boolean }

function arrowDelta(direction, isRtl): number;                                  // month-only day delta
function resolveArrowMove(focusedDate, visibleMonth, deltaDays): ArrowMove;     // month-only
function resolveViewArrowMove(view, from, visibleMonth, direction, isRtl): ArrowMove; // all views
```

- `arrowDelta` — the day delta in month view (±7 vertical, ±1 horizontal, RTL-flipped). Reused by the
  Shift+Arrow range extension.
- `resolveViewArrowMove` — the general form: one cell-step maps to a date unit per view (month → days,
  year → months, decade → years); `crosses` is true when the target leaves the visible month/year/
  decade. The grid intercepts only when `crosses` is true (re-targeting the cursor into the adjacent
  period), letting `createGridNavigation` handle every in-scope move.

Ported verbatim from the Angular calendar's `utils/navigation.ts`. In hope-ui the origin date comes
from the roving `focusedDate` (single source of truth), so no `event.target` disambiguation is needed.
