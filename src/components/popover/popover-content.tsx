import { createEffect, createSignal, JSX, Show, splitProps } from "solid-js";
import { isServer, Portal } from "solid-js/web";
import { Transition } from "solid-transition-group";

import { useComponentStyleConfigs } from "@/theme/provider";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { callHandler } from "@/utils/function";

import { Box } from "../box/box";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { usePopoverContext } from "./popover";
import { popoverArrowStyles, popoverContentStyles, popoverTransitionName } from "./popover.styles";

export type PopoverContentProps<C extends ElementType = "section"> = HTMLHopeProps<C>;

const hopePopoverContentClass = "hope-popover__content";
const hopePopoverArrowClass = "hope-popover__arrow";

/**
 * The popover content container.
 */
export function PopoverContent<C extends ElementType = "section">(props: PopoverContentProps<C>) {
  const theme = useComponentStyleConfigs().Popover;

  const popoverContext = usePopoverContext();

  const [local, others] = splitProps(props as PopoverContentProps<"section">, [
    "ref",
    "class",
    "children",
    "onKeyDown",
    "onBlur",
  ]);

  /**
   * Internal state to handle popover portal `mounted` state.
   * Dirty hack since solid-transition-group doesn't work with Portal.
   */
  const [isPortalMounted, setIsPortalMounted] = createSignal(false);

  createEffect(() => {
    if (popoverContext.state.opened) {
      // mount portal when state `opened` is true.
      setIsPortalMounted(true);
    } else {
      // unmount portal instantly when there is no popover transition.
      popoverContext.state.motionPreset === "none" && setIsPortalMounted(false);
    }
  });

  const assignRef = (el: HTMLElement) => {
    popoverContext.assignPopoverRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const shouldClosePopoverOnKeyDown = (event: KeyboardEvent) => {
    if (popoverContext.state.closeOnEsc && event.key === "Escape") {
      popoverContext.closeWithDelay();
    }
  };

  const onKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = event => {
    callHandler(local.onKeyDown)(event);

    shouldClosePopoverOnKeyDown(event);
  };

  const onBlur: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = event => {
    callHandler(local.onBlur)(event);

    //TODO: check if target is valid.

    if (popoverContext.state.opened && popoverContext.state.closeOnBlur) {
      popoverContext.closeWithDelay();
    }
  };

  const afterPopoverEnterTransition = () => {
    if (isServer) {
      return;
    }

    document.addEventListener("keydown", shouldClosePopoverOnKeyDown);

    // schedule auto update of the tooltip position
    popoverContext.setupPopoverAutoUpdate();
  };

  const afterPopoverExitTransition = () => {
    document.removeEventListener("keydown", shouldClosePopoverOnKeyDown);

    popoverContext.cleanupPopoverAutoUpdate?.();

    // For smooth transition, unmount portal only after popover's content exit transition is done.
    setIsPortalMounted(false);
  };

  const classes = () => {
    return classNames(local.class, hopePopoverContentClass, popoverContentStyles());
  };

  const arrowClasses = () => classNames(hopePopoverArrowClass, popoverArrowStyles());

  const transitionName = () => {
    switch (popoverContext.state.motionPreset) {
      case "scale":
        return popoverTransitionName.scale;
      case "none":
        return "hope-none";
    }
  };

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
              role={popoverContext.state.triggerType === "hover" ? "tooltip" : "dialog"}
              aria-labelledby={popoverContext.state.headerMounted ? popoverContext.state.headerId : undefined}
              aria-describedby={popoverContext.state.bodyMounted ? popoverContext.state.bodyId : undefined}
              class={classes()}
              __baseStyle={theme?.baseStyle?.content}
              onKeyDown={onKeyDown}
              onBlur={onBlur}
              // onMouseEnter={popoverContext.onPopoverMouseEnter}
              // onMouseLeave={popoverContext.onPopoverMouseLeave}
              {...others}
            >
              {local.children}
              <Show when={popoverContext.state.withArrow}>
                <Box
                  ref={popoverContext.assignArrowRef}
                  class={arrowClasses()}
                  boxSize={popoverContext.state.arrowSize}
                />
              </Show>
            </hope.section>
          </Show>
        </Transition>
      </Portal>
    </Show>
  );
}

PopoverContent.toString = () => createClassSelector(hopePopoverContentClass);
