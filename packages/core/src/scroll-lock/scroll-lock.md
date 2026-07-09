# `createScrollLock`

Locks `document.body` scrolling while active, compensating for the scrollbar-width
layout shift with a matching `padding-right`. Built fresh for solid-zero.

## API

```ts
function createScrollLock(options: { active: Accessor<boolean> }): void;
```

- `active` — whether the lock is currently engaged.

## Behavior

Ref-counted at module scope: if two locks are active at once (e.g. two overlays open
simultaneously), the body's original `overflow`/`padding-right` are only snapshotted on
the *first* lock and only restored once the *last* active lock releases. This makes it
safe for multiple independent components (a Dialog and a Popover, or two Dialogs) to
each call `createScrollLock` without one's deactivation prematurely unlocking scroll for
the other.

## SSR

All `document`/`window` access happens inside `createEffect`, gated on `active()`. Never
runs during SSR, no manual `isServer` guard needed.

## Example

```tsx
function Dialog(props: { open: boolean }) {
  createScrollLock({ active: () => props.open });
  return <div>...</div>;
}
```
