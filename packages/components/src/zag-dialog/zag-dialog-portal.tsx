import type { JSX } from "@solidjs/web";
import { isServer, Portal as SolidPortal } from "@solidjs/web";
import type { Component } from "solid-js";

export interface ZagDialogPortalProps {
  /** Where to portal Backdrop/Content. Defaults to `document.body`. */
  mount?: Element;
  children?: JSX.Element;
}

/**
 * The client-only portal, and nothing else. `Dialog.Portal` also renders the kernel's
 * pointer-blocking `ModalBackdrop`; this one deliberately does not — Zag blocks the page behind
 * with `pointer-events: none` on `<body>` (re-enabling the dialog's own layers), so there is no
 * backdrop element to render. Whether that is enough is one of the questions the spike measures.
 */
export const Portal: Component<ZagDialogPortalProps> = (props) => {
  // @solidjs/web's Portal throws server-side ("Portal is not supported on the server") rather
  // than degrading gracefully, so this must never render it during SSR. `isServer` is a fixed
  // per-environment constant, so a plain `if` (not `<Show>`) — there's no reactive branch.
  if (isServer) {
    return null;
  }

  return <SolidPortal mount={props.mount}>{props.children}</SolidPortal>;
};
