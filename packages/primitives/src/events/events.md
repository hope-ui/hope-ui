# `composeEventHandlers`

Chains event handlers into one. Modeled on React Aria's `chain`, with one addition: a
handler that calls `event.preventDefault()` stops the rest.

## API

```ts
function composeEventHandlers<T, E extends Event>(
  ...handlers: Array<JSX.EventHandlerUnion<T, E> | undefined>
): JSX.EventHandler<T, E>;
```

- Handlers run in the order given.
- An `undefined` entry is skipped, so a consumer prop that isn't set needs no guard.
- Both of Solid's handler forms are supported: a plain function, and the bound tuple
  (`onClick={[handler, data]}`).

## Behavior: `preventDefault()` cancels the rest

Components pass the **consumer's** handler first and their **own** behavior last. That
makes `event.preventDefault()` a cancel channel:

```tsx
<Dialog.Trigger
  onClick={(event) => {
    if (hasUnsavedChanges) event.preventDefault(); // dialog does not open
  }}
>
  Open
</Dialog.Trigger>
```

Every part that composes handlers this way renders a `<button type="button">`, where
`preventDefault()` has no other effect (no form submit, no navigation) — so the channel is
unambiguous. If the event arrives already default-prevented, no handler runs.

This is the one deliberate divergence from React Aria's `chain`, which always calls every
handler. Base UI reaches the same outcome through a bespoke `event.preventBaseUIHandler()`;
`defaultPrevented` is the same idea without a custom event property.

## Call it inside a getter, not in the component body

```tsx
const elementProps = merge(rest, {
  get onClick() {
    return composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, () =>
      context.setOpen(true),
    );
  },
});
```

Reading `props.onClick` eagerly in the component body is an untracked prop read (Solid's
dev build warns with `[STRICT_READ_UNTRACKED]`), and it freezes the consumer's handler at
render time. Inside a getter, the read lands in `spread`'s own effect instead — so a
reactive `onClick` re-binds, and nothing is read before it needs to be.

## SSR

Pure function, no DOM access. Safe to call anywhere.
