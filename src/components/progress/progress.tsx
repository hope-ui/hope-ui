import { createMemo, mergeProps, splitProps } from "solid-js";

import { RadiiProps } from "@/styled-system/props/radii";
import { ResponsiveValue } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps, SinglePartComponentStyleConfig } from "../types";
import {
  progressFilledTrackStyles,
  ProgressFilledTrackVariants,
  progressTrackStyles,
  ProgressTrackVariants,
} from "./progress.styles";
import { getProgressProps, GetProgressPropsOptions } from "./progress.utils";

/* -------------------------------------------------------------------------------------------------
 * ProgressFilledTrack (Linear)
 * -----------------------------------------------------------------------------------------------*/

type ProgressFilledTrackOptions = GetProgressPropsOptions & ProgressFilledTrackVariants;

type ProgressFilledTrackProps<C extends ElementType = "div"> = HTMLHopeProps<C, ProgressFilledTrackOptions>;

/**
 * ProgressFilledTrack (Linear)
 *
 * The progress component that visually indicates the current level of the progress bar.
 * It applies `background-color` and changes its width.
 */
function ProgressFilledTrack<C extends ElementType = "div">(props: ProgressFilledTrackProps<C>) {
  const [local, others] = splitProps(props, [
    "class",
    "min",
    "max",
    "value",
    "colorScheme",
    "striped",
    "animated",
    "indeterminate",
  ]);

  const progress = createMemo(() => {
    return getProgressProps({
      value: local.value,
      min: local.min,
      max: local.max,
      indeterminate: local.indeterminate,
    });
  });

  const progressProps = () => progress().bind;

  const width = () => `${progress().percent}%`;

  const classes = () => {
    return classNames(
      local.class,
      progressFilledTrackStyles({
        colorScheme: local.colorScheme,
        striped: local.striped,
        animated: local.animated,
        indeterminate: local.indeterminate === true ? true : false, // ensure a boolean is passed so compound variants works correctly
      })
    );
  };

  return <Box class={classes()} width={width()} {...progressProps} {...others} />;
}

/* -------------------------------------------------------------------------------------------------
 * Progress
 * -----------------------------------------------------------------------------------------------*/

interface ThemeableProgressOptions extends ProgressTrackVariants, Omit<ProgressFilledTrackVariants, "indeterminate"> {
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
    min: theme?.defaultProps?.min ?? 0,
    max: theme?.defaultProps?.max ?? 100,
    size: theme?.defaultProps?.size ?? "md",
    colorScheme: theme?.defaultProps?.colorScheme ?? "primary",
    striped: theme?.defaultProps?.striped ?? false,
    animated: theme?.defaultProps?.animated ?? false,

    borderRadius: theme?.baseStyle?.borderRadius as ResponsiveValue<RadiiProps["borderRadius"]>,
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
    "colorScheme",
    "striped",
    "animated",
    "indeterminate",
    "borderRadius",
  ]);

  const classes = () => classNames(local.class, hopeProgressClass, progressTrackStyles({ size: local.size }));

  return (
    <Box class={classes()} __baseStyle={theme?.baseStyle} borderRadius={local.borderRadius} {...others}>
      <ProgressFilledTrack
        aria-label={local["aria-label"]}
        aria-labelledby={local["aria-labelledby"]}
        min={local.min ?? 0}
        max={local.max ?? 100}
        value={local.value}
        colorScheme={local.colorScheme}
        striped={local.striped}
        animated={local.animated}
        indeterminate={local.indeterminate}
        borderRadius={local.borderRadius}
      >
        {local.children}
      </ProgressFilledTrack>
    </Box>
  );
}

Progress.toString = () => createClassSelector(hopeProgressClass);
