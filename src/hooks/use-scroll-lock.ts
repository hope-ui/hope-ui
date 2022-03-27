// import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";
import {
  addScrollableSelector,
  clearQueueScrollLocks,
  disablePageScroll,
  enablePageScroll,
  removeScrollableSelector,
} from "scroll-lock";
import { onCleanup, onMount } from "solid-js";

export interface UseScrollLockProps {
  enabled: boolean;
  elementRef: HTMLElement;
  scrollableSelector: string;
}

export function useScrollLock(props: UseScrollLockProps) {
  onMount(() => {
    if (!props.enabled) {
      return;
    }

    addScrollableSelector(props.scrollableSelector);
    disablePageScroll(props.elementRef);

    // disableBodyScroll(elementRef, {
    //   allowTouchMove: el => {
    //     if (!elementRef || elementRef === el) {
    //       return false;
    //     }
    //     // allow touchmove only if `el` is a child of `container`
    //     return elementRef.contains(el);
    //   },
    //   reserveScrollBarGap: modalContext.state.preserveScrollBarGap,
    // });
  });

  onCleanup(() => {
    removeScrollableSelector(props.scrollableSelector);
    clearQueueScrollLocks();
    enablePageScroll();

    //clearAllBodyScrollLocks();
  });
}
