# `createDialogClose`

The close part of the [dialog hook family](../root/dialog-root.md). A button that closes the dialog.

```ts
function createDialogClose(
  state: CreateDialogReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): { props: JSX.ButtonHTMLAttributes<HTMLButtonElement> };
```

Returns merged button `props`: `type` defaults to `"button"`, and an `onClick` that closes the
dialog, composed **behind** the consumer's own `onClick` (via `composeEventHandlers`) so
`event.preventDefault()` cancels the close — the mirror of `createDialogTrigger`.
