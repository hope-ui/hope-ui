/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/d945b9a7da3056017cda0cdd552af40fa1426070/packages/components/modal/src/use-modal.ts
 */

import { createTransition } from "@hope-ui/primitives";
import { mergeThemeProps, STYLE_CONFIG_PROP_NAMES } from "@hope-ui/styles";
import { createUniqueId, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { createModal } from "./create-modal";
import { useModalStyleConfig } from "./modal.styles";
import { ModalContext } from "./modal-context";
import { ModalContextValue, ModalProps } from "./types";

/**
 * Modal provides context, theming, and accessibility properties
 * to all other modal components.
 *
 * It doesn't render any DOM node.
 */
export function Modal(props: ModalProps) {
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

  const contentTransition = createTransition({
    get shouldMount() {
      return props.isOpen;
    },
    get transition() {
      return props.contentTransitionOptions?.transition ?? "pop";
    },
    get duration() {
      return props.contentTransitionOptions?.duration ?? 300;
    },
    get exitDuration() {
      return props.contentTransitionOptions?.exitDuration ?? 200;
    },
    get delay() {
      return props.contentTransitionOptions?.delay ?? 100;
    },
    get exitDelay() {
      return props.contentTransitionOptions?.exitDelay ?? 0;
    },
    get easing() {
      return props.contentTransitionOptions?.easing ?? "ease-out";
    },
    get exitEasing() {
      return props.contentTransitionOptions?.exitEasing ?? "ease-in";
    },
    get onBeforeEnter() {
      return props.contentTransitionOptions?.onBeforeEnter;
    },
    get onAfterEnter() {
      return props.contentTransitionOptions?.onAfterEnter;
    },
    get onBeforeExit() {
      return props.contentTransitionOptions?.onBeforeExit;
    },
    get onAfterExit() {
      return props.contentTransitionOptions?.onAfterExit;
    },
  });

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
}
