import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { useComboboxContext } from "./combobox-context";

type ComboboxIconElementProps = JSX.HTMLAttributes<HTMLSpanElement>;

export interface ComboboxIconProps extends ComboboxIconElementProps {
  /** Renders as a different element/component while keeping Icon's computed props. */
  render?: RenderProp<ComboboxIconElementProps>;
  /** Merged over the recipe's `icon` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * A custom chevron, overriding the default for this one trigger. When omitted, renders the resolved
   * default (instance `chevronIcon` ?? preset `defaultProps.combobox.chevronIcon` ?? hope's built-in
   * chevron-down) from context.
   */
  children?: JSX.Element;
}

/**
 * The trigger's chevron: purely decorative, and `aria-hidden` because it conveys nothing the input's
 * own `aria-expanded` does not already say.
 *
 * The glyph is **built in**: with no `children` it renders the one resolved on `Combobox.Root`, so a
 * preset can swap the default app-wide instead of every consumer hard-coding an SVG.
 */
export const Icon: Component<ComboboxIconProps> = (props) => {
  const ctx = useComboboxContext();
  const rest = omit(props, "render", "class", "children");

  const elementProps = merge(rest, {
    "data-slot": "combobox-icon",
    // Deliberately not forwardable: un-hiding the chevron would announce a state the input's own
    // `aria-expanded` already conveys, on a button that already has a name.
    "aria-hidden": "true" as const,
    get class(): string {
      return ctx.slots.icon(props.class);
    },
    get children(): JSX.Element {
      return props.children ?? ctx.chevronIcon();
    },
  });

  return renderElement<ComboboxIconElementProps, HTMLSpanElement>({
    as: "span",
    render: props.render,
    props: elementProps,
  });
};
