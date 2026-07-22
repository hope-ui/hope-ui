import { createCalendarHeading } from "@hope-ui/primitives/calendar";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { useCalendarContext } from "./calendar-context";

export interface CalendarHeadingProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Renders as a different element/component while keeping Heading's computed props. */
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
  /** Merged over the recipe's `heading` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The heading / view-switcher button. Assembles `createCalendarHeading` (which owns the drill-up
 * `onClick`, the SSR-stable `id` the grid's `aria-labelledby` points at, and the `disabled`/
 * `data-disabled` at the top of the view stack) into a styled ghost button. Defaults its label to the
 * current period (`state.headingLabel()`); a consumer child overrides it. Pure assembly + theme.
 */
export function Heading(props: CalendarHeadingProps): JSX.Element {
  const ctx = useCalendarContext();
  const heading = createCalendarHeading(ctx.state, omit(props, "render", "class"));
  const elementProps = merge(heading.props, {
    "data-slot": "calendar-heading",
    get class(): string {
      return cx(ctx.slots.heading(), props.class) ?? "";
    },
    get children(): JSX.Element {
      return props.children ?? ctx.state.headingLabel();
    },
  });
  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: props.render,
    props: elementProps,
  });
}
