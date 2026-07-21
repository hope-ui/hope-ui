import { createDialogPortal } from "@hope-ui/primitives/dialog";
import { ModalBackdrop } from "@hope-ui/primitives/modal-backdrop";
import type { JSX } from "@solidjs/web";
import { isServer, Portal as SolidPortal } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import { useDialogContext } from "./dialog-context";

export interface DialogPortalProps {
  /** Where to portal Backdrop/Content. Defaults to `document.body`. */
  mount?: Element;
  children?: JSX.Element;
}

// The portal renders no recipe slot of its own — its job is the client-only portal + the kernel's
// pointer-blocking `ModalBackdrop` (the scrim's *look* is the optional `Dialog.Backdrop`).
export const Portal: Component<DialogPortalProps> = (props) => {
  // @solidjs/web's Portal throws server-side ("Portal is not supported on the server") rather
  // than degrading gracefully, so this must never render it during SSR. `isServer` is a fixed
  // per-environment constant, so a plain `if` (not `<Show>`) — there's no reactive branch.
  if (isServer) {
    return null;
  }

  const ctx = useDialogContext();
  const portal = createDialogPortal(ctx.state);

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
