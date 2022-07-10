import { Orientation } from "@hope-ui/types";
import type { PropsWithAs } from "@hope-ui/utils";
import { createComponentWithAs } from "@hope-ui/utils";
import { mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

export interface DividerProps {
  /**
   * The orientation of the divider.
   * @default 'horizontal'
   */
  orientation?: Orientation;
}

/**
 * Divider is a visual divider between two groups of content,
 * e.g. groups of menu items or sections of a page.
 */
export const Divider = createComponentWithAs<"hr", DividerProps>(props => {
  const defaultProps: PropsWithAs<"hr", DividerProps> = {
    as: "hr",
    orientation: "horizontal",
  };

  // eslint-disable-next-line solid/reactivity
  props = mergeProps(defaultProps, props);

  const [local, others] = splitProps(props, ["as", "orientation"]);

  return (
    <Dynamic
      component={local.as}
      role={local.as === "hr" ? undefined : "separator"}
      aria-orientation={local.orientation === "horizontal" ? undefined : local.orientation}
      {...others}
    />
  );
});
