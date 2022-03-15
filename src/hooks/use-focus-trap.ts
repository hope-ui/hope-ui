import { createFocusTrap, FocusTrap } from "focus-trap";
import { onCleanup, onMount } from "solid-js";

export interface UseFocusTrapProps {
  enabled: boolean;
  elementRef: HTMLElement;
  initialFocus: string;
  fallbackFocus: string;
}

export function useFocusTrap(props: UseFocusTrapProps) {
  let focusTrap: FocusTrap | undefined;

  onMount(() => {
    if (!props.enabled) {
      return;
    }

    focusTrap = createFocusTrap(props.elementRef, {
      initialFocus: props.initialFocus,
      fallbackFocus: props.fallbackFocus,
      allowOutsideClick: false,
    });

    focusTrap.activate();
  });

  onCleanup(() => focusTrap?.deactivate());
}
