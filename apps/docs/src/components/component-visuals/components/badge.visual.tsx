import { VisualCanvas } from "../canvas";

// Badge: a focal soft chip carrying a status dot, flanked by a faded solid chip and
// a solid circular count badge — communicating "a small label, a status marker, a
// count". Default-exported and auto-registered by slug ("badge") via the glob in
// ./index.tsx. Flat, geometric, hope-ui's *semantic* primary palette only.
export default function BadgeVisual() {
  return (
    <VisualCanvas>
      {/* Left: solid chip, faded back */}
      <g opacity="0.5">
        <rect x="36" y="86" width="84" height="30" rx="15" class="fill-primary" />
        <rect x="52" y="97" width="52" height="8" rx="4" class="fill-on-primary" />
      </g>

      {/* Center: the hero soft chip with a leading status dot + label */}
      <rect x="140" y="80" width="124" height="42" rx="21" class="fill-primary-soft" />
      <circle cx="164" cy="101" r="7" class="fill-primary" />
      <rect x="180" y="97" width="66" height="8" rx="4" class="fill-primary-emphasis" />

      {/* Right: solid circular count badge */}
      <circle cx="330" cy="101" r="23" class="fill-primary" />
      <rect x="321" y="97" width="18" height="8" rx="4" class="fill-on-primary" />
    </VisualCanvas>
  );
}
