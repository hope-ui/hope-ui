import { renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { merge } from "solid-js";
import { useCalendarContext } from "./calendar-context";

export interface CalendarHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Merged over the recipe's `header` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * A structural layout row for the chrome (prev / heading / next). Purely presentational — no behavior;
 * it only carries the recipe's `header` slot (the flex row) merged with any consumer `class`.
 *
 * Rendered through `renderElement` because it spreads the consumer `props` (a Solid getter proxy) and
 * wraps delegated-event children (the nav buttons): a getter-spread on a literal host element allocates
 * `_hk` differently under the server (`ssr`) vs client (`dom`) compile, which schedules a stray
 * hydration-event replay. `renderElement` → `<Dynamic>` (a component call) allocates identically.
 */
export function Header(props: CalendarHeaderProps): JSX.Element {
  const ctx = useCalendarContext();
  const elementProps = merge(props, {
    "data-slot": "calendar-header",
    get class(): string {
      return cx(ctx.slots.header(), props.class) ?? "";
    },
  });
  return renderElement<CalendarHeaderProps>({ as: "div", props: elementProps });
}
