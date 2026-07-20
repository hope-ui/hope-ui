# `createDialogTrigger`

The trigger part of the [dialog hook family](../root/dialog-root.md). Opens the dialog and
advertises it to assistive technology.

```ts
function createDialogTrigger(
  state: CreateDialogReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): { props: JSX.ButtonHTMLAttributes<HTMLButtonElement> };
```

Returns fully-merged button `props`: `type` defaults to `"button"`, `aria-haspopup="dialog"`,
`aria-expanded` reflecting `state.open()`, and `aria-controls` naming `state.popupId()` **only while
open** (a dangling IDREF while closed is an invalid attribute value — axe `aria-valid-attr-value`).
The returned `onClick` opens the dialog, composed **behind** the consumer's own `onClick` (via
`composeEventHandlers`), so `event.preventDefault()` cancels the open. The trigger only ever opens —
never toggles (matching Base UI); close via `createDialogCloseTrigger` or controlled `open`.
