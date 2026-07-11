import type { JSX } from "@solidjs/web";
import { renderElement } from "../utils";

/** Marks the element for debugging, and lets tests identify what a hit test landed on. */
const MARKER = "data-hope-ui-modal-backdrop";

type ModalBackdropElementProps = JSX.HTMLAttributes<HTMLDivElement> & Record<typeof MARKER, string>;

export interface ModalBackdropProps {
  /**
   * Receives the rendered element. Pass it on to `createHideOutside`'s `spare` list: an
   * `inert` element is transparent to hit testing, so a backdrop that let itself be hidden
   * would silently stop blocking the pointer — the one job it exists for.
   */
  ref?: (element: HTMLDivElement) => void;
}

/**
 * An invisible, viewport-covering element that blocks pointer interaction with everything
 * behind a modal layer. Base UI ships an equivalent `InternalBackdrop` for the same reason.
 *
 * Modality is three separate mechanisms, because no single one covers all three input
 * channels: `createHideOutside` (`aria-hidden` + `inert`) for assistive technology and the
 * focus order, `createFocusTrap` for Tab cycling, and this for the pointer.
 *
 * `inert` alone would block the pointer too — but only on elements the layer actually marked.
 * This backdrop covers the viewport unconditionally, so an element inserted into the page
 * before `createHideOutside`'s `MutationObserver` has marked it is still unreachable. That
 * belt-and-braces guarantee is the whole reason it survives alongside `inert`.
 *
 * This is the *component-rendered* backdrop, always present while a layer is modal. It is not
 * the consumer's optional, visible backdrop (`Dialog.Backdrop`), which is purely decorative
 * and may be absent.
 *
 * ## Where to render it
 *
 * As the **first child** of the portal, before any consumer backdrop and before the popup.
 * Everything it should block comes earlier in the document; everything that must stay
 * interactive comes later. Both are positioned, so DOM order decides paint and hit-test order.
 *
 * Two consequences, both documented in `modal-backdrop.md`:
 * - The popup must be positioned, or it paints beneath this and its content stops responding
 *   to the mouse.
 * - Clicking this dismisses the layer, exactly as clicking a consumer backdrop does — it's
 *   outside the popup, so `createDismissable`'s outside-pointerdown check fires.
 *
 * Rendered through `renderElement`, not a literal `<div>`: a literal host element compiles to
 * a hoisted `_$template()` call, which throws on `@solidjs/web`'s server build.
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
    // Wrapped rather than passed straight through, so `props.ref` is read inside `spread`'s
    // own effect instead of eagerly in this component body.
    ref: (element) => props.ref?.(element),
  });
}
