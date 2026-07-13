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

## Accessible name

`aria-label` defaults to the localized `dialog.close` message ("Close" / "Fermer", via
`@hope-ui/primitives/i18n`), so an **icon-only** close button is labelled with no extra work. A
consumer `aria-label` wins. If the button carries its own visible text, pass a matching `aria-label`
(or accept that the localized default becomes the accessible name) to avoid a label-in-name mismatch.

