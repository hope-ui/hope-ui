# `createDialogClose`

The close part of the [dialog hook family](../root/dialog-root.md). Injects the dialog's
close-on-click behavior onto a button — and nothing else.

```ts
function createDialogClose(
  state: CreateDialogReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): { props: JSX.ButtonHTMLAttributes<HTMLButtonElement> };
```

Returns merged button `props`: an `onClick` that closes the dialog, composed **in front of** the
consumer's own `onClick` (via `composeEventHandlers`) so `event.preventDefault()` cancels the close —
the mirror of `createDialogTrigger`. Every other prop passes through unchanged.

## Minimal by design — no label, no `type` default

This hook is deliberately **minimal**: it owns only the close `onClick`. It sets **no**
`aria-label` and **no** `type="button"` of its own. Those defaults live one layer up, in the
[`CloseButton`](../../../components/close-button/close-button.md) component (over the
[`createButton`](../../internal/create-button/create-button.md) primitive) that
`@hope-ui/components`' `Dialog.Close` renders — so each default has a single owner and there is no
double-ownership between the hook and the component.

The accessible name is therefore still the localized `common.close` message ("Close" / "Fermer"), but
it is `CloseButton` that provides it, not this hook. A **headless** consumer wiring `createDialogClose`
directly onto a bare `<button>` (rather than through `CloseButton`) supplies its own `aria-label` and
`type="button"`.
