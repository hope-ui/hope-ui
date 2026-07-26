import type { JSX } from "@solidjs/web";
import { isServer, Portal as SolidPortal } from "@solidjs/web";
import type { Component } from "solid-js";

export interface PopoverPortalProps {
  /** Where to portal the Positioner/Content. Defaults to `document.body`. */
  mount?: Element;
  children?: JSX.Element;
}

// Lifts the layer out of the trigger's stacking/overflow context, so a popover inside a scroll
// container or a `transform`ed ancestor isn't clipped by it.
//
// **No primitive hook**, unlike `Dialog.Portal`: that one exists only to own the `ModalBackdrop`
// registration, and a non-modal popover has no backdrop, no scroll lock and no hide-outside. Nothing
// to register, so nothing for a kernel hook to do.
export const Portal: Component<PopoverPortalProps> = (props) => {
  // @solidjs/web's Portal throws server-side ("Portal is not supported on the server") rather than
  // degrading gracefully, so this must never render it during SSR. `isServer` is a fixed
  // per-environment constant, so a plain `if` (not `<Show>`) — there's no reactive branch.
  if (isServer) {
    return null;
  }

  return <SolidPortal mount={props.mount}>{props.children}</SolidPortal>;
};
