# `createDialogDescription`

The description part of the [dialog hook family](dialog-root.md). Describes the dialog.

```ts
function createDialogDescription(
  state: CreateDialogReturn,
  props: JSX.HTMLAttributes<HTMLParagraphElement>,
): { props: JSX.HTMLAttributes<HTMLParagraphElement> };
```

Mirrors [`createDialogTitle`](dialog-title.md): resolves `props.id` to a generated
`createUniqueId` when unset and registers it on the popup's `aria-describedby` via
`createRegisteredId`. **Call from the description's own owner scope.** Returns the element `props`
(carrying the resolved `id`).

<!-- no-rejected-alternatives: mirrors createDialogTitle exactly; dialog-title.md owns the contested
id-resolution decision, and create-registered-id.md the deferred ancestor-signal write -->

