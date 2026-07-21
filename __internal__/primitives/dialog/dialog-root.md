# `createDialog` (dialog hook family)

The headless behavior core of a modal/non-modal dialog, decomposed into one hook per part — the
shape `@hope-ui/components`' `Dialog` is a thin JSX layer over. Modeled on React Aria's
`useDialog`/`useOverlay*` split (its public surface and a11y reasoning, not its code). Exported as
one subpath, `@hope-ui/primitives/dialog`.

| Hook | Owns |
| ---- | ---- |
| `createDialog(options)` | Shared state: open/modal, the content/title/description ids, the spared-element registry. Renders nothing. Call **once**. |
| `createDialogTrigger(state, props)` | The trigger's ARIA + open handler. |
| `createDialogPortal(state)` | The pointer-blocking modal backdrop's spare registration + `showModalBackdrop` gate. |
| `createDialogBackdrop(state, props)` | Optional visible backdrop: owns its **own** presence + spare registration. |
| `createDialogContent(state, props)` | The surface, and the effect hub: focus-restore/focus-trap/hide-outside/dismiss/scroll-lock. Does **not** own presence (see below). |
| `createDialogTitle(state, props)` | Registers its id on the content's `aria-labelledby`. |
| `createDialogDescription(state, props)` | Registers its id on the content's `aria-describedby`. |
| `createDialogCloseTrigger(state, props)` | The close handler. |

Each part hook takes the `createDialog` return (`state`) plus its own props, owns that part's
effects / id-and-element registration / consumer-prop precedence, and returns spreadable `props`
(plus a `setRef` for the content/backdrop). This is why the effect stack lives in
`createDialogContent` (the content's scope), not the root: each effect tears down when the content
unmounts.

**The shared overlay presence lives on `createDialog` itself**, not a part hook. The content is
mounted lazily (only once open), so a presence created inside `createDialogContent` would see
`present` already `true` on its first run and latch straight to `entered` — the card would never
animate in. So the root hook creates **one** shared presence eagerly
(`createPresence({ present: open, ref: contentElement })`) and exposes it as `contentPresence` (plus
the `contentElement` ref it times off). `createDialogContent` and the Positioner both consume it —
gate render on `contentPresence.mounted()`, drive `data-presence` off `contentPresence.status()`.
`createDialogBackdrop` keeps its **own** presence (the backdrop is mounted eagerly, so its first run
correctly sees `present === false`). This split — shared Content/Positioner presence on the root,
separate Backdrop presence per-part — mirrors Ark UI. Because presence is a11y/behavior it belongs in
the kernel, so `createDialog`'s test is a browser test (`createPresence` needs a DOM + owner + rAF) —
the test environment follows the responsibility split, not the reverse.

`role` lives here too (`CreateDialogOptions.role` → `state.role()`): it is an **ARIA** concern, so
`createDialogContent` reads it for the surface's `role` attribute rather than the component threading
it in. The component layer contributes only recipe classes.

## `createDialog(options)`

```ts
function createDialog(options?: {
  open?: boolean;              // controlled; pass a getter for reactive control
  defaultOpen?: boolean;       // uncontrolled initial state, default false
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;             // default true
  closeOnEscape?: boolean;            // Escape dismisses, default true
  closeOnInteractOutside?: boolean;   // outside pointerdown dismisses, default true
}): {
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
  modal: Accessor<boolean>;
  isModal: Accessor<boolean>;                 // open() && modal()
  closeOnEscape: Accessor<boolean>;           // read by createDialogContent's createDismissable
  closeOnInteractOutside: Accessor<boolean>;  // read by createDialogContent's createDismissable
  popupId: Accessor<string>;                  // registered id, else SSR-stable generated fallback
  setPopupId: (id: string | undefined) => void;
  titleId: Accessor<string | undefined>;
  setTitleId: (id: string | undefined) => void;
  descriptionId: Accessor<string | undefined>;
  setDescriptionId: (id: string | undefined) => void;
  sparedElements: Accessor<Element[]>;
  addSparedElement: (element: Element) => void;
  removeSparedElement: (element: Element) => void;
};
```

- `open` / `defaultOpen` / `onOpenChange` — controlled/uncontrolled open state, resolved per-read by
  `createControllableState`. For reactive controlled use pass a getter (`get open() { return
  signal(); }`), exactly as a component prop would.
- `modal` — a modal dialog traps focus, locks scroll, sets `aria-modal`, hides the rest of the page
  (`aria-hidden` + `inert`), and blocks the pointer. `false` keeps the page behind interactive but
  still dismisses and restores focus. `isModal` = `open() && modal()`, the gate every modal-only
  behavior keys off.
- `closeOnEscape` / `closeOnInteractOutside` — the two dismissal toggles, both default `true`. They
  live on the root (a consumer sets them once) but are consumed by `createDialogContent`, which
  forwards them to its `createDismissable` as `dismissOnEscape` / `dismissOnOutsidePointerDown`. The
  returned `closeOnEscape` / `closeOnInteractOutside` accessors exist for that forwarding. See
  `../content/dialog-content.md`.
- `initialFocus` (element to focus on open) is **not** here — it's a prop of `createDialogContent`,
  the part that owns the focus trap and the only consumer. See `../content/dialog-content.md`.
- ids — `popupId` falls back to a generated (SSR-stable) `createUniqueId`; a part publishes a
  consumer id via `setPopupId`/`setTitleId`/`setDescriptionId` (the id-registering part hooks wrap
  `createRegisteredId`, which never runs during SSR — hence the generated fallback).

## Call it once, in an owner scope

`createDialog` runs inside a reactive owner (a component body or `createRoot`). Call it **once** and
share the result: `Dialog.Root` puts it on context; a headless consumer holds it and threads it into
whichever part hooks it needs. The id-registering part hooks must be called from the part that owns
the id, so the registration's cleanup is scoped to that part's unmount.

## SSR

Host-element-free and effect-gated: every `document` touch is inside a part hook's `createEffect`,
which never runs during SSR. The generated `popupId` is an SSR-stable `createUniqueId`, and the one
the root consumes — it fixes the trigger's hydration key (see `__internal__/testing.md` on how `_hk` keys
and the SSR → hydrate round-trip are pinned).
