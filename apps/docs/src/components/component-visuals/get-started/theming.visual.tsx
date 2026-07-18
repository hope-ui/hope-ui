import { VisualCanvas } from "../canvas";

// Theming: a card with a title bar and a row of tone swatches (the semantic token
// ramp, strong → light) — communicating "swap the preset and a fixed vocabulary of
// tokens remaps your whole design". Default-exported and auto-registered by key
// "get-started/theming" via the glob in ../index.tsx. Flat, geometric, hope-ui's
// *semantic* primary palette only.
export default function ThemingVisual() {
  return (
    <VisualCanvas>
      {/* Themed card panel */}
      <rect x="104" y="48" width="192" height="104" rx="16" class="fill-primary-soft" />

      {/* Themed title bar */}
      <rect x="126" y="68" width="96" height="10" rx="5" class="fill-primary-emphasis" />

      {/* Token ramp: four swatches from the strong role color down to the light on-color */}
      <rect x="126" y="92" width="28" height="28" rx="7" class="fill-primary" />
      <rect x="162" y="92" width="28" height="28" rx="7" class="fill-primary-emphasis" />
      <rect x="198" y="92" width="28" height="28" rx="7" class="fill-primary" opacity="0.5" />
      <rect
        x="234"
        y="92"
        width="28"
        height="28"
        rx="7"
        class="fill-on-primary stroke-primary"
        stroke-width="1.5"
      />

      {/* A themed content line under the ramp */}
      <rect x="126" y="132" width="140" height="7" rx="3.5" class="fill-primary" opacity="0.35" />
    </VisualCanvas>
  );
}
