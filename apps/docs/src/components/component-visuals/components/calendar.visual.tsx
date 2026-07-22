import { Cursor, VisualCanvas } from "../canvas";

// Calendar: an elevated month panel — a navigation header (chevrons + a caption bar) over a 7-column
// grid of day dots, with one day picked (a solid primary disc under the pointer) and one ringed as
// "today". Reads as "a date grid you select from". Default-exported and auto-registered by slug
// ("calendar") via the glob in ../index.tsx. Flat, geometric, hope-ui's *semantic* primary palette
// (plus `strong` for the card's soft shadow, the neutral the canvas dots use).
//
// The chevrons and the today ring are stroked with `currentColor`, their color set by a `text-*` class
// on the wrapping <g> — reusing an already-emitted `text-*` utility rather than a `stroke-*` color
// utility unique to this file (which would render invisible until Tailwind re-scans; see the note in
// listbox.visual.tsx / close-button.visual.tsx).
const COLUMNS = [122, 147, 172, 197, 222, 247, 272];
const ROWS = [92, 112, 132, 152];

export default function CalendarVisual() {
  return (
    <VisualCanvas>
      {/* Panel elevation: a soft offset shadow under the surface. */}
      <rect x="96" y="34" width="208" height="140" rx="16" class="fill-strong" opacity="0.14" />
      {/* The calendar surface — an elevated, soft-tinted panel. */}
      <rect x="96" y="30" width="208" height="140" rx="16" class="fill-primary-soft" />

      {/* Header: prev / next chevrons flanking a caption bar. */}
      <g
        class="text-primary"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M124 47 l-6 6 l6 6" />
        <path d="M276 47 l6 6 l-6 6" />
      </g>
      <rect x="168" y="49" width="64" height="8" rx="4" class="fill-primary" opacity="0.55" />

      {/* Weekday head: seven short muted ticks. */}
      {COLUMNS.map((x) => (
        <rect x={x - 6} y="70" width="12" height="4" rx="2" class="fill-primary" opacity="0.3" />
      ))}

      {/* Day grid: dots at rest. The picked / today markers below paint over their cells. */}
      {ROWS.map((y) =>
        COLUMNS.map((x) => <circle cx={x} cy={y} r="5" class="fill-primary" opacity="0.3" />),
      )}

      {/* Today — a ring around its day. */}
      <g class="text-primary-emphasis">
        <circle cx="247" cy="132" r="9" fill="none" stroke="currentColor" stroke-width="2.5" />
      </g>

      {/* The picked day — a solid disc, under the pointer. */}
      <circle cx="197" cy="112" r="9" class="fill-primary" />

      {/* The pointer, on the picked day — pick follows the pointer and the keyboard alike. */}
      <Cursor x={202} y={118} />
    </VisualCanvas>
  );
}
