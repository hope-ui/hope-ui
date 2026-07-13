import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { composeEventHandlers } from "../../utils";
import type { CreateCalendarReturn } from "../root/calendar-root";

export interface CreateCalendarPrevReturn {
  /** Spread onto the previous-period `<button>`. */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * The previous-period button: pages the calendar back one period in the active view (±1 month / ±1
 * year / ±10 years) and reflects the boundary (`disabled` + `data-disabled`) from `min`. The
 * consumer's own `onClick` runs first, so `event.preventDefault()` cancels the page.
 */
export function createCalendarPrev(
  state: CreateCalendarReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): CreateCalendarPrevReturn {
  const rest = omit(props, "onClick");

  const elementProps = merge(rest, {
    get type() {
      return props.type ?? ("button" as const);
    },
    get "aria-label"() {
      return props["aria-label"] ?? state.messages().previousLabel;
    },
    get disabled() {
      return props.disabled || state.isPrevDisabled() || undefined;
    },
    get "data-disabled"() {
      return state.isPrevDisabled() ? "true" : undefined;
    },
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, () => state.prev());
    },
  });

  return { props: elementProps };
}
