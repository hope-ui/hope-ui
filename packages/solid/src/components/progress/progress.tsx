import { createContext, mergeProps, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { ColorProps } from "../../styled-system/props/color";
import { SystemStyleObject } from "../../styled-system/types";
import { useStyleConfig } from "../../hope-provider";
import { isFunction } from "../../utils/assertion";
import { classNames, createClassSelector } from "../../utils/css";
import { valueToPercent } from "../../utils/number";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { progressStyles, ProgressVariants } from "./progress.styles";
import { ThemeableProgressIndicatorOptions } from "./progress-indicator";

export interface ProgressState {
  /**
   * Minimum value defining 'no progress' (must be lower than 'max')
   */
  min: number;

  /**
   * Maximum value defining 100% progress made (must be higher than 'min')
   */
  max: number;

  /**
   * Current progress (must be between min/max)
   */
  value: number;

  /**
   * If `true`, the progress will be indeterminate and the `value` prop will be ignored.
   */
  indeterminate: boolean;

  /**
   * The percentage of progress based on value, min and max.
   */
  percent: number;

  /**
   * The human readable text alternative of aria-valuenow.
   */
  ariaValueText?: string;

  /**
   * A function that returns the desired valueText to use in place of the value
   */
  getValueText?: (value: number, percent: number) => string;
}

interface ThemeableProgressOptions extends ProgressVariants {
  /**
   * The color of the progress track.
   */
  trackColor?: ColorProps["color"];
}

interface ProgressOptions extends ThemeableProgressOptions, Partial<Omit<ProgressState, "percent" | "ariaValueText">> {
  /**
   * The desired valueText to use in place of the value
   */
  valueText?: string;
}

export type ProgressProps<C extends ElementType = "div"> = HTMLHopeProps<C, ProgressOptions>;

export interface ProgressStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    indicator?: SystemStyleObject;
    label?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableProgressOptions;
    indicator?: ThemeableProgressIndicatorOptions;
  };
}

interface ProgressContextValue {
  state: ProgressState;
}

const ProgressContext = createContext<ProgressContextValue>();

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
  const theme = useStyleConfig().Progress;

  const [state] = createStore<ProgressState>({
    get min() {
      return props.min ?? 0;
    },
    get max() {
      return props.max ?? 100;
    },
    get value() {
      return props.value ?? 0;
    },
    get percent() {
      return valueToPercent(this.value, this.min, this.max);
    },
    get indeterminate() {
      return props.indeterminate ?? false;
    },
    get ariaValueText() {
      if (this.indeterminate) {
        return undefined;
      }

      if (isFunction(this.getValueText)) {
        return this.getValueText(this.value, this.percent);
      }

      return props.valueText ?? `${this.percent}%`;
    },
    get getValueText() {
      return props.getValueText;
    },
  });

  const defaultProps: ProgressProps<"div"> = {
    size: theme?.defaultProps?.root?.size ?? "md",
    trackColor: theme?.defaultProps?.root?.trackColor ?? "$neutral4",
  };

  const propsWithDefault: ProgressProps<"div"> = mergeProps(defaultProps, props);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [local, _, others] = splitProps(
    propsWithDefault,
    ["class", "size", "trackColor"],
    ["min", "max", "value", "indeterminate", "valueText", "getValueText"]
  );

  const classes = () => {
    return classNames(local.class, hopeProgressClass, progressStyles({ size: local.size }));
  };

  const context: ProgressContextValue = {
    state,
  };

  return (
    <ProgressContext.Provider value={context}>
      <Box
        role="progressbar"
        data-indeterminate={state.indeterminate ? "" : undefined}
        aria-valuemin={state.min}
        aria-valuemax={state.max}
        aria-valuenow={state.indeterminate ? undefined : state.value}
        aria-valuetext={state.ariaValueText}
        class={classes()}
        __baseStyle={theme?.baseStyle?.root}
        backgroundColor={local.trackColor}
        {...others}
      />
    </ProgressContext.Provider>
  );
}

Progress.toString = () => createClassSelector(hopeProgressClass);

export function useProgressContext() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error("[Hope UI]: useProgressContext must be used within a `<Progress />` component");
  }

  return context;
}
