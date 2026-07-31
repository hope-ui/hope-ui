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
   * chevron-down) from context. Read **exactly once**.
   */
  children?: JSX.Element;
}

/**
 * The trigger's chevron. Purely presentational and purely decorative — it conveys nothing the
 * input's `aria-expanded` does not already say, which is why it is `aria-hidden` and carries no
 * behavior of its own. There is no primitive part hook, for the same reason `Select.Icon` has none:
 * no ARIA beyond one constant, so there is nothing for the kernel to own.
 *
 * The glyph is **built in**: with no `children`, it renders `ctx.chevronIcon()` — an accessor, so
 * each read builds a fresh element. A consumer's `children` overrides it per instance. This keeps
 * the default glyph themeable app-wide from a preset rather than hard-coded here.
 */
export const Icon: Component<ComboboxIconProps> = (props) => {
  const ctx = useComboboxContext();
  const rest = omit(props, "render", "class", "children");

  const elementProps = merge(rest, {
    "data-slot": "combobox-icon",
    // Component-owned, deliberately not forwardable: un-hiding the chevron would announce a state
    // the input's own `aria-expanded` already conveys, on a button that already has a name.
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
