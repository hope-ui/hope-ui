import { Cursor, VisualCanvas } from "../canvas";

// Button: a focal solid button flanked by two faded variant chips (outline + soft),
// with a pointer hovering it — communicating "an action trigger, with variants".
// Default-exported and auto-registered by slug ("button") via the glob in ./index.tsx.
export default function ButtonVisual() {
  return (
    <VisualCanvas>
      {/* Left: outline variant, faded back */}
      <g opacity="0.5">
        <rect
          x="44"
          y="84"
          width="82"
          height="34"
          rx="9"
          fill="none"
          class="stroke-primary"
          stroke-width="2.5"
        />
        <rect x="60" y="97" width="50" height="8" rx="4" class="fill-primary" />
      </g>

      {/* Right: soft variant, faded back */}
      <g opacity="0.75">
        <rect x="274" y="84" width="82" height="34" rx="9" class="fill-primary-soft" />
        <rect x="290" y="97" width="50" height="8" rx="4" class="fill-primary-emphasis" />
      </g>

      {/* Center: the hero solid button */}
      <rect x="140" y="74" width="120" height="52" rx="13" class="fill-primary" />
      <rect x="168" y="95" width="64" height="10" rx="5" class="fill-on-primary" />

      <Cursor x={222} y={92} />
    </VisualCanvas>
  );
}
