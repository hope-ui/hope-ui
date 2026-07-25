# `createDismissable`

Calls an `onDismiss` callback on Escape keydown, outside pointerdown and/or outside focus
while active. Built fresh for hope-ui, modeled on Base UI's/React Aria's dismiss-layer
behavior.

## API

```ts
function createDismissable(options: {
  active: Accessor<boolean>;
  ref: Accessor<HTMLElement | null | undefined>;
  onDismiss: () => void;
  dismissOnEscape?: boolean; // default true
  dismissOnOutsidePointerDown?: boolean; // default true
  exclude?: Accessor<Element[]>;
  dismissOnFocusOutside?: boolean; // default false
}): void;
```

- `active` — whether the dismissable layer is currently listening.
- `ref` — the container element; a `pointerdown` whose target is outside this element
  triggers `onDismiss`. Must be a real signal accessor — see below.
- `onDismiss` — called once per qualifying Escape keydown, outside pointerdown or outside focus.
- `dismissOnEscape` / `dismissOnOutsidePointerDown` — toggle each trigger independently.
- `exclude` — elements that don't count as "outside", subtrees included. See below.
- `dismissOnFocusOutside` — dismiss when focus lands outside the container. **Default `false`**;
  a modal layer traps focus, so the listener would be dead weight there.

## `exclude` — the trigger is not "outside"

Without it, a layer that opens from a toggle button **can never be closed by clicking that
button**: the pointerdown dismisses in the capture phase, then the trigger's own `click`
reopens. Dialog never hit this because it is modal by default and its trigger sits behind
`inert`; a non-modal Popover hits it on the first click.

So the layer's own trigger is what `exclude` is for, above all. Radix, floating-ui and React
Aria all carry the same escape hatch; the name is Zag's — `spare` is `createHideOutside`'s word
and means something else ("exempt from `inert`").

Exclusion covers a listed element **and its subtree** (`element.contains(target)`, not `===`),
so a trigger with an icon or label element inside it works without listing each child.

`exclude` is read **live, inside the handlers** — never tracked in the effect's compute. The
elements it names register from their own effects, so tracking it would tear down and reattach
the document listeners on every ref change. It applies to pointerdown *and* focus-out, and
**not** to Escape: Escape is keyboard-global, and there is no "outside" for it to exempt.

## `dismissOnFocusOutside` listens on `focusin`, not `focusout`

Both handlers ask **one** `isOutside(target)` helper, so the two definitions of outside cannot
drift. That is only possible with `focusin`, which fires on the element focus *arrived* at.

`focusout` reports where focus *left*, whose target is by definition still inside the container —
so it would have to read `event.relatedTarget` instead, and the two handlers would no longer
share a question. Measured against this repo's Chromium:

| Path | `focusout` | `focusin` |
| --- | --- | --- |
| A genuine move from inside to outside | `target` = the inside element, `relatedTarget` = the outside one | `target` = the outside element |
| The focused element is removed, or disabled, while focused | `target` = that element (fired **synchronously, before detachment**), `relatedTarget` = **`null`** | **never fires** |
| `document.body.focus()` on a body with no `tabindex` | — | never fires (no-op) |

The second row is the one that decides it. Focus falls to `<body>`, which *is* outside the
container, and a `focusout` implementation reading a `null` `relatedTarget` as "focus went
outside" dismisses a layer nobody left. With `focusin` the event simply never arrives — the
path is excluded by the mechanism rather than by a special case. Pinned by *"does not call
onDismiss when focus falls to `<body>`"*.

A layer that autofocuses itself on open must create `createAutoFocus` **before**
`createDismissable`, so the synchronous `focusin` from its `.focus()` lands before this
primitive's listener is attached and the layer can't dismiss itself on the way in.

## The `ref` must be a signal

If the container element is created as a reactive consequence of the same signal `active`
derives from (e.g. it lives behind a `<Show>` gated on `open`), a plain closure over a `let`
will be read as `undefined` on the activating edge and never re-read — `active`, the only
other dependency, won't change again. The symptom is that Escape and outside-click silently
do nothing, forever, and only for components whose container is conditionally rendered; this
primitive's own isolated tests, which render the container unconditionally, never catch it.

This primitive tracks `ref()` in its `compute` function for exactly that reason, which only
works if `ref` is a real `createSignal` accessor. Same rule as `createFocusTrap` — see
`create-focus-trap.md`.

## Scope

This is intentionally a single-layer primitive — it does not manage a stacked dismiss-order
across multiple simultaneously open overlays. `exclude` does not change that: it settles **what
counts as outside for one layer**, not **which of several open layers wins**.

The symptom, once a Popover opens from inside a Dialog: the listeners are attached to `document`
per instance with no ordering guard, so an Escape or an outside pointerdown reaches *every* open
layer and dismisses both. The port that fixes it is recorded — react-aria `useOverlay`'s
`visibleOverlays` flat mount-order stack plus its two-phase pointer guard (capture the topmost at
pointerdown *start*, dismiss only if the same layer is still topmost when the interaction
completes), with Base UI `useDismiss`'s `bubbles` for the API vocabulary. See
`__internal__/reference-implementations.md:306` and its § *Nested overlay ordering*, which also
records why Astryx, Angular Aria and `@floating-ui/vue` are not candidates: none implements layer
coordination at all.

Its sibling half lives in [`createHideOutside`](./create-hide-outside.md) § *Nesting*, and the two
registries stay **separate** — a Dialog with `dismissOnEscape: false` still participates in
hide-outside ordering but must never win Escape.

## SSR

All `document` access happens inside `createEffect`, gated on `active() && ref()`. Never
runs during SSR, no manual `isServer` guard needed.

## Example

```tsx
function Dialog(props: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [popupRef, setPopupRef] = createSignal<HTMLDivElement>();

  createDismissable({
    active: () => props.open,
    ref: popupRef,
    onDismiss: () => props.onOpenChange(false),
  });

  return <div ref={setPopupRef}>...</div>;
}
```

A non-modal layer, where both new options earn their keep:

```tsx
function Popover(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnFocusOutside: boolean;
}) {
  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement>();
  const [popupRef, setPopupRef] = createSignal<HTMLDivElement>();

  createDismissable({
    active: () => props.open,
    ref: popupRef,
    onDismiss: () => props.onOpenChange(false),
    // Without this the trigger below can open the layer but never close it.
    exclude: () => {
      const trigger = triggerRef();
      return trigger ? [trigger] : [];
    },
    // A getter, not a one-time read — this is consulted live inside the handler.
    get dismissOnFocusOutside() {
      return props.closeOnFocusOutside;
    },
  });

  return (
    <>
      <button ref={setTriggerRef} onClick={() => props.onOpenChange(!props.open)} />
      <div ref={setPopupRef}>...</div>
    </>
  );
}
```
