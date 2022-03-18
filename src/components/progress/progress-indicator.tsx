import { createMemo, mergeProps, splitProps } from "solid-js";

import { ColorProps } from "@/styled-system/props/color";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useProgressContext } from "./progress";
import { progressIndicatorStyles, ProgressIndicatorVariants } from "./progress.styles";
import { getProgressProps } from "./progress.utils";

interface ProgressIndicatorOptions extends Omit<ProgressIndicatorVariants, "indeterminate"> {
  /**
   * The color of the progress indicator.
   */
  colorScheme?: ColorProps["color"];
}

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
    colorScheme: "$primary9",
  };

  const propsWithDefault: ProgressIndicatorProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["class", "colorScheme", "striped", "animated"]);

  const progress = createMemo(() => {
    return getProgressProps({
      value: progressContext.state.value,
      min: progressContext.state.min,
      max: progressContext.state.max,
      valueText: progressContext.state.valueText,
      getValueText: progressContext.state.getValueText,
      indeterminate: progressContext.state.indeterminate,
    });
  });

  const progressProps = () => progress().bind;

  const width = () => `${progress().percent}%`;

  const backgroundStyles = () => {
    if (progressContext.state.indeterminate) {
      return {
        backgroundImage: `linear-gradient(to right, transparent 0%, ${local.colorScheme} 50%, transparent 100%)`,
      };
    }

    return { backgroundColor: local.colorScheme };
  };

  const classes = () => {
    return classNames(
      local.class,
      hopeProgressIndicatorClass,
      progressIndicatorStyles({
        striped: local.striped,
        animated: local.animated,
        indeterminate: progressContext.state.indeterminate === true ? true : false, // ensure a boolean is passed so compound variants works correctly
        css: backgroundStyles(),
      })
    );
  };

  return (
    <Box class={classes()} __baseStyle={theme?.baseStyle?.indicator} width={width()} {...progressProps} {...others} />
  );
}

ProgressIndicator.toString = () => createClassSelector(hopeProgressIndicatorClass);
