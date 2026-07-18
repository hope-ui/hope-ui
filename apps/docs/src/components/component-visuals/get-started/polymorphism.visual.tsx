import { VisualCanvas } from "../canvas";

// Polymorphism: one source component branching into two render targets — an anchor
// (a chip with an underline) and another component (an outline chip) — communicating
// "render this component as a different element or component". Default-exported and
// auto-registered by key "get-started/polymorphism" via the glob in ../index.tsx.
// Flat, geometric, hope-ui's *semantic* primary palette only.
export default function PolymorphismVisual() {
  return (
    <VisualCanvas>
      {/* The source component */}
      <rect x="86" y="86" width="76" height="28" rx="14" class="fill-primary" />
      <rect x="102" y="97" width="44" height="6" rx="3" class="fill-on-primary" opacity="0.9" />

      {/* Branch connectors: one component -> two render targets */}
      <path
        d="M162 100 H196 V72 H236"
        fill="none"
        class="stroke-primary"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.55"
      />
      <path
        d="M162 100 H196 V128 H236"
        fill="none"
        class="stroke-primary"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.55"
      />

      {/* Target A: rendered as an anchor — a chip with an underline */}
      <rect x="238" y="60" width="76" height="24" rx="7" class="fill-primary-soft" />
      <rect x="250" y="69" width="42" height="5" rx="2.5" class="fill-primary-emphasis" />
      <line
        x1="250"
        y1="78"
        x2="292"
        y2="78"
        class="stroke-primary"
        stroke-width="2"
        opacity="0.7"
      />

      {/* Target B: rendered as another component — an outline chip */}
      <rect
        x="238"
        y="116"
        width="76"
        height="24"
        rx="12"
        fill="none"
        class="stroke-primary"
        stroke-width="2.5"
        opacity="0.75"
      />
      <rect x="250" y="125" width="42" height="6" rx="3" class="fill-primary" opacity="0.5" />
    </VisualCanvas>
  );
}
