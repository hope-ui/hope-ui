import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { progressLabelStyles } from "./progress.styles";

export type ProgressLabelProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeProgressLabelClass = "hope-progress__label";

/**
 * ProgressLabel is used to show the numeric value of the progress.
 */
export function ProgressLabel<C extends ElementType = "div">(props: ProgressLabelProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeProgressLabelClass, progressLabelStyles());

  return <Box class={classes()} {...others} />;
}

ProgressLabel.toString = () => createClassSelector(hopeProgressLabelClass);
