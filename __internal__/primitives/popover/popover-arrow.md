# `createPopoverArrow`

The arrow part of the [popover hook family](popover-root.md) — the little square that points at the
anchor.

```ts
function createPopoverArrow(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): {
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    "data-side": Side;
    "data-align": FloatingAlign;
    "data-uncentered": string | undefined;
  };
  setRef: (element: HTMLDivElement) => void;  // registering it enables the `arrow` middleware
};
```

The hook carries **measurements only**. The 45° rotation, the size, the background and the border are
the `arrow` slot's, and how a clamped arrow disappears is the recipe's call — see `data-uncentered`
below.

## Render the element unconditionally

**Never gate it on `state.floating.arrow()`.** No element means no `arrowElement` in
`createFloating`'s config, which means no `arrow` middleware, which means `arrow()` stays `undefined`
forever — the same deadlock `create-floating.md` names for gating the floating element on
`isPositioned()`. It is a genuine deadlock and not a slow start: with the gate applied in the test
harness, every `vi.waitFor` on `arrow()` runs to its full timeout.

A late ref is fine. `createFloating` tracks `arrowElement` inside its config memo, so an arrow that
mounts after the first measurement re-measures on its own.

`popover-arrow.browser.test.tsx` pins this by asserting the element is in the DOM **before** awaiting
the measurement — after it, a correct implementation and a deadlocked one are indistinguishable.

## `data-side` is the popup's side, not the pin edge

Identical to the Positioner's and the Content's, so one variant styles the card and its arrow
coherently — Base UI's semantics for `PopoverArrowDataAttributes.side` ("which side the popup is
positioned relative to the trigger"). The **pin edge** is the *opposite* of it, and it lives only in
the inline style, off `arrow().side`. Emitting the pin edge here instead is a silent footgun: both
values are legal `Side`s, so nothing fails — the card and the arrow just style off opposite
vocabularies.

## `data-uncentered` starts present

`""` while `centerOffset !== 0`, absent once a measurement resolves it to exactly `0`. A non-zero
offset means the arrow had to be clamped away from the anchor's centre and can no longer point at it
honestly.

It is present *before the first measurement too*, deliberately: an unmeasured arrow reads as clamped,
so a recipe hiding it starts hidden rather than flashing in a centred position it will not keep. The
attribute reports; it never hides anything itself — that stays with the recipe
(`data-uncentered:invisible`), where a preset can decide otherwise.

## The pin offset is a CSS string, never a measured number

```
calc(var(--popover-arrow-size, 8px) / -2)
```

Half the arrow pulled back over the popup's edge. The **size stays owned by the recipe** — the `arrow`
slot sets `--popover-arrow-size`, and the `8px` fallback covers a headless consumer who sets
nothing — and the primitive stays out of the CSSOM. Reading the size back would cost an effect, a
resize observer and a re-render, to arrive at a number CSS already has.

The alternative — a `size` option on the hook — moves a value the recipe already owns into JS and
makes it a second source of truth.

**It is border-width-agnostic, and stays that way — but a bordered preset must compensate.** Pinning
by *half* the arrow puts the square's centre on the popup's **padding-box edge**, the inner edge of
whatever border a preset draws. For a borderless consumer that is exactly right, and `box-sizing:
border-box` keeps the outer box at `--popover-arrow-size` either way, so the rotated silhouette is
bit-identical.

For a preset that *does* draw a border it is one hairline short, and the shortfall is visible. A
rotated square is widest at its **side vertices**; with those on the border's *inner* edge, the card's
band still protrudes past the arrow's outward edges at the base — a burr one border-width wide on each
side, which antialiases to a ~0.5px sliver at 1:1. It reads as the hairline overshooting the diagonal
and ending in a small stub.

The fix belongs to the **preset**, not here: hope's recipe nudges the arrow outward by exactly
`--popover-card-border`, putting the widest point on the hairline's *outer* edge, where the composite
outline hands off from straight to diagonal with no step. Baking a `- 1px` term into `PIN_OFFSET`
would hard-code one preset's border width for every headless consumer, including those drawing none —
so the kernel keeps the border-agnostic pin and the layer that authors the border cancels it.

**The name is unprefixed on purpose.** `--hope-*` is `@hope-ui/theming`'s *semantic token* vocabulary,
authored by a preset in its `theme.css`; this property is a component-local geometry channel between a
recipe and this hook — the role calendar's `--cell-size` plays. The distinction is enforced rather than
stylistic: `check:recipe-purity` rejects any bracketed arbitrary value naming `--hope-`, so under the
original `--hope-popover-arrow-size` spelling the `arrow` slot could not have set the property at all
(`[--hope-popover-arrow-size:0.5rem]` is a purity violation), and "the size stays owned by the recipe"
would have meant "every preset hard-codes a box size that must happen to match the `8px` fallback".

## The `style` merge order

Kernel first, consumer last, the same order and for the same reason as
[`popover-positioner.md`](popover-positioner.md) § *The `style` merge order*: a `z-index`, or the
`--popover-arrow-size` the pin reads, has to survive. A **string** `style` has no merge seam and
is dropped in favour of the pin. Unlike the Positioner, this part does not warn about it: dropping
the Positioner's style paints the whole layer at 0,0, while dropping the arrow's leaves a correctly
pinned arrow missing a decoration.

## The bordered arrow — which two edges, and why they are physical

The arrow is opaque and absolutely positioned, so it paints **above** the card's own border (a
positioned descendant paints over its parent's background and border). Unbordered, it stops the card's
hairline dead for ~11px and reads as a detached tab. So the recipe borders its two **outward** edges
and the hairline continues around it.

**Which two.** A clockwise 45° turn maps the box's corners **TL→top, TR→right, BR→bottom, BL→left** —
so the box's `top` edge becomes the upper-*right* one, `left` the upper-left, and so on. `data-side` is
the **popup's** side, so the arrow points the *other* way:

| `data-side` | arrow points | box edges | classes |
|---|---|---|---|
| `bottom` | up | top + left | `border-t border-l` |
| `top` | down | bottom + right | `border-b border-r` |
| `right` | left | left + bottom | `border-l border-b` |
| `left` | right | top + right | `border-t border-r` |

**The invariant that catches a mistake:** in every row the pair is **adjacent**, meeting at the vertex
that is the tip — CSS miters that into a clean point. An *opposite* pair gives two parallel bars; the
wrong *adjacent* pair gives a chevron pointing back **into** the card. Neither fails any automated
check (the browser test project compiles no Tailwind), so the mapping is pinned as a table in
`packages/presets/src/hope/recipes/__tests__/popover.test.ts` and judged by eye in Storybook's `Sides`
story.

**No opt-out is needed.** Both halves of the RTL gate exempt a `data-side-*`-scoped utility
(`MEASURED_SIDE_SCOPED`, in `packages/theming/src/conformance.ts` and `scripts/check-rtl-safety.mjs`):
`data-side` reports where the layer *landed* after `flip` — measured geometry — and which edges of a
rotated square face outward follows from that, identically in `ltr` and `rtl`. The pair is **not**
mirrored under `dir="rtl"`; if it ever appears to be, something else in the chain is direction-sensitive
and the exemption's premise is wrong. See `__internal__/theming.md` § The governing rule.

Two details the recipe owns, both silent if dropped:

- **`border-subtle` is required, not cosmetic.** Tailwind's preflight is `border: 0 solid`, so a bare
  `border-t` paints in `currentColor` — the card's inherited `text-foreground`. The colour therefore sits
  on the base unconditionally, with only the *widths* keyed per side.
- **The card's elevation must be a `filter`.** `shadow-md` is a `box-shadow` painted in the card's own
  background layer, beneath its positioned descendants, so the arrow covers it and casts none of its
  own. `drop-shadow-md` derives from the rendered subtree's alpha and traces the **card ∪ arrow**
  silhouette. An arrow hidden by `data-uncentered:invisible` contributes no alpha, so an unmeasured
  arrow correctly casts nothing.
- **The arrow must sit on the border's OUTER edge**, which costs one outward translate of exactly the
  border width — otherwise the card's band protrudes past the arrow's base. See § *The pin offset*.
  The width is single-sourced as `--popover-card-border` on the card and inherited by the arrow, so
  the border and the compensation cannot drift apart.

## SSR

Attribute and style computation only — no DOM access, no effects. Before the first measurement
`arrow()` is `undefined`, so the server emits `left`/`top` absent, the pin on `top`, and
`data-uncentered=""`; the client's first render computes the same, which is what hydration compares.
`data-side`/`data-align` seed from the config exactly as the Positioner's do.

## Rejected alternatives

### Gating the arrow element on `state.floating.arrow()`
**Why not:** no element means no `arrowElement` in `createFloating`'s config, so the `arrow` middleware
never runs and `arrow()` stays `undefined` forever. A genuine deadlock, not a slow start: with the gate
applied in the test harness, every `vi.waitFor` on `arrow()` ran to its full timeout. See *Render the
element unconditionally* above.

### Emitting the pin edge as `data-side`
**Why not:** both values are legal `Side`s, so nothing fails — the card and its arrow simply style off
opposite vocabularies, and one variant can no longer dress both coherently. The pin edge stays in the
inline style, off `arrow().side`.

### A measured arrow size — a `size` option on the hook, or reading the property back
**Why not:** reading it back costs an effect, a resize observer and a re-render to arrive at a number CSS
already has, and an option moves a value the recipe owns into JS as a second source of truth. The pin
stays a CSS string over `--popover-arrow-size`, with an `8px` fallback for a headless consumer.

### `--hope-popover-arrow-size` — the property's original name
**Why not:** `check:recipe-purity` rejects any bracketed arbitrary value naming `--hope-`, so
`[--hope-popover-arrow-size:0.5rem]` in the `arrow` slot is a purity violation. No preset recipe could
have set the property at all, and "the size stays owned by the recipe" would have meant every preset
hard-coding a box size that must happen to match the fallback.

### Baking the border compensation into `PIN_OFFSET`
**Why not:** a `- 1px` term hard-codes one preset's border width for every headless consumer, including
those drawing no border at all, whose arrow would then sit a hairline off the popup's edge. The kernel
keeps the border-agnostic pin and the layer that authors the border cancels it. See *The pin offset is a
CSS string, never a measured number* above.

### Logical border utilities (`border-s`/`border-e`) on the bordered arrow
**Why not:** which two edges of a 45°-rotated square face outward follows from the rotation and from
`data-side`, which reports *measured* geometry — identically in `ltr` and `rtl`. A pair that mirrored
under `dir="rtl"` would break the adjacency invariant and paint a chevron pointing back into the card,
and nothing automated would catch it (the browser test project compiles no Tailwind). Both halves of the
RTL gate exempt `data-side-*`-scoped utilities for exactly this case (`MEASURED_SIDE_SCOPED`).

### `shadow-md` (a `box-shadow`) for the card's elevation
**Why not:** a `box-shadow` paints in the card's own background layer, beneath its positioned
descendants, so the arrow covers it and casts none of its own. `drop-shadow-md` derives from the rendered
subtree's alpha and traces the card ∪ arrow silhouette instead.
