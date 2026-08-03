import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useSelectContext } from "./select-context";

type SelectIconElementProps = JSX.HTMLAttributes<HTMLSpanElement>;

export interface SelectIconProps extends SelectIconElementProps {
  /** Renders as a different element/component while keeping Icon's computed props. */
  render?: RenderProp<SelectIconElementProps>;
  /** Merged over the recipe's `icon` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * A custom chevron, overriding the default for this one trigger. When omitted, renders the resolved
   * default (instance `chevronIcon` ?? preset `defaultProps.select.chevronIcon` ?? hope's built-in
   * chevron-down) from context.
   */
  children?: JSX.Element;
}

/**
 * The trigger's chevron: purely decorative, and `aria-hidden` because it conveys nothing the
 * trigger's own `aria-expanded` does not already say.
 *
 * The glyph is **built in**: with no `children` it renders the one resolved on `Select.Root`, so a
 * preset can swap the default app-wide instead of every consumer hard-coding an SVG.
 */
export const Icon: Component<SelectIconProps> = (props) => {
  const ctx = useSelectContext();
  const rest = omit(props, "render", "class", "children");

  const elementProps = merge(rest, {
    "data-slot": "select-icon",
    // Deliberately not forwardable: un-hiding the chevron would announce a state the trigger's own
    // `aria-expanded` already conveys.
    "aria-hidden": "true" as const,
    get class(): string {
      return ctx.slots.icon(props.class);
    },
    get children(): JSX.Element {
      return props.children ?? ctx.chevronIcon();
    },
  });

  return renderElement<SelectIconElementProps, HTMLSpanElement>({
    as: "span",
    render: props.render,
    props: elementProps,
  });
};
