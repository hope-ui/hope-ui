import { createContext, mergeProps, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SystemStyleObject } from "@/styled-system";
import { useComponentStyleConfigs } from "@/theme";
import { RightJoinProps } from "@/utils/types";

import { CloseButtonProps } from "../close-button/close-button";
import { Modal, ModalProps } from "../modal/modal";
import { ModalBody, ModalBodyProps } from "../modal/modal-body";
import { ModalCloseButton } from "../modal/modal-close-button";
import { ModalFooter, ModalFooterProps } from "../modal/modal-footer";
import { ModalHeader, ModalHeaderProps } from "../modal/modal-header";
import { ElementType } from "../types";
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

export interface DrawerStyleConfig {
  baseStyle?: {
    overlay?: SystemStyleObject;
    content?: SystemStyleObject;
    closeButton?: SystemStyleObject;
    header?: SystemStyleObject;
    body?: SystemStyleObject;
    footer?: SystemStyleObject;
  };
  defaultProps?: {
    root?: Pick<
      DrawerProps,
      | "placement"
      | "size"
      | "fullHeight"
      | "disableTransition"
      | "blockScrollOnMount"
      | "closeOnEsc"
      | "closeOnOverlayClick"
      | "preserveScrollBarGap"
      | "trapFocus"
    >;
    closeButton?: Pick<CloseButtonProps, "aria-label" | "icon" | "variant" | "colorScheme" | "size">;
  };
}

type DrawerContextValue = Required<DrawerOptions>;

const DrawerContext = createContext<DrawerContextValue>();

export function Drawer(props: DrawerProps) {
  const theme = useComponentStyleConfigs().Drawer;

  const [, modalProps] = splitProps(props, ["placement", "size", "fullHeight", "disableTransition"]);

  const [state] = createStore<DrawerContextValue>({
    get placement() {
      return props.placement ?? theme?.defaultProps?.root?.placement ?? "right";
    },
    get size() {
      return props.size ?? theme?.defaultProps?.root?.size ?? "xs";
    },
    get fullHeight() {
      return props.fullHeight ?? theme?.defaultProps?.root?.fullHeight ?? false;
    },
    get disableTransition() {
      return props.disableTransition ?? theme?.defaultProps?.root?.disableTransition ?? false;
    },
  });

  // inject global css for transitions
  drawerTransitionStyles();

  return (
    <DrawerContext.Provider value={state}>
      <Modal
        scrollBehavior="inside"
        blockScrollOnMount={theme?.defaultProps?.root?.blockScrollOnMount}
        closeOnEsc={theme?.defaultProps?.root?.closeOnEsc}
        closeOnOverlayClick={theme?.defaultProps?.root?.closeOnOverlayClick}
        preserveScrollBarGap={theme?.defaultProps?.root?.preserveScrollBarGap}
        trapFocus={theme?.defaultProps?.root?.trapFocus}
        {...modalProps}
      />
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

export function DrawerBody<C extends ElementType = "div">(props: ModalBodyProps<C>) {
  const theme = useComponentStyleConfigs().Drawer;
  return <ModalBody __baseStyle={theme?.baseStyle?.body} {...props} />;
}

export function DrawerHeader<C extends ElementType = "header">(props: ModalHeaderProps<C>) {
  const theme = useComponentStyleConfigs().Drawer;
  return <ModalHeader __baseStyle={theme?.baseStyle?.header} {...props} />;
}

export function DrawerFooter<C extends ElementType = "footer">(props: ModalFooterProps<C>) {
  const theme = useComponentStyleConfigs().Drawer;
  return <ModalFooter __baseStyle={theme?.baseStyle?.footer} {...props} />;
}

export function DrawerCloseButton(props: CloseButtonProps) {
  const theme = useComponentStyleConfigs().Drawer;

  const defaultProps: CloseButtonProps = {
    "aria-label": theme?.defaultProps?.closeButton?.["aria-label"] ?? "Close drawer",
    size: theme?.defaultProps?.closeButton?.size ?? "sm",
    icon: theme?.defaultProps?.closeButton?.icon,
    variant: theme?.defaultProps?.closeButton?.variant,
    colorScheme: theme?.defaultProps?.closeButton?.colorScheme,
  };

  const propsWithDefault = mergeProps(defaultProps, props);

  return <ModalCloseButton __baseStyle={theme?.baseStyle?.closeButton} {...propsWithDefault} />;
}