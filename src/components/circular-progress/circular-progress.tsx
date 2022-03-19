import { Property } from "csstype";
import { createContext, mergeProps, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SizeScaleValue, SystemStyleObject } from "@/styled-system";
import { ColorProps } from "@/styled-system/props/color";
import { SizeProps } from "@/styled-system/props/size";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { circularProgressStyles, circularProgressTrackStyles } from "./circular-progress.styles";

interface CircularProgressState {
  /**
   * The size of the circular progress in CSS units
   */
  size: SizeProps["boxSize"];

  /**
   * This defines the stroke width of the svg circle.
   */
  thickness: Property.StrokeWidth<SizeScaleValue> | number;

  /**
   * If `true`, the cap of the progress indicator will be rounded.
   */
  withRoundCaps: boolean;

  /**
   * Minimum value defining 'no progress' (must be lower than 'max')
   */
  min: number;

  /**
   * Maximum value defining 100% progress made (must be higher than 'min')
   */
  max: number;

  /**
   * A function that returns the desired valueText to use in place of the value
   */
  getValueText?: (value: number, percent: number) => string;

  /**
   * An array of all children circular progress indicator.
   */
  values: number[];
}

type CircularProgressOptions = Partial<CircularProgressState> & {
  /**
   * The color of the progress track.
   */
  trackColor?: ColorProps["color"];
};

type ThemeableCircularProgressOptions = Pick<
  CircularProgressOptions,
  "trackColor" | "size" | "thickness" | "withRoundCaps"
>;

export type CircularProgressProps<C extends ElementType = "div"> = HTMLHopeProps<C, CircularProgressOptions>;

export interface CircularProgressStyleConfig {
  baseStyle?: {
    track?: SystemStyleObject;
    indicator?: SystemStyleObject;
    label?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableCircularProgressOptions;
  };
}

interface CircularProgressContextValue {
  state: CircularProgressState;

  /**
   * Callback to register a circular progress indicator to the context.
   */
  registerIndicator: (value: number) => number;

  /**
   * Get the length of the circular progress indicator.
   */
  getCircleLength: (index: number) => number;
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
  const theme = useComponentStyleConfigs().CircularProgress;

  const [state, setState] = createStore<CircularProgressState>({
    get size() {
      return props.size ?? theme?.defaultProps?.root?.size ?? "$12";
    },
    get thickness() {
      return props.thickness ?? theme?.defaultProps?.root?.thickness ?? "$2_5";
    },
    get withRoundCaps() {
      return props.withRoundCaps ?? theme?.defaultProps?.root?.withRoundCaps ?? false;
    },
    get min() {
      return props.min ?? 0;
    },
    get max() {
      return props.max ?? 100;
    },
    get getValueText() {
      return props.getValueText;
    },
    values: [],
  });

  const defaultProps: CircularProgressProps<"div"> = {
    trackColor: theme?.defaultProps?.root?.trackColor ?? "$neutral4",
  };

  const propsWithDefaults: CircularProgressProps<"div"> = mergeProps(defaultProps, props);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [local, _, others] = splitProps(
    propsWithDefaults,
    ["class", "children", "trackColor"],
    ["size", "thickness", "withRoundCaps", "min", "max", "getValueText"]
  );

  const rootClasses = () => classNames(local.class, hopeCircularProgressClass, circularProgressStyles());

  const trackClasses = () => {
    return circularProgressTrackStyles({
      css: {
        color: local.trackColor,
        strokeWidth: state.thickness,
      },
    });
  };

  const registerIndicator = (value: number) => {
    setState("values", prev => [...prev, value]);

    return state.values.length - 1;
  };

  const getCircleLength = (index: number) => {
    if (index <= 0) {
      return 0;
    }

    return state.values[index - 1];
  };

  const context: CircularProgressContextValue = {
    state: state as CircularProgressState,
    registerIndicator,
    getCircleLength,
  };

  return (
    <CircularProgressContext.Provider value={context}>
      <Box class={rootClasses()} {...others}>
        <hope.svg class={hopeCircularProgressTrackClass} viewBox="0 0 100 100" boxSize={state.size}>
          <hope.circle class={trackClasses()} cx={50} cy={50} r={42} __baseStyle={theme?.baseStyle?.track} />
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
    throw new Error("[Hope UI]: useCircularProgressContext must be used within a `<CircularProgress />` component");
  }

  return context;
}
