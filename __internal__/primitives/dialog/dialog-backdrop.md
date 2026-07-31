# `createDialogBackdrop`

The optional visible-backdrop part of the [dialog hook family](dialog-root.md).

```ts
function createDialogBackdrop(
  state: CreateDialogReturn,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): {
  props: JSX.HTMLAttributes<HTMLDivElement> & { "data-presence": string };
  mounted: Accessor<boolean>;
  setRef: (element: HTMLDivElement) => void;
};
```

Owns its own `createPresence` (drives `mounted()` + `data-presence`) and registers its element in
`state.sparedElements` via `createRegisteredElement`, sparing it from the popup's `createHideOutside`
— an `inert` element is transparent to hit testing, so a backdrop that hid itself would silently
stop blocking the pointer and lose its hover/transition/pointer handlers. Returned `props`: `role`
falls back to `"presentation"` (consumer wins); `data-presence` is owned here. This is *not* what
makes a modal dialog inert — that is the pointer-blocking modal backdrop (`createDialogPortal` +
`ModalBackdrop`).

## Rejected alternatives

### Leaving the backdrop within `createHideOutside`'s reach
**Why not:** an `inert` element is transparent to hit testing, so a backdrop that let itself be hidden
would silently stop blocking the pointer and lose its hover styles, transitions and pointer handlers —
still painted, still styled, and unreachable by the mouse, with the layer reporting itself modal the
whole time. Registering the element in `state.sparedElements` is the whole reason this part touches
`createRegisteredElement`.

### This part as the modal pointer blocker
**Why not:** it is optional and purely decorative, so a modal dialog whose consumer renders no
`Backdrop` would leave the page behind clickable. Pointer blocking belongs to `ModalBackdrop`, which
`createDialogPortal` gates on `open() && modal()` and renders whether or not a visible backdrop
exists — modality must not depend on a styling choice. Both are spared from `inert`, and rendering
both is normal; see [`modal-backdrop.md`](../modal-backdrop/modal-backdrop.md).
