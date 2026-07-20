# `createFocusRestore`

Remembers what was focused when `active` turns true, and focuses it again when `active`
turns false.

## API

```ts
function createFocusRestore(options: { active: Accessor<boolean> }): void;
```

- `active` — whether the layer that borrowed focus is currently active.

Note what's *not* here: no `ref`. Restore only ever reads `document.activeElement` on the
activating edge, so it never needs to know which element borrowed focus.

## Why this is separate from `createFocusTrap`

Restore and trap are independent concerns. An overlay can want its focus returned without
trapping focus inside itself — **Popover and Tooltip are exactly that**: non-modal,
restore-without-trap.

Welding them together (restore living inside the trap's effect cleanup) meant a non-modal
`Dialog`, which doesn't activate the trap, stranded keyboard focus on `<body>` after
Escape — a WAI-ARIA APG violation. The alternative for a future non-modal component would
have been to enable the whole trap (wrong) or copy-paste the restore logic (worse: that's
the cross-component coupling this project exists to avoid).

## Two ordering constraints

Both verified empirically against the installed `solid-js@2.0.0-beta`, not assumed — and
both pinned by `../solid-contract.test.tsx`, so SolidJS 2.0 stable changing either goes red
there first.

**1. Call `createFocusRestore` before `createFocusTrap`.**

Sibling effects run in creation order. Creating the restore effect first is what guarantees
its `document.activeElement` snapshot happens *before* the trap moves focus into its
container — otherwise it would remember the popup's first focusable child, not the trigger.

**2. The restore is deferred by one microtask.**

The path that matters is the effect **re-run**: `active` flips false, and Solid walks the
sibling effects in creation order, running each one's previous cleanup before its own new
body. So this primitive's cleanup runs while `createFocusTrap`'s `focusin` listener is still
attached. Focusing the trigger synchronously would dispatch `focusin` (`.focus()` dispatches
it synchronously), and the still-live trap would yank focus straight back into its container.

Effect cleanups are synchronous within a flush, so a microtask queued from this one lands
after every sibling cleanup has run and the listener is gone:

```
A cleanup (sync)  →  B cleanup (removes listeners)  →  A restore (microtask)
```

> Owner **disposal** is the opposite: cleanups there run LIFO, so the trap's would fire
> first. Nothing depends on that — `Dialog.Content` stays mounted while only its element
> unmounts, so deactivation always takes the re-run path — but the two paths disagreeing is
> exactly the sort of thing a reader assumes away. Both are pinned.

Tests that assert on restored focus must therefore await a tick — `await expect.element(x).toHaveFocus()`
already retries, so in practice this is invisible.

The deferral is doubly load-bearing once `createHideOutside` is in the mix. It applies `inert`
to everything outside the popup, which includes the trigger's ancestor — and `.focus()` on an
`inert` element silently does nothing. Restoring synchronously would therefore fail even
without a focus trap present. Both cleanups have run by the time the microtask fires, so the
trigger is focusable again. Same rule as before: create `createFocusRestore` first, and both
its snapshot (before `inert` blurs the trigger) and its restore (after `inert` is removed) land
where they should.

## When restore is skipped

- The remembered element has left the document (`isConnected === false`) — its subtree was
  unmounted along with the overlay, and focusing a detached node does nothing useful.
- The remembered element is `<body>` — nothing meaningful had focus, and `body.focus()`
  would only blur whatever has it now.

## SSR

All DOM access (including the `document.activeElement` read) happens inside `createEffect`,
which never runs during SSR. No manual `isServer` guard needed.

## Example

```tsx
function Popup(props: { open: boolean; modal: boolean }) {
  const [ref, setRef] = createSignal<HTMLDivElement>();

  // Restore whenever the popup is open, whether or not focus is trapped.
  createFocusRestore({ active: () => props.open });
  // Trap only while modal. Created second — see the ordering constraints above.
  createFocusTrap({ active: () => props.open && props.modal, ref });

  return <div ref={setRef}>...</div>;
}
```
