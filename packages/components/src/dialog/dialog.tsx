import { CloseButton, type CloseButtonProps } from "@hope-ui/components/close-button";
import {
  type CreateDialogContentProps,
  type CreateDialogOptions,
  type CreateDialogReturn,
  createDialog,
  createDialogBackdrop,
  createDialogCloseTrigger,
  createDialogContent,
  createDialogDescription,
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
  /** Where to portal Backdrop/Content. Defaults to `document.body`. */
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
      Portal's *first* child — before a consumer `Dialog.Backdrop` and the `Dialog.Content` — so it
      blocks the page behind while leaving both interactive above it. Its ref is spared from
      hide-outside by `createDialogPortal`. A modal `Content` must be positioned; see
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

// ---------- Content ----------

export interface DialogContentProps extends CreateDialogContentProps {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

export const Content: Component<DialogContentProps> = (props) => {
  const state = useDialogContext();
  const content = createDialogContent(state, omit(props, "render"));

  return (
    <Show when={content.mounted()}>
      {renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
        as: "div",
        render: props.render,
        props: content.props,
        ref: content.setRef,
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

// ---------- CloseTrigger ----------

// `Dialog.CloseTrigger` is a `CloseButton` with the dialog's close wiring — so it inherits
// `size`/`icon`/`render`/`class`/`slotClasses`/native attrs for free, and shows the themed X by
// default. Because it renders a recipe-styled `CloseButton`, `Dialog.CloseTrigger` now **requires a
// `<ThemeProvider>`** ancestor, like every other styled component (see `Dialog.md`).
export interface DialogCloseTriggerProps extends CloseButtonProps {}

export const CloseTrigger: Component<DialogCloseTriggerProps> = (props) => {
  const state = useDialogContext();
  // The primitive owns only the close `onClick` (composed in front of the consumer's, so their
  // `preventDefault()` cancels the close). The label + visual + `type` default come from `CloseButton`.
  // `render` is passed to `CloseButton` directly (not through the spread) — it is read synchronously
  // to build the element, so a reactive spread-read would trip `STRICT_READ_UNTRACKED`.
  const close = createDialogCloseTrigger(state, omit(props, "render"));

  // `close.props` is typed as the primitive's `JSX.ButtonHTMLAttributes` (the hook can't reference the
  // component's `CloseButtonProps` without a layering cycle), which widens `disabled` to Solid's
  // `boolean | ""`. It still carries the consumer's `size`/`icon`/etc. at runtime, so cast back to the
  // component surface for the spread.
  return <CloseButton {...(close.props as CloseButtonProps)} render={props.render} />;
};

export const Dialog = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Content,
  Title,
  Description,
  CloseTrigger,
};
