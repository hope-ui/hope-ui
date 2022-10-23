import { createPreventScroll, createTransition, TransitionOptions } from "@hope-ui/primitives";
import { createMemo, createSignal, JSX } from "solid-js";

import { mergeDefaultProps } from "../utils";
import { BaseModalProps } from "./types";

const DEFAULT_OVERLAY_TRANSITION_OPTIONS: TransitionOptions = {
  transition: "fade",
  duration: 300,
  exitDuration: 200,
  easing: "ease-out",
  exitEasing: "ease-in",
};

export function createModal(props: BaseModalProps) {
  const [headingId, setHeadingId] = createSignal<string>();
  const [descriptionId, setDescriptionId] = createSignal<string>();

  const overlayTransitionOptions = createMemo(() => {
    if (!props.overlayTransitionOptions) {
      return DEFAULT_OVERLAY_TRANSITION_OPTIONS;
    }

    return mergeDefaultProps(DEFAULT_OVERLAY_TRANSITION_OPTIONS, props.overlayTransitionOptions);
  });

  const overlayTransition = createTransition(() => props.isOpen, overlayTransitionOptions);

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
