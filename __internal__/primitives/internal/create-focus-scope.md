# `createFocusScope`

Registers a container as a **focus scope** while it is active, and answers the one question a layer
underneath needs: *did focus land in me, or in a layer opened above me?*

It moves no focus and cages none. [`createAutoFocus`](create-auto-focus.md) owns moving focus in,
[`createFocusTrap`](create-focus-trap.md) owns Tab cycling, and
[`createFocusRestore`](create-focus-restore.md) owns handing focus back. This is the third registry
in the nested-overlay set, beside [`createDismissable`](create-dismissable.md)'s dismiss stack and
[`createHideOutside`](create-hide-outside.md)'s observer stack.

## API

```ts
function createFocusScope(options: {
  active: Accessor<boolean>;
  ref: Accessor<HTMLElement | null | undefined>;
}): { containsSelfOrAbove(target: Node | null): boolean };
```

- `active` — whether this scope is currently part of the chain. Toggling it registers/unregisters
  without remounting anything.
- `ref` — the container the scope covers, subtree included. Must be a real signal accessor when the
  container is conditionally rendered; same constraint, same reason, as
  [`createFocusTrap`](create-focus-trap.md#the-ref-must-be-a-signal).
- `containsSelfOrAbove(target)` — `true` when `target` is inside this scope's own container, or
  inside the container of any scope registered **above** it. `false` for a `null` target, and
  `false` while this scope holds no registration (inactive, or still waiting for its container).

## What it is for

A `Popover` opened inside a modal `Dialog` is portaled to `<body>`, so
`dialogContent.contains(target)` is `false` for everything in it. Without a chain, that reads as
focus escaping the dialog, and the measured consequence was a three-step collapse:

```
create-auto-focus.ts    initial.focus()                       → the popover's inner button
create-focus-trap.ts    (focusable[0] ?? container).focus()   → the DIALOG's close trigger
create-dismissable.ts   handleFocusIn → onDismiss             → the popover closes itself
```

A popover open for about three milliseconds, with no error anywhere — the breakage
`popover.stories.tsx`'s `InsideADialog` used to hide behind `closeOnFocusOutside={false}`.
`createFocusTrap` now consults `containsSelfOrAbove` instead of `container.contains`, so step 2
never fires and step 3 has nothing to react to.

## The chain looks upward only

The stack is a flat array on `document`, topmost last, and the predicate slices **from this scope
up**: itself, then everything opened above it. Never downward, and the asymmetry is the behavior:

- the **dialog underneath** must tolerate focus in the popover above it — otherwise it yanks it back;
- the **popover above** must still treat focus falling back down into the dialog as focus it has
  lost — otherwise Tabbing away could never close it.

**Position is activation order, not mount order.** The push happens inside the effect body, after
the `active`/`ref` guard, so a mounted-but-closed layer is simply absent and reopening it puts it on
top. One consequence shared with the other two registries: the effect is keyed on
`[active(), ref()]`, so swapping the container element *while active* re-runs it and moves that
scope to the top.

## The stack lives on `document`, under a global symbol

`Symbol.for("hope-ui.focus-scope-stack")`, for the reason every registry in this kernel gives:
nothing forces a consumer to have one installed copy of `@hope-ui/primitives`. Two module-scope
stacks would put a `Popover` from copy B outside every scope copy A knows about, and copy A's
`Dialog` would go back to yanking focus out of it — on some installs and not others.

**The three stacks stay separate.** A `Dialog` with `dismissOnEscape: false` participates in
focus-scope and hide-outside ordering but must never win Escape, so a single merged overlay stack
would be a bug rather than a simplification. React Aria keeps `focusScopeTree`, `observerStack` and
`visibleOverlays` apart for the same reason. This is also why roadmap #14 (`createOverlayStack`) is
retired rather than built.

## Tab is deliberately not covered

Registering a scope does **not** extend the trap below it. With focus inside a non-modal layer, Tab
past its last focusable leaves the chain, the trap underneath pulls focus back into itself, and
`closeOnFocusOutside` closes the layer. That is the documented non-modal contract — *"Tab away
closes it"* — not a gap. A layer that wants Tab caged asks for `createFocusTrap`, which registers a
scope of its own.

## Composition

Two shapes, and they differ only in whether the layer traps.

A **modal** layer gets its scope for free: `createFocusTrap` composes `createFocusScope` internally,
with the same `options`, created before its own listener effect so the registration is in place
before anything can consult it.

A **non-modal** layer registers directly, and the creation order is load-bearing:

```tsx
createFocusRestore({ active: state.open });      // snapshot before anything moves focus
createFocusScope({ active: state.open, ref });   // on the stack before anything moves focus in
createAutoFocus({ active: …, ref });             // moves focus in
createDismissable({ active: state.open, ref, … });
```

Sibling effects run in creation order, so registering *after* `createAutoFocus` means the `focusin`
that `.focus()` dispatches reaches the enclosing trap while the trap still knows nothing about this
layer — the exact collapse above. `popover-content.ts` is the worked example; its returned predicate
is unused, because a non-modal layer consults nobody.

## SSR

All DOM access happens inside `createEffect`, gated on `active() && ref()`. `createEffect` bodies
never run during SSR, so this primitive needs no `isServer` guard — and there is no scope stack on a
server anyway.

## Provenance

The idea is React Aria's: `FocusScope.tsx` keeps a `focusScopeTree`, and `useOverlay` consults
`isElementInChildOfActiveScope` before treating a blur as focus leaving an overlay.

Only the idea. Upstream is a genuine `Tree` of `TreeNode`s with parent links, a per-node
`nodeToRestore`, a pre-order traversal generator and a `clone()` — a data structure built to carry
the focus *restore* algorithm that lives in the same file. hope-ui already has that half
(`createFocusRestore`), so what is left here is a flat array and a slice, sharing no expression with
it. Credited in prose; **not** an attributed derivative, and it carries no `@license` header. See
`__internal__/reference-implementations.md`.

## Rejected alternatives

### React Aria's `focusScopeTree` — a real tree of parent-linked nodes

**Why not:** Upstream's `Tree`/`TreeNode` structure, its `fastMap`, its pre-order traversal
generator and its `clone()` all exist to carry the focus *restore* algorithm that lives in the same
file — `nodeToRestore` is a field on every node. hope-ui already has that half as
[`createFocusRestore`](create-focus-restore.md), so porting the structure duplicates a solved
problem and turns a flat array, an `indexOf` and a `slice` into an attributed derivative with an
`@license` header. The verdict was settled against the diff, not the plan (`2a40b14`); what was
taken is the *question* `useOverlay` asks through `isElementInChildOfActiveScope`, which is the
bucket that owes nothing. See *Provenance* above.

### One merged overlay stack (`createOverlayStack`, roadmap #14)

**Why not:** The three registries answer different questions, and a `Dialog` with
`dismissOnEscape: false` needs all three answers to disagree: it still participates in focus-scope
and hide-outside ordering, and must never win Escape. Merged, that is expressible only as a special
case inside the merged stack. React Aria keeps `focusScopeTree`, `observerStack` and
`visibleOverlays` apart and centralizes nothing. The roadmap row was retired rather than built.

### Extending the trap through the chain, so `Tab` is caged across registered scopes

**Why not:** It would silently rewrite the non-modal contract. With focus inside a non-modal layer,
`Tab` past its last focusable is *supposed* to leave the chain, let the trap underneath pull focus
back, and let `closeOnFocusOutside` close the layer — *"Tab away closes it"*. Caging it means a
non-modal Popover inside a Dialog can never be closed by tabbing away. A layer that wants the cage
asks for [`createFocusTrap`](create-focus-trap.md), which registers a scope of its own.

### A module-scope scope stack

**Why not:** Nothing forces a consumer to a single installed copy of `@hope-ui/primitives`, and two
module-scope stacks put a `Popover` from copy B outside every scope copy A knows about — so copy A's
`Dialog` goes back to yanking focus out of it, on some installs and not others. `Symbol.for` resolves
through the cross-realm global registry, so every copy reads the same slot. Pinned cross-instance by
a `?instance=2` import rather than argued.
