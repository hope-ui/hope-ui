import { mergeProps, Show, splitProps } from "solid-js";

import { ColorProps } from "@/styled-system/props/color";
import { useComponentStyleConfigs } from "@/theme/provider";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { valueToPercent } from "@/utils/number";

import { Box } from "../box/box";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useCircularProgressContext } from "./circular-progress";
import { circularProgressIndicatorContainerStyles, circularProgressIndicatorStyles } from "./circular-progress.styles";

interface CircularProgressIndicatorOptions {
  /**
   * The stroke color of the progress indicator.
   */
  color?: ColorProps["color"];

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

type CircularProgressIndicatorProps<C extends ElementType = "div"> = HTMLHopeProps<C, CircularProgressIndicatorOptions>;

const hopeCircularProgressIndicatorClass = "hope-circular-progress__indicator";

/**
 * ProgressIndicator (Circular)
 *
 * The progress component that visually indicates the current level of the circular progress bar.
 */
export function CircularProgressIndicator<C extends ElementType = "div">(props: CircularProgressIndicatorProps<C>) {
  const theme = useComponentStyleConfigs().CircularProgress;

  const circularProgressContext = useCircularProgressContext();

  const defaultProps: CircularProgressIndicatorProps<"div"> = {
    color: "$primary9",
    value: 0,
    getValueText: circularProgressContext.state.getValueText,
  };

  const propsWithDefault: CircularProgressIndicatorProps<"div"> = mergeProps(defaultProps, props);

  const [local, others] = splitProps(propsWithDefault, [
    "class",
    "children",
    "color",
    "indeterminate",
    "value",
    "valueText",
    "getValueText",
  ]);

  const percent = () => {
    if (local.value == null) {
      return 0;
    }

    return valueToPercent(local.value, circularProgressContext.state.min, circularProgressContext.state.max);
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

  // prevent showing the indicator when value is 0 in safari.
  const isIndicatorVisible = () => {
    if (local.value == null || local.value <= 0 || local.indeterminate) {
      return false;
    }

    return true;
  };

  const rootClasses = () => {
    return classNames(
      local.class,
      hopeCircularProgressIndicatorClass,
      circularProgressIndicatorContainerStyles({ spin: local.indeterminate })
    );
  };

  const indicatorClasses = () => {
    return circularProgressIndicatorStyles({
      indeterminate: local.indeterminate === true ? true : false, // ensure a boolean is passed so the `true/false` values works correctly
      withRoundCaps: circularProgressContext.state.withRoundCaps,
      css: {
        color: local.color,
        strokeWidth: circularProgressContext.state.thickness,
      },
    });
  };

  return (
    <Box
      role="progressbar"
      data-indeterminate={local.indeterminate ? "" : undefined}
      aria-valuemin={circularProgressContext.state.min}
      aria-valuemax={circularProgressContext.state.max}
      aria-valuenow={local.indeterminate ? undefined : local.value}
      aria-valuetext={ariaValueText()}
      class={rootClasses()}
      {...others}
    >
      <Show when={isIndicatorVisible()}>
        <hope.svg viewBox="0 0 100 100" boxSize={circularProgressContext.state.size}>
          <hope.circle
            cx={50}
            cy={50}
            r={42}
            stroke-dasharray={strokeDasharray()}
            class={indicatorClasses()}
            __baseStyle={theme?.baseStyle?.indicator}
          />
        </hope.svg>
      </Show>
    </Box>
  );
}

CircularProgressIndicator.toString = () => createClassSelector(hopeCircularProgressIndicatorClass);
