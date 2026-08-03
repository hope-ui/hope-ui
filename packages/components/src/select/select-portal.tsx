import type { JSX } from "@solidjs/web";
import { isServer, Portal as SolidPortal } from "@solidjs/web";
import type { Component } from "solid-js";

export interface SelectPortalProps {
  /** Where to portal the Positioner/Content. Defaults to `document.body`. */
  mount?: Element;
  children?: JSX.Element;
}

// Lifts the popup out of the trigger's stacking/overflow context, so a Select inside a scroll
// container, a table cell or a `transform`ed ancestor isn't clipped by it. It renders no element and
// carries no behavior — the modality effects live on `Select.Content`, where they tear down when the
// popup unmounts.
export const Portal: Component<SelectPortalProps> = (props) => {
  // @solidjs/web's `Portal` throws server-side ("Portal is not supported on the server") rather than
  // degrading, so it must never be rendered during SSR. `isServer` is a build-time constant, hence a
  // plain `if` rather than `<Show>` — there is no reactive branch here. Nothing is lost: the popup
  // mounts on open, so it renders nothing on the server either way.
  if (isServer) {
    return null;
  }

  return <SolidPortal mount={props.mount}>{props.children}</SolidPortal>;
};
