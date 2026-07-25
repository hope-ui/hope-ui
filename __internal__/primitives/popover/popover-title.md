# `createPopoverTitle`

The title part of the [popover hook family](popover-root.md). Labels the popup.

```ts
function createPopoverTitle(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLHeadingElement>,
): { props: JSX.HTMLAttributes<HTMLHeadingElement> };
```

Resolves `props.id` to a generated `createUniqueId` when unset and registers that id on the popup's
`aria-labelledby` via `createRegisteredId` — which defers the ancestor-signal write past Solid 2.0's
`[REACTIVE_WRITE_IN_OWNED_SCOPE]` ban. **Call from the title's own owner scope**, so the
registration's cleanup is scoped to the title's unmount. Returns the element `props` carrying the
resolved `id`. The [`createDialogTitle`](../dialog/dialog-title.md) shape, against `createPopover`'s
state.

## `withDefaults`, and the merged object is the one that ships

`withDefaults(props, { id: generatedId })`, not `props.id ?? generatedId` — and the **merged** object
is what comes back, never the raw `props`. `withDefaults` copies nothing; it exposes the default as a
getter over a *new* object, so `props.id` still reads `undefined` for a consumer who set none.
Returning `props` there type-checks, passes a test that pins its own id, and leaves the popup with no
`aria-labelledby` target — which for a `role="dialog"` surface is an axe `aria-dialog-name`
violation, not a nicety.

## It is a fallback, not an overwrite

`createPopoverContent` reads it as `props["aria-labelledby"] ?? state.titleId()`, so a consumer who
labels the content themselves keeps their value and the Title still registers. Pinned in
`popover-title.browser.test.tsx`.

## SSR

`onSettled` never runs on the server, so nothing registers there and the server's popup carries no
`aria-labelledby`. The `id` itself is `createUniqueId`, which is SSR-stable, so the title element's
own markup is identical on both sides of the round-trip.
