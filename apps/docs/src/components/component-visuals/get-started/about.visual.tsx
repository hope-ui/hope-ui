import { VisualCanvas } from "../canvas";

// About: a card holding a few ready-made components — a solid button with a label,
// a round badge pip, and an outline chip — communicating "import a component and it
// works, styled out of the box". Default-exported and auto-registered by key
// "get-started/about" via the glob in ../index.tsx. Flat, geometric, hope-ui's
// *semantic* primary palette only.
export default function AboutVisual() {
  return (
    <VisualCanvas>
      {/* Card panel holding the components */}
      <rect x="104" y="50" width="192" height="100" rx="16" class="fill-primary-soft" />

      {/* A solid button with a label line */}
      <rect x="126" y="72" width="90" height="24" rx="12" class="fill-primary" />
      <rect x="140" y="81" width="62" height="6" rx="3" class="fill-on-primary" opacity="0.9" />

      {/* A round badge / count pip */}
      <circle cx="248" cy="84" r="13" class="fill-primary-emphasis" />

      {/* An outline component below */}
      <rect
        x="126"
        y="110"
        width="110"
        height="22"
        rx="11"
        fill="none"
        class="stroke-primary"
        stroke-width="2.5"
        opacity="0.7"
      />
      {/* A small trailing dot */}
      <circle cx="254" cy="121" r="7" class="fill-primary" opacity="0.5" />
    </VisualCanvas>
  );
}
