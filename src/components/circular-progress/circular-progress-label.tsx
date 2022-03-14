import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { circularProgressLabelStyles } from "./circular-progress.styles";

export type CircularProgressLabelProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeCircularProgressLabelClass = "hope-circular-progress__label";

/**
 * CircularProgressLabel is used to show the numeric value of the progress.
 */
export function CircularProgressLabel<C extends ElementType = "div">(props: CircularProgressLabelProps<C>) {
  const theme = useComponentStyleConfigs().CircularProgress;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => {
    return classNames(local.class, hopeCircularProgressLabelClass, circularProgressLabelStyles());
  };

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.label} {...others} />;
}

CircularProgressLabel.toString = () => createClassSelector(hopeCircularProgressLabelClass);
