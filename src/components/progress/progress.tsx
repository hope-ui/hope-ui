import { mergeProps, splitProps } from "solid-js";

import { ColorProps } from "@/styled-system/props/color";
import { RadiiProps } from "@/styled-system/props/radii";
import { ResponsiveValue, SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
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
   * The border-radius of the progress track and indicator.
   */
  borderRadius?: ResponsiveValue<RadiiProps["borderRadius"]>;

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

export interface ProgressStyleConfig {
  baseStyle?: {
    track?: SystemStyleObject;
    indicator?: SystemStyleObject;
    label?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableProgressOptions;
  };
}

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
    color: theme?.defaultProps?.root?.color ?? "$primary9",
    trackColor: theme?.defaultProps?.root?.trackColor ?? "$neutral4",
    min: theme?.defaultProps?.root?.min ?? 0,
    max: theme?.defaultProps?.root?.max ?? 100,
    size: theme?.defaultProps?.root?.size ?? "md",
    striped: theme?.defaultProps?.root?.striped ?? false,
    animated: theme?.defaultProps?.root?.animated ?? false,
    borderRadius: theme?.defaultProps?.root?.borderRadius ?? "$none",
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
      __baseStyle={theme?.baseStyle?.track}
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
