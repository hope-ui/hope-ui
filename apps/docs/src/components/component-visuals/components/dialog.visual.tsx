import { Cursor, VisualCanvas } from "../canvas";

// Dialog: a modal card floating over a dimmed page — faint page content behind a neutral scrim,
// with an elevated centered card carrying a title, two body lines, a corner "×", and a footer
// action row (a soft Cancel next to a solid confirm the pointer is pressing). Reads as "an overlay
// that interrupts the page for a focused task". Default-exported and auto-registered by slug
// ("dialog") via the glob in ./index.tsx. Flat, geometric, hope-ui's *semantic* primary palette
// (plus `strong` for the scrim/shadow, the same neutral the canvas dots use).
export default function DialogVisual() {
  return (
    <VisualCanvas>
      {/* The page behind, dimmed: faint content bars peeking from the corners. */}
      <g class="fill-primary" opacity="0.3">
        <rect x="40" y="30" width="118" height="8" rx="4" />
        <rect x="242" y="30" width="118" height="8" rx="4" />
        <rect x="40" y="164" width="150" height="8" rx="4" />
        <rect x="214" y="164" width="146" height="8" rx="4" />
      </g>

      {/* The scrim: a neutral wash over the whole canvas that dims the page but not the card above. */}
      <rect width="400" height="200" class="fill-strong" opacity="0.12" />

      {/* Card elevation: a soft offset shadow under the surface. */}
      <rect x="110" y="52" width="180" height="104" rx="16" class="fill-strong" opacity="0.14" />

      {/* The dialog surface: an elevated, soft-tinted centered card. */}
      <rect x="110" y="48" width="180" height="104" rx="16" class="fill-primary-soft" />

      {/* Header: a bold title bar with a small dismiss "×" in the trailing corner. */}
      <rect x="130" y="66" width="86" height="11" rx="5" class="fill-primary-emphasis" />
      <g class="stroke-primary-emphasis" stroke-width="2.4" stroke-linecap="round" opacity="0.55">
        <path d="M256 62 l8 8" />
        <path d="M264 62 l-8 8" />
      </g>

      {/* Body: two muted content lines. */}
      <rect x="130" y="90" width="138" height="7" rx="3.5" class="fill-primary" opacity="0.4" />
      <rect x="130" y="103" width="108" height="7" rx="3.5" class="fill-primary" opacity="0.4" />

      {/* Footer action row: a soft Cancel next to the solid confirm button. */}
      <g opacity="0.55">
        <rect
          x="140"
          y="120"
          width="58"
          height="22"
          rx="8"
          fill="none"
          class="stroke-primary"
          stroke-width="2"
        />
        <rect x="154" y="128" width="30" height="6" rx="3" class="fill-primary" />
      </g>
      <rect x="206" y="120" width="64" height="22" rx="8" class="fill-primary" />
      <rect x="221" y="128" width="34" height="6" rx="3" class="fill-on-primary" />

      {/* The pointer, pressing the confirm button — this overlay is interactive. */}
      <Cursor x={246} y={126} />
    </VisualCanvas>
  );
}
