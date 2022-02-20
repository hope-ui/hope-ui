import type { Placement as FloatingUIPlacement } from "@floating-ui/dom";
import { arrow, computePosition, flip, offset, shift } from "@floating-ui/dom";
import {
  children,
  createEffect,
  createSignal,
  JSX,
  mergeProps,
  onCleanup,
  onMount,
  Show,
  splitProps,
} from "solid-js";
import { isServer, Portal } from "solid-js/web";
import { Transition } from "solid-transition-group";

import { isFunction } from "@/utils/assertion";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import {
  tooltipArrowStyles,
  tooltipStyles,
  tooltipTransitionName,
  tooltipTransitionStyles,
} from "./tooltip.styles";

export interface TooltipOptions {
  label: JSX.Element;
  placement?: FloatingUIPlacement;
}

export type TooltipProps<C extends ElementType = "div"> = HopeComponentProps<C, TooltipOptions>;

export function Tooltip<C extends ElementType = "div">(props: TooltipProps<C>) {
  const defaultProps: TooltipProps<"div"> = {
    as: "div",
    label: "",
    placement: "bottom",
  };

  const propsWithDefault: TooltipProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["label", "placement"]);

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
      placement: local.placement,
      middleware: [offset(8), flip(), shift(), arrow({ element: arrowElement })],
    }).then(({ x, y, placement, middlewareData }) => {
      Object.assign(tooltipElement?.style, {
        left: `${x}px`,
        top: `${y}px`,
      });

      // Accessing the data
      const arrowX = middlewareData.arrow?.x;
      const arrowY = middlewareData.arrow?.y;

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

  onMount(() => addTriggerListeners());
  onCleanup(() => removeTriggerListeners());

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
              <Box ref={tooltipElement} role="tooltip" class={tooltipStyles()} {...others}>
                {local.label}
                <Box ref={arrowElement} class={tooltipArrowStyles()} />
              </Box>
            </Show>
          </Transition>
        </Portal>
      </Show>
    </>
  );
}
