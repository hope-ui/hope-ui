# `createDialogTitle`

The title part of the [dialog hook family](dialog-root.md). Labels the dialog.

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

## Rejected alternatives

### Returning the raw `props`, with the `id` resolved as `props.id ?? generatedId` on the side
**Why not:** `withDefaults` copies nothing — it exposes the default as a getter over a *new* object —
so `props.id` still reads `undefined` for a consumer who set none. Returning `props` type-checks, and
passes a test that pins its own id, while shipping a heading with no `id` at all and a popup whose
`aria-labelledby` names nothing: for a `role="dialog"` surface that is an axe `aria-dialog-name`
violation, not a nicety. The merged object is the one that ships.
