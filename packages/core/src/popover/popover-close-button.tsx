import { createHopeComponent } from "@hope-ui/styles";
import { callHandler } from "@hope-ui/utils";
import { clsx } from "clsx";
import { JSX, splitProps } from "solid-js";

import { CloseButton, CloseButtonProps } from "../close-button";
import { mergeDefaultProps } from "../utils";
import { usePopoverContext } from "./popover-context";

export type PopoverCloseButtonProps = CloseButtonProps;

/**
 * PopoverCloseButton is used closes the popover.
 *
 * You don't need to pass the `onClick` to it, it gets the
 * `close` action from the popover context.
 */
export const PopoverCloseButton = createHopeComponent<"button", PopoverCloseButtonProps>(props => {
  const popoverContext = usePopoverContext();

  props = mergeDefaultProps(
    {
      "aria-label": "Close popover",
      size: "sm",
    },
    props
  );

  const [local, others] = splitProps(props, ["class", "onClick"]);

  const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    event.stopPropagation();
    callHandler(local.onClick, event);
    popoverContext.onCloseButtonClick();
  };

  return (
    <CloseButton
      class={clsx("hope-Popover-closeButton", local.class)}
      onClick={onClick}
      {...others}
    />
  );
});
