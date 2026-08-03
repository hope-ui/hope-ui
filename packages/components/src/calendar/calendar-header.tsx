import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { useCalendarContext } from "./calendar-context";

export interface CalendarHeaderProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Renders as a different element/component while keeping Header's computed props. */
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
  /** Merged over the recipe's `header` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * A structural layout row for the chrome (prev / heading / next). Purely presentational: no behavior,
 * just the recipe's `header` slot merged with any consumer `class`.
 *
 * It goes through `renderElement` rather than being a literal `<div>` because it spreads the consumer
 * props (a getter-backed proxy) around children with delegated event handlers. That combination on a
 * *literal* host element makes Solid's server and client compilers allocate hydration keys
 * differently, which schedules a stray event replay on hydrate.
 */
export function Header(props: CalendarHeaderProps): JSX.Element {
  const ctx = useCalendarContext();
  const rest = omit(props, "render");

  const elementProps = merge(rest, {
    "data-slot": "calendar-header",
    get class(): string {
      return ctx.slots.header(props.class);
    },
  });
  return renderElement<CalendarHeaderProps>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
}
