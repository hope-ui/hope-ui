import { Property } from "csstype";
import { JSX, mergeProps, Show, splitProps } from "solid-js";

import { SizeScaleValue, SystemStyleObject } from "@/styled-system";
import { ColorProps } from "@/styled-system/props/color";
import { SizeProps } from "@/styled-system/props/size";
import { useComponentStyleConfigs } from "@/theme/provider";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { valueToPercent } from "@/utils/number";

import { Box } from "../box/box";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { circularProgressStyles, circularProgressSvgStyles } from "./circular-progress.styles";
import { CircularProgressIndicator } from "./circular-progress-indicator";
import { CircularProgressTrack } from "./circular-progress-track";

interface ThemeableCircularProgressOptions {
  /**
   * The color of the progress indicator.
   */
  color?: ColorProps["color"];

  /**
   * The color of the progress track.
   */
  trackColor?: ColorProps["color"];

  /**
   * The size of the circular progress in CSS units
   */
  size?: SizeProps["boxSize"];

  /**
   * This defines the stroke width of the svg circle.
   */
  thickness?: Property.StrokeWidth<SizeScaleValue> | number;

  /**
   * If `true`, the cap of the progress indicator will be rounded.
   */
  withRoundCap?: boolean;

  /**
   * Minimum value defining 'no progress' (must be lower than 'max')
   */
  min?: number;

  /**
   * Maximum value defining 100% progress made (must be higher than 'min')
   */
  max?: number;
}

interface CircularProgressOptions extends ThemeableCircularProgressOptions {
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

  /**
   * The content of the circular progress bar. If passed, the content will be inside and centered in the progress bar.
   */
  children?: JSX.Element;
}

export type CircularProgressProps<C extends ElementType = "div"> = HTMLHopeProps<C, CircularProgressOptions>;

export interface CircularProgressStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    track?: SystemStyleObject;
    indicator?: SystemStyleObject;
    label?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableCircularProgressOptions;
  };
}

const hopeCircularProgressClass = "hope-circular-progress";

/**
 * Progress (Circular)
 *
 * CircularProgress is used to display the progress status for a task that takes a long
 * time or consists of several steps.
 *
 * It includes accessible attributes to help assistive technologies understand
 * and speak the progress values.
 */
export function CircularProgress<C extends ElementType = "div">(props: CircularProgressProps<C>) {
  const theme = useComponentStyleConfigs().CircularProgress;

  const defaultProps: CircularProgressProps<"div"> = {
    size: theme?.defaultProps?.root?.size ?? "$12",
    min: theme?.defaultProps?.root?.min ?? 0,
    max: theme?.defaultProps?.root?.max ?? 100,
    thickness: theme?.defaultProps?.root?.thickness ?? "$2_5",
    color: theme?.defaultProps?.root?.color ?? "$primary9",
    trackColor: theme?.defaultProps?.root?.trackColor ?? "$neutral4",

    value: 0,
    //getValueText: progressContext.state.getValueText,
  };

  const propsWithDefaults: CircularProgressProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefaults, [
    "class",
    "children",
    "color",
    "trackColor",
    "size",
    "thickness",
    "withRoundCap",
    "value",
    "min",
    "max",
    "indeterminate",
    "valueText",
    "getValueText",
  ]);

  const percent = () => {
    if (local.value == null) {
      return 0;
    }

    return valueToPercent(local.value, local.min!, local.max!);
  };

  const ariaValueText = () => {
    if (local.value == null) {
      return undefined;
    }

    return isFunction(local.getValueText) ? local.getValueText(local.value, percent()) : local.valueText;
  };

  const strokeDasharray = () => {
    if (local.indeterminate) {
      return undefined;
    }

    const determinant = (percent() ?? 0) * 2.64;

    return `${determinant} ${264 - determinant}`;
  };

  const isIndicatorVisible = () => local.value! > 0 || local.indeterminate;

  const classes = () => classNames(local.class, hopeCircularProgressClass, circularProgressStyles());

  const svgClasses = () => circularProgressSvgStyles({ spin: local.indeterminate });

  return (
    <Box
      class={classes()}
      __baseStyle={theme?.baseStyle?.root}
      role="progressbar"
      data-indeterminate={local.indeterminate ? "" : undefined}
      aria-valuemin={local.min}
      aria-valuemax={local.max}
      aria-valuenow={local.indeterminate ? undefined : local.value}
      aria-valuetext={ariaValueText()}
      {...others}
    >
      <hope.svg viewBox="0 0 100 100" class={svgClasses()} boxSize={local.size}>
        <CircularProgressTrack stroke={local.trackColor} strokeWidth={local.thickness} />
        <Show when={isIndicatorVisible()}>
          <CircularProgressIndicator
            spin={local.indeterminate}
            withRoundCap={local.withRoundCap}
            stroke={local.color}
            strokeWidth={local.thickness}
            stroke-dasharray={strokeDasharray()}
          />
        </Show>
      </hope.svg>
      {local.children}
    </Box>
  );
}

CircularProgress.toString = () => createClassSelector(hopeCircularProgressClass);
