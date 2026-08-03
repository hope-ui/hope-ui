import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createRegisteredElement } from "../internal";
import type { CreatePopoverReturn } from "./popover-root";

export interface CreatePopoverAnchorReturn {
  /** The consumer's props, unchanged. Returned only so every part hook has the same shape — this
   * one computes nothing to merge in. */
  props: JSX.HTMLAttributes<HTMLDivElement>;
  /** Hand to the anchor element's `ref`; registers it as `state.customAnchorElement`, which outranks
   * the trigger, and **clears** it on unmount. */
  setRef: (element: HTMLDivElement) => void;
}

/**
 * The anchor part: positions the layer against something other than its trigger — a card, a table
 * row, a whole section — while the trigger keeps owning the toggle and the ARIA.
 *
 * **It contributes no ARIA, no handler and no `data-*`.** A positioning reference is not a control,
 * which is also why it is deliberately *not* exempt from dismissal: a consumer may wrap a whole
 * section in one, and exempting it would turn that region into a dead zone where outside-click
 * silently stops working.
 *
 * **Clearing on unmount is the load-bearing half.** `createRegisteredElement` rather than
 * `createRegisteredId`, because an id is known at render time and a ref only after it — and its
 * unregister is what hands positioning back to the trigger when the anchor goes away. Without it
 * `state.anchorElement()` keeps naming a detached element and the layer strands wherever that
 * element last was.
 *
 * Call from the anchor's own owner scope, so the registration's cleanup is scoped to its unmount.
 */
export function createPopoverAnchor(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): CreatePopoverAnchorReturn {
  // A real signal, not a plain ref: the root exposes it through a derived accessor the positioning
  // layer tracks, so the element arriving has to be an observable change.
  const [element, setElement] = createSignal<HTMLElement>();

  createRegisteredElement<HTMLElement>({
    ref: element,
    register: (anchor) => state.setCustomAnchorElement(anchor),
    unregister: () => state.setCustomAnchorElement(undefined),
  });

  return {
    props,
    setRef: (anchor) => setElement(anchor),
  };
}
