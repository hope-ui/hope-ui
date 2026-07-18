import type { JSX } from "@solidjs/web";
import { createUniqueId } from "solid-js";

// Shared frame + decorators for every component visual (see ./index.tsx for how they're
// discovered and rendered). Kept in one place so all illustrations share the same canvas,
// dotted texture, and palette — a per-visual file only draws that component's shapes.

// The shared viewBox is a 2:1 landscape; art is composed for the ~400×200 space and
// VisualCanvas scales it to the card's fixed-height preview panel.
export const VB_W = 400;
export const VB_H = 200;

// One consistent frame for every illustration: a faint dotted texture behind the art
// (so all cards read as one family) plus the shared viewBox. The dot `<pattern>` id is
// per-instance (createUniqueId, SSR-safe) so multiple cards on the page never collide
// on a duplicate id. The whole SVG is decorative — the card's own title/description
// already name the component — so it's `aria-hidden`.
export function VisualCanvas(props: { children: JSX.Element }) {
  const dotsId = createUniqueId();
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      class="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <pattern id={dotsId} width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" class="fill-strong" opacity="0.16" />
        </pattern>
      </defs>
      <rect width={VB_W} height={VB_H} fill={`url(#${dotsId})`} />
      {props.children}
    </svg>
  );
}

// A mouse pointer, redrawn — sits on a hero shape to signal "interactive". Filled with
// the raised-surface color and outlined in the foreground token so it stays legible in
// both themes over a saturated primary fill. Reusable by any interactive-component visual.
export function Cursor(props: { x: number; y: number }) {
  return (
    <g transform={`translate(${props.x} ${props.y}) scale(1.35)`}>
      <path
        d="M0 0 L0 20 L5 15.5 L8.5 24 L12 22.3 L8.5 14 L15 14 Z"
        class="fill-surface-raised stroke-foreground"
        stroke-width="1.4"
        stroke-linejoin="round"
      />
    </g>
  );
}
