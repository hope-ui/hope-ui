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
 * The trigger part: toggles the popover and advertises it to assistive technology. Owns the `aria-*`
 * wiring, the toggle handler and the trigger's registration on the root state.
 *
 * ## Two deliberate differences from `createDialogTrigger`
 *
 * **It toggles, where Dialog's only ever opens.** A non-modal layer must close by clicking the
 * control that opened it, which is only reachable because `createDismissable` can `exclude` the
 * trigger: without that exclusion the capture-phase pointerdown dismisses and the trigger's own
 * `click` immediately reopens. The two halves are one feature — see `state.dismissExclusions` and
 * `createPopoverContent`.
 *
 * **It returns a `setRef`.** Dialog's trigger registers nothing; Popover's element is the default
 * anchor (`state.anchorElement`, until a `Popover.Anchor` overrides it) *and* the one element
 * dismissal must not treat as outside.
 *
 * The consumer's own `onClick` runs first, so `event.preventDefault()` cancels the toggle.
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
      // Only while open. `aria-controls` naming an element that isn't in the DOM is an invalid
      // IDREF (axe `aria-valid-attr-value`), so it's omitted when closed.
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
