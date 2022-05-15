import { createContext, mergeProps, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { useStyleConfig } from "../../hope-provider";
import { SystemStyleObject } from "../../styled-system/types";
import { OverrideProps } from "../../utils/types";
import { CloseButtonProps, ThemeableCloseButtonOptions } from "../close-button/close-button";
import { Modal, ModalProps } from "../modal/modal";
import { ModalBody, ModalBodyProps } from "../modal/modal-body";
import { ModalCloseButton } from "../modal/modal-close-button";
import { ModalFooter, ModalFooterProps } from "../modal/modal-footer";
import { ModalHeader, ModalHeaderProps } from "../modal/modal-header";
import { ElementType } from "../types";
import { DrawerDialogVariants } from "./drawer.styles";

export type DrawerPlacement = "top" | "right" | "bottom" | "left";

interface DrawerOptions extends DrawerDialogVariants {
  /**
   * The placement of the drawer
   */
  placement?: DrawerPlacement;

  /**
   * If `true`, the drawer will appear without any transition.
   */
  disableMotion?: boolean;
}

export type DrawerProps = OverrideProps<
  Omit<ModalProps, "scrollBehavior" | "centered" | "motionPreset">,
  DrawerOptions
>;

type ThemeableDrawerOptions = Pick<
  DrawerProps,
  | "placement"
  | "size"
  | "fullHeight"
  | "disableMotion"
  | "blockScrollOnMount"
  | "closeOnEsc"
  | "closeOnOverlayClick"
  | "preserveScrollBarGap"
  | "trapFocus"
>;

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
    root?: ThemeableDrawerOptions;
    closeButton?: ThemeableCloseButtonOptions;
  };
}

type DrawerContextValue = Required<DrawerOptions>;

const DrawerContext = createContext<DrawerContextValue>();

export function Drawer(props: DrawerProps) {
  const theme = useStyleConfig().Drawer;

  const [, modalProps] = splitProps(props, [
    "opened",
    "onClose",
    "placement",
    "size",
    "fullHeight",
    "disableMotion",
  ]);

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
    get disableMotion() {
      return props.disableMotion ?? theme?.defaultProps?.root?.disableMotion ?? false;
    },
  });

  return (
    <DrawerContext.Provider value={state}>
      <Modal
        scrollBehavior="inside"
        blockScrollOnMount={theme?.defaultProps?.root?.blockScrollOnMount}
        closeOnEsc={theme?.defaultProps?.root?.closeOnEsc}
        closeOnOverlayClick={theme?.defaultProps?.root?.closeOnOverlayClick}
        preserveScrollBarGap={theme?.defaultProps?.root?.preserveScrollBarGap}
        trapFocus={theme?.defaultProps?.root?.trapFocus}
        opened={props.opened}
        onClose={props.onClose}
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

/* -------------------------------------------------------------------------------------------------
 * Drawer parts is just Modal parts with drawer's theme baseStyle
 * -----------------------------------------------------------------------------------------------*/

export function DrawerCloseButton(props: CloseButtonProps) {
  const theme = useStyleConfig().Drawer;

  const defaultProps: CloseButtonProps = {
    "aria-label": theme?.defaultProps?.closeButton?.["aria-label"] ?? "Close drawer",
    size: theme?.defaultProps?.closeButton?.size ?? "md",
    icon: theme?.defaultProps?.closeButton?.icon,
  };

  const propsWithDefault = mergeProps(defaultProps, props);

  return <ModalCloseButton __baseStyle={theme?.baseStyle?.closeButton} {...propsWithDefault} />;
}

export function DrawerBody<C extends ElementType = "div">(props: ModalBodyProps<C>) {
  const theme = useStyleConfig().Drawer;
  return <ModalBody __baseStyle={theme?.baseStyle?.body} {...props} />;
}

export function DrawerHeader<C extends ElementType = "header">(props: ModalHeaderProps<C>) {
  const theme = useStyleConfig().Drawer;
  return <ModalHeader __baseStyle={theme?.baseStyle?.header} {...props} />;
}

export function DrawerFooter<C extends ElementType = "footer">(props: ModalFooterProps<C>) {
  const theme = useStyleConfig().Drawer;
  return <ModalFooter __baseStyle={theme?.baseStyle?.footer} {...props} />;
}
