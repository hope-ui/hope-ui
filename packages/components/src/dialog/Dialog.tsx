import {
  composeEventHandlers,
  createComponentContext,
  createControllableState,
  createDismissable,
  createFocusRestore,
  createFocusTrap,
  createHideOutside,
  createPresence,
  createRegisteredElement,
  createRegisteredId,
  createScrollLock,
  ModalBackdrop,
  type RenderProp,
  renderElement,
  withDefaults,
} from "@solid-zero/primitives";
import type { JSX } from "@solidjs/web";
import { isServer, Portal as SolidPortal } from "@solidjs/web";
import { type Component, createSignal, createUniqueId, merge, omit, Show } from "solid-js";

interface DialogContextValue {
  open: () => boolean;
  setOpen: (open: boolean) => void;
  modal: () => boolean;
  /** The Popup's id: a consumer-supplied one if it registered, else a generated one. */
  popupId: () => string;
  setPopupId: (id: string | undefined) => void;
  titleId: () => string | undefined;
  setTitleId: (id: string | undefined) => void;
  descriptionId: () => string | undefined;
  setDescriptionId: (id: string | undefined) => void;
  /**
   * Elements `createHideOutside` must spare *beside* the popup while the dialog is modal: the
   * `ModalBackdrop`, and the consumer's optional `Dialog.Backdrop`. Each part registers its
   * own element, since `Root` never sees them. The popup itself is passed to
   * `createHideOutside` as its `target`, not registered here — see the note there on why the
   * two can't be treated the same way.
   */
  sparedElements: () => Element[];
  addSparedElement: (element: Element) => void;
  removeSparedElement: (element: Element) => void;
}

const [DialogContext, useDialogContext] = createComponentContext<DialogContextValue>("Dialog");

// ---------- Root ----------

export interface DialogRootProps {
  /** Controlled open state. Omit for uncontrolled usage via `defaultOpen`. */
  open?: boolean;
  /** Initial open state for uncontrolled usage. Default `false`. */
  defaultOpen?: boolean;
  /** Called whenever the dialog would open or close. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Whether the dialog is modal. A modal dialog traps focus, locks page scroll, sets
   * `aria-modal`, hides the rest of the page from assistive technology, and blocks pointer
   * interaction with it. Default `true`.
   *
   * When `false`, the dialog is still dismissable (Escape/outside click) and still returns
   * focus to whatever had it before opening, but the page behind stays fully interactive.
   */
  modal?: boolean;
  children?: JSX.Element;
}

export const Root: Component<DialogRootProps> = (props) => {
  // `withDefaults`, not `merge({ modal: true }, props)`: a wrapper forwarding an unset
  // `modal` passes the key with value `undefined`, which `merge` treats as a real
  // override — silently producing a non-modal dialog. See `withDefaults`' doc.
  const merged = withDefaults(props, { defaultOpen: false, modal: true });
  const [titleId, setTitleId] = createSignal<string | undefined>();
  const [descriptionId, setDescriptionId] = createSignal<string | undefined>();

  const [open, setOpen] = createControllableState<boolean>({
    value: () => merged.open,
    defaultValue: () => merged.defaultOpen,
    onChange: (value) => merged.onOpenChange?.(value),
  });

  // `Popup` may register its own consumer-supplied `id`. `Trigger`'s `aria-controls` reads
  // through this accessor so it always names the element that actually exists. The generated
  // id is the server-visible fallback: `createRegisteredId` never runs during SSR.
  const generatedPopupId = createUniqueId();
  const [customPopupId, setCustomPopupId] = createSignal<string | undefined>();
  const popupId = () => customPopupId() ?? generatedPopupId;

  const [sparedElements, setSparedElements] = createSignal<Element[]>([]);
  const addSparedElement = (element: Element) =>
    setSparedElements((previous) =>
      previous.includes(element) ? previous : [...previous, element],
    );
  const removeSparedElement = (element: Element) =>
    setSparedElements((previous) => previous.filter((candidate) => candidate !== element));

  return (
    <DialogContext
      value={{
        open,
        setOpen,
        modal: () => merged.modal,
        popupId,
        setPopupId: setCustomPopupId,
        titleId,
        setTitleId,
        descriptionId,
        setDescriptionId,
        sparedElements,
        addSparedElement,
        removeSparedElement,
      }}
    >
      {merged.children}
    </DialogContext>
  );
};

// ---------- Trigger ----------

export interface DialogTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
}

export const Trigger: Component<DialogTriggerProps> = (props) => {
  const context = useDialogContext();
  const merged = withDefaults(props, { type: "button" as const });
  const rest = omit(merged, "render", "onClick");

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(rest, {
    get "aria-haspopup"() {
      return "dialog" as const;
    },
    get "aria-expanded"() {
      return context.open() ? ("true" as const) : ("false" as const);
    },
    get "aria-controls"() {
      // Only while open. `Popup`'s element exists in the DOM only then, and an IDREF that
      // resolves to nothing is an invalid attribute value per ARIA — axe reports
      // `aria-valid-attr-value` (incomplete) for it, open or closed. Base UI emits it
      // unconditionally; that's the one place this component deliberately doesn't follow it.
      return context.open() ? context.popupId() : undefined;
    },
    // The consumer's handler runs first, and `event.preventDefault()` cancels the open.
    // Composed inside a getter so `merged.onClick` is read in `spread`'s effect rather than
    // eagerly in this component body. The trigger only ever opens — it never toggles, which
    // matches Base UI. Use `Dialog.Close` (or controlled `open`) to close.
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(merged.onClick, () =>
        context.setOpen(true),
      );
    },
  });

  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: merged.render,
    props: elementProps,
  });
};

// ---------- Portal ----------

export interface DialogPortalProps {
  /** Where to portal Backdrop/Popup. Defaults to `document.body`. */
  mount?: Element;
  children?: JSX.Element;
}

export const Portal: Component<DialogPortalProps> = (props) => {
  // @solidjs/web's Portal throws server-side ("Portal is not supported on the
  // server") rather than degrading gracefully, so this must never render it during
  // SSR. `isServer` is a fixed per-environment constant (not a runtime toggle), so a
  // plain `if` is used instead of `<Show>` — there's no reactive branch to track.
  if (isServer) return null;

  const context = useDialogContext();
  const [modalBackdropEl, setModalBackdropEl] = createSignal<HTMLDivElement>();

  // Spare the backdrop from `createHideOutside`. An `inert` element is transparent to hit
  // testing, so a backdrop that hid itself would silently stop blocking the pointer — the one
  // job it exists for.
  createRegisteredElement({
    ref: modalBackdropEl,
    register: context.addSparedElement,
    unregister: context.removeSparedElement,
  });

  return (
    <SolidPortal mount={props.mount}>
      {/* `ModalBackdrop` covers the viewport unconditionally, so an element inserted into the
      page before `createHideOutside`'s MutationObserver has marked it `inert` is still
      unreachable by pointer. It's the Portal's *first* child, before the consumer's optional
      `Dialog.Backdrop` and before `Dialog.Popup`, so it blocks the page behind while leaving
      both of those interactive above it. A modal `Popup` must be positioned; see
      `modal-backdrop.md`.

      Gated on `open()`, matching every other modal behavior (`createFocusTrap`,
      `createHideOutside`, `createScrollLock` all key off `open() && modal()`). A `Popup` with
      an exit transition therefore stops blocking the pointer when `open` flips false rather
      than when the transition ends — consistent with the rest, and the alternative would mean
      `Popup` publishing its presence state back up to `Root`. */}
      <Show when={context.open() && context.modal()}>
        <ModalBackdrop ref={setModalBackdropEl} />
      </Show>
      {props.children}
    </SolidPortal>
  );
};

// ---------- Backdrop ----------

export interface DialogBackdropProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

export const Backdrop: Component<DialogBackdropProps> = (props) => {
  const context = useDialogContext();
  // A real signal, not a plain closure over a `let` — this element only exists as a
  // reactive consequence of `presence.mounted()`, so `createPresence` (reading this ref
  // in the branch that decides whether to wait for an exit transition) must be able to
  // react once it's actually set. See the identical comment in `focus-trap.ts`.
  const [backdropEl, setBackdropEl] = createSignal<HTMLDivElement>();
  const presence = createPresence({ present: context.open, ref: backdropEl });

  // Spare the consumer's backdrop from `createHideOutside`, so it keeps its `:hover` styles,
  // its transitions, and its pointer handlers while the dialog is modal.
  createRegisteredElement({
    ref: backdropEl,
    register: context.addSparedElement,
    unregister: context.removeSparedElement,
  });

  // Internal values fall back to the consumer's rather than overwriting them: `merge`
  // gives the *last* source precedence, so a bare `{ get role() { return "presentation" } }`
  // would silently discard a consumer-supplied `role`. See the same pattern in `Popup`.
  const merged = merge(props, {
    get role() {
      return props.role ?? ("presentation" as const);
    },
    get "data-presence"() {
      return presence.status();
    },
  });
  const rest = omit(merged, "render");

  return (
    <Show when={presence.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: merged.render,
        props: rest,
        ref: setBackdropEl,
      })}
    </Show>
  );
};

// ---------- Popup ----------

export interface DialogPopupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
  /** Explicit element to focus when the dialog opens, instead of the first focusable descendant. */
  initialFocus?: () => HTMLElement | null | undefined;
}

export const Popup: Component<DialogPopupProps> = (props) => {
  const context = useDialogContext();
  // A real signal, not a plain closure over a `let`: this element only exists as a
  // reactive consequence of `presence.mounted()`, so the focus-trap/dismissable effects
  // below (which also react to `open`, and need the ref the moment they activate) must
  // be able to react once it's actually set — not just once, at whatever point their
  // own effect happens to run relative to the effect that creates this element. See the
  // identical comment in `focus-trap.ts`.
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const isModal = () => context.open() && context.modal();

  const presence = createPresence({ present: context.open, ref });

  // Order matters, and it is not stylistic. `createFocusRestore` must be created *before*
  // `createFocusTrap` and `createHideOutside`: sibling effects run in creation order, so this
  // is what makes the restore's `document.activeElement` snapshot happen before the trap moves
  // focus into the popup, and before `inert` on the trigger's ancestor blurs it. Its cleanup
  // runs first too, which is why the restore itself is deferred a microtask — by then the
  // trap's `focusin` listener is detached and the trigger is no longer `inert`, so
  // `.focus()` can actually land. See focus-restore.md.
  //
  // Restore is gated on `open()` alone, the trap on `open() && modal()`. That split is the
  // point: a non-modal dialog isn't focus-trapped, but it must still hand focus back to the
  // trigger — while the two were one primitive, `modal={false}` stranded focus on `<body>`.
  createFocusRestore({ active: context.open });
  createFocusTrap({ active: isModal, ref, initialFocus: props.initialFocus });
  // Modality is three mechanisms. `createHideOutside` covers assistive technology
  // (`aria-hidden`) and the focus order (`inert`); `createFocusTrap` above covers Tab cycling;
  // `ModalBackdrop`, rendered by `Portal`, covers the pointer unconditionally. `aria-modal`
  // alone covers none of them reliably — see hide-outside.md.
  createHideOutside({ active: isModal, target: ref, spare: context.sparedElements });
  createDismissable({ active: context.open, ref, onDismiss: () => context.setOpen(false) });
  createScrollLock({ active: isModal });

  // Register a consumer-supplied `id` with `Root`, so `Trigger`'s `aria-controls` names the
  // element that actually exists. `createRegisteredId` defers the write past Solid 2.0's
  // ban on a descendant writing to an ancestor-owned signal from its render body.
  createRegisteredId({ id: () => props.id, register: context.setPopupId });

  // Internal values fall back to the consumer's rather than overwriting them. `merge` gives
  // the *last* source precedence and treats a getter returning `undefined` as a real value,
  // so `get "aria-labelledby"() { return context.titleId(); }` used to erase a consumer's
  // own `aria-labelledby` whenever no `Dialog.Title` was mounted — leaving the dialog with
  // no accessible name at all. `role` and `id` were unoverridable for the same reason,
  // which made the APG alertdialog pattern unreachable.
  //
  // `aria-modal` and `data-presence` stay internally owned: both are derived from state the
  // consumer doesn't control, and `aria-modal` must be *absent* on a non-modal dialog.
  const merged = merge(props, {
    get id() {
      return props.id ?? context.popupId();
    },
    get role() {
      return props.role ?? ("dialog" as const);
    },
    get "aria-modal"() {
      return context.modal() ? ("true" as const) : undefined;
    },
    get "aria-labelledby"() {
      return props["aria-labelledby"] ?? context.titleId();
    },
    get "aria-describedby"() {
      return props["aria-describedby"] ?? context.descriptionId();
    },
    get "data-presence"() {
      return presence.status();
    },
  });
  const rest = omit(merged, "render", "initialFocus");

  return (
    <Show when={presence.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: merged.render,
        props: rest,
        ref: setRef,
      })}
    </Show>
  );
};

// ---------- Title ----------

export interface DialogTitleProps extends JSX.HTMLAttributes<HTMLHeadingElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLHeadingElement>>;
}

export const Title: Component<DialogTitleProps> = (props) => {
  const context = useDialogContext();
  const generatedId = createUniqueId();
  // `withDefaults` for the same reason as everywhere else: `<Dialog.Title id={props.id}>`
  // with an unset `id` would otherwise resolve to `undefined`, and the dialog would end up
  // with no `aria-labelledby` and no accessible name.
  const merged = withDefaults(props, { id: generatedId });

  createRegisteredId({ id: () => merged.id, register: context.setTitleId });

  const rest = omit(merged, "render");
  return renderElement<JSX.HTMLAttributes<HTMLHeadingElement>>({
    as: "h2",
    render: merged.render,
    props: rest,
  });
};

// ---------- Description ----------

export interface DialogDescriptionProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLParagraphElement>>;
}

export const Description: Component<DialogDescriptionProps> = (props) => {
  const context = useDialogContext();
  const generatedId = createUniqueId();
  const merged = withDefaults(props, { id: generatedId });

  createRegisteredId({ id: () => merged.id, register: context.setDescriptionId });

  const rest = omit(merged, "render");
  return renderElement<JSX.HTMLAttributes<HTMLParagraphElement>>({
    as: "p",
    render: merged.render,
    props: rest,
  });
};

// ---------- Close ----------

export interface DialogCloseProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
}

export const Close: Component<DialogCloseProps> = (props) => {
  const context = useDialogContext();
  const merged = withDefaults(props, { type: "button" as const });
  const rest = omit(merged, "render", "onClick");

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(rest, {
    // As on `Trigger`: the consumer's handler runs first, and `preventDefault()` cancels
    // the close.
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(merged.onClick, () =>
        context.setOpen(false),
      );
    },
  });

  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: merged.render,
    props: elementProps,
  });
};

export const Dialog = { Root, Trigger, Portal, Backdrop, Popup, Title, Description, Close };
