import { createMemo, splitProps } from "solid-js";

import { ColorProps } from "@/styled-system/props/color";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { progressIndicatorStyles, ProgressIndicatorVariants } from "./progress.styles";
import { getProgressProps, GetProgressPropsOptions } from "./progress.utils";

interface ProgressIndicatorOptions extends GetProgressPropsOptions, Omit<ProgressIndicatorVariants, "indeterminate"> {
  /**
   * The color of the progress indicator.
   */
  color?: ColorProps["color"];
}

export type ProgressIndicatorProps<C extends ElementType = "div"> = HTMLHopeProps<C, ProgressIndicatorOptions>;

const hopeProgressIndicatorClass = "hope-progress__indicator";

/**
 * ProgressIndicator (Linear)
 *
 * The progress component that visually indicates the current level of the progress bar.
 * It applies `background-color` and changes its width.
 */
export function ProgressIndicator<C extends ElementType = "div">(props: ProgressIndicatorProps<C>) {
  const theme = useComponentStyleConfigs().Progress;

  const [local, others] = splitProps(props, [
    "class",
    "min",
    "max",
    "value",
    "valueText",
    "getValueText",
    "color",
    "striped",
    "animated",
    "indeterminate",
  ]);

  const progress = createMemo(() => {
    return getProgressProps({
      value: local.value,
      min: local.min,
      max: local.max,
      valueText: local.valueText,
      getValueText: local.getValueText,
      indeterminate: local.indeterminate,
    });
  });

  const progressProps = () => progress().bind;

  const width = () => `${progress().percent}%`;

  const backgroundStyles = () => {
    if (local.indeterminate) {
      return {
        backgroundImage: `linear-gradient(to right, transparent 0%, ${local.color} 50%, transparent 100%)`,
      };
    }

    return { backgroundColor: local.color };
  };

  const classes = () => {
    return classNames(
      local.class,
      hopeProgressIndicatorClass,
      progressIndicatorStyles({
        striped: local.striped,
        animated: local.animated,
        indeterminate: local.indeterminate === true ? true : false, // ensure a boolean is passed so compound variants works correctly
        css: backgroundStyles(),
      })
    );
  };

  return (
    <Box class={classes()} __baseStyle={theme?.baseStyle?.indicator} width={width()} {...progressProps} {...others} />
  );
}

ProgressIndicator.toString = () => createClassSelector(hopeProgressIndicatorClass);
