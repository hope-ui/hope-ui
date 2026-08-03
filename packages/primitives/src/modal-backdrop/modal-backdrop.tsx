import type { JSX } from "@solidjs/web";
import { renderElement } from "../render";

/** Marks the element for debugging, and lets tests identify what a hit test landed on. */
const MARKER = "data-hope-ui-modal-backdrop";

type ModalBackdropElementProps = JSX.HTMLAttributes<HTMLDivElement> & Record<typeof MARKER, string>;

export interface ModalBackdropProps {
  /**
   * Receives the rendered element. Pass it on to `createHideOutside`'s `spare` list: an `inert`
   * element is transparent to hit testing, so a backdrop that let itself be marked would silently
   * stop blocking the pointer — the one job it exists for.
   */
  ref?: (element: HTMLDivElement) => void;
}

/**
 * An invisible, viewport-covering element that blocks pointer interaction with everything behind a
 * modal layer. Not the consumer's optional decorative backdrop (`Dialog.Backdrop`) — this one is
 * always present while a layer is modal.
 *
 * It is the *pointer* third of modality, alongside `createHideOutside` (`aria-hidden` + `inert`,
 * the HTML attribute that makes a subtree unfocusable and untouchable) and `createFocusTrap`.
 * `inert` blocks the pointer too, but only on elements the layer actually marked, so anything
 * inserted into the page before `createHideOutside`'s `MutationObserver` reaches it would stay
 * clickable. Covering the viewport unconditionally closes that hole.
 *
 * Render it as the **first child** of the portal, before any consumer backdrop and before the
 * popup: what it must block comes earlier in the document, what must stay interactive comes later.
 * So a popup that isn't positioned paints *beneath* this and stops responding to the mouse, and
 * clicking here dismisses the layer (it counts as a pointerdown outside the popup). Details:
 * `__internal__/primitives/modal-backdrop/modal-backdrop.md`.
 */
export function ModalBackdrop(props: ModalBackdropProps): JSX.Element {
  return renderElement<ModalBackdropElementProps, HTMLDivElement>({
    as: "div",
    props: {
      role: "presentation",
      "aria-hidden": "true",
      [MARKER]: "",
      style: { position: "fixed", inset: "0" },
    },
    // Wrapped rather than passed straight through, so `props.ref` is read inside the element's own
    // ref effect instead of eagerly in this component body.
    ref: (element) => props.ref?.(element),
  });
}
