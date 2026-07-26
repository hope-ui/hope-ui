# `createHideOutside`

Makes everything outside a target inert to all three input channels, and restores the previous
state on deactivation. Each element outside gets **both**:

- `aria-hidden="true"` — removes it from the accessibility tree.
- `inert` — removes it from the focus order, and from hit testing.

Behavior adapted from React Aria's `ariaHideOutside` (Adobe, Apache-2.0) — its TreeWalker
accept/skip/reject strategy, its per-element ref count, its `MutationObserver`, its layer stack,
`keepVisible` and the always-visible marker. The stack's disconnect/restart sequence (including the
out-of-order splice branch), `keepVisible` and `isAlwaysVisibleNode` are ported function-for-
function, so this file is an **attributed derivative**: it carries an `@license` header and a row in
both `NOTICE.md` tables. The `inert` half follows floating-ui's `markOthers`, which exposes it as a
flag layered on `aria-hidden`.

## API

```ts
function createHideOutside(options: {
  active: Accessor<boolean>;
  target: Accessor<Element | null | undefined>;
  spare?: Accessor<ReadonlyArray<Element | null | undefined>>;
}): void;

/** Spare an element from the innermost open layer, for as long as `active`. */
function createKeepVisible(options: {
  active: Accessor<boolean>;
  ref: Accessor<Element | null | undefined>;
}): void;

/** The imperative form: spares `element`, returns the undo — or `undefined` if there is no open
 *  layer, or it already spares it. */
function keepVisible(element: Element): (() => void) | undefined;

/** `"data-hope-ui-top-layer"` — an element carrying it is spared by every layer. */
const TOP_LAYER_ATTRIBUTE: string;
```

- `active` — whether outside content should currently be hidden.
- `target` — the element everything else is hidden *from*. Its subtree and its ancestors are
  spared. **Must be a real signal accessor**, not a closure over a plain `let` (see
  `create-focus-trap.md`).
- `spare` — additional elements to spare beside the target.

The subtree walked is always `document.body`.

## Why both attributes

`aria-modal="true"` on the popup is the spec-blessed way to tell assistive technology the rest
of the page is inert. In practice it has long-standing VoiceOver/Safari gaps, which is why
React Aria ships `ariaHideOutside` and Base UI ships floating-ui's `markOthers`.

But `aria-hidden` on its own leaves outside content **focusable and clickable**. And `inert`
on its own does **not** take content out of the accessibility tree as far as ARIA tooling is
concerned — measured against this repo's Chromium, a role-based query still finds an `inert`
button, while it does not find an `aria-hidden` one:

| | `aria-hidden` | `inert` | both |
| --- | --- | --- | --- |
| Out of the accessibility tree | yes | **no** | yes |
| Out of the focus order | no | yes | yes |
| Out of hit testing (pointer blocked) | no | yes | yes |
| axe `aria-hidden-focus` on a focusable background | `incomplete` | — | **clean** |

floating-ui reaches the same conclusion, exposing `inert` as a separate opt-in flag on top of
`aria-hidden` rather than as a replacement for it.

## `target` is gated on; `spare` is not

The asymmetry is deliberate, and it was a real bug before it was.

These elements register themselves from effects that fire on different flushes, so `spare` is
routinely incomplete on an early run. That's harmless: an element that hasn't registered yet is
merely hidden until the next run spares it.

The **target** cannot be treated that way. A run with the popup missing from the list hides the
popup itself; `inert` then blurs whatever `createFocusTrap` just focused inside it, and focus
lands on `<body>` for good — the trap has no reason to fire again. So: until `target` resolves
to a connected element, this primitive does nothing at all.

## Three concerns, three mechanisms

This primitive covers two of them. It does not block the pointer on elements it hasn't marked —
an element inserted into the page before the `MutationObserver` sees it is briefly clickable.

| Concern | Mechanism |
| ------- | --------- |
| Assistive technology | `createHideOutside` (`aria-hidden`) |
| Focus order | `createHideOutside` (`inert`) |
| Tab cycling within the popup | `createFocusTrap` |
| Pointer, unconditionally | [`ModalBackdrop`](../modal-backdrop/modal-backdrop.md) |

`Dialog` composes all four, and spares its `ModalBackdrop` — an `inert` backdrop is
transparent to hit testing and would silently stop doing its job.

## Interaction with `createFocusRestore`

`inert` blurs a focused element the moment one of its ancestors becomes inert. A
`createFocusRestore` composed alongside this must therefore be **created first**, so its
`document.activeElement` snapshot precedes the blur — and it must restore focus **after** this
primitive's cleanup has removed `inert`, or `.focus()` silently does nothing. Its microtask
deferral already guarantees the second half. See `create-focus-restore.md`.

## Nesting

Both attributes are ref-counted per element, so two stacked layers compose: the inner layer's
cleanup leaves them in place on elements the outer layer still needs hidden. Any pre-existing
`aria-hidden` or `inert` the consumer set themselves is snapshotted and restored.

The count lives on the element itself under `Symbol.for("hope-ui.hide-outside")`, not in a
module-scope `WeakMap`. `@hope-ui/primitives` is an internal/advanced package, still depended on as
a plain `dependencies` entry (and carried transitively by `@hope-ui/components`), which does not
force a single installed instance — two copies would keep
two independent counts and un-hide each other's elements. `Symbol.for` resolves through the
cross-realm global symbol registry, so every copy reads the same slot. `createScrollLock`
stores its lock state the same way, for the same reason.

### Only the innermost layer observes

Every activation also pushes onto a layer stack held on `document` under
`Symbol.for("hope-ui.hide-outside-stack")`, and disconnects the layer it covers — so exactly one
`MutationObserver` is live at a time. Cleanup un-hides this layer's own set, then either pops and
restarts the layer underneath (the normal, innermost-closes-first case) or splices itself out of
the middle without restarting anything, because whoever is on top never stopped observing. Two
overlays really can close in either order, so that second branch is not hypothetical.

**That is load-bearing, not an optimization.** `keepVisible` registers into the *topmost* layer
only, so a still-observing outer layer would hide the very element the inner one just agreed to
spare, and no registration could ever survive a nesting. (A Dialog inside a Dialog also stops
marking every newly added element twice.)

**Stack position is activation order, not mount order.** The push happens inside the effect body,
after the `active`/`target` guard, so a mounted-but-closed layer is simply absent and reopening it
puts it on top. The effect is keyed on `[active(), target(), spare()]`, so swapping the target
element *while active* re-runs it and moves that layer to the top.

Like the per-element count, the stack lives under a `Symbol.for(…)` key rather than at module
scope, and for the same reason. Pinned by the same `?instance=2` import.

### Sparing a layer that opens later: `keepVisible` and the top-layer marker

Ref-counting composes two layers that were both known when each ran. It does not cover a **new**
layer mounting into a page an existing one is already observing — a Popover opened inside a Dialog
portals onto `document.body` *after* the Dialog's `createHideOutside` started observing, and it
isn't in that layer's static `spare` array. Marked `aria-hidden` + `inert`, the popup is out of the
accessibility tree and transparent to hit testing while still painting perfectly, and every test
stays green.

`spare` cannot express the fix: it is static and per-layer, with no way to say "spare this in
whichever layer is currently on top". Two mechanisms do, and **they cover opposite orderings** —
which is why both exist:

| Ordering | Mechanism |
| --- | --- |
| A layer opens **after** the modal — Popover inside Dialog | `createKeepVisible` / `keepVisible` — the layer registers itself into whichever layer is topmost *now*, and unregisters on close |
| A modal opens **after** the element — a toast root, a live region, a third-party portal already in the page | `TOP_LAYER_ATTRIBUTE` (`data-hope-ui-top-layer`) — read on every walk and inside the observer, so no registration is needed at all |

No registration can reach the second row: a modal that opens later walks the page fresh and knows
nothing about a call that happened before it existed. And no attribute is a good fit for the first
row, because it is always on — `Popover.Positioner` wants sparing scoped to one layer and undone on
close, which is what `createKeepVisible` gives it. React Aria ships the same pair
(`data-react-aria-top-layer`, and no first-party overlay of theirs sets it either); hope-ui's marker
likewise ships **wired to nothing**, as the escape hatch for code that never sees this kernel.

`createKeepVisible` is the reactive form, shaped like `createRegisteredElement`: it registers from
an effect body (not a cleanup or a deferred callback, which would run after the observer had already
seen the element) and undoes on deactivation, on an element swap, or on disposal. Sparing an element
spares its **whole subtree**, since `isSpared` tests containment in both directions — so
`Popover.Positioner` registering covers the card and everything in it. Keyed on what keeps the layer
*mounted* rather than on `open`, because a layer animating out is still in the page and still must
not be `inert`. Registering into an empty stack is a no-op, so a popover with no modal above it pays
nothing.

### Three registries, not one

This stack answers "who observes, and who is spared".
[`createDismissable`](./create-dismissable.md)'s answers "who wins a dismissal";
[`createFocusScope`](./create-focus-scope.md)'s answers "did focus land in me or above me". They
stay **separate**: a Dialog with `dismissOnEscape: false` still participates in hide-outside and
focus-scope ordering but must never win Escape. React Aria keeps `observerStack`, `visibleOverlays`
and `focusScopeTree` apart for the same reason.

## Late-arriving content

A `MutationObserver` on `document.body` hides elements added while the layer is active — a
second portal, a toast, a lazily rendered route, or the `ModalBackdrop` a modal layer renders,
which is inserted after the effect runs.

Three things escape it: a node carrying `TOP_LAYER_ATTRIBUTE`, which is added to the layer's spared
set instead of hidden; a node already spared, or inside something spared (`keepVisible`'s
registrations included); and a node under an ancestor this layer already hid, since both attributes
inherit. Only the innermost layer's observer is live — see § *Nesting*.

## SSR

All DOM access happens inside `createEffect`, gated on `active() && target()`. Never runs
during SSR, no manual `isServer` guard needed.

## Example

```tsx
function Popup(props: { open: boolean; modal: boolean }) {
  const [ref, setRef] = createSignal<HTMLDivElement>();

  createFocusRestore({ active: () => props.open });
  createFocusTrap({ active: () => props.open && props.modal, ref });
  createHideOutside({
    active: () => props.open && props.modal,
    target: ref,
    spare: context.sparedElements,
  });

  return <div ref={setRef} role="dialog" aria-modal={props.modal ? "true" : undefined} />;
}
```

A non-modal layer that may open *inside* one — this is all `Popover.Positioner` does:

```tsx
function Positioner(props: { mounted: boolean }) {
  const [ref, setRef] = createSignal<HTMLDivElement>();

  // Keyed on `mounted`, not `open`: a layer animating out is still in the page, and an `inert`
  // element mid-exit stops responding to the pointer. A no-op when nothing modal is open.
  createKeepVisible({ active: () => props.mounted, ref });

  return <div ref={setRef}>...</div>;
}
```
