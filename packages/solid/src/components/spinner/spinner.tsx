import { Property } from "csstype";
import { mergeProps, Show, splitProps } from "solid-js";

import { BorderProps } from "../../styled-system/props/border";
import { ColorProps } from "../../styled-system/props/color";
import { visuallyHiddenStyles } from "../../styled-system/utils";
import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps, SinglePartComponentStyleConfig } from "../types";
import { spinnerStyles, SpinnerVariants } from "./spinner.styles";

interface SpinnerOptions extends SpinnerVariants {
  /**
   * The color of the spinner
   */
  color?: ColorProps["color"];

  /**
   * The color of the empty area in the spinner
   */
  emptyColor?: ColorProps["color"];

  /**
   * The thickness of the spinner
   * @example
   * ```jsx
   * <Spinner thickness="4px"/>
   * ```
   */
  thickness?: BorderProps["borderWidth"];

  /**
   * The speed of the spinner.
   * @example
   * ```jsx
   * <Spinner speed="0.2s"/>
   * ```
   */
  speed?: Property.TransitionDuration;

  /**
   * For accessibility, it is important to add a fallback loading text.
   * This text will be visible to screen readers.
   */
  label?: string;
}

export type SpinnerProps<C extends ElementType = "div"> = HTMLHopeProps<C, SpinnerOptions>;

export type SpinnerStyleConfig = SinglePartComponentStyleConfig<SpinnerOptions>;

const hopeSpinnerClass = "hope-spinner";

export function Spinner<C extends ElementType = "div">(props: SpinnerProps<C>) {
  const theme = useStyleConfig().Spinner;

  const defaultProps: SpinnerProps<"div"> = {
    label: theme?.defaultProps?.label ?? "Loading...",
    size: theme?.defaultProps?.size ?? "md",
    emptyColor: theme?.defaultProps?.emptyColor,
    color: theme?.defaultProps?.color,
    thickness: theme?.defaultProps?.thickness,
    speed: theme?.defaultProps?.speed,
  };

  const propsWithDefault: SpinnerProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "class",
    "children",
    "label",
    "size",
    "emptyColor",
    "color",
    "thickness",
    "speed",
  ]);

  const classes = () =>
    classNames(
      local.class,
      hopeSpinnerClass,
      spinnerStyles({
        size: local.size,
        css: {
          color: local.color,
          borderWidth: local.thickness,
          borderBottomColor: local.emptyColor,
          borderLeftColor: local.emptyColor,
          animationDuration: local.speed,
        },
      })
    );

  return (
    <Box class={classes()} {...others}>
      <Show when={local.label}>
        <span class={visuallyHiddenStyles()}>{local.label}</span>
      </Show>
    </Box>
  );
}

Spinner.toString = () => createClassSelector(hopeSpinnerClass);
