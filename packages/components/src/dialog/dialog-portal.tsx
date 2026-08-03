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

// Two jobs, neither of them styling: move Backdrop/Content out to `document.body`, and render the
// invisible layer that blocks the pointer. The scrim a user actually *sees* is `Dialog.Backdrop`.
export const Portal: Component<DialogPortalProps> = (props) => {
  // `@solidjs/web`'s Portal throws server-side ("Portal is not supported on the server") instead of
  // degrading, so it must never be reached during SSR. A plain `if`, not `<Show>`: `isServer` is a
  // build-time constant, so there is no reactive branch to track.
  if (isServer) {
    return null;
  }

  const ctx = useDialogContext();
  const portal = createDialogPortal(ctx.state);

  return (
    <SolidPortal mount={props.mount}>
      {/* A full-viewport layer that swallows clicks unconditionally. It is needed because the other
      half of modality marks background elements `inert` (removing them from focus order and hit
      testing) through a MutationObserver, and anything inserted before that observer reacts would
      still be clickable. Rendered as the *first* child, so a consumer's `Dialog.Backdrop` and the
      `Dialog.Content` both paint and hit-test above it — which also means a modal `Content` must be
      positioned or it disappears underneath (see `modal-backdrop.md`). It is itself exempted from
      `inert`, since an inert element is transparent to hit testing and would stop blocking. */}
      <Show when={portal.showModalBackdrop()}>
        <ModalBackdrop ref={portal.setModalBackdropRef} />
      </Show>
      {props.children}
    </SolidPortal>
  );
};
