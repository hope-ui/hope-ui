import { Property } from "csstype";
import { createContext, mergeProps, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SizeScaleValue, SystemStyleObject } from "../../styled-system";
import { ColorProps } from "../../styled-system/props/color";
import { SizeProps } from "../../styled-system/props/size";
import { useStyleConfig } from "../../hope-provider";
import { isFunction } from "../../utils/assertion";
import { classNames, createClassSelector } from "../../utils/css";
import { valueToPercent } from "../../utils/number";
import { Box } from "../box/box";
import { hope } from "../factory";
import { ProgressState } from "../progress/progress";
import { ElementType, HTMLHopeProps } from "../types";
import { circularProgressStyles, circularProgressTrackStyles } from "./circular-progress.styles";
import { ThemeableCircularProgressIndicatorOptions } from "./circular-progress-indicator";

interface CircularProgressState extends ProgressState {
  /**
   * The size of the circular progress.
   */
  size: SizeProps["boxSize"];

  /**
   * The thickness of the circles.
   */
  thickness: Property.StrokeWidth<SizeScaleValue> | number;

  /**
   * If `true`, the circular progress indicator will be visible.
   * Used to prevent showing the indicator when value is 0 in Safari.
   */
  isIndicatorVisible: boolean;
}

interface CircularProgressOptions
  extends Partial<Omit<CircularProgressState, "percent" | "ariaValueText" | "isIndicatorVisible">> {
  /**
   * The color of the circular progress track.
   */
  trackColor?: ColorProps["color"];

  /**
   * The desired valueText to use in place of the value
   */
  valueText?: string;
}

type ThemeableCircularProgressOptions = Pick<
  CircularProgressOptions,
  "size" | "thickness" | "trackColor"
>;

export type CircularProgressProps<C extends ElementType = "div"> = HTMLHopeProps<
  C,
  CircularProgressOptions
>;

export interface CircularProgressStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    track?: SystemStyleObject;
    indicator?: SystemStyleObject;
    label?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableCircularProgressOptions;
    indicator?: ThemeableCircularProgressIndicatorOptions;
  };
}

interface CircularProgressContextValue {
  state: CircularProgressState;
}

const CircularProgressContext = createContext<CircularProgressContextValue>();

const hopeCircularProgressClass = "hope-circular-progress";
const hopeCircularProgressTrackClass = "hope-circular-progress__track";

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
  const theme = useStyleConfig().CircularProgress;

  const [state] = createStore<CircularProgressState>({
    get size() {
      return props.size ?? theme?.defaultProps?.root?.size ?? "$12";
    },
    get thickness() {
      return props.thickness ?? theme?.defaultProps?.root?.thickness ?? "$2_5";
    },
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
    get isIndicatorVisible() {
      return this.value > 0 || this.indeterminate ? true : false;
    },
  });

  const defaultProps: CircularProgressProps<"div"> = {
    size: theme?.defaultProps?.root?.size ?? "$12",
    thickness: theme?.defaultProps?.root?.thickness ?? "$2_5",
    trackColor: theme?.defaultProps?.root?.trackColor ?? "$neutral4",
  };

  const propsWithDefaults: CircularProgressProps<"div"> = mergeProps(defaultProps, props);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [local, _, others] = splitProps(
    propsWithDefaults,
    ["class", "children", "trackColor"],
    ["size", "thickness", "min", "max", "getValueText"]
  );

  const rootClasses = () =>
    classNames(local.class, hopeCircularProgressClass, circularProgressStyles());

  const trackClasses = () => {
    return classNames(
      hopeCircularProgressTrackClass,
      circularProgressTrackStyles({
        css: {
          color: local.trackColor,
          strokeWidth: state.thickness,
        },
      })
    );
  };

  const context: CircularProgressContextValue = {
    state,
  };

  return (
    <CircularProgressContext.Provider value={context}>
      <Box
        role="progressbar"
        data-indeterminate={state.indeterminate ? "" : undefined}
        aria-valuemin={state.min}
        aria-valuemax={state.max}
        aria-valuenow={state.indeterminate ? undefined : state.value}
        aria-valuetext={state.ariaValueText}
        class={rootClasses()}
        __baseStyle={theme?.baseStyle?.root}
        {...others}
      >
        <hope.svg viewBox="0 0 100 100" boxSize={state.size}>
          <hope.circle
            cx={50}
            cy={50}
            r={42}
            class={trackClasses()}
            __baseStyle={theme?.baseStyle?.track}
          />
        </hope.svg>
        {local.children}
      </Box>
    </CircularProgressContext.Provider>
  );
}

CircularProgress.toString = () => createClassSelector(hopeCircularProgressClass);

export function useCircularProgressContext() {
  const context = useContext(CircularProgressContext);

  if (!context) {
    throw new Error(
      "[Hope UI]: useCircularProgressContext must be used within a `<CircularProgress />` component"
    );
  }

  return context;
}
