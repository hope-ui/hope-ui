import { Show, splitProps } from "solid-js";
import { Transition } from "solid-transition-group";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { useModalContext } from "../modal/modal";
import { modalOverlayStyles } from "../modal/modal.styles";
import { ElementType, HTMLHopeProps } from "../types";
import { useDrawerContext } from "./drawer";
import { drawerTransitionName } from "./drawer.styles";

export type DrawerOverlayProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeDrawerOverlayClass = "hope-drawer__overlay";

/**
 * DrawerOverlay renders a backdrop behind the drawer.
 */
export function DrawerOverlay<C extends ElementType = "div">(props: DrawerOverlayProps<C>) {
  const theme = useComponentStyleConfigs().Drawer;

  const drawerContext = useDrawerContext();
  const modalContext = useModalContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeDrawerOverlayClass, modalOverlayStyles());

  const transitionName = () => {
    return drawerContext.disableTransition ? "hope-none" : drawerTransitionName.fade;
  };

  return (
    <Transition name={transitionName()} appear>
      <Show when={modalContext.state.opened}>
        <Box class={classes()} __baseStyle={theme?.baseStyle?.overlay} {...others} />
      </Show>
    </Transition>
  );
}

DrawerOverlay.toString = () => createClassSelector(hopeDrawerOverlayClass);
