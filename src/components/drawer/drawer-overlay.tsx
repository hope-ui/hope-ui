import { Show, splitProps } from "solid-js";
import { Transition } from "solid-transition-group";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { useModalContext } from "../modal/modal";
import { modalOverlayStyles } from "../modal/modal.styles";
import { ElementType, HopeComponentProps } from "../types";
import { useDrawerContext } from "./drawer";
import { drawerTransitionName } from "./drawer.styles";

const hopeDrawerOverlayClass = "hope-drawer__overlay";

/**
 * DrawerOverlay renders a backdrop behind the drawer.
 */
export function DrawerOverlay<C extends ElementType = "div">(props: HopeComponentProps<C>) {
  const drawerContext = useDrawerContext();
  const modalContext = useModalContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeDrawerOverlayClass, modalOverlayStyles());

  const transitionName = () => {
    return drawerContext.disableTransition ? "hope-none" : drawerTransitionName.fade;
  };

  return (
    <Transition name={transitionName()} appear>
      <Show when={modalContext.state.isOpen}>
        <Box class={classes()} {...others} />
      </Show>
    </Transition>
  );
}

DrawerOverlay.toString = () => createClassSelector(hopeDrawerOverlayClass);
