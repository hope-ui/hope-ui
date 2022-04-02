import { onCleanup, onMount, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { usePopoverContext } from "./popover";
import { popoverBodyStyles } from "./popover.styles";

export type PopoverBodyProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopePopoverBodyClass = "hope-popover__body";

/**
 * PopoverBody is the main content area for the popover.
 * It should contain at least one interactive element.
 */
export function PopoverBody<C extends ElementType = "div">(props: PopoverBodyProps<C>) {
  const theme = useComponentStyleConfigs().Popover;

  const popoverContext = usePopoverContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopePopoverBodyClass, popoverBodyStyles());

  /**
   * Notify the popover context if this component was rendered or used
   * so we can append `aria-describedby` automatically
   */
  onMount(() => popoverContext.setBodyMounted(true));
  onCleanup(() => popoverContext.setBodyMounted(false));

  return <Box class={classes()} id={popoverContext.state.bodyId} __baseStyle={theme?.baseStyle?.body} {...others} />;
}

PopoverBody.toString = () => createClassSelector(hopePopoverBodyClass);
