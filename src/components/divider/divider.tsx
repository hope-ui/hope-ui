import { Property } from "csstype";
import { mergeProps, splitProps } from "solid-js";

import { SizeScaleValue } from "@/styled-system/types";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { dividerStyles, DividerVariants } from "./divider.styles";

export interface DividerOptions extends DividerVariants {
  /**
   * The thickness of the divider
   * @example
   * ```jsx
   * <Divider thickness="4px"/>
   * ```
   */
  thickness?: Property.BorderWidth<SizeScaleValue>;
}

export type DividerProps<C extends ElementType = "div"> = HTMLHopeProps<C, DividerOptions>;

const hopeDividerClass = "hope-divider";

export function Divider<C extends ElementType = "div">(props: DividerProps<C>) {
  const defaultProps: DividerProps<"div"> = {
    as: "div",
    variant: "solid",
    orientation: "horizontal",
    color: "$neutral6",
    thickness: "1px",
  };

  const propsWithDefault: DividerProps<"div"> = mergeProps(defaultProps, props);

  const [local, others] = splitProps(propsWithDefault, ["class", "variant", "orientation", "thickness"]);

  const classes = () =>
    classNames(
      local.class,
      hopeDividerClass,
      dividerStyles({
        variant: local.variant,
        orientation: local.orientation,
        css: {
          borderLeftWidth: local.orientation === "vertical" ? local.thickness : 0,
          borderBottomWidth: local.orientation === "horizontal" ? local.thickness : 0,
        },
      })
    );

  return <Box class={classes()} {...others} />;
}

Divider.toString = () => createClassSelector(hopeDividerClass);
