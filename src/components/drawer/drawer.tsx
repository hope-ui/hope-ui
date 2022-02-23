import { createContext, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { RightJoinProps } from "@/utils/types";

import { Modal, ModalProps } from "../modal/modal";
import { DrawerDialogVariants, drawerTransitionStyles } from "./drawer.styles";

export type DrawerPlacement = "top" | "right" | "bottom" | "left";

interface DrawerOptions extends DrawerDialogVariants {
  /**
   * The placement of the drawer
   */
  placement?: DrawerPlacement;

  /**
   * If `true`, the drawer will appear without any transition.
   */
  disableTransition?: boolean;
}

export type DrawerProps = RightJoinProps<Omit<ModalProps, "scrollBehavior" | "centered" | "transition">, DrawerOptions>;

type DrawerContextValue = Required<DrawerOptions>;

const DrawerContext = createContext<DrawerContextValue>();

export function Drawer(props: DrawerProps) {
  const [, modalProps] = splitProps(props, ["placement", "size", "fullHeight", "disableTransition"]);

  const [state] = createStore<DrawerContextValue>({
    get placement() {
      return props.placement ?? "right";
    },
    get size() {
      return props.size ?? "xs";
    },
    get fullHeight() {
      return props.fullHeight ?? false;
    },
    get disableTransition() {
      return props.disableTransition ?? false;
    },
  });

  // inject global css for transitions
  drawerTransitionStyles();

  return (
    <DrawerContext.Provider value={state}>
      <Modal scrollBehavior="inside" {...modalProps} />
    </DrawerContext.Provider>
  );
}

export function useDrawerContext() {
  const context = useContext(DrawerContext);

  if (!context) {
    throw new Error("[Hope UI]: useDrawerContext must be used within a `<Drawer />` component");
  }

  return context;
}

export { ModalBody as DrawerBody } from "../modal/modal-body";
export { ModalCloseButton as DrawerCloseButton } from "../modal/modal-close-button";
export { ModalFooter as DrawerFooter } from "../modal/modal-footer";
export { ModalHeader as DrawerHeader } from "../modal/modal-header";
