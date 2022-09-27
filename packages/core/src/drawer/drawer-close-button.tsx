import { createHopeComponent } from "@hope-ui/styles";
import { callHandler } from "@hope-ui/utils";
import { clsx } from "clsx";
import { JSX, splitProps } from "solid-js";

import { CloseButton, CloseButtonProps } from "../close-button";
import { mergeDefaultProps } from "../utils";
import { useDrawerContext } from "./drawer-context";

export type DrawerCloseButtonProps = CloseButtonProps;

/**
 * `DrawerCloseButton` is used closes the drawer dialog.
 *
 * You don't need to pass the `onClick` to it, it gets the
 * `close` action from the drawer context.
 */
export const DrawerCloseButton = createHopeComponent<"button", DrawerCloseButtonProps>(props => {
  const drawerContext = useDrawerContext();

  props = mergeDefaultProps(
    {
      "aria-label": "Close drawer",
      size: "md",
    },
    props
  );

  const [local, others] = splitProps(props, ["class", "onClick"]);

  const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    event.stopPropagation();
    callHandler(local.onClick, event);
    drawerContext.onCloseButtonClick();
  };

  return (
    <CloseButton
      class={clsx("hope-Drawer-closeButton", local.class)}
      onClick={onClick}
      {...others}
    />
  );
});
