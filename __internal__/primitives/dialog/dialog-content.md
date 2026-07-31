# `createDialogContent`

The content part of the [dialog hook family](dialog-root.md) — the dialog surface, and the
behavior hub.

```ts
function createDialogContent(
  state: CreateDialogReturn,
  props: JSX.HTMLAttributes<HTMLDivElement> & {
    // Element to focus on open, instead of the first focusable descendant. A control prop, not an
    // attribute: it's read by this part's focus trap and dropped from the spread onto the surface.
    initialFocus?: Accessor<HTMLElement | null | undefined>;
  },
): {
  props: JSX.HTMLAttributes<HTMLDivElement> & { "data-presence": string };
  mounted: Accessor<boolean>;                 // gate the content's render on this
  setRef: (element: HTMLDivElement) => void;  // registers the element on `state`
};
```

**Reflects the shared presence; does not create one.** `createDialog` owns the single shared overlay
presence (`state.contentPresence`) eagerly; this hook *mirrors* it — `mounted` and the `data-presence`
attribute come straight from `state.contentPresence`, and `setRef` registers the element on
`state.setContentElement` so that presence can time its exit off it. Creating a presence *here* would
break the enter animation: this part is mounted lazily on open, so a presence created here would see
`present` already `true` on its first run and latch straight to `entered` (never `entering`), so the
CSS enter transition never fires. The Positioner consumes the same `state.contentPresence`;
`createDialogBackdrop` (eagerly mounted) keeps its own. Mirrors Ark. See
[`create-presence.md`](../internal/create-presence.md) and [`dialog-root.md`](./dialog-root.md).

Owns the full effect stack, all created in this hook's (the content's) scope so each tears down when
the content unmounts:

- `createFocusRestore` (gated on `open()`) → `createFocusTrap` → `createHideOutside` (both gated on
  `isModal()`) → `createDismissable` (Escape / outside pointerdown) → `createScrollLock`. **Creation
  order is load-bearing**: focus-restore must precede the trap and hide-outside so its
  `activeElement` snapshot lands before focus moves and before `inert` blurs the trigger (see
  [`create-focus-restore.md`](../internal/create-focus-restore.md)).

The two dismissal toggles come from the root state, not this part's props: `createDismissable`'s
`dismissOnEscape` / `dismissOnOutsidePointerDown` are forwarded from `state.closeOnEscape()` /
`state.closeOnInteractOutside()` (both default `true` on `createDialog`), so a consumer sets them
**once** on `createDialog` / `Dialog.Root`. They are forwarded as getters, not a one-time read:
`createDismissable` reads them live inside its keydown/pointerdown handlers, so a getter keeps them
reactive (and avoids a `STRICT_READ_UNTRACKED` read in this hook body). See
[`dialog-root.md`](dialog-root.md).

`initialFocus` (when set) is what `createFocusTrap` focuses on open, instead of the first focusable
descendant; it's read lazily at focus time (after mount), so the target may live inside the content.
It belongs here, not on `createDialog` — the focus trap is owned by this part, and no other part
reads it.

Also registers a consumer-supplied `props.id` as the content id (feeds the trigger's `aria-controls`)
via `createRegisteredId`.

Returned `props`: `id`/`aria-labelledby`/`aria-describedby` fall back to the consumer's value with `??`
against the resolved state accessors (a blind default would strip a consumer's accessible name);
`aria-modal` (present only while modal) and `data-presence` (mirroring `state.contentPresence.status()`)
are owned here. `role` is `props.role ?? state.role()` — a direct consumer `role` on the content still
wins, otherwise it comes from `createDialog`'s `role` option (default `"dialog"`, or `"alertdialog"`).
The styled `@hope-ui/components` `Dialog` sets `role` once on `Dialog.Root` (→ `createDialog`), so the
component layer threads nothing.

## Rejected alternatives

### A `createPresence` created inside this hook
**Why not:** this part is mounted lazily on open, so a presence created here sees `present` already
`true` on its first run and the first-run latch puts it straight on `entered` — the card appears
instantly, the authored enter transition never fires, and no test fails (`95cee52`). It mirrors
`state.contentPresence`, created eagerly on the root while still closed; see *Reflects the shared
presence* above and [`create-presence.md`](../internal/create-presence.md), which owns the full entry.

### Computed `aria-labelledby` / `aria-describedby` / `role` / `id` that overwrite the consumer's
**Why not:** `merge` gives the *last* source precedence and treats a getter returning `undefined` as a
real value, so a bare `get "aria-labelledby"()` erased a consumer's own value whenever no `Title` was
mounted — leaving the dialog with no accessible name, an axe `aria-dialog-name` violation in *their*
app — and left `role`/`id` unoverridable, which put the APG `alertdialog` pattern out of reach
(`5674fae`). Each falls back with `??` instead; only `aria-modal` and `data-presence` stay owned here,
since both derive from state the consumer does not control.

### Creating `createFocusTrap` or `createHideOutside` before `createFocusRestore`
**Why not:** sibling effects run, and clean up on re-run, in creation order — so the restore's
`document.activeElement` snapshot would be taken after the trap had already moved focus and after
`inert` had blurred the trigger, and focus would be handed back to the wrong element or to nothing.
The order is load-bearing, not stylistic; see
[`create-focus-restore.md`](../internal/create-focus-restore.md).

### Forwarding `closeOnEscape` / `closeOnInteractOutside` as one-time reads
**Why not:** `createDismissable` reads both live inside its keydown/pointerdown handlers, so a value
read once in this hook body freezes them — a consumer flipping a toggle after mount would have no
effect — and the read itself is an untracked signal read in a hook body, i.e. `STRICT_READ_UNTRACKED`,
which `mount()` fails a test on. They are forwarded as getters.
