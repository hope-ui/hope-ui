# `createPopoverAnchor`

The anchor part of the [popover hook family](popover-root.md) — the escape hatch that positions the
layer against something other than its trigger.

```ts
function createPopoverAnchor(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): {
  props: JSX.HTMLAttributes<HTMLDivElement>;   // the consumer's, unchanged
  setRef: (element: HTMLDivElement) => void;   // registers `state.customAnchorElement`
};
```

Hand `setRef` to the element's `ref` and the layer positions against that element instead of the
trigger. The trigger keeps owning the toggle and the ARIA; a consumer wraps a card, a table row or a
whole section in the anchor and puts the button wherever it belongs.

## It computes nothing

No ARIA, no handler, no `data-*`. `props` comes back exactly as it went in — returned only so every
part hook in the family has one shape. A positioning reference is not a control, and
`popover-anchor.browser.test.tsx` pins that by asserting the element's *whole* attribute list, so an
`aria-*` or a `data-side` sneaking in later fails there rather than in a screen reader.

## The precedence rule

```ts
state.anchorElement = () => customAnchorElement() ?? triggerElement();
```

The Anchor wins whenever one is mounted; with none, the layer falls back to the trigger. The chain
itself, and why it is a derived accessor rather than a latched value, is
[`popover-root.md`](popover-root.md) § *The anchor precedence chain*.

## Clearing on unmount is the load-bearing half

`createRegisteredElement`, not `createRegisteredId` — an id is known at render time, a ref only after
it — and its `unregister` is what hands positioning back to the trigger. Without the clear,
`anchorElement()` keeps naming a **detached** element and an open layer strands wherever that element
last was; measured in the test's red run, the layer sat 64px off. Both directions are asserted
against the positioner's **rect**, not against `state.anchorElement()`: a different accessor proves
nothing about whether the positioning layer noticed.

Call it from the anchor's own owner scope, so that cleanup is scoped to the anchor's unmount rather
than the root's.

## It is deliberately **not** dismiss-excluded

Clicking the anchor closes the popover, and that is the intended behavior — the reasoning is in
[`popover-root.md`](popover-root.md) § *Why a `Popover.Anchor` is deliberately **not** excluded*
(short version: `exclude` fixes the trigger's toggle race, and `element.contains(target)` would turn
the anchor's whole subtree into a dead zone for outside-click).

## SSR

`createRegisteredElement` runs in a `createEffect`, which never runs on the server, so nothing
registers there and the layer seeds as trigger-anchored. Nothing is visible in that window —
`isPositioned()` is false and the layer is `visibility: hidden` — and this part renders no attribute
of its own, so the server's bytes and the client's first render are identical.

## Rejected alternatives

### A register-only anchor — the `createRegisteredId` shape, with no `unregister`
**Why not:** without the clear on unmount, `state.anchorElement()` keeps naming a **detached** element and
an open layer strands wherever that element last was — measured in the test's red run at 64px off. An id
is also known at render time where a ref is only known after it, so `createRegisteredId` cannot express
this registration in the first place.

### ARIA, a handler or a `data-*` of the anchor's own
**Why not:** the anchor is a positioning reference, not a control, and a consumer may wrap it around a
card, a table row or a whole section — any `aria-*` on it would describe that entire region to a screen
reader as part of the widget. `popover-anchor.browser.test.tsx` asserts the element's *whole* attribute
list so a later addition fails there rather than in a screen reader.
