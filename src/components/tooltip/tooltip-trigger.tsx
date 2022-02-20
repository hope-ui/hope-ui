import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useTooltipContext } from "./tooltip";

export type TooltipTriggerProps<C extends ElementType = "div"> = HopeComponentProps<C>;

const hopeTooltipTriggerClass = "hope-tooltip__trigger";

export function TooltipTrigger<C extends ElementType = "div">(props: TooltipTriggerProps<C>) {
  const tooltipContext = useTooltipContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeTooltipTriggerClass);

  return <Box class={classes()} {...others} />;
}

TooltipTrigger.toString = () => createClassSelector(hopeTooltipTriggerClass);
