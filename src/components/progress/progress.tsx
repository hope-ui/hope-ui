import { mergeProps, splitProps } from "solid-js";

import { ColorProps } from "@/styled-system/props/color";
import { RadiiProps } from "@/styled-system/props/radii";
import { ResponsiveValue } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps, SinglePartComponentStyleConfig } from "../types";
import { ProgressIndicatorVariants, progressTrackStyles, ProgressTrackVariants } from "./progress.styles";
import { ProgressIndicator } from "./progress-indicator";

/* -------------------------------------------------------------------------------------------------
 * Progress
 * -----------------------------------------------------------------------------------------------*/

interface ThemeableProgressOptions extends ProgressTrackVariants, Omit<ProgressIndicatorVariants, "indeterminate"> {
  /**
   * The color of the progress indicator.
   */
  color?: ColorProps["color"];

  /**
   * The color of the progress track.
   */
  trackColor?: ColorProps["color"];

  /**
   * The minimum value of the progress.
   */
  min?: number;

  /**
   * The maximum value of the progress.
   */
  max?: number;
}

interface ProgressOptions extends ThemeableProgressOptions {
  /**
   * The `value` of the progress indicator.
   * If `undefined` the progress bar will be in `indeterminate` state.
   */
  value?: number;

  /**
   * If `true`, the progress will be indeterminate and the `value` prop will be ignored.
   */
  indeterminate?: boolean;
}

export type ProgressProps<C extends ElementType = "div"> = HTMLHopeProps<C, ProgressOptions>;

export type ProgressStyleConfig = SinglePartComponentStyleConfig<ThemeableProgressOptions>;

const hopeProgressClass = "hope-progress";

/**
 * Progress (Linear)
 *
 * Progress is used to display the progress status for a task that takes a long
 * time or consists of several steps.
 *
 * It includes accessible attributes to help assistive technologies understand
 * and speak the progress values.
 */
export function Progress<C extends ElementType = "div">(props: ProgressProps<C>) {
  const theme = useComponentStyleConfigs().Progress;

  const defaultProps: ProgressProps<"div"> = {
    color: theme?.defaultProps?.color ?? "$primary9",
    trackColor: theme?.defaultProps?.trackColor ?? "$neutral4",
    min: theme?.defaultProps?.min ?? 0,
    max: theme?.defaultProps?.max ?? 100,
    size: theme?.defaultProps?.size ?? "md",
    striped: theme?.defaultProps?.striped ?? false,
    animated: theme?.defaultProps?.animated ?? false,
    borderRadius: (theme?.baseStyle?.borderRadius as ResponsiveValue<RadiiProps["borderRadius"]>) ?? "$none",
  };

  const propsWithDefaults: ProgressProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefaults, [
    "class",
    "children",
    "value",
    "min",
    "max",
    "aria-label",
    "aria-labelledby",
    "size",
    "color",
    "trackColor",
    "striped",
    "animated",
    "indeterminate",
    "borderRadius",
  ]);

  const classes = () => classNames(local.class, hopeProgressClass, progressTrackStyles({ size: local.size }));

  return (
    <Box
      class={classes()}
      __baseStyle={theme?.baseStyle}
      bg={local.trackColor}
      borderRadius={local.borderRadius}
      {...others}
    >
      <ProgressIndicator
        aria-label={local["aria-label"]}
        aria-labelledby={local["aria-labelledby"]}
        min={local.min ?? 0}
        max={local.max ?? 100}
        value={local.value}
        color={local.color}
        striped={local.striped}
        animated={local.animated}
        indeterminate={local.indeterminate}
        borderRadius={local.borderRadius}
      >
        {local.children}
      </ProgressIndicator>
    </Box>
  );
}

Progress.toString = () => createClassSelector(hopeProgressClass);
