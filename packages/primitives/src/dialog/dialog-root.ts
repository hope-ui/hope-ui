import { type Accessor, createSignal, createUniqueId } from "solid-js";
import {
  createControllableState,
  createPresence,
  type DismissBubbles,
  type PresenceState,
} from "../internal";
import { withDefaults } from "../utils";

/**
 * The shared state kernel of a dialog — one call at the root of the tree. It owns open state, the
 * popup/title/description ids and the spared-element registry, and renders **no JSX and no host
 * element**. Each part hook (`createDialogTrigger`, `createDialogContent`, …) takes this state plus
 * its own props and owns the rest: its effects, its id/element registration, its prop precedence.
 *
 * It also owns the single *shared* content presence — the state that keeps an element mounted
 * through its exit animation — and the content element ref, because presence must be created
 * **eagerly**, while the dialog is still closed. `Dialog.Content` mounts only once open, so a
 * presence created inside `createDialogContent` would see `present` already `true` on its first run
 * and latch straight to `"entered"`, skipping the enter animation. Content and positioner share
 * this one; the backdrop mounts eagerly, so `createDialogBackdrop` keeps its own.
 *
 * It deliberately does **not** own the focus/dismiss/hide-outside/scroll effect stack — those
 * belong to `createDialogContent`, so each effect lives in the content element's own scope and
 * tears down when it unmounts.
 *
 * Call it **once**, inside a reactive owner scope (a component body, or a `createRoot`). Full
 * rationale: `__internal__/primitives/dialog/dialog-root.md`.
 */

/** The dialog's ARIA role. `alertdialog` is the ARIA Authoring Practices Guide's pattern for a
 * destructive confirmation. */
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
   * Whether an Escape / outside pointerdown that closes a layer opened **above** this dialog also
   * closes the dialog. Default: neither — the topmost layer alone dismisses. Forwarded by
   * `createDialogContent` to `createDismissable`'s `bubbles`.
   */
  bubbles?: DismissBubbles;
  /** ARIA role — `"dialog"` (default) or `"alertdialog"`. Read by `createDialogContent` for the
   * surface's `role` attribute. */
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
  /** Whether a dismissal handled by a layer above also closes this one. Read by
   * `createDialogContent`'s `createDismissable`. */
  bubbles: Accessor<DismissBubbles | undefined>;

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
  // `withDefaults`, never `merge({ modal: true }, options)`: `merge` resolves by key *presence*, so
  // a wrapper forwarding an unset `modal` would silently beat the default. See `withDefaults`' doc.
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
  // No `withDefaults` entry: an absent `bubbles` already means "neither channel" to
  // `createDismissable`.
  const bubbles = () => merged.bubbles;
  const role = () => merged.role;

  // The generated id is the server-visible fallback: `createRegisteredId` runs in an effect, and
  // effects never run during SSR, so a consumer-pinned id cannot be registered server-side.
  // Keep it the root's only `createUniqueId` call and keep it here: Solid matches server and client
  // nodes positionally, and reserving another id ahead of it shifts the trigger's hydration key
  // (`_hk`) on one side only. See `__internal__/testing.md`.
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

  // Keep this after the `createUniqueId` above: anything created ahead of it can change which id
  // the popup gets, and the trigger's hydration key with it. Created eagerly — while `open` is
  // still `false` — so opening drives `entering → entered`; see this hook's doc.
  const [contentElement, setContentElement] = createSignal<HTMLElement>();
  const contentPresence = createPresence({ present: open, ref: contentElement });

  return {
    open,
    setOpen,
    modal,
    isModal,
    closeOnEscape,
    closeOnInteractOutside,
    bubbles,
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
