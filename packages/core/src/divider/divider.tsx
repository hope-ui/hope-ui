import { clsx } from "clsx";
import { children, createMemo, JSX, mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { Orientation } from "../types/orientation";
import { createComponentWithAs, PropsWithAs } from "../utils/create-component-with-as";
import { withBemModifiers } from "../utils/with-bem-modifiers";

export interface DividerProps {
  /**
   * The visual style of the divider.
   * @default 'solid'
   */
  variant?: "solid" | "dashed";

  /**
   * The orientation of the divider.
   * @default 'horizontal'
   */
  orientation?: Orientation;

  /**
   * The placement of the label, if any.
   * @default 'start'
   */
  labelPlacement?: "start" | "center" | "end";

  /** The label of the divider, if any. */
  children?: JSX.Element;
}

/**
 * Divider is a visual divider between two groups of content,
 * e.g. groups of menu items or sections of a page.
 */
export const Divider = createComponentWithAs<"div", DividerProps>(props => {
  const defaultProps: PropsWithAs<"div", DividerProps> = {
    as: "div",
    variant: "solid",
    orientation: "horizontal",
    labelPlacement: "start",
  };

  // eslint-disable-next-line solid/reactivity
  props = mergeProps(defaultProps, props);

  const [local, others] = splitProps(props, [
    "children",
    "as",
    "class",
    "variant",
    "orientation",
    "labelPlacement",
  ]);

  const resolvedChildren = children(() => local.children);

  const isHorizontal = () => local.orientation === "horizontal";

  const hasLabel = () => resolvedChildren() != null && isHorizontal();

  const classes = createMemo(() => {
    return clsx(
      local.class,
      withBemModifiers("pl-divider", [
        local.variant,
        local.orientation,
        hasLabel() && `label-${local.labelPlacement}`,
      ])
    );
  });

  return (
    <Dynamic
      component={local.as}
      class={classes()}
      role="separator"
      aria-orientation={isHorizontal() ? undefined : local.orientation}
      {...others}
    >
      <Show when={isHorizontal()}>{local.children}</Show>
    </Dynamic>
  );
});
