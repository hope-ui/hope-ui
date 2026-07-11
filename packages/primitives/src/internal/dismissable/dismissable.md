# `createDismissable`

Calls an `onDismiss` callback on Escape keydown and/or outside pointerdown while active.
Built fresh for enara-ui, modeled on Base UI's/React Aria's dismiss-layer behavior.

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
  triggers `onDismiss`. Must be a real signal accessor — see below.
- `onDismiss` — called once per qualifying Escape keydown or outside pointerdown.
- `dismissOnEscape` / `dismissOnOutsidePointerDown` — toggle each trigger independently.

## The `ref` must be a signal

If the container element is created as a reactive consequence of the same signal `active`
derives from (e.g. it lives behind a `<Show>` gated on `open`), a plain closure over a `let`
will be read as `undefined` on the activating edge and never re-read — `active`, the only
other dependency, won't change again. The symptom is that Escape and outside-click silently
do nothing, forever, and only for components whose container is conditionally rendered; this
primitive's own isolated tests, which render the container unconditionally, never catch it.

This primitive tracks `ref()` in its `compute` function for exactly that reason, which only
works if `ref` is a real `createSignal` accessor. Same rule as `createFocusTrap` — see
`focus-trap.md`.

## Scope

This is intentionally a single-layer primitive — it does not manage a stacked
dismiss-order across multiple simultaneously open overlays (e.g. a Popover opened from
inside a Dialog, where only the topmost layer should dismiss on Escape). That's deferred
until Popover/Tooltip force an actual need for it, per enara-ui's phased build plan —
adding it now would be speculative.

## SSR

All `document` access happens inside `createEffect`, gated on `active() && ref()`. Never
runs during SSR, no manual `isServer` guard needed.

## Example

```tsx
function Dialog(props: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [popupRef, setPopupRef] = createSignal<HTMLDivElement>();

  createDismissable({
    active: () => props.open,
    ref: popupRef,
    onDismiss: () => props.onOpenChange(false),
  });

  return <div ref={setPopupRef}>...</div>;
}
```
