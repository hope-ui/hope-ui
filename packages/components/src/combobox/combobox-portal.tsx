import type { JSX } from "@solidjs/web";
import { isServer, Portal as SolidPortal } from "@solidjs/web";
import type { Component } from "solid-js";

export interface ComboboxPortalProps {
  /** Where to portal the Positioner/Content. Defaults to `document.body`. */
  mount?: Element;
  children?: JSX.Element;
}

// Lifts the popup out of the control's stacking/overflow context, so a Combobox inside a scroll
// container, a table cell or a `transform`ed ancestor isn't clipped by it.
//
// **No primitive hook**, and no element of its own — the precedent `Popover.Portal` set, followed by
// `Select.Portal`. There is nothing here for a kernel hook to own: the modality registration lives on
// `Combobox.Content`, where it can tear down when the popup unmounts.
export const Portal: Component<ComboboxPortalProps> = (props) => {
  // @solidjs/web's Portal throws server-side ("Portal is not supported on the server") rather than
  // degrading gracefully, so this must never render it during SSR. `isServer` is a fixed
  // per-environment constant, so a plain `if` (not `<Show>`) — there's no reactive branch. The popup
  // renders nothing on the server anyway (it mounts on open), so nothing is lost.
  if (isServer) {
    return null;
  }

  return <SolidPortal mount={props.mount}>{props.children}</SolidPortal>;
};
