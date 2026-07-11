# `createDialogBackdrop`

The optional visible-backdrop part of the [dialog hook family](../root/dialog-root.md).

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
