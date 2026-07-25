# `createFloating`

The **overlay positioning primitive**: a SolidJS reactive binding over
[`@floating-ui/dom`](https://floating-ui.com) — placement, `flip`/`shift`, `offset`, `arrow`,
`size`, `autoUpdate`. It is the substrate every floating layer positions with: Tooltip, Popover,
HoverCard, Menu, ContextMenu, Menubar, Select, Combobox, NavigationMenu, DatePicker.

**Positioning only.** Dismissal ([`createDismissable`](create-dismissable.md)), focus
([`createFocusTrap`](create-focus-trap.md)), mount/unmount transitions
([`createPresence`](create-presence.md)) and hover intent are separate primitives — the same split
floating-ui draws between its own packages. A Popover composes them; none of them knows about the
others. In particular, a non-modal layer must **not** reach for Dialog's modal machinery to get
positioned.

## Why `@floating-ui/dom` (and why optional)

`@floating-ui/dom` is the framework-agnostic core with no Solid coupling, so we **adopt** it and
write the Solid binding by hand — rather than a framework port compiled for another runtime. The
structural reference is `@floating-ui/vue`'s `useFloating.ts`/`arrow.ts`, whose
`ref`/`computed`/`watch`/`onScopeDispose` lifecycle maps to
`createSignal`/`createMemo`/`createEffect`/`onCleanup` almost 1:1; the React port's
`useState`/`useLayoutEffect` memoization is re-render bookkeeping you would only have to reverse
out. The **option vocabulary** is Base UI's `useAnchorPositioning` — `side`/`align`/`sideOffset`/
`alignOffset` — which is the anchor-relative way to say what floating-ui spells as one `placement`
string.

It went in as an **optional `peerDependency`**, the same pattern as `@tanstack/virtual-core`: a
consumer who never opens a floating layer keeps a dependency-free `@hope-ui/primitives` install.
Note the honest limit of "optional" — see the caveat in
[`packages/primitives/README.md`](../../../packages/primitives/README.md).

## API

Elements and `active` are **required accessors**; every other option is a plain optional scalar the
caller keeps live with a getter.

```ts
function createFloating(options: {
  active: Accessor<boolean>;                                 // same seam as createDismissable/createFocusTrap
  anchor: Accessor<ReferenceElement | null | undefined>;     // Element | VirtualElement
  floating: Accessor<HTMLElement | null | undefined>;        // the POSITIONER, not the content card
  arrowElement?: Accessor<HTMLElement | null | undefined>;   // supplying it is what enables the arrow middleware

  side?: Side;                    // default "bottom"
  align?: FloatingAlign;          // default "center"
  sideOffset?: number;            // default 0
  alignOffset?: number;           // default 0
  strategy?: Strategy;            // default "absolute"
  flip?: boolean;                 // default true
  shift?: boolean;                // default true
  collisionPadding?: Padding;     // default 0
  collisionBoundary?: Boundary;   // default "clippingAncestors"
  arrowPadding?: number;          // default 0
  transform?: boolean;            // default true — translate() instead of left/top
  trackSize?: boolean;            // default false — run `size`, populate `size()`
  autoUpdate?: boolean;           // default true
  trackAnchorMotion?: boolean;    // default false — autoUpdate's `animationFrame`
  middleware?: Middleware[];      // APPENDED after the built-in stack
}): {
  floatingStyles: Accessor<JSX.CSSProperties>;  // the primary product — spread onto the positioner
  placement: Accessor<Placement>;               // RESOLVED, after flip/shift
  side: Accessor<Side>;                         // drives data-side
  align: Accessor<FloatingAlign>;               // floating-ui's absent suffix normalized to "center"
  isPositioned: Accessor<boolean>;
  x: Accessor<number>;
  y: Accessor<number>;
  strategy: Accessor<Strategy>;
  arrow: Accessor<FloatingArrowState | undefined>;   // { x, y, centerOffset, side }
  size: Accessor<FloatingSizeState | undefined>;     // { anchorWidth, anchorHeight, availableWidth, availableHeight }
  middlewareData: Accessor<MiddlewareData>;          // escape hatch
  update: () => void;                                // for VirtualElement rect mutations
};
```

floating-ui's `Boundary`, `Middleware`, `MiddlewareData`, `Padding`, `Placement`,
`ReferenceElement`, `Side`, `Strategy` and `VirtualElement` are re-exported from this module, so a
consumer names them through `@hope-ui/primitives/internal` rather than taking a direct import on an
optional peer.

**Why getters and not accessor-or-value.** floating-ui's own option surface is full of callables
(`Derivable<T> = (state) => T` for `offset`/`flip`/`shift`/`size`, plus `Middleware.fn`), so a
`sideOffset?: number | (() => number)` would collide head-on with floating-ui's `offset(state => …)`
convention — and `runIfFunction` is only sound when `T` is not itself callable. Getters have no such
ambiguity, and they are what the other eight primitives already use.

**`strategy: "fixed"` has a caveat that cannot be fixed here.** Inside a transformed ancestor, a
`position: fixed` element resolves against that ancestor rather than the viewport — a CSS
containing-block rule, not a floating-ui bug. The default is `"absolute"` for that reason.

**`trackSize` is measurement-only.** Nothing is written onto the floating element, which is what
keeps `size` out of its classic ResizeObserver feedback loop. Once a consumer *does* wire
`--available-height` into a `max-height`, that write re-fires `elementResize` and Chromium may log
`ResizeObserver loop completed with undelivered notifications` even though the loop converges
(`availableHeight` depends on the anchor and boundary, not on the layer's own height).

### Base UI vocabulary → floating-ui middleware

| Option | What it becomes |
| --- | --- |
| `side` + `align` | `placement` — `"bottom"`, `"bottom-start"`, `"left-end"`, … |
| `sideOffset` | `offset({ mainAxis })` |
| `alignOffset` | `offset({ crossAxis, alignmentAxis })` — both, so one option means one thing on centred *and* aligned placements |
| `flip` | `flip(collision)`, or omitted |
| `shift` | `shift(collision)`, or omitted |
| `collisionPadding` | the `padding` of `flip`/`shift`/`size` |
| `collisionBoundary` | the `boundary` of `flip`/`shift`/`size` |
| `arrowElement` + `arrowPadding` | `arrow({ element, padding })` |
| `trackSize` | `size({ …collision, apply })` — `apply` records numbers, writes nothing |
| `strategy` | `computePosition`'s `strategy` |
| `autoUpdate` / `trackAnchorMotion` | `autoUpdate(anchor, floating, update, { animationFrame })` |
| `transform` | *not* floating-ui — how `floatingStyles()` spends the coordinates |
| `middleware` | appended after everything above |

## Rendering a positioner

Two elements, deliberately: the **positioner** carries the kernel's styles and nothing else; the
**content card** inside it carries the recipe, the padding, the shadow, and any enter/exit
transition. Keeping them apart is what stops a transform-based animation from fighting the
`translate()` the kernel writes.

```tsx
const [anchorElement, setAnchorElement] = createSignal<HTMLElement>();
const [positioner, setPositioner] = createSignal<HTMLElement>();

const floating = createFloating({
  active: open,
  anchor: anchorElement,
  floating: positioner,
  get side() {
    return props.side;
  },
  get sideOffset() {
    return props.sideOffset;
  },
});

return (
  <>
    <button ref={setAnchorElement} onClick={() => setOpen(!open())}>
      Open
    </button>
    <Show when={mounted()}>
      <Portal>
        <div
          ref={setPositioner}
          data-side={floating.side()}
          data-align={floating.align()}
          style={floating.floatingStyles()}
        >
          <div class={slots.content()}>…</div>
        </div>
      </Portal>
    </Show>
  </>
);
```

`data-side`/`data-align` are how a recipe reacts to a flip — in CSS, never by branching the tree
(see *SSR & hydration* below).

With `trackSize`, the measurements reach CSS as custom properties, which is the whole reason the
kernel records them instead of applying them:

```tsx
style={{
  ...floating.floatingStyles(),
  "--anchor-width": `${floating.size()?.anchorWidth ?? 0}px`,
  "--available-height": `${floating.size()?.availableHeight ?? 0}px`,
}}
```

A Select listbox then matches its trigger with `width: var(--anchor-width)` and caps itself with
`max-height: var(--available-height)`.

## Arrow

`createFloating` returns arrow **measurements** — `{ x, y, centerOffset, side }` — and writes
nothing. The 45° rotation and the static-side pinning are CSS the themeable component owns.

`side` here is the **opposite** of `floating.side()`: the edge of the layer the arrow attaches to.
`x` and `y` are mutually exclusive — floating-ui fills in only the axis the placement varies along.
`centerOffset` is how far the arrow had to be clamped away from the anchor's centre; non-zero means
the anchor is too narrow to point at honestly, and is the signal to hide the arrow.

```tsx
const px = (value: number | undefined) => (value == null ? undefined : `${value}px`);

<div
  ref={setArrowElement}
  data-side={floating.arrow()?.side}
  style={{
    position: "absolute",
    left: px(floating.arrow()?.x),
    top: px(floating.arrow()?.y),
    [floating.arrow()?.side ?? "top"]: `${-ARROW_SIZE / 2}px`,
    transform: "rotate(45deg)",
    visibility: floating.arrow()?.centerOffset === 0 ? undefined : "hidden",
  }}
/>;
```

**Never gate the arrow element's existence on `arrow()`.** It is the same deadlock as gating the
floating element on `isPositioned()`: no element → no `arrow` middleware → `arrow()` stays
`undefined` forever. Render it unconditionally and drive its *style* from the measurements. The ref
may arrive late — it is read inside the config memo, so a conditionally rendered arrow re-measures
when it mounts.

## RTL

Reading direction is **delegated to floating-ui**, which resolves it from the DOM:
`getComputedStyle(element).direction === "rtl"`, applied to the *floating* element and consumed by
the alignment-axis sign and by `offset`/`shift`/`arrow`. Threading `useLocale()` in from
`@hope-ui/i18n` would create a second, divergent source of truth — an app that sets `dir="ltr"` on a
subtree inside an Arabic-locale document would get positioned by the locale and painted by the
`dir`.

That leaves two obligations on the consumer, both easy to miss:

1. **`I18nProvider` renders no DOM.** The app must set `dir` on `<html>` itself, from
   `useLocale().direction`. Without it floating-ui sees `ltr` no matter what the locale says.
2. **The portal gotcha.** A positioner portaled to `document.body` inherits `direction` from
   `<html>`, *not* from the anchor's subtree — so an app that sets `dir="rtl"` on an inner container
   only will get an LTR-positioned popover.

The **alignment** axis is logical for free (`align: "start"` follows the reading direction), because
floating-ui's `isRTL` already handles it. The **side** is not: floating-ui has no logical
placements, so `side: "inline-start"` is deliberately not offered. The one case it matters for — an
RTL submenu opening left — is a one-liner with the getter idiom:

```ts
const { direction } = useLocale();

createFloating({
  active: state.open,
  anchor,
  floating,
  get side() {
    return direction() === "rtl" ? "left" : "right";
  },
});
```

## Virtual elements

`anchor` accepts a `VirtualElement` — anything with a `getBoundingClientRect()` — which is what
anchors a ContextMenu to a pointer position rather than to an element.

```ts
const coords = { x: 0, y: 0 };
// Stable identity, mutable coordinates.
const pointerAnchor: VirtualElement = {
  getBoundingClientRect: () => new DOMRect(coords.x, coords.y, 0, 0),
};

function onContextMenu(event: MouseEvent) {
  coords.x = event.clientX;
  coords.y = event.clientY;
  floating.update();
}
```

Two caveats:

1. **Keep the object stable.** A fresh `{ getBoundingClientRect }` per pointer event changes
   `anchor()`'s identity, which tears down and re-creates `autoUpdate` on every mouse move. Close
   over mutable coords instead, and call `update()` — no observer can see a rect function's return
   value change.
2. **`autoUpdate` needs a real element for `elementResize`/`layoutShift`.** floating-ui observes
   `reference.contextElement` when present and silently skips those two mechanisms otherwise. Set
   `contextElement` when there is a sensible one; otherwise `update()` is the whole story.

## Extending the stack

`middleware` is appended **after** the built-in stack, and `middlewareData()` returns the raw output
— together they cover anything this binding doesn't surface. floating-ui's `hide()` is the worked
example: it detects that the *anchor* has been clipped out of view (scrolled out of an
`overflow: auto` container) so a consumer can hide a layer whose trigger is no longer visible. It
needs no kernel change at all, because it writes straight to `middlewareData`:

```ts
import { hide } from "@floating-ui/dom";

const floating = createFloating({ /* … */, middleware: [hide()] });
// floating.middlewareData().hide?.referenceHidden
```

Because appended middleware runs last, anything that must run *early* — `inline()`, for instance —
requires `flip: false, shift: false` and supplying the whole stack yourself.

## Implementation notes

- **Two effects, and their creation order is API.** Effect (1) attaches `autoUpdate`, keyed on the
  elements (tracked in `compute` — the conditionally-rendered-ref hazard) plus
  `autoUpdate`/`trackAnchorMotion`; `autoUpdate`'s own setup calls `update()`, so this is also the
  first measurement. Effect (2) re-measures on a config change and resets `isPositioned` on close,
  and skips its initial run with a `firstConfigRun` latch — correct *only* because effect (1) was
  created first and Solid 2.0 runs sibling effects in creation order (pinned in
  `solid-contract.test.ts`). Swapping them silently duplicates `computePosition` on every mount.
- **`active` lives in effect (2), not (1).** A closing overlay stays anchored while its exit
  transition plays, so element identity must not depend on `active`. But a fast close→open through
  `createPresence` changes no element, so effect (1) never re-runs — effect (2) is the only thing
  that can flip `isPositioned` back to true.
- **Stale-async guard.** `computePosition` returns a Promise, so a resolution can land after the
  attachment was torn down or the owner disposed. A `generation` counter is bumped by every teardown
  *before* detaching (a detach cannot recall a Promise already in flight), and the `.then` drops any
  result whose token no longer matches. There is deliberately no `.catch()`, matching the Vue and
  React ports.
- **No `ownedWrite: true`,** and it must not be added prophylactically. Unlike
  [`createVirtualCollection`](create-virtual-collection.md) — whose `onChange` fires re-entrantly
  from inside a call its effect makes synchronously — every write here happens in a microtask
  (`computePosition().then`) or an observer/rAF callback, with an empty stack and the owner already
  restored. The browser test disposes every mount, which is what makes that a tested claim rather
  than an argued one.
- **`update()` reads everything under `untrack`.** It is called from `autoUpdate`'s
  scroll/resize/rAF callbacks, and a tracked read from one of those emits `[STRICT_READ_UNTRACKED]`.
  The two effects own the reactivity instead.
- **Middleware order is `offset → flip → shift → arrow → size → …consumer`,** floating-ui's own
  guidance: `offset` shifts the starting point, `flip` picks the side from the offset geometry,
  `shift` slides within the side `flip` chose, and `arrow` measures against the final coordinates.
  Radix deliberately runs `shift` *before* `flip`, preferring to slide rather than jump sides — so a
  future `collisionPreference` option is an addition here, not a rewrite.
- **`size`'s `apply` writes into a per-call sink object,** never a shared `let`: two measurement
  chains can interleave at microtask granularity, and the loser would otherwise overwrite the
  winner's numbers.

## SSR & hydration

The pre-positioned style is a constant with no client-only input:

```ts
{ position: strategy, left: "0", top: "0", visibility: "hidden" }
```

On the server `floating()` is `undefined` (no ref effect runs); on the client's first render
`isPositioned()` is still `false`. Same branch, same bytes. `computePosition`/`autoUpdate` are
reached from effect bodies alone, and effects never run under `renderToStringAsync`, so there is no
`isServer` import — the same convention as `createDismissable`. `side()`/`align()` seed from the
config rather than from hard-coded defaults, so `data-side` is correct on the very first paint and
identical on both sides of the round-trip.

`visibility: hidden` and not `display: none` — an element with no box can never be measured, so
`display: none` would deadlock. And not `opacity: 0`, which stays hit-testable.

Four consumer anti-patterns, each of which looks reasonable:

1. **`<Show when={isPositioned()}>` around the floating element is a deadlock,** not merely a
   hydration bug: no element → no `floating()` → no `computePosition` → `isPositioned()` never
   becomes true. Gate visibility with CSS; `floatingStyles()` already does.
2. **Never branch the tree on `side()`/`align()`/`placement()`.** The server renders the *requested*
   side and the client may render a *flipped* one, and `_hk` keys are a path through the component
   tree. Emit `data-side` and branch in CSS.
3. **Keep `floatingStyles()` an object** Solid can diff — never concatenate it into a style string.
4. **The positioner's recipe must not set `position`/`left`/`top`/`transform`,** or it will fight
   the kernel's styles and win.
