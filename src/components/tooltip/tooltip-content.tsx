import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useTooltipContext } from "./tooltip";

export type TooltipContentProps<C extends ElementType = "div"> = HopeComponentProps<C>;

const hopeTooltipContentClass = "hope-tooltip__content";

export function TooltipContent<C extends ElementType = "div">(props: TooltipContentProps<C>) {
  const tooltipContext = useTooltipContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeTooltipContentClass);

  return <Box class={classes()} {...others} />;
}

TooltipContent.toString = () => createClassSelector(hopeTooltipContentClass);
