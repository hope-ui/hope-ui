import { mergeProps, splitProps } from "solid-js";

import { ResponsiveValue } from "../../styled-system/types";
import { mapResponsive } from "../../styled-system/utils";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { aspectRatioStyles } from "./aspect-ratio.styles";

interface AspectRatioOptions {
  /**
   * The aspect ratio of the Box. Common values are:
   *
   * `21/9`, `16/9`, `9/16`, `4/3`, `1.85/1`
   */
  ratio?: ResponsiveValue<number>;
}

export type AspectRatioProps<C extends ElementType = "div"> = HTMLHopeProps<C, AspectRatioOptions>;

const hopeAspectRatioClass = "hope-aspect-ratio";

/**
 * Component used to cropping media (videos, images and maps)
 * to a desired aspect ratio.
 */
export function AspectRatio<C extends ElementType = "div">(props: AspectRatioProps<C>) {
  const defaultProps: AspectRatioProps<"div"> = {
    ratio: 4 / 3,
  };

  const propsWithDefault: AspectRatioProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "ratio"]);

  const classes = () => classNames(local.class, hopeAspectRatioClass, aspectRatioStyles());

  const paddingBottom = () => mapResponsive(local.ratio, r => `${(1 / r) * 100}%`);

  return <Box class={classes()} _before={{ paddingBottom: paddingBottom() }} {...others} />;
}

AspectRatio.toString = () => createClassSelector(hopeAspectRatioClass);
