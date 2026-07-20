# `createDialogContent`

The content part of the [dialog hook family](../root/dialog-root.md) — the dialog surface, and the
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
  mounted: Accessor<boolean>;               // gate the content's render on this
  setRef: (element: HTMLDivElement) => void; // hand to the content element's ref
};
```

Owns presence and the full effect stack, all created in this hook's (the content's) scope so each
tears down when the content unmounts:

- `createPresence` — drives `mounted()` (stays mounted through an exit transition) and the
  `data-presence` attribute.
- `createFocusRestore` (gated on `open()`) → `createFocusTrap` → `createHideOutside` (both gated on
  `isModal()`) → `createDismissable` (Escape / outside pointerdown) → `createScrollLock`. **Creation
  order is load-bearing**: focus-restore must precede the trap and hide-outside so its
  `activeElement` snapshot lands before focus moves and before `inert` blurs the trigger (see
  [`create-focus-restore.md`](../../internal/create-focus-restore/create-focus-restore.md)).

`initialFocus` (when set) is what `createFocusTrap` focuses on open, instead of the first focusable
descendant; it's read lazily at focus time (after mount), so the target may live inside the content.
It belongs here, not on `createDialog` — the focus trap is owned by this part, and no other part
reads it.

Also registers a consumer-supplied `props.id` as the content id (feeds the trigger's `aria-controls`)
via `createRegisteredId`.

Returned `props`: `id`/`role`/`aria-labelledby`/`aria-describedby` fall back to the consumer's value
with `??` against the resolved state accessors (a blind default would strip a consumer's accessible
name); `aria-modal` (present only while modal) and `data-presence` are owned here. `role` defaults to
`"dialog"` but honors a consumer `role="alertdialog"` — the styled `@hope-ui/components` `Dialog`
lifts `role` to `Dialog.Root` and threads it here via context.
