# `createDialogPortal`

The portal part of the [dialog hook family](dialog-root.md). Owns the pointer-blocking modal
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
beneath the backdrop — see [`modal-backdrop.md`](../modal-backdrop/modal-backdrop.md).

## Rejected alternatives

### Letting `createHideOutside` mark the modal backdrop `inert` along with the rest of the page
**Why not:** `inert` makes an element transparent to hit testing, so the one element whose entire job
is blocking the pointer would stop blocking it while the layer still reported itself modal. The
registration this hook performs — and nothing else it does — is what prevents that.

### A reactive `<Show when={!isServer}>` around the portal
**Why not:** `@solidjs/web`'s server build implements `Portal` as a `throw`, so the guard has to exist
at all; but `isServer` is a fixed per-environment constant, and a `<Show>` makes the portal subtree
depend on `Show`'s hydration-key bookkeeping for something that cannot change within a build. A plain
`if (isServer) return null;` at the top of a small wrapper component is the shape — see `plan.md`
§ SSR & hydration requirements.
