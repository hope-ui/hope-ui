import { arrow, computePosition, flip, offset, shift } from "@floating-ui/dom";
import { children, createEffect, createSignal, onCleanup, onMount, Show } from "solid-js";
import { isServer, Portal } from "solid-js/web";
import { Transition } from "solid-transition-group";

import { isFunction } from "@/utils/assertion";

import { ElementType, HopeComponentProps } from "../types";
import { tooltipTransitionName, tooltipTransitionStyles } from "./tooltip.styles";

export type TooltipProps<C extends ElementType = "div"> = HopeComponentProps<C>;

export function Tooltip<C extends ElementType = "div">(props: TooltipProps<C>) {
  const [isTooltipVisible, setIsTooltipVisible] = createSignal(false);
  const [isPortalMounted, setIsPortalMounted] = createSignal(false);

  let tooltipElement: HTMLDivElement | undefined;
  let arrowElement: HTMLDivElement | undefined;

  const resolvedChildren = children(() => props.children);

  const trigger = () => {
    let el = resolvedChildren() as Element;

    // recursively resolve element
    while (isFunction(el)) {
      el = el();
    }

    return el;
  };

  function updateTooltipPosition() {
    const triggerElement = trigger();

    if (!triggerElement || !tooltipElement || !arrowElement) {
      return;
    }

    computePosition(triggerElement, tooltipElement, {
      placement: "top",
      middleware: [offset(8), flip(), shift({ padding: 16 }), arrow({ element: arrowElement })],
    }).then(({ x, y, placement, middlewareData }) => {
      Object.assign(tooltipElement?.style, {
        left: `${x}px`,
        top: `${y}px`,
      });

      // Accessing the data
      const { x: arrowX, y: arrowY } = middlewareData.arrow;

      const staticSide = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right",
      }[placement.split("-")[0]] as string;

      Object.assign(arrowElement?.style, {
        left: arrowX != null ? `${arrowX}px` : "",
        top: arrowY != null ? `${arrowY}px` : "",
        right: "",
        bottom: "",
        [staticSide]: "-4px",
      });
    });
  }

  const showTooltip = () => {
    setIsTooltipVisible(true);
    updateTooltipPosition();
  };

  const hideTooltip = () => {
    setIsTooltipVisible(false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      hideTooltip();
    }
  };

  const addTriggerListeners = () => {
    const triggerElement = trigger();

    triggerElement.addEventListener("mouseenter", showTooltip);
    triggerElement.addEventListener("focus", showTooltip);

    triggerElement.addEventListener("click", hideTooltip);
    triggerElement.addEventListener("mouseleave", hideTooltip);
    triggerElement.addEventListener("blur", hideTooltip);
  };

  const removeTriggerListeners = () => {
    const triggerElement = trigger();

    triggerElement.removeEventListener("mouseenter", showTooltip);
    triggerElement.removeEventListener("focus", showTooltip);

    triggerElement.removeEventListener("click", hideTooltip);
    triggerElement.removeEventListener("mouseleave", hideTooltip);
    triggerElement.removeEventListener("blur", hideTooltip);
  };

  const onToolipEnterTransitionEnd = () => {
    if (isServer) {
      return;
    }

    document.addEventListener("keydown", onKeyDown);

    window.addEventListener("scroll", updateTooltipPosition);
    window.addEventListener("resize", updateTooltipPosition);
  };

  const onToolipExitTransitionEnd = () => {
    document.removeEventListener("keydown", onKeyDown);

    window.removeEventListener("scroll", updateTooltipPosition);
    window.removeEventListener("resize", updateTooltipPosition);

    // unmount portal only after tooltip exit transition is done.
    setIsPortalMounted(false);
  };

  onMount(addTriggerListeners);
  onCleanup(removeTriggerListeners);

  // mount portal when `isTooltipVisible` is true.
  createEffect(() => isTooltipVisible() && setIsPortalMounted(true));

  // inject global css for transitions
  tooltipTransitionStyles();

  return (
    <>
      {trigger}
      <Show when={isPortalMounted()}>
        <Portal>
          <Transition
            name={tooltipTransitionName.scale}
            appear
            onAfterEnter={onToolipEnterTransitionEnd}
            onAfterExit={onToolipExitTransitionEnd}
          >
            <Show when={isTooltipVisible()}>
              <div ref={tooltipElement} id="tooltip" role="tooltip">
                My very long tooltip with more content
                <div ref={arrowElement} id="arrow"></div>
              </div>
            </Show>
          </Transition>
        </Portal>
      </Show>
    </>
  );
}
