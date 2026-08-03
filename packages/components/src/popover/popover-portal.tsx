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
// **No primitive hook**, unlike `Dialog.Portal`: that one exists only to register the modal backdrop,
// and a non-modal popover has no backdrop, no scroll lock and no background-hiding to register.
export const Portal: Component<PopoverPortalProps> = (props) => {
  // @solidjs/web's Portal throws server-side ("Portal is not supported on the server") rather than
  // degrading, so it must never be reached during SSR. `isServer` is a build-time constant, so a
  // plain `if` is correct here — there is no reactive branch for `<Show>` to track.
  if (isServer) {
    return null;
  }

  return <SolidPortal mount={props.mount}>{props.children}</SolidPortal>;
};
