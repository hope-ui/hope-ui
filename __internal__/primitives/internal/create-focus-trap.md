# `createFocusTrap`

Traps `Tab`/`Shift+Tab` focus cycling within a container while active. Built fresh for
hope-ui, modeled on the behavior of Base UI's/React Aria's focus scope primitives.

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

- On activation: focuses `initialFocus` (or falls back as described above) — delegated to
  [`createAutoFocus`](create-auto-focus.md), see below.
- While active: `Tab` on the last focusable descendant moves to the first;
  `Shift+Tab` on the first moves to the last. If focus is moved outside the container by
  other means (e.g. another script calling `.focus()`), a `focusin` listener on
  `document` redirects it back inside.
- On deactivation: listeners are removed, and any `tabindex` this primitive added itself is
  removed.

## Moving focus in is `createAutoFocus`

The activation half — the `initialFocus` → first-focusable → container fallback chain and the
`tabindex="-1"` it may add — lives in [`createAutoFocus`](create-auto-focus.md), which this
primitive composes. The two were welded into one effect, so a non-modal overlay wanting focus
moved into it had to accept the cage as well. Public options are unchanged: all three keys are
forwarded straight through.

### The listener effect is created *first*, and that is load-bearing

```ts
createEffect(…listeners…);   // ← first
createAutoFocus(options);    // ← second
```

Sibling effect cleanups run in **creation** order on a re-run, so listeners-first reproduces
exactly what the single welded effect did: remove the `keydown`/`focusin` handlers, and only
then let autofocus remove the `tabindex`.

Two things that follow, neither of them obvious:

**The guarantee covers a re-run, not owner disposal.** On disposal siblings clean up **LIFO**,
so the order reverses and the `tabindex` goes first. That is benign — see the measurement
below — but the two paths disagreeing is exactly the sort of thing a reader assumes away.

**The teardown hazard is not observable in Chromium, which is why the order is pinned
structurally.** Dropping the `tabindex` from the focused container does blur it, but Chromium
fires only `focusout` — never a `focusin` — and focus lands on `<body>`. This primitive
listens for `focusin`, so its handler cannot react even while still attached. Measured against
the installed Chromium, not assumed. The order is still the right one, so
`create-auto-focus.browser.test.tsx` pins the teardown *sequence* directly rather than a DOM
consequence there isn't one of; without that pin the decision would silently revert.

**What the order does change, observably: an `initialFocus` pointing outside the container.**
The `focusin` listener is already attached when autofocus fires, so the trap yanks that focus
back inside. Arguably the more correct behavior for a *trap* — an explicit request to start
focus outside the cage is a contradiction — and it is asserted rather than left implicit.
`createAutoFocus` on its own honors an outside target, since nothing is watching.

`create-focus-trap.browser.test.tsx` is untouched by the extraction: it imports only
`createFocusTrap`, so it is the no-behavior-change gate. The composition tests live beside
`createAutoFocus` instead.

## Restoring focus is a separate primitive

Deactivating the trap does **not** return focus to whatever had it before. That's
[`createFocusRestore`](create-focus-restore.md).

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

`create-focus-restore.md` explains the two ordering constraints that depend on that line order.

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
