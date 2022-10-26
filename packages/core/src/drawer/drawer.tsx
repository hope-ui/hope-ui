/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/d945b9a7da3056017cda0cdd552af40fa1426070/packages/components/drawer/src/use-drawer.ts
 */

import { createTransition } from "@hope-ui/primitives";
import { mergeThemeProps, STYLE_CONFIG_PROP_NAMES } from "@hope-ui/styles";
import { createUniqueId, ParentComponent, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { createModal } from "../modal/create-modal";
import { mergeDefaultProps } from "../utils";
import { useDrawerStyleConfig } from "./drawer.styles";
import { DrawerCloseButton } from "./drawer-close-button";
import { DrawerContent } from "./drawer-content";
import { DrawerContext } from "./drawer-context";
import { DrawerDescription } from "./drawer-description";
import { DrawerHeading } from "./drawer-heading";
import { DrawerOverlay } from "./drawer-overlay";
import { DRAWER_TRANSITION } from "./drawer-transition";
import { DrawerContextValue, DrawerProps } from "./types";

type DrawerComposite = {
  Overlay: typeof DrawerOverlay;
  Content: typeof DrawerContent;
  CloseButton: typeof DrawerCloseButton;
  Heading: typeof DrawerHeading;
  Description: typeof DrawerDescription;
};

/**
 * Drawer provides context, theming, and accessibility properties
 * to all other drawer components.
 *
 * It doesn't render any DOM node.
 */
export const Drawer: ParentComponent<DrawerProps> & DrawerComposite = props => {
  props = mergeThemeProps(
    "Drawer",
    {
      id: `hope-drawer-${createUniqueId()}`,
      size: "md",
      placement: "right",
      closeOnOverlayClick: true,
      closeOnEsc: true,
      preventScroll: true,
      trapFocus: true,
    },
    props
  );

  const [styleConfigProps] = splitProps(props, [...STYLE_CONFIG_PROP_NAMES, "size", "placement"]);

  const { baseClasses, styleOverrides } = useDrawerStyleConfig("Drawer", styleConfigProps);

  const {
    headingId,
    setHeadingId,
    descriptionId,
    setDescriptionId,
    overlayTransition,
    onContainerMouseDown,
    onContainerKeyDown,
    onContainerClick,
    onCloseButtonClick,
  } = createModal(props);

  const contentTransition = createTransition(
    () => props.isOpen,
    () =>
      mergeDefaultProps(
        {
          transition: DRAWER_TRANSITION[props.placement!],
          duration: 300,
          exitDuration: 200,
          delay: 100,
          exitDelay: 0,
          easing: "ease-out",
          exitEasing: "ease-in",
        },
        props.contentTransitionOptions ?? {}
      )
  );

  const context: DrawerContextValue = {
    baseClasses,
    styleOverrides,
    isOpen: () => props.isOpen,
    contentTransition,
    overlayTransition,
    contentId: () => props.id!,
    headingId,
    setHeadingId,
    descriptionId,
    setDescriptionId,
    trapFocus: () => props.trapFocus!,
    initialFocusSelector: () => props.initialFocusSelector,
    restoreFocusSelector: () => props.restoreFocusSelector,
    onContainerMouseDown,
    onContainerKeyDown,
    onContainerClick,
    onCloseButtonClick,
  };

  return (
    <Show when={overlayTransition.keepMounted() && contentTransition.keepMounted()}>
      <Portal>
        <DrawerContext.Provider value={context}>{props.children}</DrawerContext.Provider>
      </Portal>
    </Show>
  );
};

Drawer.Overlay = DrawerOverlay;
Drawer.Content = DrawerContent;
Drawer.CloseButton = DrawerCloseButton;
Drawer.Heading = DrawerHeading;
Drawer.Description = DrawerDescription;
