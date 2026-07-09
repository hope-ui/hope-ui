# `createFocusTrap`

Traps `Tab`/`Shift+Tab` focus cycling within a container while active. Built fresh for
solid-zero, modeled on the behavior of Base UI's/React Aria's focus scope primitives.

## API

```ts
function createFocusTrap(options: {
  active: Accessor<boolean>;
  ref: Accessor<HTMLElement | null | undefined>;
  initialFocus?: Accessor<HTMLElement | null | undefined>;
  returnFocus?: boolean; // default true
}): void;
```

- `active` — whether the trap is enabled. Toggling it on/off activates/deactivates the
  trap without needing to remount anything.
- `ref` — the container element to trap focus within.
- `initialFocus` — explicit element to focus on activation. Defaults to the first
  focusable descendant, or the container itself (given a temporary `tabindex="-1"`) if
  it has none.
- `returnFocus` — restore focus to whatever was focused immediately before activation,
  once the trap deactivates. Defaults to `true`.

## Behavior

- On activation: saves `document.activeElement`, then focuses `initialFocus` (or falls
  back as described above).
- While active: `Tab` on the last focusable descendant moves to the first;
  `Shift+Tab` on the first moves to the last. If focus is moved outside the container by
  other means (e.g. another script calling `.focus()`), a `focusin` listener on
  `document` redirects it back inside.
- On deactivation: listeners are removed, any `tabindex` this primitive added itself is
  removed, and (unless `returnFocus` is `false`) focus is restored to the
  pre-activation element.

## SSR

All DOM access (including the very first `document.activeElement` read) happens inside
`createEffect`, gated on `active() && ref()` both being truthy. `createEffect` bodies
never run during SSR, so this primitive needs no manual `isServer` guard.

## Example

```tsx
function Dialog(props: { open: boolean }) {
  let popupRef: HTMLDivElement | undefined;

  createFocusTrap({
    active: () => props.open,
    ref: () => popupRef,
  });

  return (
    <div ref={popupRef} role="dialog">
      ...
    </div>
  );
}
```
