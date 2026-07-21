import { VisualCanvas } from "../canvas";

// Internationalization: a globe beside two content rows — one anchored left (LTR), one anchored
// right (RTL) — communicating "the same components adapt to a locale's language and reading
// direction". Default-exported and auto-registered by key "get-started/i18n" via the glob in
// ../index.tsx. Flat, geometric, hope-ui's *semantic* primary palette only.
export default function I18nVisual() {
  return (
    <VisualCanvas>
      {/* Panel */}
      <rect x="104" y="48" width="192" height="104" rx="16" class="fill-primary-soft" />

      {/* Globe: a light disc with primary grid lines (meridian + latitudes) */}
      <circle
        cx="150"
        cy="100"
        r="32"
        class="fill-on-primary stroke-primary"
        stroke-width="2"
        opacity="0.95"
      />
      <ellipse
        cx="150"
        cy="100"
        rx="12"
        ry="32"
        fill="none"
        class="stroke-primary"
        stroke-width="2"
        opacity="0.6"
      />
      <line
        x1="118"
        y1="100"
        x2="182"
        y2="100"
        class="stroke-primary"
        stroke-width="2"
        opacity="0.6"
      />
      <line
        x1="126"
        y1="84"
        x2="174"
        y2="84"
        class="stroke-primary"
        stroke-width="2"
        opacity="0.4"
      />
      <line
        x1="126"
        y1="116"
        x2="174"
        y2="116"
        class="stroke-primary"
        stroke-width="2"
        opacity="0.4"
      />

      {/* LTR row — bars anchored to the left edge */}
      <rect x="198" y="80" width="84" height="9" rx="4.5" class="fill-primary-emphasis" />
      <rect x="198" y="95" width="60" height="7" rx="3.5" class="fill-primary" opacity="0.4" />

      {/* RTL row — bars anchored to the right edge */}
      <rect x="198" y="113" width="84" height="9" rx="4.5" class="fill-primary-emphasis" />
      <rect x="222" y="128" width="60" height="7" rx="3.5" class="fill-primary" opacity="0.4" />
    </VisualCanvas>
  );
}
