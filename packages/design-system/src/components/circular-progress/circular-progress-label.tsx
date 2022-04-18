import { Show, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useCircularProgressContext } from "./circular-progress";
import { circularProgressLabelStyles } from "./circular-progress.styles";

export type CircularProgressLabelProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeCircularProgressLabelClass = "hope-circular-progress__label";

/**
 * CircularProgressLabel is used to show the numeric value of the progress.
 */
export function CircularProgressLabel<C extends ElementType = "div">(
  props: CircularProgressLabelProps<C>
) {
  const theme = useStyleConfig().CircularProgress;

  const circularProgressContext = useCircularProgressContext();

  const [local, others] = splitProps(props, ["class", "children"]);

  const classes = () => {
    return classNames(local.class, hopeCircularProgressLabelClass, circularProgressLabelStyles());
  };

  return (
    <Box class={classes()} __baseStyle={theme?.baseStyle?.label} {...others}>
      <Show when={local.children} fallback={circularProgressContext.state.ariaValueText}>
        {local.children}
      </Show>
    </Box>
  );
}

CircularProgressLabel.toString = () => createClassSelector(hopeCircularProgressLabelClass);
