import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { composeEventHandlers } from "../utils";
import type { CreateCalendarReturn } from "./calendar-root";

export interface CreateCalendarHeadingReturn {
  /** Spread onto the heading `<button>`. Its text content should be `state.headingLabel()`. */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * The heading / view switcher (a `<button>`). Shows the current period label — the component renders
 * it as the button's own text — and drills **up** the view stack on click (month → year → decade).
 * Disabled at the top of the stack, where there is nothing to climb to, and on a disabled calendar.
 *
 * The consumer's `id` is deliberately dropped: this element's id is the calendar's `headingId`, which
 * the grid's `aria-labelledby` points at, so honoring an override would break that link.
 */
export function createCalendarHeading(
  state: CreateCalendarReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): CreateCalendarHeadingReturn {
  const rest = omit(props, "onClick", "id");
  // `canDrillUp` answers "is there a view above this one", not "may the user interact" — so the
  // whole-calendar `disabled` folds in here rather than into it.
  const isInert = () => state.disabled() || !state.canDrillUp();

  const elementProps = merge(rest, {
    get type() {
      return props.type ?? ("button" as const);
    },
    get id() {
      return state.headingId();
    },
    get disabled() {
      return props.disabled || isInert() || undefined;
    },
    get "data-disabled"() {
      return isInert() ? "true" : undefined;
    },
    get onClick() {
      return composeEventHandlers<HTMLButtonElement, MouseEvent>(props.onClick, () =>
        state.drillUp(),
      );
    },
  });

  return { props: elementProps };
}
