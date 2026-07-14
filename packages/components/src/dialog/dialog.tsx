import {
  type CreateDialogOptions,
  type CreateDialogPopupProps,
  type CreateDialogReturn,
  createDialog,
  createDialogBackdrop,
  createDialogClose,
  createDialogDescription,
  createDialogPopup,
  createDialogPortal,
  createDialogTitle,
  createDialogTrigger,
} from "@hope-ui/primitives/dialog";
import { createComponentContext } from "@hope-ui/primitives/internal";
import { ModalBackdrop } from "@hope-ui/primitives/modal-backdrop";
import { type RenderProp, renderElement } from "@hope-ui/primitives/utils";
import type { JSX } from "@solidjs/web";
import { isServer, Portal as SolidPortal } from "@solidjs/web";
import { type Component, omit, Show } from "solid-js";

// Dialog is a thin JSX layer over the `createDialog` hook family (`@hope-ui/primitives/dialog`).
// `Root` calls `createDialog` once for the shared state (open/modal/ids/spared registry) and puts
// it on context; every other part reads that state, calls its own `createDialogX(state, props)`
// hook — which owns that part's effects, id/element registration, and consumer-prop precedence —
// and renders the returned props through `renderElement`. The component owns only markup and
// `render`-prop polymorphism. See `createDialog.md`.
const [DialogContext, useDialogContext] = createComponentContext<CreateDialogReturn>("Dialog");

// ---------- Root ----------

export interface DialogRootProps extends CreateDialogOptions {
  children?: JSX.Element;
}

export const Root: Component<DialogRootProps> = (props) => {
  const dialog = createDialog(props);
  return <DialogContext value={dialog}>{props.children}</DialogContext>;
};

// ---------- Trigger ----------

export interface DialogTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
}

export const Trigger: Component<DialogTriggerProps> = (props) => {
  const state = useDialogContext();
  const trigger = createDialogTrigger(state, omit(props, "render"));

  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: props.render,
    props: trigger.props,
  });
};

// ---------- Portal ----------

export interface DialogPortalProps {
  /** Where to portal Backdrop/Popup. Defaults to `document.body`. */
  mount?: Element;
  children?: JSX.Element;
}

export const Portal: Component<DialogPortalProps> = (props) => {
  // @solidjs/web's Portal throws server-side ("Portal is not supported on the server") rather
  // than degrading gracefully, so this must never render it during SSR. `isServer` is a fixed
  // per-environment constant, so a plain `if` (not `<Show>`) — there's no reactive branch.
  if (isServer) {
    return null;
  }

  const state = useDialogContext();
  const portal = createDialogPortal(state);

  return (
    <SolidPortal mount={props.mount}>
      {/* `ModalBackdrop` covers the viewport unconditionally, so an element inserted before
      hide-outside's MutationObserver marks it `inert` is still unreachable by pointer. It's the
      Portal's *first* child — before a consumer `Dialog.Backdrop` and the `Dialog.Popup` — so it
      blocks the page behind while leaving both interactive above it. Its ref is spared from
      hide-outside by `createDialogPortal`. A modal `Popup` must be positioned; see
      `modal-backdrop.md`. */}
      <Show when={portal.showModalBackdrop()}>
        <ModalBackdrop ref={portal.setModalBackdropRef} />
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
  const state = useDialogContext();
  const backdrop = createDialogBackdrop(state, omit(props, "render"));

  return (
    <Show when={backdrop.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: backdrop.props,
        ref: backdrop.setRef,
      })}
    </Show>
  );
};

// ---------- Popup ----------

export interface DialogPopupProps extends CreateDialogPopupProps {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

export const Popup: Component<DialogPopupProps> = (props) => {
  const state = useDialogContext();
  const popup = createDialogPopup(state, omit(props, "render"));

  return (
    <Show when={popup.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: popup.props,
        ref: popup.setRef,
      })}
    </Show>
  );
};

// ---------- Title ----------

export interface DialogTitleProps extends JSX.HTMLAttributes<HTMLHeadingElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLHeadingElement>>;
}

export const Title: Component<DialogTitleProps> = (props) => {
  const state = useDialogContext();
  const title = createDialogTitle(state, omit(props, "render"));

  return renderElement<JSX.HTMLAttributes<HTMLHeadingElement>>({
    as: "h2",
    render: props.render,
    props: title.props,
  });
};

// ---------- Description ----------

export interface DialogDescriptionProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLParagraphElement>>;
}

export const Description: Component<DialogDescriptionProps> = (props) => {
  const state = useDialogContext();
  const description = createDialogDescription(state, omit(props, "render"));

  return renderElement<JSX.HTMLAttributes<HTMLParagraphElement>>({
    as: "p",
    render: props.render,
    props: description.props,
  });
};

// ---------- Close ----------

export interface DialogCloseProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
}

export const Close: Component<DialogCloseProps> = (props) => {
  const state = useDialogContext();
  const close = createDialogClose(state, omit(props, "render"));

  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: props.render,
    props: close.props,
  });
};

export const Dialog = { Root, Trigger, Portal, Backdrop, Popup, Title, Description, Close };
