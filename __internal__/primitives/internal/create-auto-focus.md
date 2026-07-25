# `createAutoFocus`

Moves focus into a container when `active` turns true. Extracted from `createFocusTrap`,
which now composes it.

## API

```ts
function createAutoFocus(options: {
  active: Accessor<boolean>;
  ref: Accessor<HTMLElement | null | undefined>;
  initialFocus?: Accessor<HTMLElement | null | undefined>;
}): void;
```

- `active` — whether autofocus is enabled. Focus moves on the activating edge.
- `ref` — the container to move focus into. Must be a real signal accessor when the
  container is conditionally rendered — see "The `ref` must be a signal" below.
- `initialFocus` — explicit element to focus, skipping the descendant scan.

## The fallback chain

On activation, exactly one element is focused, picked in this order:

1. **`initialFocus()`**, if the option is passed and returns an element.
2. **The first focusable descendant** of the container — the first match of the focusable
   selector that is also *visible* (`offsetParent !== null || getClientRects().length > 0`,
   so a `display: none` control is skipped).
3. **The container itself**, under a `tabindex="-1"` this primitive adds.

Step 3 is the escape hatch for a layer with nothing focusable in it — an alert-style dialog,
a popover of static text. A container is not focusable by default, so the attribute is the
only way to put focus on it rather than leaving it on whatever is behind the layer.

**The `tabindex` is removed again on deactivation, and only if this primitive added it.** A
`tabindex` the consumer authored is left alone: the flag is set at the moment of writing, not
inferred afterwards, so nothing can strip an attribute it does not own.

`tabindex="-1"` keeps the container out of the Tab order — it is programmatically focusable
only. That is deliberate: this primitive puts focus somewhere, it does not add a stop to the
sequential navigation order.

## `initialFocus` is sampled, not tracked

The read is wrapped in `untrack()`. `initialFocus` names where focus goes *on this
activation*; tracking it would re-run the whole activation block — stealing focus back from
wherever the user has since moved it — every time a signal-backed target ref reassigned.

Spelling it is also required rather than cosmetic: left as a bare read inside the effect
callback it trips `STRICT_READ_UNTRACKED` for any consumer passing a real accessor, which
`mount()` turns into a failed test. See `mount.md`.

## The `ref` must be a signal

If the container element is created as a reactive consequence of the same signal `active`
derives from (e.g. it lives behind a `<Show>` gated on `open`), a plain closure over a `let`
will be read as `undefined` on the activating edge and never re-read — `active`, the only
other dependency, won't change again. This primitive tracks `ref()` in its `compute` function
for exactly that reason, which only works if `ref` is a real `createSignal` accessor.

## Composition

Three primitives split what used to be one, because the three concerns are independently
wanted:

| Primitive | Owns |
| --- | --- |
| [`createFocusRestore`](create-focus-restore.md) | putting focus back where it was, on deactivation |
| `createAutoFocus` | putting focus *into* the layer, on activation |
| [`createFocusTrap`](create-focus-trap.md) | caging `Tab` inside the layer while active |

A **modal** layer wants all three. A **non-modal** layer — Popover, Tooltip, `<Dialog
modal={false}>` — wants the first two and not the trap: focus lands in the popup and returns
to the trigger, but `Tab` walks out of it normally. Before the split, taking the focus you
wanted meant taking the trap you didn't.

**Create `createFocusRestore` first.** Sibling effects run in creation order, so the restore
effect's `document.activeElement` snapshot must be taken before this one moves focus —
otherwise it remembers the popup's first focusable child rather than the trigger.
`create-focus-restore.md` has both ordering constraints.

```tsx
function Popover(props: { open: boolean }) {
  const [popupRef, setPopupRef] = createSignal<HTMLDivElement>();

  createFocusRestore({ active: () => props.open });
  createAutoFocus({ active: () => props.open, ref: popupRef });

  return <div ref={setPopupRef} role="dialog">…</div>;
}
```

`createFocusTrap` composes this primitive rather than reimplementing it, and creates its
listener effect **before** calling it. That order is load-bearing and documented in
`create-focus-trap.md`.

## SSR

All DOM access happens inside `createEffect`, gated on `active() && ref()` both being truthy.
`createEffect` bodies never run during SSR, so this primitive needs no manual `isServer`
guard.
