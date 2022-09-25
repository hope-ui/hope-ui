/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/d945b9a7da3056017cda0cdd552af40fa1426070/packages/components/modal/src/use-modal.ts
 */

import { createDisclosure, createPreventScroll, createTransition } from "@hope-ui/primitives";
import { mergeThemeProps, STYLE_CONFIG_PROP_NAMES, StyleConfigProvider } from "@hope-ui/styles";
import { contains, getRelatedTarget, runIfFn } from "@hope-ui/utils";
import {
  createEffect,
  createSignal,
  createUniqueId,
  JSX,
  onCleanup,
  Show,
  splitProps,
} from "solid-js";
import { isServer, Portal } from "solid-js/web";

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

  const styleConfigResult = useModalStyleConfig("Modal", styleConfigProps);

  const [headingId, setHeadingId] = createSignal<string>();
  const [descriptionId, setDescriptionId] = createSignal<string>();

  const overlayTransition = createTransition({
    get shouldMount() {
      return props.isOpen;
    },
    get transition() {
      return props.overlayTransitionOptions?.transition ?? "fade";
    },
    get duration() {
      return props.overlayTransitionOptions?.duration;
    },
    get exitDuration() {
      return props.overlayTransitionOptions?.exitDuration;
    },
    get delay() {
      return props.overlayTransitionOptions?.delay ?? 0;
    },
    get exitDelay() {
      return props.overlayTransitionOptions?.exitDelay ?? 100;
    },
    get easing() {
      return props.overlayTransitionOptions?.easing;
    },
    get exitEasing() {
      return props.overlayTransitionOptions?.exitEasing;
    },
    get onBeforeEnter() {
      return props.overlayTransitionOptions?.onBeforeEnter;
    },
    get onAfterEnter() {
      return props.overlayTransitionOptions?.onAfterEnter;
    },
    get onBeforeExit() {
      return props.overlayTransitionOptions?.onBeforeExit;
    },
    get onAfterExit() {
      return props.overlayTransitionOptions?.onAfterExit;
    },
  });

  const modalTransition = createTransition({
    get shouldMount() {
      return props.isOpen;
    },
    get transition() {
      return props.modalTransitionOptions?.transition ?? "pop";
    },
    get duration() {
      return props.modalTransitionOptions?.duration;
    },
    get exitDuration() {
      return props.modalTransitionOptions?.exitDuration;
    },
    get delay() {
      return props.modalTransitionOptions?.delay ?? 100;
    },
    get exitDelay() {
      return props.modalTransitionOptions?.exitDelay ?? 0;
    },
    get easing() {
      return props.modalTransitionOptions?.easing ?? "ease-out";
    },
    get exitEasing() {
      return props.modalTransitionOptions?.exitEasing ?? "ease-in";
    },
    get onBeforeEnter() {
      return props.modalTransitionOptions?.onBeforeEnter;
    },
    get onAfterEnter() {
      return props.modalTransitionOptions?.onAfterEnter;
    },
    get onBeforeExit() {
      return props.modalTransitionOptions?.onBeforeExit;
    },
    get onAfterExit() {
      return props.modalTransitionOptions?.onAfterExit;
    },
  });

  let mouseDownTarget: EventTarget | undefined;

  const onContainerMouseDown: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    mouseDownTarget = event.target;
  };

  const onContainerKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = event => {
    if (event.key === "Escape") {
      event.stopPropagation();

      if (props.closeOnEsc) {
        props.onClose();
      }

      props.onEscKeyDown?.();
    }
  };

  const onContainerClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    event.stopPropagation();
    /**
     * Prevent the modal from closing when user
     * start dragging from the content, and release drag outside the content.
     *
     * Because it is technically not a considered "click outside".
     */
    if (mouseDownTarget !== event.target) {
      return;
    }

    if (props.closeOnOverlayClick) {
      props.onClose();
    }

    props.onOverlayClick?.();
  };

  const onCloseButtonClick = () => {
    props.onClose();
  };

  createPreventScroll({
    isEnabled: () => props.isOpen && !!props.preventScroll,
  });

  const context: ModalContextValue = {
    isOpen: () => props.isOpen,
    modalTransition,
    overlayTransition,
    modalId: () => props.id!,
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
    <Show when={overlayTransition.keepMounted() && modalTransition.keepMounted()}>
      <Portal>
        <StyleConfigProvider value={styleConfigResult}>
          <ModalContext.Provider value={context}>{props.children}</ModalContext.Provider>
        </StyleConfigProvider>
      </Portal>
    </Show>
  );
}
