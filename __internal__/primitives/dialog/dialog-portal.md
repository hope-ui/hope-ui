# `createDialogPortal`

The portal part of the [dialog hook family](../root/dialog-root.md). Owns the pointer-blocking modal
backdrop's registration.

```ts
function createDialogPortal(state: CreateDialogReturn): {
  showModalBackdrop: Accessor<boolean>;              // open() && modal()
  setModalBackdropRef: (element: HTMLDivElement) => void;
};
```

Registers the modal backdrop element in `state.sparedElements` (via `createRegisteredElement`) so
the popup's `createHideOutside` spares it — an `inert` backdrop is transparent to hit testing and
would stop blocking the pointer, its one job. `showModalBackdrop` gates the backdrop's render on
`open() && modal()`. This hook returns no element props: the consumer renders the portal container
and the `ModalBackdrop` element themselves (and, in the component, guards the portal against SSR),
wiring `setModalBackdropRef` as the backdrop's `ref`. A modal popup must be positioned or it paints
beneath the backdrop — see [`modal-backdrop.md`](../../modal-backdrop/modal-backdrop.md).
