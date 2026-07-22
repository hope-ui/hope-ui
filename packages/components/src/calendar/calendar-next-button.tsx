import { createCalendarNext } from "@hope-ui/primitives/calendar";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { cx } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { merge, omit } from "solid-js";
import { useCalendarContext } from "./calendar-context";

export interface CalendarNextButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Renders as a different element/component while keeping NextButton's computed props. */
  render?: RenderProp<JSX.ButtonHTMLAttributes<HTMLButtonElement>>;
  /** Merged over the recipe's `nextButton` slot (applied last), so the consumer's utilities win. */
  class?: string;
}

/**
 * The next-period navigation button — the mirror of `PrevButton`. Assembles `createCalendarNext`
 * (aria-label default, `disabled`/`data-disabled` boundary reflection, paging `onClick`) into a styled
 * ghost icon button. Pure assembly + theme.
 */
export function NextButton(props: CalendarNextButtonProps): JSX.Element {
  const ctx = useCalendarContext();
  const next = createCalendarNext(ctx.state, omit(props, "render", "class"));
  const elementProps = merge(next.props, {
    "data-slot": "calendar-next-button",
    get class(): string {
      return cx(ctx.slots.nextButton(), props.class) ?? "";
    },
  });
  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: props.render,
    props: elementProps,
  });
}
