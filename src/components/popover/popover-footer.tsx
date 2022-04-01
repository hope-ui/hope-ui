import { splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { popoverFooterStyles } from "./popover.styles";

export type PopoverFooterProps<C extends ElementType = "footer"> = HTMLHopeProps<C>;

const hopePopoverFooterClass = "hope-popover__footer";

/**
 * PopoverFooter houses the action buttons of the popover.
 */
export function PopoverFooter<C extends ElementType = "footer">(props: PopoverFooterProps<C>) {
  const theme = useComponentStyleConfigs().Popover;

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopePopoverFooterClass, popoverFooterStyles());

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.footer} {...others} />;
}

PopoverFooter.toString = () => createClassSelector(hopePopoverFooterClass);
