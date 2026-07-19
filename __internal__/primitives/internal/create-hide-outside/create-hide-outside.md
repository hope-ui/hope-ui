# `createHideOutside`

Makes everything outside a target inert to all three input channels, and restores the previous
state on deactivation. Each element outside gets **both**:

- `aria-hidden="true"` — removes it from the accessibility tree.
- `inert` — removes it from the focus order, and from hit testing.

Behavior adapted from React Aria's `ariaHideOutside` (Adobe, Apache-2.0) — its TreeWalker
accept/skip/reject strategy, its per-element ref count, and its `MutationObserver`. The
`inert` half follows floating-ui's `markOthers`, which exposes it as a flag layered on
`aria-hidden`. The code is written fresh for Solid.

## API

```ts
function createHideOutside(options: {
  active: Accessor<boolean>;
  target: Accessor<Element | null | undefined>;
  spare?: Accessor<ReadonlyArray<Element | null | undefined>>;
}): void;
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
| Pointer, unconditionally | [`ModalBackdrop`](../../modal-backdrop/modal-backdrop.md) |

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

## Late-arriving content

A `MutationObserver` on `document.body` hides elements added while the layer is active — a
second portal, a toast, a lazily rendered route, or the `ModalBackdrop` a modal layer renders,
which is inserted after the effect runs.

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
