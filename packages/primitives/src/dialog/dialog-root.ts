import { type Accessor, createSignal, createUniqueId } from "solid-js";
import { createControllableState, createPresence, type PresenceState } from "../internal";
import { withDefaults } from "../utils";

/**
 * The shared state kernel of a dialog — the one call at the root of the tree. It owns open
 * state, the popup/title/description ids, and the spared-element registry, and it renders **no
 * JSX and no host element**. The per-part hooks (`createDialogTrigger`, `createDialogContent`,
 * `createDialogBackdrop`, `createDialogPortal`, `createDialogCloseTrigger`, `createDialogTitle`,
 * `createDialogDescription`) each take this state plus their own props and own the rest — their
 * effects, their id/element registration, and their consumer-prop precedence. `Dialog.Root` calls
 * this once and shares the return on context; a headless consumer holds it and threads it into
 * whichever part hooks it needs.
 *
 * Owns the **shared overlay presence** (`contentPresence`) and the content element ref
 * (`contentElement`), because these are the one piece of dialog behavior that must be created
 * *eagerly* (while closed) and shared across parts. `Dialog.Content` is mounted lazily — only once
 * open — so a presence created inside `createDialogContent` would see `present` already `true` on
 * its first run and latch straight to `"entered"`, skipping the enter animation. Created here, its
 * first run observes `open === false`, so opening drives `entering → entered`. Both the content and
 * the (transition-less) positioner consume this one presence; `createDialogBackdrop` keeps its own
 * (the backdrop is mounted eagerly, so per-part is correct there). Mirrors Ark UI's split.
 *
 * Deliberately does **not** own the focus/dismiss/hide-outside/scroll effect **stack**, nor the
 * per-part refs those effects read: those belong to the part that renders the element
 * (`createDialogContent`), so each effect lives in that element's own scope and tears down when it
 * unmounts. This split mirrors React Aria's `useDialog`/`useOverlay*` decomposition (its public
 * surface and a11y reasoning, not its code).
 *
 * Call it **once**, inside a reactive owner scope (a component body, or a `createRoot`).
 */

/** The dialog's ARIA role. `alertdialog` is the APG destructive-confirmation pattern. */
export type DialogRole = "dialog" | "alertdialog";

export interface CreateDialogOptions {
  /** Controlled open state. Omit for uncontrolled use via `defaultOpen`. For reactive control,
   * pass a getter (`get open() { return signal(); }`), exactly as a component prop would. */
  open?: boolean;
  /** Initial open state, uncontrolled. Default `false`. */
  defaultOpen?: boolean;
  /** Called whenever the dialog would open or close. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the dialog is modal. A modal dialog traps focus, locks page scroll, sets
   * `aria-modal`, hides the rest of the page from assistive technology, and blocks pointer
   * interaction. When `false`, it is still dismissable and still restores focus, but the page
   * behind stays interactive. Default `true`.
   */
  modal?: boolean;
  /**
   * Whether pressing Escape closes the dialog. Forwarded by `createDialogContent` to
   * `createDismissable`'s `dismissOnEscape`. Default `true`.
   */
  closeOnEscape?: boolean;
  /**
   * Whether a pointerdown outside the content closes the dialog. Forwarded by `createDialogContent`
   * to `createDismissable`'s `dismissOnOutsidePointerDown`. Default `true`.
   */
  closeOnInteractOutside?: boolean;
  /**
   * ARIA role — `"dialog"` (default) or `"alertdialog"` (the APG destructive-confirmation pattern).
   * An accessibility concern, so it lives on the state hook (not the styling layer): `createDialogContent`
   * reads it for the surface's `role` attribute.
   */
  role?: DialogRole;
}

export interface CreateDialogReturn {
  /** Current open state. */
  open: Accessor<boolean>;
  /** Request an open/close. Honors controlled mode and fires `onOpenChange`. */
  setOpen: (open: boolean) => void;
  /** Whether the dialog is modal. */
  modal: Accessor<boolean>;
  /** The ARIA role (`"dialog"` | `"alertdialog"`). Read by `createDialogContent` for the surface. */
  role: Accessor<DialogRole>;
  /** `open() && modal()` — the gate every modal-only behavior keys off. */
  isModal: Accessor<boolean>;
  /** Whether Escape closes the dialog. Read by `createDialogContent`'s `createDismissable`. */
  closeOnEscape: Accessor<boolean>;
  /** Whether an outside pointerdown closes the dialog. Read by `createDialogContent`'s `createDismissable`. */
  closeOnInteractOutside: Accessor<boolean>;

  /** The popup's id: a registered consumer id if any, else a generated (SSR-stable) fallback. */
  popupId: Accessor<string>;
  /** Register a consumer-supplied popup id (feeds the trigger's `aria-controls`). Called by
   * `createDialogContent` from the content's own scope, via `createRegisteredId`. */
  setPopupId: (id: string | undefined) => void;
  /** The registered title id, or `undefined` — the popup's `aria-labelledby` fallback. */
  titleId: Accessor<string | undefined>;
  /** Register a title id. Called by `createDialogTitle` from the title's own scope. */
  setTitleId: (id: string | undefined) => void;
  /** The registered description id, or `undefined` — the popup's `aria-describedby` fallback. */
  descriptionId: Accessor<string | undefined>;
  /** Register a description id. Called by `createDialogDescription` from its own scope. */
  setDescriptionId: (id: string | undefined) => void;

  /** Elements `createDialogContent`'s hide-outside must spare beside the content while modal: the
   * pointer-blocking modal backdrop and any consumer backdrop. */
  sparedElements: Accessor<Element[]>;
  /** Add an element to the spared set (idempotent). */
  addSparedElement: (element: Element) => void;
  /** Remove an element from the spared set. */
  removeSparedElement: (element: Element) => void;

  /** The content element. Set via `createDialogContent`'s `setRef`; read by the shared presence
   * (exit timing) and the content's focus/dismiss effects. */
  contentElement: Accessor<HTMLElement | undefined>;
  /** Register the content element. Wired to `createDialogContent`'s `setRef`. */
  setContentElement: (element: HTMLElement | undefined) => void;
  /** The **shared** overlay presence for `Content` + `Positioner` (see this hook's doc). Gate their
   * render on `mounted()` and drive `data-presence` off `status()`. Created eagerly here so the
   * enter animation fires. `Backdrop` keeps its own. */
  contentPresence: PresenceState;
}

export function createDialog(options: CreateDialogOptions = {}): CreateDialogReturn {
  // `withDefaults`, not `merge({ modal: true }, options)`: `merge` resolves by key *presence*, so
  // a wrapper forwarding an unset `modal`/`defaultOpen` (the key present with value `undefined`)
  // would silently beat the default. See `withDefaults`' doc.
  const merged = withDefaults(options, {
    defaultOpen: false,
    modal: true,
    closeOnEscape: true,
    closeOnInteractOutside: true,
    role: "dialog" as DialogRole,
  });

  const [open, setOpen] = createControllableState<boolean>({
    value: () => merged.open,
    defaultValue: () => merged.defaultOpen,
    onChange: (value) => merged.onOpenChange?.(value),
  });
  const modal = () => merged.modal;
  const isModal = () => open() && modal();
  const closeOnEscape = () => merged.closeOnEscape;
  const closeOnInteractOutside = () => merged.closeOnInteractOutside;
  const role = () => merged.role;

  // The generated id is the server-visible fallback: `createRegisteredId` never runs during SSR,
  // so a consumer-pinned id can't be registered server-side. This is the only `createUniqueId`
  // the root consumes, and it fixes the trigger's SSR hydration key — see the fixtures README.
  const generatedPopupId = createUniqueId();
  const [customPopupId, setCustomPopupId] = createSignal<string | undefined>();
  const popupId = () => customPopupId() ?? generatedPopupId;
  const [titleId, setTitleId] = createSignal<string | undefined>();
  const [descriptionId, setDescriptionId] = createSignal<string | undefined>();

  const [sparedElements, setSparedElements] = createSignal<Element[]>([]);
  const addSparedElement = (element: Element) =>
    setSparedElements((previous) =>
      previous.includes(element) ? previous : [...previous, element],
    );
  const removeSparedElement = (element: Element) =>
    setSparedElements((previous) => previous.filter((candidate) => candidate !== element));

  // The content element + the ONE shared overlay presence. Created after `createUniqueId` above so
  // the trigger's SSR hydration key is unaffected by the id `createPresence` reserves. Eager
  // (created while `open` is `false`) so opening drives `entering → entered` — see this hook's doc.
  const [contentElement, setContentElement] = createSignal<HTMLElement>();
  const contentPresence = createPresence({ present: open, ref: contentElement });

  return {
    open,
    setOpen,
    modal,
    isModal,
    closeOnEscape,
    closeOnInteractOutside,
    role,
    popupId,
    setPopupId: setCustomPopupId,
    titleId,
    setTitleId,
    descriptionId,
    setDescriptionId,
    sparedElements,
    addSparedElement,
    removeSparedElement,
    contentElement,
    setContentElement: (element) => setContentElement(element),
    contentPresence,
  };
}
