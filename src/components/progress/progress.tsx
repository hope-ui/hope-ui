import { createContext, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { progressStyles, ProgressVariants } from "./progress.styles";
import { GetProgressPropsOptions } from "./progress.utils";

type ThemeableProgressOptions = ProgressVariants;

interface ProgressOptions extends ThemeableProgressOptions, Partial<GetProgressPropsOptions> {}

export type ProgressProps<C extends ElementType = "div"> = HTMLHopeProps<C, ProgressOptions>;

export interface ProgressStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    indicator?: SystemStyleObject;
    label?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableProgressOptions;
  };
}

type ProgressState = GetProgressPropsOptions;

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
  const theme = useComponentStyleConfigs().Progress;

  const [state] = createStore<ProgressState>({
    get min() {
      return props.min ?? 0;
    },
    get max() {
      return props.max ?? 100;
    },
    get value() {
      return props.value;
    },
    get valueText() {
      return props.valueText;
    },
    get getValueText() {
      return props.getValueText;
    },
    get indeterminate() {
      return props.indeterminate;
    },
  });

  const [local, others] = splitProps(props, ["class", "size"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeProgressClass,
      progressStyles({ size: local.size ?? theme?.defaultProps?.root?.size ?? "md" })
    );
  };

  const context: ProgressContextValue = {
    state,
  };

  return (
    <ProgressContext.Provider value={context}>
      <Box class={classes()} __baseStyle={theme?.baseStyle?.root} {...others} />
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
