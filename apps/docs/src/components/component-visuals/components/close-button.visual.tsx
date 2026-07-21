import { Cursor, VisualCanvas } from "../canvas";

// CloseButton: a focal squared, rounded "x" button flanked by two faded, smaller ones
// (a nod to its sm/md/lg sizes), with a pointer hovering the hero — communicating "a
// compact, square dismiss affordance you press". Default-exported and auto-registered by
// slug ("close-button") via the glob in ./index.tsx. Flat, geometric, hope-ui's *semantic*
// primary palette only.
//
// The X glyph is stroked with `currentColor`, its color set by a `text-*` class on the
// wrapping <g> — mirroring the real `CloseIcon` component (`stroke="currentColor"`). This
// is deliberate: it reuses `text-on-primary` / `text-primary-emphasis`, utilities already
// emitted elsewhere in the app, rather than introducing `stroke-*` color utilities unique
// to this file. A brand-new utility isn't generated until Tailwind re-scans (a full build
// or dev restart), so a `stroke-on-primary` used only here renders as an invisible glyph on
// a stale dev server. `currentColor` sidesteps that entirely.
export default function CloseButtonVisual() {
  return (
    <VisualCanvas>
      {/* Left flank: a medium soft button, faded back */}
      <g opacity="0.5" class="text-primary-emphasis">
        <rect x="52" y="72" width="56" height="56" rx="16" class="fill-primary-soft" />
        <line
          x1="69"
          y1="89"
          x2="91"
          y2="111"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
        />
        <line
          x1="91"
          y1="89"
          x2="69"
          y2="111"
          stroke="currentColor"
          stroke-width="5"
          stroke-linecap="round"
        />
      </g>

      {/* Right flank: a small soft button, faded further back */}
      <g opacity="0.4" class="text-primary-emphasis">
        <rect x="306" y="78" width="46" height="46" rx="13" class="fill-primary-soft" />
        <line
          x1="320"
          y1="92"
          x2="338"
          y2="110"
          stroke="currentColor"
          stroke-width="4.5"
          stroke-linecap="round"
        />
        <line
          x1="338"
          y1="92"
          x2="320"
          y2="110"
          stroke="currentColor"
          stroke-width="4.5"
          stroke-linecap="round"
        />
      </g>

      {/* Center: the hero squared, rounded close button with its X glyph */}
      <g class="text-on-primary">
        <rect x="162" y="62" width="76" height="76" rx="21" class="fill-primary" />
        <line
          x1="185"
          y1="85"
          x2="215"
          y2="115"
          stroke="currentColor"
          stroke-width="7"
          stroke-linecap="round"
        />
        <line
          x1="215"
          y1="85"
          x2="185"
          y2="115"
          stroke="currentColor"
          stroke-width="7"
          stroke-linecap="round"
        />
      </g>

      <Cursor x={214} y={104} />
    </VisualCanvas>
  );
}
