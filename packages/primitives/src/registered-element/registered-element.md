# `createRegisteredElement`

Publishes a descendant's DOM element into an ancestor's context, so the ancestor can act on an
element it doesn't own.

`Dialog` uses it to collect three elements — the popup, the consumer's optional
`Dialog.Backdrop`, and the `ModalBackdrop` — into the `targets` list that `createHideOutside`
must spare. Any modal Popover or Select needs the same collection.

## API

```ts
function createRegisteredElement<T extends Element>(options: {
  ref: Accessor<T | null | undefined>;
  register: (element: T) => void;
  unregister: (element: T) => void;
}): void;
```

- `ref` — the element to publish. **Must be a real signal accessor**, not a closure over a
  plain `let`. See `focus-trap.md`.
- `register` — called with the element once it exists.
- `unregister` — called with **the same element** when it changes or the owner is disposed, so
  an ancestor holding a list can remove exactly the entry it was given.

## Why this is a primitive

The element counterpart of [`createRegisteredId`](../registered-id/registered-id.md), for the
same reason: a descendant may not write to a signal owned by an **ancestor's** reactive scope
directly from its own synchronous render body — SolidJS 2.0 throws
`[REACTIVE_WRITE_IN_OWNED_SCOPE]`.

The two differ in *how* they defer, and the difference matters:

| | `createRegisteredId` | `createRegisteredElement` |
| --- | --- | --- |
| Defers into | `onSettled` | `createEffect` |
| Because | an id is known at render time and never changes | a ref is only populated *after* render, and is replaced when the element remounts |
| Reads its value | once | on every change |

## SSR

`createEffect` bodies never run during SSR, so nothing registers server-side. An ancestor whose
server-rendered markup depends on a registered element needs its own fallback.

## Example

```tsx
export const Backdrop: Component<DialogBackdropProps> = (props) => {
  const context = useDialogContext();
  const [backdropEl, setBackdropEl] = createSignal<HTMLDivElement>();

  // Spare the backdrop from `createHideOutside`, so it keeps its hover styles and its
  // pointer handlers while the dialog is modal.
  createRegisteredElement({
    ref: backdropEl,
    register: context.addModalTarget,
    unregister: context.removeModalTarget,
  });

  return <Show when={presence.mounted()}>{/* … ref={setBackdropEl} … */}</Show>;
};
```
