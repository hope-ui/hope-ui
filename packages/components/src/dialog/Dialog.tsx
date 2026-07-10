import {
  createComponentContext,
  createDismissable,
  createFocusTrap,
  createPresence,
  createScrollLock,
  type RenderProp,
  renderElement,
} from "@solid-zero/primitives";
import type { JSX } from "@solidjs/web";
import { isServer, Portal as SolidPortal } from "@solidjs/web";
import {
  type Component,
  createSignal,
  createUniqueId,
  merge,
  omit,
  onSettled,
  Show,
} from "solid-js";

function callEventHandler<T, E extends Event>(
  handler: JSX.EventHandlerUnion<T, E> | undefined,
  event: E & { currentTarget: T; target: Element },
): void {
  if (typeof handler === "function") {
    handler(event);
  } else if (Array.isArray(handler)) {
    handler[0](handler[1], event);
  }
}

/** Combines an internal ref-setter with a possibly-absent consumer-supplied ref. */
function mergeRefs<T>(
  internal: (element: T) => void,
  external: JSX.Ref<T> | undefined,
): JSX.Ref<T> {
  return external === undefined ? internal : [internal, external];
}

/** Normalizes an attribute value that may be `false` (dom-expressions' "omit this
 * attribute" convention) down to `undefined`. */
function stringOrUndefined(value: string | false | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

interface DialogContextValue {
  open: () => boolean;
  setOpen: (open: boolean) => void;
  modal: () => boolean;
  popupId: string;
  titleId: () => string | undefined;
  setTitleId: (id: string | undefined) => void;
  descriptionId: () => string | undefined;
  setDescriptionId: (id: string | undefined) => void;
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
   * Whether the dialog is modal: traps focus, locks page scroll, and sets `aria-modal`.
   * Default `true`. When `false`, the dialog can still be dismissed (Escape/outside
   * click) but doesn't trap focus or block page interaction.
   */
  modal?: boolean;
  children?: JSX.Element;
}

export const Root: Component<DialogRootProps> = (props) => {
  const merged = merge({ defaultOpen: false, modal: true }, props);
  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(merged.defaultOpen);
  const [titleId, setTitleId] = createSignal<string | undefined>();
  const [descriptionId, setDescriptionId] = createSignal<string | undefined>();
  const popupId = createUniqueId();

  const open = () => merged.open ?? uncontrolledOpen();
  const setOpen = (value: boolean) => {
    if (merged.open === undefined) setUncontrolledOpen(value);
    merged.onOpenChange?.(value);
  };

  return (
    <DialogContext
      value={{
        open,
        setOpen,
        modal: () => merged.modal,
        popupId,
        titleId,
        setTitleId,
        descriptionId,
        setDescriptionId,
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
  const merged = merge({ type: "button" as const }, props);
  const rest = omit(merged, "render", "onClick");

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(rest, {
    get "aria-haspopup"() {
      return "dialog" as const;
    },
    get "aria-expanded"() {
      return context.open() ? ("true" as const) : ("false" as const);
    },
    get "aria-controls"() {
      return context.popupId;
    },
    onClick: (event: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }) => {
      callEventHandler(merged.onClick, event);
      context.setOpen(true);
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
  return <SolidPortal mount={props.mount}>{props.children}</SolidPortal>;
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

  const merged = merge(props, {
    get role() {
      return "presentation" as const;
    },
    get "data-status"() {
      return presence.status();
    },
  });
  const rest = omit(merged, "render");

  return (
    <Show when={presence.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>>({
        as: "div",
        render: merged.render,
        props: merge(rest, { ref: mergeRefs<HTMLDivElement>(setBackdropEl, props.ref) }),
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

  const presence = createPresence({ present: context.open, ref });
  createFocusTrap({
    active: () => context.open() && context.modal(),
    ref,
    initialFocus: props.initialFocus,
  });
  createDismissable({ active: context.open, ref, onDismiss: () => context.setOpen(false) });
  createScrollLock({ active: () => context.open() && context.modal() });

  const merged = merge(props, {
    id: context.popupId,
    get role() {
      return "dialog" as const;
    },
    get "aria-modal"() {
      return context.modal() ? ("true" as const) : undefined;
    },
    get "aria-labelledby"() {
      return context.titleId();
    },
    get "aria-describedby"() {
      return context.descriptionId();
    },
    get "data-status"() {
      return presence.status();
    },
  });
  const rest = omit(merged, "render", "initialFocus");

  return (
    <Show when={presence.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>>({
        as: "div",
        render: merged.render,
        props: merge(rest, { ref: mergeRefs<HTMLDivElement>(setRef, props.ref) }),
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
  const merged = merge({ id: generatedId }, props);

  // Solid 2.0 forbids writing to a signal owned by an ancestor scope (here, Root's
  // titleId) directly from a descendant component's own synchronous render body
  // ([REACTIVE_WRITE_IN_OWNED_SCOPE]). Deferring to `onSettled` moves the write out of
  // that owned-scope call stack. This never risks an SSR/hydration mismatch here
  // because Title only ever exists inside Dialog.Portal, which itself never renders
  // during SSR (see Portal's isServer guard) — so there's no server-rendered
  // `aria-labelledby` value for a later client-only id write to disagree with.
  onSettled(() => {
    context.setTitleId(stringOrUndefined(merged.id));
    return () => context.setTitleId(undefined);
  });

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
  const merged = merge({ id: generatedId }, props);

  // See the identical comment in `Title` above for why this is deferred to `onSettled`.
  onSettled(() => {
    context.setDescriptionId(stringOrUndefined(merged.id));
    return () => context.setDescriptionId(undefined);
  });

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
  const merged = merge({ type: "button" as const }, props);
  const rest = omit(merged, "render", "onClick");

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(rest, {
    onClick: (event: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }) => {
      callEventHandler(merged.onClick, event);
      context.setOpen(false);
    },
  });

  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: merged.render,
    props: elementProps,
  });
};

export const Dialog = { Root, Trigger, Portal, Backdrop, Popup, Title, Description, Close };
