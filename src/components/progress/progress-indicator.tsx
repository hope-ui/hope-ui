import { mergeProps, splitProps } from "solid-js";

import { ColorProps } from "@/styled-system/props/color";
import { useComponentStyleConfigs } from "@/theme/provider";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { valueToPercent } from "@/utils/number";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useProgressContext } from "./progress";
import { progressIndicatorStyles, ProgressIndicatorVariants } from "./progress.styles";

interface ProgressIndicatorOptions extends Omit<ProgressIndicatorVariants, "indeterminate"> {
  /**
   * The color of the progress indicator.
   */
  colorScheme?: ColorProps["color"];

  /**
   * If `true`, the progress will be indeterminate and the `value` prop will be ignored.
   */
  indeterminate?: boolean;

  /**
   * Current progress (must be between min/max)
   */
  value?: number;

  /**
   * The desired valueText to use in place of the value
   */
  valueText?: string;

  /**
   * A function that returns the desired valueText to use in place of the value
   */
  getValueText?: (value: number, percent: number) => string;
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

  const progressContext = useProgressContext();

  const defaultProps: ProgressIndicatorProps<"div"> = {
    colorScheme: "$primary9",
    value: 0,
    getValueText: progressContext.state.getValueText,
  };

  const propsWithDefault: ProgressIndicatorProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "class",
    "colorScheme",
    "striped",
    "animated",
    "indeterminate",
    "value",
    "valueText",
    "getValueText",
  ]);

  const percent = () => {
    if (local.value == null) {
      return 0;
    }

    return valueToPercent(local.value, progressContext.state.min, progressContext.state.max);
  };

  const ariaValueText = () => {
    if (local.value == null) {
      return undefined;
    }

    return isFunction(local.getValueText) ? local.getValueText(local.value, percent()) : local.valueText;
  };

  const backgroundStyles = () => {
    if (local.indeterminate) {
      return {
        backgroundImage: `linear-gradient(to right, transparent 0%, ${local.colorScheme} 50%, transparent 100%)`,
      };
    }

    return { backgroundColor: local.colorScheme };
  };

  const classes = () => {
    return classNames(
      local.class,
      hopeProgressIndicatorClass,
      progressIndicatorStyles({
        striped: local.striped,
        animated: local.animated,
        indeterminate: local.indeterminate === true ? true : false, // ensure a boolean is passed so compound variants works correctly
        css: {
          ...backgroundStyles(),
          width: `${percent()}%`,
        },
      })
    );
  };

  return (
    <Box
      class={classes()}
      __baseStyle={theme?.baseStyle?.indicator}
      role="progressbar"
      data-indeterminate={local.indeterminate ? "" : undefined}
      aria-valuemin={progressContext.state.min}
      aria-valuemax={progressContext.state.max}
      aria-valuenow={local.indeterminate ? undefined : local.value}
      aria-valuetext={ariaValueText()}
      {...others}
    />
  );
}

ProgressIndicator.toString = () => createClassSelector(hopeProgressIndicatorClass);
