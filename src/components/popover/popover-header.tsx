import { onCleanup, onMount, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { usePopoverContext } from "./popover";
import { popoverHeaderStyles } from "./popover.styles";

export type PopoverHeaderProps<C extends ElementType = "header"> = HTMLHopeProps<C>;

const hopePopoverHeaderClass = "hope-popover__header";

/**
 * PopoverHeader houses the title of the popover.
 */
export function PopoverHeader<C extends ElementType = "header">(props: PopoverHeaderProps<C>) {
  const theme = useComponentStyleConfigs().Popover;

  const popoverContext = usePopoverContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopePopoverHeaderClass, popoverHeaderStyles());

  /**
   * Notify the popover context if this component was rendered or used
   * so we can append `aria-labelledby` automatically
   */
  onMount(() => popoverContext.setHeaderMounted(true));
  onCleanup(() => popoverContext.setHeaderMounted(false));

  return (
    <Box class={classes()} id={popoverContext.state.headerId} __baseStyle={theme?.baseStyle?.header} {...others} />
  );
}

PopoverHeader.toString = () => createClassSelector(hopePopoverHeaderClass);
