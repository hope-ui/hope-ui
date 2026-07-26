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

The hook carries **measurements only**. The 45° rotation, the size and the background are the `arrow`
slot's, and how a clamped arrow disappears is the recipe's call — see `data-uncentered` below.

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

## Borderless in v1

A bordered arrow is a 45°-rotated square whose *outward* two edges carry the border — a fact of the
rotation, not of reading direction. `assertLogicalPropertyConformance` exempts only `rtl:`/`ltr:`
-scoped utilities and takes **no allowlist parameter**, so a direction-invariant physical border
would have to be spelled twice (`ltr:border-t ltr:border-s rtl:border-t rtl:border-e`, per side) to
pass a check whose premise does not apply to it.

The path to a bordered one, if it is ever wanted: give the conformance kit an explicit
`directionInvariant` escape hatch — a named opt-out with a reason string, the shape `rtl-ok:` already
uses in `check-rtl-safety.mjs` — rather than doubling the class list at every call site. Until then
the arrow is a solid `bg-surface-overlay` square and the card's border stops at it.

## SSR

Attribute and style computation only — no DOM access, no effects. Before the first measurement
`arrow()` is `undefined`, so the server emits `left`/`top` absent, the pin on `top`, and
`data-uncentered=""`; the client's first render computes the same, which is what hydration compares.
`data-side`/`data-align` seed from the config exactly as the Positioner's do.
