import { VisualCanvas } from "../canvas";

// Combobox: the same control-plus-popup silhouette as select.visual.tsx — same x, same width, the
// popup edge-to-edge under the field, because both spend the positioner's `--anchor-width` — with the
// three things that make it a *different* component drawn on top:
//
//   1. a **text caret** in the field instead of a settled value bar (and no pointer cursor, which is
//      select.visual.tsx's mark): a Combobox is typed into, and the input is the focus owner;
//   2. a **short list** — two rows where Select draws three — because a query narrowed it;
//   3. a **result-count footer** under a hairline: `Combobox.Status`, the part that says how many
//      options survived, in the card beside the list rather than inside it.
//
// Rows 2's label is drawn as a bright prefix plus a muted remainder — the matched span of a filtered
// row. Default-exported and auto-registered by slug ("combobox") via the glob in ./index.tsx. Flat,
// geometric, hope-ui's *semantic* primary palette (plus `strong` for the soft shadow, the same neutral
// the canvas dots use).
//
// The chevron is stroked with `currentColor`, its color set by a `text-*` class on the wrapping <g> —
// reusing an already-emitted `text-*` utility rather than a `stroke-*` color utility unique to this
// file (which would render invisible until Tailwind re-scans; see close-button.visual.tsx).
export default function ComboboxVisual() {
  return (
    <VisualCanvas>
      {/* The control: the bordered shell, holding the input's query text and the chevron. */}
      <rect x="110" y="22" width="180" height="34" rx="10" class="fill-primary-soft" />
      {/* A partial query — short, because it is half-typed — followed by the caret. */}
      <rect x="124" y="35" width="42" height="8" rx="4" class="fill-primary" opacity="0.6" />
      <rect x="172" y="30" width="3" height="18" rx="1.5" class="fill-primary-emphasis" />
      <g class="text-primary-emphasis">
        <path
          d="M262 35 l8 8 l8 -8"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>

      {/* Popup elevation: a soft offset shadow under the card. */}
      <rect x="110" y="70" width="180" height="90" rx="14" class="fill-strong" opacity="0.14" />
      {/* The popup card — same x and same width as the control above it. */}
      <rect x="110" y="66" width="180" height="90" rx="14" class="fill-primary-soft" />

      {/* Row 1 — the top match, highlighted: typing lands the highlight on the first suggestion, so
          Enter commits it. A full-width fill with an inverted label. */}
      <rect x="118" y="78" width="164" height="24" rx="8" class="fill-primary" />
      <rect x="126" y="86" width="84" height="8" rx="4" class="fill-on-primary" />

      {/* Row 2 — a surviving match: the bright bar is the span the query matched, the muted one the
          rest of the label. */}
      <rect x="126" y="114" width="24" height="8" rx="4" class="fill-primary-emphasis" />
      <rect x="154" y="114" width="52" height="8" rx="4" class="fill-primary" opacity="0.34" />

      {/* The hairline, then the result count — Combobox.Status, pinned in the card under the list. */}
      <rect x="118" y="136" width="164" height="1.5" class="fill-primary" opacity="0.25" />
      <rect x="126" y="143" width="46" height="6" rx="3" class="fill-primary" opacity="0.45" />
    </VisualCanvas>
  );
}
