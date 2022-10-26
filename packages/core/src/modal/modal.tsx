/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/d945b9a7da3056017cda0cdd552af40fa1426070/packages/components/modal/src/use-modal.ts
 */

import { createTransition } from "@hope-ui/primitives";
import { mergeThemeProps, STYLE_CONFIG_PROP_NAMES } from "@hope-ui/styles";
import { createUniqueId, ParentComponent, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { mergeDefaultProps } from "../utils";
import { createModal } from "./create-modal";
import { useModalStyleConfig } from "./modal.styles";
import { ModalCloseButton } from "./modal-close-button";
import { ModalContent } from "./modal-content";
import { ModalContext } from "./modal-context";
import { ModalDescription } from "./modal-description";
import { ModalHeading } from "./modal-heading";
import { ModalOverlay } from "./modal-overlay";
import { ModalContextValue, ModalProps } from "./types";

type ModalComposite = {
  Overlay: typeof ModalOverlay;
  Content: typeof ModalContent;
  CloseButton: typeof ModalCloseButton;
  Heading: typeof ModalHeading;
  Description: typeof ModalDescription;
};

/**
 * Modal provides context, theming, and accessibility properties
 * to all other modal components.
 *
 * It doesn't render any DOM node.
 */
export const Modal: ParentComponent<ModalProps> & ModalComposite = props => {
  props = mergeThemeProps(
    "Modal",
    {
      id: `hope-modal-${createUniqueId()}`,
      size: "md",
      isCentered: false,
      scrollBehavior: "outside",
      closeOnOverlayClick: true,
      closeOnEsc: true,
      preventScroll: true,
      trapFocus: true,
    },
    props
  );

  const [styleConfigProps] = splitProps(props, [
    ...STYLE_CONFIG_PROP_NAMES,
    "size",
    "isCentered",
    "scrollBehavior",
  ]);

  const { baseClasses, styleOverrides } = useModalStyleConfig("Modal", styleConfigProps);

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
          transition: "pop",
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

  const context: ModalContextValue = {
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
        <ModalContext.Provider value={context}>{props.children}</ModalContext.Provider>
      </Portal>
    </Show>
  );
};

Modal.Overlay = ModalOverlay;
Modal.Content = ModalContent;
Modal.CloseButton = ModalCloseButton;
Modal.Heading = ModalHeading;
Modal.Description = ModalDescription;
