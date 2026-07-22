import { createCalendarPrev } from "@hope-ui/primitives/calendar";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { useCalendarContext } from "./calendar-context";

export interface CalendarPrevButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Renders as a different element/component while keeping PrevButton's computed props. */
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
  /** Merged over the recipe's `prevButton` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The previous-period navigation button. Assembles `createCalendarPrev` (which owns the aria-label
 * default, the `disabled`/`data-disabled` boundary reflection, and the paging `onClick`) into a styled
 * ghost icon button — pure assembly + theme, no behavior here.
 */
export function PrevButton(props: CalendarPrevButtonProps): JSX.Element {
  const ctx = useCalendarContext();
  const prev = createCalendarPrev(ctx.state, omit(props, "render", "class"));
  const elementProps = merge(prev.props, {
    "data-slot": "calendar-prev-button",
    get class(): string {
      return cx(ctx.slots.prevButton(), props.class) ?? "";
    },
  });
  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: props.render,
    props: elementProps,
  });
}
