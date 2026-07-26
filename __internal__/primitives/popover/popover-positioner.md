# `createPopoverPositioner`

The positioner part of the [popover hook family](popover-root.md) — the kernel-styled wrapper the
floating layer is measured and moved as.

```ts
function createPopoverPositioner(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): {
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    "data-side": Side;
    "data-align": FloatingAlign;
    "data-presence": PresenceStatus;
  };
  mounted: Accessor<boolean>;                 // gate the positioner's render on this
  setRef: (element: HTMLDivElement) => void;  // registers it as what `createFloating` positions
};
```

## Why the split exists at all

`Popover.Content` — the recipe card with the chrome and the enter/exit transition — is this element's
child, not this element. Tailwind v4 compiles `scale-*`/`-translate-y-*` to the standalone `scale`
and `translate` properties, so a directional enter slide on the content never touches `transform` and
never fights the `translate()` the kernel writes here. One element for *where the layer is*, one for
*what it looks like arriving*.

## Unlike Dialog's positioner, this one is not kernel-free

A Dialog is absolutely positioned by a recipe: its placement is authored, so a pure variant resolves
it and no attribute is needed. A Popover is **measured** — where it landed is runtime state that only
`createFloating` knows, and that no recipe can predict, since the consumer asks for `bottom` and
`flip` may hand back `top` and change again on scroll. That is what `style`, `data-side` and
`data-align` carry.

- `data-side` — the **resolved, always-physical** side, after `flip`. A logical `side: "inline-end"`
  comes back as `"left"` or `"right"`.
- `data-align` — the resolved alignment, with floating-ui's absent suffix normalized to `"center"`.
- `data-presence` — the **shared** presence's status, the same one the Content reflects.

`mounted` is `state.contentPresence.mounted` — the shared presence, never a new one. Gate the
element's render on it, so the layer stays mounted through the content's exit transition.

## It is the element that stays visible inside a modal

```ts
createKeepVisible({ active: state.contentPresence.mounted, ref: state.positionerElement });
```

The positioner is the direct `<body>` child that a modal ancestor's `createHideOutside` observer
sees appear — a `Popover` opened from inside a `Dialog`. Left to itself the modal marks it
`aria-hidden` + `inert`, which leaves a card that paints on top of the scrim, undimmed and fully
legible, yet is out of the accessibility tree and **transparent to hit testing**: the click lands on
whatever is underneath. `createKeepVisible` registers the element with whichever hide-outside layer
is innermost right now, and sparing it spares its **whole subtree** — `isSpared` tests containment
both ways — so the Content, the Arrow and everything in the card ride along on this one call. See
[`create-hide-outside.md`](../internal/create-hide-outside.md) § *Nesting*.

Two details are deliberate:

- **Keyed on `mounted()`, not `open()`** — the same reason `createFloating` is. A layer animating
  out is still in the page, and going `inert` mid-exit would make the card stop responding to the
  pointer before it has finished leaving.
- **It is unconditional.** A popover with no modal above it registers into an empty layer stack and
  `keepVisible` no-ops, so there is nothing to gate on and no ancestor to detect.

The focus half of the same nesting lives one part up, in
[`popover-content.md`](popover-content.md) — this part covers hit testing and the accessibility
tree only.

## The `style` merge order is the documented escape valve

```ts
style = { ...state.floating.floatingStyles(), ...consumerStyleObject }
```

**Kernel first, consumer last** — so a conflicting key resolves the consumer's way. This is the
sanctioned way out of `create-floating.md`'s consumer anti-pattern #4 ("never put `position`/`left`/
`top`/`transform` in the positioner slot"): a `z-index`, a `pointer-events`, or a different
pre-positioned `visibility` is spread *after* and wins, without the recipe growing positional
utilities that would be overwritten on the first measurement anyway.

Concretely, the pre-positioned branch of `floatingStyles()` is
`{ position, left: 0, top: 0, visibility: "hidden" }`. A consumer who wants the layer laid out
differently before it is measured overrides `visibility` here rather than patching the kernel:

```tsx
// Lay the layer out unmeasured — e.g. to measure its own content first — instead of hiding it.
<Popover.Positioner style={{ visibility: "visible" }} />
```

### What that overrides, measured

The kernel's `visibility` is doing two jobs, and spreading over it opts out of both. Both are pinned
by the R9 cases in `popover.browser.test.tsx`, which sample the positioner's *computed* style once per
animation frame across an open and a close:

- **No frame is ever visible-but-unmeasured.** `visibility` and the `translate()` are lifted by the
  same memo read, so the layer never paints at 0,0 — measured, it is already translated on the first
  sampled frame, because `computePosition` resolves on the microtask queue inside the mounting task
  while `createPresence` spends two rAFs going `entering → entered`.
- **A closing layer stays positioned for its whole exit.** That is `active: () =>
  contentPresence.mounted()` in `createPopover`, not `active: open` — see
  [`popover-root.md`](popover-root.md).

Override `visibility` and the first point becomes the consumer's problem: the layer paints wherever
it was laid out until the first measurement lands. That is the trade the escape valve exists to make
available, not a bug.

### A string `style` is unsupported

An inline style string has no merge seam — it cannot be spread into the kernel's object — and the
kernel's positioning has to win, or the layer paints at 0,0 on top of whatever is there. So the
consumer's string is dropped, and **loudly**: a dev-only effect warns, naming the fix (pass an
object). Silently dropping it is how someone spends an afternoon on a style that never applied.

## `dir` is an ordinary forwarded attribute

Popover writes no locale-derived `dir` anywhere (see [`popover-root.md`](popover-root.md) § *Popover
takes no locale*). A consumer who needs to force a direction on a portaled layer forwards `dir` to
this part like any other native attribute, and `createFloating` reads it back off
`getComputedStyle(floating).direction` — the same call floating-ui's own `platform.isRTL` makes, on
the same element. One direction channel, nothing to disagree.

That escape hatch is pinned by a test asserting a **rect**, not just the attribute:
`side: "inline-end"` with `dir="rtl"` here must place the layer to the physical *left* of the anchor
and report `data-side="left"`. Asserting only the attribute would pass even if the box painted on the
wrong side.

## SSR

No DOM access. Both effects here — `createKeepVisible` and the dev-only string-`style` warning —
reach the DOM from their effect bodies alone, and effect bodies never run on the server (there is no
layer stack there anyway). `floatingStyles()` serves its pre-positioned branch — a constant with no client-only input —
and `side()`/`align()` seed from the config, so `data-side`/`data-align` are identical on both sides
of the hydration round-trip. The tree never branches on them, only CSS does.
