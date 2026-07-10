# `createDismissable`

Calls an `onDismiss` callback on Escape keydown and/or outside pointerdown while active.
Built fresh for solid-zero, modeled on Base UI's/React Aria's dismiss-layer behavior.

## API

```ts
function createDismissable(options: {
  active: Accessor<boolean>;
  ref: Accessor<HTMLElement | null | undefined>;
  onDismiss: () => void;
  dismissOnEscape?: boolean; // default true
  dismissOnOutsidePointerDown?: boolean; // default true
}): void;
```

- `active` — whether the dismissable layer is currently listening.
- `ref` — the container element; a `pointerdown` whose target is outside this element
  triggers `onDismiss`.
- `onDismiss` — called once per qualifying Escape keydown or outside pointerdown.
- `dismissOnEscape` / `dismissOnOutsidePointerDown` — toggle each trigger independently.

## Scope

This is intentionally a single-layer primitive — it does not manage a stacked
dismiss-order across multiple simultaneously open overlays (e.g. a Popover opened from
inside a Dialog, where only the topmost layer should dismiss on Escape). That's deferred
until Popover/Tooltip force an actual need for it, per solid-zero's phased build plan —
adding it now would be speculative.

## SSR

All `document` access happens inside `createEffect`, gated on `active() && ref()`. Never
runs during SSR, no manual `isServer` guard needed.

## Example

```tsx
function Dialog(props: { open: boolean; onOpenChange: (open: boolean) => void }) {
  let popupRef: HTMLDivElement | undefined;

  createDismissable({
    active: () => props.open,
    ref: () => popupRef,
    onDismiss: () => props.onOpenChange(false),
  });

  return <div ref={popupRef}>...</div>;
}
```
