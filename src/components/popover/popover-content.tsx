import { createEffect, createSignal, JSX, Show, splitProps } from "solid-js";
import { isServer, Portal } from "solid-js/web";
import { Transition } from "solid-transition-group";

import { useComponentStyleConfigs } from "@/theme/provider";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers, callHandler } from "@/utils/function";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { usePopoverContext } from "./popover";
import { popoverContentStyles, popoverTransitionName } from "./popover.styles";

export type PopoverContentProps<C extends ElementType = "section"> = HTMLHopeProps<C>;

const hopePopoverContentClass = "hope-popover__content";

/**
 * The popover content container.
 */
export function PopoverContent<C extends ElementType = "section">(props: PopoverContentProps<C>) {
  const theme = useComponentStyleConfigs().Popover;

  const popoverContext = usePopoverContext();

  /**
   * Internal state to handle popover portal `mounted` state.
   * Dirty hack since solid-transition-group doesn't work with Portal.
   */
  const [isPortalMounted, setIsPortalMounted] = createSignal(false);

  const [local, others] = splitProps(props as PopoverContentProps<"section">, [
    "ref",
    "class",
    "onKeyDown",
    "onFocusOut",
    "onMouseEnter",
    "onMouseLeave",
  ]);

  const assignRef = (el: HTMLElement) => {
    popoverContext.assignPopoverRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const closeOnKeyDown = (event: KeyboardEvent) => {
    if (popoverContext.state.closeOnEsc && event.key === "Escape") {
      popoverContext.closeWithDelay();
    }
  };

  const onKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = event => {
    callAllHandlers(local.onKeyDown, closeOnKeyDown)(event);
  };

  const onFocusOut: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = event => {
    callAllHandlers(local.onFocusOut, popoverContext.onPopoverFocusOut)(event);
  };

  const onMouseEnter: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    callHandler(local.onMouseEnter)(event);

    popoverContext.setIsHovering(true);
  };

  const onMouseLeave: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    callHandler(local.onMouseLeave)(event);

    popoverContext.onPopoverMouseLeave();
  };

  const afterPopoverEnterTransition = () => {
    if (isServer) {
      return;
    }

    document.addEventListener("keydown", closeOnKeyDown);

    popoverContext.afterPopoverOpen();
  };

  const afterPopoverExitTransition = () => {
    document.removeEventListener("keydown", closeOnKeyDown);

    popoverContext.afterPopoverClose();

    // For smooth transition, unmount portal only after popover's content exit transition is done.
    setIsPortalMounted(false);
  };

  const popoverClasses = () => {
    return classNames(local.class, hopePopoverContentClass, popoverContentStyles());
  };

  const transitionName = () => {
    switch (popoverContext.state.motionPreset) {
      case "scale":
        return popoverTransitionName.scale;
      case "none":
        return "hope-none";
    }
  };

  createEffect(() => {
    if (popoverContext.state.opened) {
      // mount portal when state `opened` is true.
      setIsPortalMounted(true);
    } else {
      // unmount portal instantly when there is no popover transition.
      popoverContext.state.motionPreset === "none" && setIsPortalMounted(false);
    }
  });

  return (
    <Show when={isPortalMounted()}>
      <Portal>
        <Transition
          name={transitionName()}
          appear
          onAfterEnter={afterPopoverEnterTransition}
          onAfterExit={afterPopoverExitTransition}
        >
          <Show when={popoverContext.state.opened}>
            <hope.section
              ref={assignRef}
              tabIndex={-1}
              id={popoverContext.state.contentId}
              role={popoverContext.state.triggerOnHover ? "tooltip" : "dialog"}
              aria-labelledby={popoverContext.state.headerMounted ? popoverContext.state.headerId : undefined}
              aria-describedby={popoverContext.state.bodyMounted ? popoverContext.state.bodyId : undefined}
              class={popoverClasses()}
              __baseStyle={theme?.baseStyle?.content}
              onKeyDown={onKeyDown}
              onFocusOut={onFocusOut}
              onMouseEnter={popoverContext.state.triggerOnHover ? onMouseEnter : undefined}
              onMouseLeave={popoverContext.state.triggerOnHover ? onMouseLeave : undefined}
              {...others}
            />
          </Show>
        </Transition>
      </Portal>
    </Show>
  );
}

PopoverContent.toString = () => createClassSelector(hopePopoverContentClass);
