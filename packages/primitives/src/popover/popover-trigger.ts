import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { composeEventHandlers, withDefaults } from "../utils";
import type { CreatePopoverReturn } from "./popover-root";

export interface CreatePopoverTriggerReturn {
  /** Spread onto the trigger element. `type` defaults to `"button"`, plus
   * `aria-haspopup`/`aria-expanded`/`aria-controls` and an `onClick` that **toggles** (composed
   * behind the consumer's, so their `preventDefault()` cancels). */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Hand to the trigger element's `ref`; registers it as the default anchor and the sole
   * dismiss exclusion. */
  setRef: (element: HTMLButtonElement) => void;
}

/**
 * The trigger part: toggles the popover and advertises it to assistive technology. The consumer's
 * own `onClick` runs first, so `event.preventDefault()` cancels the toggle.
 *
 * Two deliberate differences from `createDialogTrigger`:
 *
 * - **It toggles, where Dialog's only ever opens.** A non-modal layer has to close by clicking the
 *   control that opened it, and that only works because the trigger is excluded from dismissal —
 *   otherwise the capture-phase pointerdown dismisses and the trigger's own `click` immediately
 *   reopens. The two halves are one feature; see `createPopoverContent`.
 * - **It returns a `setRef`.** Dialog's trigger registers nothing; this element is the default
 *   positioning anchor (until a `Popover.Anchor` overrides it) *and* the one element dismissal must
 *   not treat as outside.
 */
export function createPopoverTrigger(
  state: CreatePopoverReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): CreatePopoverTriggerReturn {
  const merged = withDefaults(props, { type: "button" as const });
  const rest = omit(merged, "onClick");

  const elementProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = merge(rest, {
    get "aria-haspopup"() {
      // `"dialog"` for both roles: ARIA defines no `alertdialog` token for `aria-haspopup`.
      return "dialog" as const;
    },
    get "aria-expanded"() {
      return state.open() ? ("true" as const) : ("false" as const);
    },
    get "aria-controls"() {
      // Only while open: the popup mounts lazily, and an `aria-controls` naming an element that is
      // not in the DOM is an invalid IDREF (axe `aria-valid-attr-value`).
      return state.open() ? state.popupId() : undefined;
    },
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(merged.onClick, () =>
        state.setOpen(!state.open()),
      );
    },
  });

  return {
    props: elementProps,
    setRef: (element) => state.setTriggerElement(element),
  };
}
