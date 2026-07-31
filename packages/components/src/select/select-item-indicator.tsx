import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";
import { useSelectContext, useSelectItemContext } from "./select-context";

type SelectItemIndicatorElementProps = JSX.HTMLAttributes<HTMLSpanElement>;

export interface SelectItemIndicatorProps extends SelectItemIndicatorElementProps {
  /** Renders as a different element/component while keeping ItemIndicator's computed props. */
  render?: RenderProp<SelectItemIndicatorElementProps>;
  /** Merged over the recipe's `itemIndicator` slot (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * A custom selection glyph, overriding the default for this one indicator. When omitted, renders the
   * resolved default (instance `checkIcon` ?? preset `defaultProps.select.checkIcon` ?? hope's
   * built-in check) from context. Read **exactly once**, gated on the item's `isSelected()` — see the
   * `children()` note below.
   */
  children?: JSX.Element;
}

/**
 * The chosen-row check glyph. Purely presentational — it reads the item's `isSelected()` off
 * `SelectItemContext` (behavior stays on the primitive) and shows the glyph in the row's reserved
 * trailing gutter only while selected. `aria-hidden` because the selection is already conveyed by the
 * option's `aria-selected`.
 *
 * The glyph is **built in**: with no `children`, it renders `ctx.checkIcon()` — an accessor, so each
 * read builds a fresh element. A consumer's `children` overrides it per instance, keeping the default
 * themeable app-wide from a preset rather than hard-coded here.
 *
 * The custom glyph is read **exactly once**, inside a `<Show>` gated on `isSelected()` — not on the
 * glyph prop itself. Per the codified `children()` decision procedure, a component-valued child read
 * once — inside a `<Show>` or not — needs no `children()`: only the `when`-gate + body *double* read
 * misaligns `_hk`, and there is no such double read here.
 */
export const ItemIndicator: Component<SelectItemIndicatorProps> = (props) => {
  const ctx = useSelectContext();
  const itemCtx = useSelectItemContext();

  const rest = omit(props, "render", "class", "children");

  const elementProps = merge(rest, {
    "data-slot": "select-item-indicator",
    // Component-owned, deliberately not forwardable: un-hiding the glyph would double-announce a
    // selection the option's own `aria-selected` already conveys.
    "aria-hidden": "true" as const,
    get class(): string {
      return ctx.slots.itemIndicator(props.class);
    },
    get children(): JSX.Element {
      return props.children ?? ctx.checkIcon();
    },
  });

  return (
    <Show when={itemCtx.isSelected()}>
      {renderElement<SelectItemIndicatorElementProps, HTMLSpanElement>({
        as: "span",
        render: props.render,
        props: elementProps,
      })}
    </Show>
  );
};
