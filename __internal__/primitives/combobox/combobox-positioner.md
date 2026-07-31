# `createComboboxPositioner`

The positioner part of the [combobox hook family](combobox-root.md): the kernel-styled wrapper the
popup is measured and moved as.

```ts
function createComboboxPositioner<V, M extends SelectionMode>(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): {
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    "data-side": Side;
    "data-align": FloatingAlign;
    "data-presence": PresenceStatus;
  };
  mounted: Accessor<boolean>;
  setRef: (element: HTMLDivElement) => void;
};
```

[`Content`](combobox-content.md) — the card with the chrome and the enter/exit transition — is its
child, so the transition's `translate`/`scale` never fight the `translate()` this element carries.

Gate the render on `mounted()`: it is the **shared** presence `createCombobox` owns, the same one the
Content reflects, so the positioner cannot unmount out from under the card it wraps.

## The four measured custom properties

After the first measurement, `style` carries — unprefixed:

| Property | What it is for |
| --- | --- |
| `--anchor-width` | the popup matching the trigger's width, which is what every Select design does |
| `--anchor-height` | rarely spent, published for symmetry |
| `--available-width` | a popup that must not exceed its collision box |
| `--available-height` | capping the list so it **scrolls** instead of running off the viewport |

For a combobox the first and last are not niceties — they are how the popup relates to its trigger and
to the viewport at all.

**Unprefixed on purpose.** These name the *anchor*, not the component:
[`popover-positioner.md`](../popover/popover-positioner.md) already called them "kernel vocabulary a
future Select or Menu positioner publishes identically", and this is that positioner. `--hope-*` is
the theming package's semantic-token namespace and is not what this is.

**Nothing is emitted before the first measurement**, rather than a `0px` placeholder. A real `0px`
would collapse whatever reads it; an absent property leaves `width: var(--anchor-width)` invalid, so
the browser drops that one declaration and the element keeps its natural size. It also keeps the
server render and the first client render identical, which is what hydration needs — `size()` is
`undefined` in both.

The four lines are **copied** from `popover-positioner.ts`, not imported: two top-level primitive
folders do not reach into each other, and the four *names* are the contract, not the four lines.

## `style` precedence, and the string-`style` trap

The kernel's positioning is written **first** and the consumer's object `style` is spread **over** it.
That is deliberate: a consumer who needs different pre-positioned behavior (their own `visibility`, a
`z-index`, `pointer-events`) wins, without the positioner slot growing a `position`/`left`/`top` of its
own.

A **string** `style` has no merge seam — it cannot be spread into the kernel's object — and the
kernel's positioning has to win, or the popup paints at 0,0. So the consumer's is dropped, and dropping
it silently is how a consumer spends an afternoon on a style that never applied. A dev-only,
effect-gated `console.warn` names the file and shows the object form.

## `createKeepVisible`

A Select opened inside a modal Dialog is a layer that appears *after* the modal, so the modal's
`MutationObserver` would hide it — leaving a popup that paints on top, undimmed and legible, yet
`inert`: out of the accessibility tree and transparent to hit testing. `createKeepVisible` registers
the positioner into the enclosing layer's spared set, and sparing the positioner spares its whole
subtree.

Keyed on `contentPresence.mounted()`, not on `open()`, so the layer stays spared through its exit
transition.

## SSR

Attribute computation only. `floatingStyles()` renders its pre-positioned branch (a constant with no
client-only input), the four custom properties are absent on both sides, and `side()`/`align()` seed
from the config — so `data-side` is identical across the round-trip. `createKeepVisible` and the
string-`style` warning are both `createEffect`s and never run server-side.

## Rejected alternatives

### Importing `anchorSizeProperties` from `popover/`
**Why not:** it would make two top-level primitive folders — two independently published subpaths —
depend on each other's internals for four lines, so `@hope-ui/primitives/combobox` would pull Popover's
module graph in. What actually has to stay in sync is the four *names*, which are stated as a contract
in both docs.

### Prefixing the properties (`--hope-anchor-width`, `--combobox-anchor-width`)
**Why not:** `--hope-*` is the theming package's semantic-token namespace and these are measurements,
not tokens; and a component prefix would mean a consumer's `w-(--anchor-width)` breaks the moment they
swap Popover for Select. They name the anchor, which is the same thing in both.

### Emitting `0px` before the first measurement instead of nothing
**Why not:** `width: 0px` collapses the popup, where an *invalid* `var(--anchor-width)` makes the
browser drop that one declaration and keep the element's natural size. It would also make the server
render and the first client render disagree, which is what hydration cannot tolerate.

### Honoring a string `style` by parsing and merging it
**Why not:** a hand-rolled CSS-text parser in a positioner, to support a form nobody needs on an
element whose position the kernel owns. The dev warning costs 15 lines and points at the fix.

### Consumer `style` first, kernel last (so the kernel always wins)
**Why not:** it removes the only escape hatch for pre-positioned behavior — `z-index`, a custom
`visibility`, `pointer-events` — and would force the positioner slot to grow options for each. The
positioning keys the kernel must own (`position`/`left`/`top`/`transform`) are ones a consumer has no
reason to set, and `create-floating.md` records overriding them as an anti-pattern.

### Putting `data-side`/`data-align` on the Content instead
**Why not:** the positioner is the element being measured and moved, so that is where the resolved
placement is a fact rather than a copy. A card that needs the direction for its transform origin reads
it from its parent, which is one `group-data-[side=…]:` away.
