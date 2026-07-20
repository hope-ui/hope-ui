# `createDialogTitle`

The title part of the [dialog hook family](../root/dialog-root.md). Labels the dialog.

```ts
function createDialogTitle(
  state: CreateDialogReturn,
  props: JSX.HTMLAttributes<HTMLHeadingElement>,
): { props: JSX.HTMLAttributes<HTMLHeadingElement> };
```

Resolves `props.id` to a generated `createUniqueId` when unset (an unset id would leave the dialog
with no `aria-labelledby` and no accessible name), and registers that id on the popup's
`aria-labelledby` via `createRegisteredId` — which defers the ancestor-signal write past Solid 2.0's
`[REACTIVE_WRITE_IN_OWNED_SCOPE]` ban. **Call from the title's own owner scope**, so the
registration's cleanup is scoped to the title's unmount. Returns the element `props` (carrying the
resolved `id`).
