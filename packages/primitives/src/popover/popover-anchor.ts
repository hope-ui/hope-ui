import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { createRegisteredElement } from "../internal";
import type { CreatePopoverReturn } from "./popover-root";

export interface CreatePopoverAnchorReturn {
  /** The consumer's props, unchanged. Returned only so every part hook has one shape — this part
   * computes nothing to merge in. */
  props: JSX.HTMLAttributes<HTMLDivElement>;
  /** Hand to the anchor element's `ref`; registers it as `state.customAnchorElement`, which outranks
   * the trigger, and **clears** it on unmount. */
  setRef: (element: HTMLDivElement) => void;
}

/**
 * The anchor part: the escape hatch that positions the layer against something other than its
 * trigger — a card, a table row, a whole section — while the trigger keeps owning the toggle and the
 * ARIA.
 *
 * **It contributes no ARIA, no handler and no `data-*`.** A positioning reference is not a control,
 * which is also why it is deliberately *not* in `state.dismissExclusions`: see `popover-root.md`
 * § *Why a `Popover.Anchor` is deliberately not excluded*.
 *
 * ## Clearing on unmount is the load-bearing half
 *
 * `createRegisteredElement`, not `createRegisteredId`: an id is known at render time, a ref only
 * after it. Its `unregister` is what hands positioning back to the trigger when the anchor goes away
 * — without it `state.anchorElement()` would keep naming a detached element and the layer would
 * strand wherever that element last was. Both directions are pinned in
 * `popover-anchor.browser.test.tsx` against the layer's **rect**.
 *
 * Call from the anchor's own owner scope, so the registration's cleanup is scoped to its unmount.
 */
export function createPopoverAnchor(
  state: CreatePopoverReturn,
  props: JSX.HTMLAttributes<HTMLDivElement>,
): CreatePopoverAnchorReturn {
  // A real signal, not a plain ref: the root reads this through a derived accessor that
  // `createFloating` tracks, so the element arriving has to be an observable change.
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
