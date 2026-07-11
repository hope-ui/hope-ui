# `createDialog` (dialog hook family)

The headless behavior core of a modal/non-modal dialog, decomposed into one hook per part — the
shape `@solid-zero/components`' `Dialog` is a thin JSX layer over. Modeled on React Aria's
`useDialog`/`useOverlay*` split (its public surface and a11y reasoning, not its code). Exported as
one subpath, `@solid-zero/primitives/dialog`.

| Hook | Owns |
| ---- | ---- |
| `createDialog(options)` | Shared state: open/modal, the popup/title/description ids, the spared-element registry, `initialFocus`. Renders nothing. Call **once**. |
| `createDialogTrigger(state, props)` | The trigger's ARIA + open handler. |
| `createDialogPortal(state)` | The pointer-blocking modal backdrop's spare registration + `showModalBackdrop` gate. |
| `createDialogBackdrop(state, props)` | Optional visible backdrop: presence + spare registration. |
| `createDialogPopup(state, props)` | The surface, and the effect hub: presence + focus-restore/focus-trap/hide-outside/dismiss/scroll-lock. |
| `createDialogTitle(state, props)` | Registers its id on the popup's `aria-labelledby`. |
| `createDialogDescription(state, props)` | Registers its id on the popup's `aria-describedby`. |
| `createDialogClose(state, props)` | The close handler. |

Each part hook takes the `createDialog` return (`state`) plus its own props, owns that part's
effects / id-and-element registration / consumer-prop precedence, and returns spreadable `props`
(plus a `setRef` and a presence `mounted` accessor for the popup/backdrop). This is why the effect
stack lives in `createDialogPopup` (the popup's scope), not the root: each effect tears down when the
popup unmounts.

## `createDialog(options)`

```ts
function createDialog(options?: {
  open?: boolean;              // controlled; pass a getter for reactive control
  defaultOpen?: boolean;       // uncontrolled initial state, default false
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;             // default true
  initialFocus?: Accessor<HTMLElement | null | undefined>;
}): {
  open: Accessor<boolean>;
  setOpen: (open: boolean) => void;
  modal: Accessor<boolean>;
  isModal: Accessor<boolean>;                 // open() && modal()
  initialFocus: Accessor<HTMLElement | null | undefined>;
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
- `initialFocus` — element to focus on open instead of the first focusable descendant. Read by
  `createDialogPopup`'s focus trap; lives at the root so it is available before the popup mounts.
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
the root consumes — it fixes the trigger's hydration key (see the `Dialog` component's
`__fixtures__/README.md`).
