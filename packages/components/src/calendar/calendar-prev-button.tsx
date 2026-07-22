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
 *
 * The glyph is **built in**: with no `children`, it renders `ctx.prevIcon()` — the resolved default
 * chevron (instance `prevIcon` ?? preset `defaultProps.calendar.prevIcon` ?? hope's built-in). A
 * consumer `children` (text, a custom icon) overrides it per instance. Single read of `props.children`,
 * so no `children()` and no `<Show>`-`when`-gate hydration hazard; `??` short-circuits, so the default
 * glyph is never built when the consumer supplies one.
 */
export function PrevButton(props: CalendarPrevButtonProps): JSX.Element {
  const ctx = useCalendarContext();
  const prev = createCalendarPrev(ctx.state, omit(props, "render", "class"));
  const elementProps = merge(prev.props, {
    "data-slot": "calendar-prev-button",
    get class(): string {
      return cx(ctx.slots.prevButton(), props.class) ?? "";
    },
    get children(): JSX.Element {
      return props.children ?? ctx.prevIcon();
    },
  });
  return renderElement<JSX.ButtonHTMLAttributes<HTMLButtonElement>>({
    as: "button",
    render: props.render,
    props: elementProps,
  });
}
