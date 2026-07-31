import { Cursor, VisualCanvas } from "../canvas";

// Select: a closed-looking control with its option popup hanging directly beneath it, drawn at
// **exactly the trigger's width** — that edge-to-edge alignment is the whole identity of the
// component (the popup always matches the trigger, via the `--anchor-width` the positioner
// publishes), and it is what tells this card apart from listbox.visual.tsx (a bare panel, no control)
// and popover.visual.tsx (a card offset from its trigger by an arrow). One row carries the highlight
// under the pointer, one carries the selection check. Default-exported and auto-registered by slug
// ("select") via the glob in ./index.tsx. Flat, geometric, hope-ui's *semantic* primary palette (plus
// `strong` for the soft shadow, the same neutral the canvas dots use).
//
// The chevron and the check are stroked with `currentColor`, their color set by a `text-*` class on
// the wrapping <g> — reusing an already-emitted `text-*` utility rather than a `stroke-*` color
// utility unique to this file (which would render invisible until Tailwind re-scans; see
// close-button.visual.tsx).
export default function SelectVisual() {
  return (
    <VisualCanvas>
      {/* The trigger: a raised control showing the current value, with the chevron at its end. */}
      <rect x="110" y="22" width="180" height="34" rx="10" class="fill-primary-soft" />
      <rect x="124" y="35" width="86" height="8" rx="4" class="fill-primary" opacity="0.6" />
      <g class="text-primary-emphasis">
        <path
          d="M262 35 l8 8 l8 -8"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>

      {/* Popup elevation: a soft offset shadow under the card. */}
      <rect x="110" y="70" width="180" height="92" rx="14" class="fill-strong" opacity="0.14" />
      {/* The popup card — same x and same width as the trigger above it. */}
      <rect x="110" y="66" width="180" height="92" rx="14" class="fill-primary-soft" />

      {/* Row 1 — at rest: a muted label bar. */}
      <rect x="126" y="82" width="92" height="8" rx="4" class="fill-primary" opacity="0.34" />

      {/* Row 2 — the active highlight: a full-width fill with an inverted label, under the pointer. */}
      <rect x="118" y="100" width="164" height="24" rx="8" class="fill-primary" />
      <rect x="126" y="108" width="84" height="8" rx="4" class="fill-on-primary" />

      {/* Row 3 — the chosen option: a stronger label bar with a trailing check glyph. */}
      <rect x="126" y="132" width="70" height="8" rx="4" class="fill-primary" opacity="0.6" />
      <g class="text-primary-emphasis">
        <path
          d="M256 136 l5 5 l11 -11"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>

      {/* The pointer on the highlighted row — highlight follows the pointer and the keyboard alike. */}
      <Cursor x={236} y={104} />
    </VisualCanvas>
  );
}
