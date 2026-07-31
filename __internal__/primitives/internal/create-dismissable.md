# `createDismissable`

Calls an `onDismiss` callback on Escape keydown, outside pointerdown and/or outside focus
while active, for the **topmost** open layer.

The single-layer half was built fresh for hope-ui, modeled on Base UI's/React Aria's dismiss-layer
behavior. The layer stack that came later is a port: the flat activation-order array and its
topmost check are React Aria `useOverlay`'s `visibleOverlays` (Adobe, Apache-2.0), so the file
carries an `@license` header and a row in both `NOTICE.md` tables. `bubbles` takes its name and
shape — but no source — from Base UI's `useDismiss` (MIT).

## API

```ts
function createDismissable(options: {
  active: Accessor<boolean>;
  ref: Accessor<HTMLElement | null | undefined>;
  onDismiss: () => void;
  dismissOnEscape?: boolean; // default true
  dismissOnOutsidePointerDown?: boolean; // default true
  exclude?: Accessor<Element[]>;
  dismissOnFocusOutside?: boolean; // default false
  bubbles?: boolean | { escapeKey?: boolean; outsidePress?: boolean }; // default: neither
}): void;
```

- `active` — whether the dismissable layer is currently listening.
- `ref` — the container element; a `pointerdown` whose target is outside this element
  triggers `onDismiss`. Must be a real signal accessor — see below.
- `onDismiss` — called once per qualifying Escape keydown, outside pointerdown or outside focus.
- `dismissOnEscape` / `dismissOnOutsidePointerDown` — toggle each trigger independently.
- `exclude` — elements that don't count as "outside", subtrees included. See below.
- `dismissOnFocusOutside` — dismiss when focus lands outside the container. **Default `false`**;
  a modal layer traps focus, so the listener would be dead weight there.
- `bubbles` — whether a dismissal handled by the layer **above** this one also reaches it.
  **Neither channel by default.** See below.

## `exclude` — the trigger is not "outside"

Without it, a layer that opens from a toggle button **can never be closed by clicking that
button**: the pointerdown dismisses in the capture phase, then the trigger's own `click`
reopens. Dialog never hit this because it is modal by default and its trigger sits behind
`inert`; a non-modal Popover hits it on the first click.

So the layer's own trigger is what `exclude` is for, above all. Radix, floating-ui and React
Aria all carry the same escape hatch; the name is Zag's — `spare` is `createHideOutside`'s word
and means something else ("exempt from `inert`").

Exclusion covers a listed element **and its subtree** (`element.contains(target)`, not `===`),
so a trigger with an icon or label element inside it works without listing each child.

`exclude` is read **live, inside the handlers** — never tracked in the effect's compute. The
elements it names register from their own effects, so tracking it would tear down and reattach
the document listeners on every ref change. It applies to pointerdown *and* focus-out, and
**not** to Escape: Escape is keyboard-global, and there is no "outside" for it to exempt.

## `dismissOnFocusOutside` listens on `focusin`, not `focusout`

Both handlers ask **one** `isOutside(target)` helper, so the two definitions of outside cannot
drift. That is only possible with `focusin`, which fires on the element focus *arrived* at.

`focusout` reports where focus *left*, whose target is by definition still inside the container —
so it would have to read `event.relatedTarget` instead, and the two handlers would no longer
share a question. Measured against this repo's Chromium:

| Path | `focusout` | `focusin` |
| --- | --- | --- |
| A genuine move from inside to outside | `target` = the inside element, `relatedTarget` = the outside one | `target` = the outside element |
| The focused element is removed, or disabled, while focused | `target` = that element (fired **synchronously, before detachment**), `relatedTarget` = **`null`** | **never fires** |
| `document.body.focus()` on a body with no `tabindex` | — | never fires (no-op) |

The second row is the one that decides it. Focus falls to `<body>`, which *is* outside the
container, and a `focusout` implementation reading a `null` `relatedTarget` as "focus went
outside" dismisses a layer nobody left. With `focusin` the event simply never arrives — the
path is excluded by the mechanism rather than by a special case. Pinned by *"does not call
onDismiss when focus falls to `<body>`"*.

A layer that autofocuses itself on open must create `createAutoFocus` **before**
`createDismissable`, so the synchronous `focusin` from its `.focus()` lands before this
primitive's listener is attached and the layer can't dismiss itself on the way in.

## The `ref` must be a signal

If the container element is created as a reactive consequence of the same signal `active`
derives from (e.g. it lives behind a `<Show>` gated on `open`), a plain closure over a `let`
will be read as `undefined` on the activating edge and never re-read — `active`, the only
other dependency, won't change again. The symptom is that Escape and outside-click silently
do nothing, forever, and only for components whose container is conditionally rendered; this
primitive's own isolated tests, which render the container unconditionally, never catch it.

This primitive tracks `ref()` in its `compute` function for exactly that reason, which only
works if `ref` is a real `createSignal` accessor. Same rule as `createFocusTrap` — see
`create-focus-trap.md`.

## Nested layers

Every active layer pushes onto a stack held on `document` under
`Symbol.for("hope-ui.dismiss-stack")`, topmost last. On `document` rather than at module scope for
the reason CLAUDE.md gives generally: nothing forces a consumer to have one installed copy of
`@hope-ui/primitives`, and two module-scope stacks each believing they own the topmost layer is an
unreproducible field bug — one Escape closing a Dialog straight through the Popover above it, on
some installs and not others. Pinned by a `?instance=2` import in
`create-dismissable.browser.test.tsx`.

Two rules follow from the stack:

- **Escape and outside pointerdown dismiss the topmost layer only.** Without the gate, a Popover
  opened inside a Dialog closes both on one Escape and both on one outside click.
- **Nothing inside a layer opened _above_ this one counts as "outside".** A pointerdown on the
  Popover's card is not an outside press for the Dialog underneath, and focus landing there is not
  focus leaving it. It is one clause inside the shared `isOutside`, so it covers pointerdown and
  focus-out together — and it is why `exclude` never needs to name a layer, only a trigger.

**Focus-out deliberately gets no topmost gate.** The layers-above clause already covers the
nesting, and focus that genuinely leaves the whole chain should close all of it, not just the top.

### Stack position is activation order, not mount order

The push happens inside the effect body, *after* the `active`/`ref` guard, so a mounted-but-closed
layer is simply absent from the stack and reopening it puts it back on top. One consequence worth
knowing, which React Aria's `visibleOverlays` shares: the effect is keyed on `[active(), ref()]`,
so swapping the container element *while active* re-runs it and moves that layer to the top.

Cleanup splices by `indexOf` rather than popping — layers can close in either order, and
`splice(-1, 1)` on a miss would drop whichever layer happens to be topmost.

### `bubbles` — opting a lower layer back in

```ts
bubbles?: boolean | { escapeKey?: boolean; outsidePress?: boolean };
```

Both members default to `false`: one Escape closes one layer. The name and shape are Base UI's
(`useDismiss`); **its asymmetric default (`escapeKey: false`, `outsidePress: true`) is deliberately
not followed** — an outside press that bubbled would make a single click on a modal's backdrop
close the modal *and* the layer above it, which is the exact breakage this stack exists to end. A
bare boolean sets both channels.

`Popover.Root` and `Dialog.Root` thread it straight through, so a consumer sets it once on the
root.

### Two deliberate divergences from React Aria's `useOverlay`

Both are recorded as divergences rather than gaps — see
[`reference-implementations.md`](../../reference-implementations.md) § *Nested overlay ordering*.

**1. Escape stays document-level.** React Aria scopes it to the overlay element through
`useKeyboard`, so it only fires with focus inside the overlay; here it is a `document` listener
gated on being topmost. Element-scoping it would mean returning keyboard props from every part hook
in every family — a change to the whole public surface, for behavior the stack already provides. The
practical difference is that hope-ui's stack carries more weight than upstream's: with focus
elsewhere, upstream's overlay hears nothing, while here the gate is the only thing deciding who
answers.

**2. One phase, not two.** React Aria snapshots the topmost layer at `pointerdown` and *decides* at
`click`, because it dismisses at `click` and the two events can have different targets. hope-ui
dismisses at the start of the interaction, in the capture-phase `pointerdown` handler, so "topmost
at the snapshot" and "topmost now" are the same instant and the second phase buys nothing.

That equivalence rests on a dispatch not being reorderable underneath itself. Every layer's
listener is attached by its own sibling effect, and the topmost layer's handler *writes the very
signal those effects track* — dismissing unmounts a layer. If that write re-ran the effects
mid-dispatch, a lower layer's listener would be detached before the event reached it, and the
single-phase guard would be reading a stack that changed under it. Solid defers the re-run to the
next flush, so it cannot. Pinned by `solid-contract.browser.test.tsx` § *a signal write from one
document listener cannot unhook the next one mid-dispatch*; if that ever goes red, the two-phase
snapshot becomes necessary.

### Three registries, not one

This stack answers "who wins a dismissal". [`createHideOutside`](./create-hide-outside.md)'s
answers "who observes, and who is spared"; [`createFocusScope`](./create-focus-scope.md)'s answers
"did focus land in me or above me". They stay **separate**, and merging them would be a bug: a
Dialog with `dismissOnEscape: false` still participates in hide-outside and focus-scope ordering
but must never win Escape. React Aria keeps `visibleOverlays`, `observerStack` and `focusScopeTree`
apart for the same reason and centralizes nothing — which is also why `roadmap.md`'s speculative
`createOverlayStack` (#14) was retired rather than built.

The layer *tree* (Base UI's `FloatingTree`, real ancestry rather than flat order) is **deferred to
Menu**, where submenu chains make it load-bearing; it composes with the flat stack rather than
replacing it.

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

A non-modal layer, where both new options earn their keep:

```tsx
function Popover(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnFocusOutside: boolean;
}) {
  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement>();
  const [popupRef, setPopupRef] = createSignal<HTMLDivElement>();

  createDismissable({
    active: () => props.open,
    ref: popupRef,
    onDismiss: () => props.onOpenChange(false),
    // Without this the trigger below can open the layer but never close it.
    exclude: () => {
      const trigger = triggerRef();
      return trigger ? [trigger] : [];
    },
    // A getter, not a one-time read — this is consulted live inside the handler.
    get dismissOnFocusOutside() {
      return props.closeOnFocusOutside;
    },
  });

  return (
    <>
      <button ref={setTriggerRef} onClick={() => props.onOpenChange(!props.open)} />
      <div ref={setPopupRef}>...</div>
    </>
  );
}
```

## Rejected alternatives

### `focusout` as the `dismissOnFocusOutside` trigger

**Why not:** Its target is by definition still inside the container, so it would have to read
`event.relatedTarget` — and `relatedTarget` is `null` exactly when the focused element is removed or
disabled while focused. Read as "focus went outside", that dismisses a layer nobody left. `focusin`
never fires on that path at all, so the case is excluded by the mechanism rather than by a special
case, and both handlers can keep asking one shared `isOutside`. Measured against this repo's
Chromium — the table in *`dismissOnFocusOutside` listens on `focusin`, not `focusout`* above is the
measurement.

### React Aria's element-scoped Escape (`useKeyboard` → `keyboardProps`)

**Why not:** Upstream spreads keyboard props on the overlay element, so Escape only fires with focus
inside it. Matching that means returning keyboard props from **every part hook in every family** — a
change to the whole public surface — to buy behavior the topmost gate already provides. The
practical difference is that this stack carries more weight than upstream's: with focus elsewhere,
upstream's overlay hears nothing, while here the gate is the only thing deciding who answers.

### React Aria's two-phase pointer guard (snapshot at `pointerdown`, dismiss at `click`)

**Why not:** Upstream needs two phases because it *dismisses* at `click`, and `pointerdown` and
`click` can have different targets. hope-ui dismisses at the start of the interaction, in the
capture-phase `pointerdown` handler, so "topmost at the snapshot" and "topmost now" are the same
instant and the second phase buys nothing.
**Revisit if:** `solid-contract.browser.test.tsx` § *a signal write from one document listener cannot
unhook the next one mid-dispatch* goes red — the equivalence rests on that guarantee, and without it
the single-phase guard reads a stack that changed under it.

### Base UI's asymmetric `bubbles` default (`escapeKey: false`, `outsidePress: true`)

**Why not:** An outside press that bubbled makes a single click on a modal's backdrop close the
modal *and* the layer above it — the exact breakage this stack was built to end. Both channels
default to `false` here: one Escape, or one outside press, closes one layer. The option's name and
shape are still Base UI's.

### A module-scope layer stack

**Why not:** Nothing forces a consumer to a single installed copy of `@hope-ui/primitives`, and two
module-scope stacks each believe they own the topmost layer — one Escape closing a Dialog straight
through the Popover above it, on some installs and not others. `Symbol.for("hope-ui.dismiss-stack")`
resolves through the cross-realm global registry; pinned by a `?instance=2` import in
`create-dismissable.browser.test.tsx`.

### One merged overlay stack (`createOverlayStack`, roadmap #14)

**Why not:** A `Dialog` with `dismissOnEscape: false` still participates in hide-outside and
focus-scope ordering but must never win Escape, so the three registries have to be able to disagree
— merged, that is a special case rather than a simplification. React Aria keeps `visibleOverlays`,
`observerStack` and `focusScopeTree` apart and centralizes nothing. See *Three registries, not one*
above; the roadmap row was retired rather than built.

### Base UI's layer *tree* (`FloatingTree` / `FloatingNode`)

**Why not:** Real ancestry costs `<FloatingTree>` + `<FloatingNode>` JSX wiring in a kernel that is
hooks-only by design — `ModalBackdrop` is deliberately its one DOM-rendering component — and forces
every overlay component to declare its node. A flat activation-order stack needs no consumer wiring
and survives portals for free, because activation order does not depend on DOM ancestry.
**Revisit if:** Menu lands — submenu chains make `getNodeChildren` load-bearing, and the tree
composes with the flat stack rather than replacing it, exactly as floating-ui-react's own
`useDismiss` uses both.
