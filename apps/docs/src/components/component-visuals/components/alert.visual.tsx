import { VisualCanvas } from "../canvas";

// Alert: a soft-tinted status card — a round status glyph on the left, a bold title
// bar over two muted body lines, and a small dismiss "×" in the corner — reading as
// "a contextual notice you can act on or dismiss". Default-exported and auto-registered
// by slug ("alert") via the glob in ./index.tsx. Flat, geometric, hope-ui's *semantic*
// primary palette only.
export default function AlertVisual() {
  return (
    <VisualCanvas>
      {/* The alert surface: a soft-tinted, rounded status card centered on the canvas. */}
      <rect x="60" y="62" width="280" height="76" rx="16" class="fill-primary-soft" />

      {/* Leading status glyph: a filled disc carrying an "i" (info notice). */}
      <circle cx="94" cy="100" r="15" class="fill-primary" />
      <circle cx="94" cy="93.5" r="1.9" class="fill-on-primary" />
      <rect x="92.3" y="98" width="3.4" height="9" rx="1.7" class="fill-on-primary" />

      {/* Content: a bold title bar over two muted body lines. */}
      <rect x="124" y="86" width="104" height="10" rx="5" class="fill-primary-emphasis" />
      <rect x="124" y="105" width="176" height="7" rx="3.5" class="fill-primary" opacity="0.4" />
      <rect x="124" y="118" width="120" height="7" rx="3.5" class="fill-primary" opacity="0.4" />

      {/* Dismiss affordance: a small "×" in the trailing corner. */}
      <g class="stroke-primary-emphasis" stroke-width="2.4" stroke-linecap="round" opacity="0.55">
        <path d="M312 76 l9 9" />
        <path d="M321 76 l-9 9" />
      </g>
    </VisualCanvas>
  );
}
