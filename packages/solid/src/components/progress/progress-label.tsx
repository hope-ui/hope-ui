import { Show, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useProgressContext } from "./progress";
import { progressLabelStyles } from "./progress.styles";

export type ProgressLabelProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeProgressLabelClass = "hope-progress__label";

/**
 * ProgressLabel is used to show the numeric value of the progress.
 */
export function ProgressLabel<C extends ElementType = "div">(props: ProgressLabelProps<C>) {
  const theme = useStyleConfig().Progress;

  const progressContext = useProgressContext();

  const [local, others] = splitProps(props, ["class", "children"]);

  const classes = () => classNames(local.class, hopeProgressLabelClass, progressLabelStyles());

  return (
    <Box class={classes()} __baseStyle={theme?.baseStyle?.label} {...others}>
      <Show when={local.children} fallback={progressContext.state.ariaValueText}>
        {local.children}
      </Show>
    </Box>
  );
}

ProgressLabel.toString = () => createClassSelector(hopeProgressLabelClass);
