# `createComboboxContent`

The content part of the [combobox hook family](combobox-root.md): the popup card, and the behavior
hub. It owns the effect stack — dismissal, hide-outside and scroll lock — all created in this scope,
so each tears down when the popup unmounts.

```ts
function createComboboxContent<V, M extends SelectionMode>(
  state: CreateComboboxReturn<V, M>,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): {
  props: JSX.HTMLAttributes<HTMLDivElement> & { "data-presence": PresenceStatus };
  mounted: Accessor<boolean>;
  setRef: (element: HTMLDivElement) => void;
};
```

Everything the consumer passes is forwarded; only `data-presence` is owned here.

## It is not the listbox

`Content` and [`List`](combobox-list.md) stay distinct parts because `role="listbox"` may contain only
options and groups. A Combobox's `Empty` ("No product found.") and `Status` (the `createAnnounce` live
region) have to live in the **card**, beside the list rather than inside it — so the card cannot be the
listbox.

Consequently this part emits **no `role`** and no `aria-modal`: the layer is not a dialog, and it never
claims to be one. It does not create presence either — `createCombobox` owns the single shared popup
presence eagerly and this part *reflects* it (`mounted`, `data-presence`), the same one the Positioner
reflects. Creating one here would recreate the enter-animation bug: this part mounts lazily on open, so
its own presence would see `present` already `true` on the first run and latch straight to `entered`.

## Modality: two mechanisms, and the trigger spared from both

| | Gated on |
| --- | --- |
| `createDismissable` | `state.open()` |
| `createHideOutside` — `aria-hidden` **and** `inert` outside the popup | `state.open() && state.modal()` |
| `createScrollLock` | `state.open() && state.modal()` |

`modal` defaults to `true`; Combobox passes `false`.

There is **no focus trap** — focus never leaves the trigger in activedescendant mode, so there is
nothing to trap — and **no `ModalBackdrop`**, which would cover the trigger, making it unclickable and
breaking toggle-to-close. React Aria's Select composes exactly this pair (`usePreventScroll` +
`ariaHideOutside`). See [`combobox-root.md`](combobox-root.md) § *Modality is two mechanisms*.

**`state.sparedElements` — the trigger — feeds both `createHideOutside`'s `spare` and
`createDismissable`'s `exclude`.** It is one requirement wearing two mechanisms, and dropping it from
either breaks the same feature a different way:

- no `exclude` → a pointerdown on the trigger dismisses in the capture phase and the trigger's own
  `click` reopens, so the popup can never be closed by the control that opened it;
- no `spare` → the trigger is `inert` while the popup is open, so it loses focus, the pointer, and the
  same toggle.

**`createHideOutside` does nothing at all until its `target` resolves.** A run without the popup in the
spared set would make the popup itself `inert` — blurring whatever holds focus and stranding it on
`<body>` permanently. The primitive gates on this itself; the reason it must is recorded here because
this is the call site.

`aria-hidden` and `inert` are both applied, deliberately: `aria-hidden` alone leaves the background
focusable and clickable, and `inert` alone does **not** remove content from the accessibility tree as
far as ARIA tooling is concerned.

## Dismissal

The three toggles and `bubbles` come from the root state, so a consumer sets them once on
`createCombobox` and this part forwards them — as **getters**, because `createDismissable` reads them
live inside its keydown/pointerdown/focusin handlers (and a plain read here would be a
`STRICT_READ_UNTRACKED`).

`closeOnFocusOutside` defaults to `true`, unlike `createDismissable`'s own default: nothing here traps
focus, so tabbing away must not leave an orphaned popup behind. The trigger being `exclude`d is what
keeps the *opening* click — which focuses the trigger — from reading as focus landing outside.

Escape is handled twice, on purpose and idempotently: the trigger's keymap closes it (that is where
focus is), and `createDismissable`'s document-level listener covers the case where focus drifted into
the popup. Neither calls the other; `setOpen` drops a request that matches the current state.

## SSR

No `role` computation, no ids, and every effect is client-only —
`createDismissable`/`createHideOutside`/`createScrollLock` all gate their DOM access inside
`createEffect`, so no `isServer` import is needed. In practice this part renders inside a `Portal`,
which does not render server-side at all.

## Rejected alternatives

### Putting `role="listbox"` on the content and dropping the `List` part
**Why not:** `role="listbox"` may contain only options and groups, so a Combobox's `Empty` and `Status`
would have nowhere legal to live — and moving them out of the card later is a breaking anatomy change.
One extra part now buys the whole Combobox surface later. Popover/Dialog's `Portal → Positioner →
Content` spine is unaffected either way.

### Registering `popupId` here, as `createPopoverContent`/`createDialogContent` do
**Why not:** `aria-controls` must name the element carrying `role="listbox"`, and that is the List, not
the card. Registering the card's id would point assistive technology at a wrapper whose role says
nothing.

### Modality as Dialog does it — `createFocusTrap` + `ModalBackdrop`
**Why not:** the trap has nothing to cage (focus never leaves the trigger), and the backdrop covers the
trigger, so the control that opened the popup can no longer close it — the exact fight `exclude` exists
to end. Verified in the browser: a backdrop that spares itself from `inert` still blocks the pointer
unconditionally, which is precisely the problem here.

### Separate `spare` and `exclude` sets on the root
**Why not:** two names for one array invites them to drift, and every failure mode is the same feature
breaking. The single `sparedElements` says what the trigger *is* — the element modality must not touch
— rather than naming one of the two mechanisms that touch it.

### `dismissOnFocusOutside` left at `createDismissable`'s default (`false`)
**Why not:** that default exists for a **modal, focus-trapped** layer, where the listener is dead
weight. Nothing traps focus here, so a Tab away from the trigger would leave the popup open with focus
somewhere else entirely — the same reasoning that made Popover flip the default.

### Emitting `data-side` / `data-align` here too, as `createPopoverContent` does
**Why not:** the placement is a fact about the element being measured, and copying it onto a second
element is one more thing to keep in sync for a card that can read it from its parent with one
`group-data-[side=…]:`. The Positioner owns it; see
[`combobox-positioner.md`](combobox-positioner.md).
