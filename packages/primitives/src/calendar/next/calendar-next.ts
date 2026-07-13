import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { composeEventHandlers } from "../../utils";
import type { CreateCalendarReturn } from "../root/calendar-root";

export interface CreateCalendarNextReturn {
  /** Spread onto the next-period `<button>`. */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * The next-period button: pages the calendar forward one period in the active view (±1 month / ±1
 * year / ±10 years) and reflects the boundary (`disabled` + `data-disabled`) from `max`. The
 * consumer's own `onClick` runs first, so `event.preventDefault()` cancels the page.
 */
export function createCalendarNext(
  state: CreateCalendarReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): CreateCalendarNextReturn {
  const rest = omit(props, "onClick");

  const elementProps = merge(rest, {
    get type() {
      return props.type ?? ("button" as const);
    },
    get "aria-label"() {
      return props["aria-label"] ?? state.messages().nextLabel;
    },
    get disabled() {
      return props.disabled || state.isNextDisabled() || undefined;
    },
    get "data-disabled"() {
      return state.isNextDisabled() ? "true" : undefined;
    },
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, () => state.next());
    },
  });

  return { props: elementProps };
}
