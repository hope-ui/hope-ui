import { mergeProps, splitProps } from "solid-js";

import { ColorProps } from "@/styled-system/props/color";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useProgressContext } from "./progress";
import { progressIndicatorStyles, ProgressIndicatorVariants } from "./progress.styles";

export interface ThemeableProgressIndicatorOptions extends Omit<ProgressIndicatorVariants, "indeterminate"> {
  /**
   * The color of the progress indicator.
   */
  color?: ColorProps["color"];
}

type ProgressIndicatorOptions = ThemeableProgressIndicatorOptions;

export type ProgressIndicatorProps<C extends ElementType = "div"> = HTMLHopeProps<C, ProgressIndicatorOptions>;

const hopeProgressIndicatorClass = "hope-progress__indicator";

/**
 * ProgressIndicator (Linear)
 *
 * The progress component that visually indicates the current level of the progress bar.
 * It applies `background-color` and changes its width.
 */
export function ProgressIndicator<C extends ElementType = "div">(props: ProgressIndicatorProps<C>) {
  const theme = useComponentStyleConfigs().Progress;

  const progressContext = useProgressContext();

  const defaultProps: ProgressIndicatorProps<"div"> = {
    color: "$primary9",
  };

  const propsWithDefault: ProgressIndicatorProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "color", "striped", "animated"]);

  const backgroundStyles = () => {
    if (progressContext.state.indeterminate) {
      return {
        backgroundImage: `linear-gradient(to right, transparent 0%, ${local.color} 50%, transparent 100%)`,
      };
    }

    return { backgroundColor: local.color };
  };

  const classes = () => {
    return classNames(
      local.class,
      hopeProgressIndicatorClass,
      progressIndicatorStyles({
        striped: local.striped,
        animated: local.animated,
        indeterminate: progressContext.state.indeterminate === true ? true : false, // ensure a boolean is passed so compound variants works correctly
        css: {
          ...backgroundStyles(),
          width: `${progressContext.state.percent}%`,
        },
      })
    );
  };

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.indicator} {...others} />;
}

ProgressIndicator.toString = () => createClassSelector(hopeProgressIndicatorClass);
