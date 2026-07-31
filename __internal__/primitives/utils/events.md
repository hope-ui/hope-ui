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

## Rejected alternatives

### React Aria's `chain`, unmodified
**Why not:** `chain` always calls every handler, which leaves a part's own behavior unconditional.
That was the shape Dialog shipped before this helper existed — `Dialog.Trigger` invoked the
consumer's `onClick` and then `setOpen(true)` regardless — so a consumer with unsaved changes had
no way to stop the dialog opening short of not using the part. The `preventDefault()` cancel
channel is the one deliberate divergence from `chain`; see *Behavior: `preventDefault()` cancels
the rest* above.

### Base UI's `event.preventBaseUIHandler()`
**Why not:** it reaches the same outcome by hanging a bespoke method off every event the library
hands out (`BaseUIEvent<T>`), so the cancel channel exists only on wrapped event types.
`defaultPrevented` is already on the platform event, so there is no new API to learn and a handler
written against the DOM works unchanged.

### `@solid-primitives/props`' `combineHandlers`
**Why not:** it buys a runtime dependency for a ~5-line helper, which the adoption record scores as
net-negative — and every adopted dep then owes the full DoD including the hydration round-trip.
Recorded as *kept, not adopted* in `__internal__/solid-primitives-eval.md` § Tier A.
**Revisit if:** `renderElement`'s prop merge adopts the sibling `combineProps`, already logged there
as a candidate — the dependency would be paid for by then and the handler merge could ride along.
