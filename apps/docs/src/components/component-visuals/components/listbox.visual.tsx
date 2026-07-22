import { Cursor, VisualCanvas } from "../canvas";

// Listbox: an elevated panel of option rows — one row highlighted (the shared keyboard/pointer
// active state) under a pointer, one row bearing a selection check, the rest at rest. Reads as "a
// keyboard-navigable list you pick from". Default-exported and auto-registered by slug ("listbox")
// via the glob in ./index.tsx. Flat, geometric, hope-ui's *semantic* primary palette (plus `strong`
// for the card's soft shadow, the same neutral the canvas dots use).
//
// The selection check is stroked with `currentColor`, its color set by a `text-*` class on the
// wrapping <g> (mirroring the real `ItemIndicator`, whose glyph inherits the row's text color) —
// reusing an already-emitted `text-*` utility rather than a `stroke-*` color utility unique to this
// file (which would render invisible until Tailwind re-scans; see close-button.visual.tsx).
export default function ListboxVisual() {
  return (
    <VisualCanvas>
      {/* Panel elevation: a soft offset shadow under the surface. */}
      <rect x="108" y="40" width="184" height="124" rx="16" class="fill-strong" opacity="0.14" />
      {/* The listbox surface — an elevated, soft-tinted panel. */}
      <rect x="108" y="36" width="184" height="124" rx="16" class="fill-primary-soft" />

      {/* Row 1 — at rest: a muted label bar. */}
      <rect x="126" y="54" width="96" height="8" rx="4" class="fill-primary" opacity="0.34" />

      {/* Row 2 — selected: a stronger label bar with a trailing check glyph. */}
      <rect x="126" y="80" width="82" height="8" rx="4" class="fill-primary" opacity="0.6" />
      <g class="text-primary-emphasis">
        <path
          d="M256 84 l6 6 l12 -12"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>

      {/* Row 3 — the active highlight: a full-width fill with an inverted label, under the pointer. */}
      <rect x="120" y="102" width="160" height="24" rx="8" class="fill-primary" />
      <rect x="126" y="110" width="90" height="8" rx="4" class="fill-on-primary" />

      {/* Row 4 — at rest: a muted label bar. */}
      <rect x="126" y="140" width="70" height="8" rx="4" class="fill-primary" opacity="0.34" />

      {/* The pointer, hovering the highlighted row — highlight follows the pointer and the keyboard. */}
      <Cursor x={244} y={110} />
    </VisualCanvas>
  );
}
