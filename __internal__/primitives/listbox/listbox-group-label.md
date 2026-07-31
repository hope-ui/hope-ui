# `createListboxGroupLabel`

The group-label part of the [listbox family](./listbox-root.md): names its
[`Group`](./listbox-group.md). It registers its `id` on the group's `aria-labelledby` via
`createRegisteredId` (which defers the ancestor-signal write past Solid 2.0's ban on writing an
ancestor-owned signal from a descendant's render body), exactly like `createDialogTitle` registers on
the dialog's `aria-labelledby`.

Call it from the label's **own** owner scope, so the registration's cleanup is scoped to the label's
unmount.

## API

```ts
function createListboxGroupLabel(
  group: CreateListboxGroupReturn,           // the group whose aria-labelledby to register on
  props?: JSX.HTMLAttributes<HTMLElement>,
): {
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref">; // carries the resolved id
};
```

The `id` resolves via `withDefaults(props, { id: generatedId })` — a consumer id wins, otherwise a
generated (SSR-stable) `createUniqueId`. `withDefaults`, not `props.id ?? id`, because an unset `id`
must resolve to the generated one or the group ends up with no accessible name.

## ARIA

The label is not itself an option — it is a plain element whose `id` the group's `aria-labelledby`
points at. It carries no `role="option"` and is not part of the arrow-navigation order.

## SSR

`createRegisteredId` writes on `onSettled`, which never runs server-side, so the group's
`aria-labelledby` linkage lands on the client after mount (the label's own `id` attribute is present
in the server markup, since it is a plain render-time value).

## Rejected alternatives

### A direct `group.setLabelId(id)` in the label's render body

**Why not:** the group's signal is owned by an ancestor, and Solid 2.0 throws
`[REACTIVE_WRITE_IN_OWNED_SCOPE]` when a descendant writes one from its synchronous render body.
`createRegisteredId` defers the write to `onSettled` and scopes its cleanup to the label's own
unmount — the same split `createDialogTitle` uses for the dialog's `aria-labelledby`.
