import { createCalendarPrev } from "@hope-ui/primitives/calendar";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
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
 * The previous-period navigation button. The primitive owns the localized `aria-label`, the disabled
 * state at a `min` boundary, and the paging click.
 *
 * The glyph is **built in**: with no `children` it renders the resolved default — instance `prevIcon`,
 * else the preset's, else hope's chevron. A consumer `children` overrides it per instance.
 *
 * `props.children` is read **exactly once** and `??` short-circuits, so the default glyph is never
 * built when a consumer supplies one. One read also needs no `children()` wrapper: it is the *double*
 * read — a `<Show>`'s `when` plus its body — that builds and discards a component and shifts the
 * hydration keys Solid derives from tree position.
 */
export function PrevButton(props: CalendarPrevButtonProps): JSX.Element {
  const ctx = useCalendarContext();
  const prev = createCalendarPrev(ctx.state, omit(props, "render", "class"));
  const elementProps = merge(prev.props, {
    "data-slot": "calendar-prev-button",
    get class(): string {
      return ctx.slots.prevButton(props.class);
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
