import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { composeEventHandlers } from "../utils";
import type { CreateCalendarReturn } from "./calendar-root";

export interface CreateCalendarHeadingReturn {
  /** Spread onto the heading `<button>`. Its text content should be `state.headingLabel()`. */
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * The heading / view switcher (a `<button>`). Shows the current period label (rendered as its own
 * text content by the component) and drills **up** the view stack on click (month → year → decade);
 * it is `disabled` at the top (decade), where there is nothing to climb to, and on a disabled
 * calendar, which no interaction may navigate. Its `id` is the calendar's `headingId`, which the grid
 * points `aria-labelledby` at — one SSR-stable value, so the consumer's `id` is intentionally not
 * honored here (it would break that link).
 */
export function createCalendarHeading(
  state: CreateCalendarReturn,
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
): CreateCalendarHeadingReturn {
  const rest = omit(props, "onClick", "id");
  // `canDrillUp` says "there is a view above this one", not "you may interact" — so the whole-calendar
  // `disabled` folds in here rather than into it.
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
