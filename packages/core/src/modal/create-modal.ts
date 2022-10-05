import { createPreventScroll, createTransition } from "@hope-ui/primitives";
import { createSignal, JSX } from "solid-js";

import { BaseModalProps } from "./types";

export function createModal(props: BaseModalProps) {
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
      return props.overlayTransitionOptions?.duration ?? 300;
    },
    get exitDuration() {
      return props.overlayTransitionOptions?.exitDuration ?? 200;
    },
    get delay() {
      return props.overlayTransitionOptions?.delay;
    },
    get exitDelay() {
      return props.overlayTransitionOptions?.exitDelay;
    },
    get easing() {
      return props.overlayTransitionOptions?.easing ?? "ease-out";
    },
    get exitEasing() {
      return props.overlayTransitionOptions?.exitEasing ?? "ease-in";
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

  return {
    headingId,
    setHeadingId,
    descriptionId,
    setDescriptionId,
    overlayTransition,
    onContainerMouseDown,
    onContainerKeyDown,
    onContainerClick,
    onCloseButtonClick,
  };
}
