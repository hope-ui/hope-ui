import { Cursor, VisualCanvas } from "../canvas";

// Popover: a small elevated card anchored to the button that opened it, with an arrow straddling the
// card's edge and pointing back at that button. Reads as "a light surface attached to a control" —
// deliberately the opposite of dialog.visual.tsx, which draws a scrim over a dimmed page: nothing is
// dimmed here, and the page content either side stays at full strength, because a Popover is
// non-modal. Default-exported and auto-registered by slug ("popover") via the glob in ./index.tsx.
// Flat, geometric, hope-ui's *semantic* primary palette (plus `strong` for the shadow, the same
// neutral the canvas dots use).
export default function PopoverVisual() {
  return (
    <VisualCanvas>
      {/* The page either side, undimmed and still live — the non-modal half of the story. */}
      <g class="fill-primary" opacity="0.3">
        <rect x="22" y="62" width="54" height="8" rx="4" />
        <rect x="22" y="78" width="40" height="8" rx="4" />
        <rect x="324" y="62" width="54" height="8" rx="4" />
        <rect x="338" y="78" width="40" height="8" rx="4" />
      </g>

      {/* Card elevation: a soft offset shadow under the surface. */}
      <rect x="88" y="48" width="224" height="86" rx="14" class="fill-strong" opacity="0.14" />

      {/* The popup surface: a compact, soft-tinted card floating above the page. */}
      <rect x="88" y="44" width="224" height="86" rx="14" class="fill-primary-soft" />

      {/* The arrow: a 45°-rotated square straddling the card's bottom edge, pointing at the trigger
          below — the same geometry the real `arrow` slot draws. */}
      <rect
        x="192"
        y="122"
        width="16"
        height="16"
        rx="2"
        transform="rotate(45 200 130)"
        class="fill-primary-soft"
      />

      {/* Title, then two lines of description. */}
      <rect x="108" y="62" width="94" height="11" rx="5" class="fill-primary-emphasis" />
      <rect x="108" y="86" width="184" height="7" rx="3.5" class="fill-primary" opacity="0.4" />
      <rect x="108" y="99" width="132" height="7" rx="3.5" class="fill-primary" opacity="0.4" />

      {/* The trigger the card is anchored to — a solid button, directly under the arrow. */}
      <rect x="158" y="150" width="84" height="28" rx="10" class="fill-primary" />
      <rect x="176" y="161" width="48" height="6" rx="3" class="fill-on-primary" />

      {/* The pointer on that trigger — the card belongs to the control the reader just pressed. */}
      <Cursor x={216} y={158} />
    </VisualCanvas>
  );
}
