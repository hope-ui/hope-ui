# `createScrollLock`

Locks `document.body` scrolling while active, compensating for the scrollbar-width
layout shift with a matching `padding-right`. Built fresh for solid-zero.

## API

```ts
function createScrollLock(options: { active: Accessor<boolean> }): void;
```

- `active` — whether the lock is currently engaged.

## Behavior

Ref-counted: if two locks are active at once (e.g. two overlays open simultaneously), the
body's original `overflow`/`padding-right` are only snapshotted on the *first* lock and only
restored once the *last* active lock releases. This makes it safe for multiple independent
components (a Dialog and a Popover, or two Dialogs) to each call `createScrollLock` without
one's deactivation prematurely unlocking scroll for the other.

## Where the ref count lives, and why it matters

On `document.body`, under `Symbol.for("solid-zero.scroll-lock")` — **not** at module scope.

`@solid-zero/primitives` is public API, and `@solid-zero/components` depends on it as a plain
`dependencies` entry. Neither forces a single installed instance: a consumer can end up with
two copies of this package in their tree, at which point two module-scope counters each
believe they own the body. The observable failure is that `overflow: hidden` is restored while
a dialog is still open, or never restored at all — the exact opposite of what the ref count
promises, and impossible to reproduce in this repo's CI, where there is only ever one copy.

`Symbol.for` resolves through the cross-realm global symbol registry, so every copy of the
module reads and writes the same slot on the same `document.body`. Base UI stores its lock
state on the element for the same reason. `createHideOutside` stores its own per-element
ref count the same way.

`scroll-lock.browser.test.tsx` pins this by importing a genuinely separate module instance
(via a `?instance=2` query, which Vite serves as a distinct module) and checking the two
compose.

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
