import { Accessor, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";

import { getOwnerDocument, isValidEvent } from "@/utils/dom";

// Thanks Chakra UI (https://github.com/chakra-ui/chakra-ui/blob/main/packages/hooks/src/use-outside-click.ts)

export interface UseOutsideClickProps {
  /**
   * The reference to a DOM element.
   */
  element: Accessor<HTMLElement | undefined>;

  /**
   * Function invoked when a click is triggered outside the referenced element.
   */
  handler?: (e: Event) => void;
}

export function useOutsideClick(props: UseOutsideClickProps) {
  const [state, setState] = createStore({
    isPointerDown: false,
    ignoreEmulatedMouseEvents: false,
  });

  const onPointerDown: any = (e: PointerEvent) => {
    if (isValidEvent(e, props.element())) {
      setState("isPointerDown", true);
    }
  };

  const onMouseUp: any = (event: MouseEvent) => {
    if (state.ignoreEmulatedMouseEvents) {
      setState("ignoreEmulatedMouseEvents", false);
      return;
    }

    if (state.isPointerDown && props.handler && isValidEvent(event, props.element())) {
      setState("isPointerDown", false);
      props.handler(event);
    }
  };

  const onTouchEnd = (event: TouchEvent) => {
    setState("ignoreEmulatedMouseEvents", true);
    if (props.handler && state.isPointerDown && isValidEvent(event, props.element())) {
      setState("isPointerDown", false);
      props.handler(event);
    }
  };

  onMount(() => {
    const doc = getOwnerDocument(props.element());
    doc.addEventListener("mousedown", onPointerDown, true);
    doc.addEventListener("mouseup", onMouseUp, true);
    doc.addEventListener("touchstart", onPointerDown, true);
    doc.addEventListener("touchend", onTouchEnd, true);
  });

  onCleanup(() => {
    const doc = getOwnerDocument(props.element());
    doc.removeEventListener("mousedown", onPointerDown, true);
    doc.removeEventListener("mouseup", onMouseUp, true);
    doc.removeEventListener("touchstart", onPointerDown, true);
    doc.removeEventListener("touchend", onTouchEnd, true);
  });
}
