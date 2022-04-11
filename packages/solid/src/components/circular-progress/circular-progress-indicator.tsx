import { mergeProps, splitProps } from "solid-js";

import { ColorProps } from "../../styled-system/props/color";
import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { HTMLHopeProps } from "../types";
import { useCircularProgressContext } from "./circular-progress";
import { circularProgressIndicatorContainerStyles, circularProgressIndicatorStyles } from "./circular-progress.styles";

export interface ThemeableCircularProgressIndicatorOptions {
  /**
   * The stroke color of the progress indicator.
   */
  color?: ColorProps["color"];

  /**
   * If `true`, the caps of the progress indicator will be rounded.
   */
  withRoundCaps?: boolean;
}

type CircularProgressIndicatorOptions = ThemeableCircularProgressIndicatorOptions;

type CircularProgressIndicatorProps = HTMLHopeProps<"svg", CircularProgressIndicatorOptions>;

const hopeCircularProgressIndicatorClass = "hope-circular-progress__indicator";

/**
 * ProgressIndicator (Circular)
 *
 * The progress component that visually indicates the current level of the circular progress bar.
 */
export function CircularProgressIndicator(props: CircularProgressIndicatorProps) {
  const theme = useStyleConfig().CircularProgress;

  const circularProgressContext = useCircularProgressContext();

  const defaultProps: CircularProgressIndicatorProps = {
    color: theme?.defaultProps?.indicator?.color ?? "$primary9",
    withRoundCaps: theme?.defaultProps?.indicator?.withRoundCaps ?? false,
  };

  const propsWithDefault: CircularProgressIndicatorProps = mergeProps(defaultProps, props);

  const [local, others] = splitProps(propsWithDefault, ["class", "children", "color", "withRoundCaps"]);

  const strokeDasharray = () => {
    if (circularProgressContext.state.indeterminate) {
      return undefined;
    }

    const determinant = circularProgressContext.state.percent * 2.64;

    return `${determinant} ${264 - determinant}`;
  };

  const rootClasses = () => {
    return classNames(
      local.class,
      hopeCircularProgressIndicatorClass,
      circularProgressIndicatorContainerStyles({ spin: circularProgressContext.state.indeterminate })
    );
  };

  const indicatorClasses = () => {
    return circularProgressIndicatorStyles({
      hidden: !circularProgressContext.state.isIndicatorVisible,
      indeterminate: circularProgressContext.state.indeterminate === true ? true : false, // ensure a boolean is passed so the `true/false` values works correctly
      withRoundCaps: local.withRoundCaps,
      css: {
        color: local.color,
        strokeWidth: circularProgressContext.state.thickness,
        strokeDasharray: strokeDasharray(),
      },
    });
  };

  return (
    <hope.svg viewBox="0 0 100 100" class={rootClasses()} boxSize={circularProgressContext.state.size} {...others}>
      <hope.circle cx={50} cy={50} r={42} class={indicatorClasses()} __baseStyle={theme?.baseStyle?.indicator} />
    </hope.svg>
  );
}

CircularProgressIndicator.toString = () => createClassSelector(hopeCircularProgressIndicatorClass);
