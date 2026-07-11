# `createFocusTrap`

Traps `Tab`/`Shift+Tab` focus cycling within a container while active. Built fresh for
enara-ui, modeled on the behavior of Base UI's/React Aria's focus scope primitives.

## API

```ts
function createFocusTrap(options: {
  active: Accessor<boolean>;
  ref: Accessor<HTMLElement | null | undefined>;
  initialFocus?: Accessor<HTMLElement | null | undefined>;
}): void;
```

- `active` — whether the trap is enabled. Toggling it on/off activates/deactivates the
  trap without needing to remount anything.
- `ref` — the container element to trap focus within. Must be a real signal accessor when
  the container is conditionally rendered — see "The `ref` must be a signal" below.
- `initialFocus` — explicit element to focus on activation. Defaults to the first
  focusable descendant, or the container itself (given a temporary `tabindex="-1"`) if
  it has none.

## Behavior

- On activation: focuses `initialFocus` (or falls back as described above).
- While active: `Tab` on the last focusable descendant moves to the first;
  `Shift+Tab` on the first moves to the last. If focus is moved outside the container by
  other means (e.g. another script calling `.focus()`), a `focusin` listener on
  `document` redirects it back inside.
- On deactivation: listeners are removed, and any `tabindex` this primitive added itself is
  removed.

## Restoring focus is a separate primitive

Deactivating the trap does **not** return focus to whatever had it before. That's
[`createFocusRestore`](../focus-restore/focus-restore.md).

They're split because restore and trap are independent concerns: Popover, Tooltip, and a
non-modal `Dialog` all want focus returned *without* being trapped. While the two were
welded together — restore living in this primitive's effect cleanup, behind a `returnFocus`
option — a component that skipped the trap silently lost focus restore too, stranding
keyboard focus on `<body>`.

Compose both, and **create `createFocusRestore` first**:

```tsx
createFocusRestore({ active: () => props.open });
createFocusTrap({ active: () => props.open && props.modal, ref });
```

`focus-restore.md` explains the two ordering constraints that depend on that line order.

Note also that a focus trap only covers **Tab cycling**. A modal layer additionally needs
`createHideOutside` for assistive technology (`aria-hidden`) and the focus order (`inert`),
and a `ModalBackdrop` to block the pointer unconditionally.

## The `ref` must be a signal

If the container element is created as a reactive consequence of the same signal `active`
derives from (e.g. it lives behind a `<Show>` gated on `open`), a plain closure over a
`let` will be read as `undefined` on the activating edge and never re-read — `active`, the
only other dependency, won't change again. This primitive tracks `ref()` in its `compute`
function for exactly that reason, which only works if `ref` is a real `createSignal`
accessor.

## SSR

All DOM access happens inside `createEffect`, gated on `active() && ref()` both being
truthy. `createEffect` bodies never run during SSR, so this primitive needs no manual
`isServer` guard.

## Example

```tsx
function Dialog(props: { open: boolean }) {
  const [popupRef, setPopupRef] = createSignal<HTMLDivElement>();

  createFocusRestore({ active: () => props.open });
  createFocusTrap({ active: () => props.open, ref: popupRef });

  return (
    <div ref={setPopupRef} role="dialog">
      ...
    </div>
  );
}
```
