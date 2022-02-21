import type { Placement as FloatingUIPlacement } from "@floating-ui/dom";
import {
  arrow,
  computePosition,
  flip,
  getScrollParents,
  inline,
  offset,
  shift,
} from "@floating-ui/dom";
import {
  children,
  createEffect,
  createSignal,
  createUniqueId,
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
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import {
  tooltipArrowStyles,
  tooltipStyles,
  tooltipTransitionName,
  tooltipTransitionStyles,
} from "./tooltip.styles";

export interface TooltipOptions {
  /**
   * Placement of the tooltip
   */
  placement?: FloatingUIPlacement;

  /**
   * Offset between the tooltip and the reference (trigger) element.
   */
  offset?: number;

  /**
   * The id of the tooltip.
   */
  id?: string;

  /**
   * If `true`, the tooltip will be shown (in controlled mode)
   */
  isOpen?: boolean;

  /**
   * If `true`, the tooltip will be initially shown
   */
  defaultIsOpen?: boolean;

  /**
   * If `true`, apply floating-ui `inline` middleware.
   * Useful for inline reference elements that span over multiple lines, such as hyperlinks or range selections.
   */
  isInline?: boolean;

  /**
   * The label of the tooltip.
   */
  label?: JSX.Element;

  /**
   * The accessible, human friendly label to use for
   * screen readers.
   *
   * If passed, tooltip will show the content `label`
   * but expose only `aria-label` to assistive technologies
   */
  "aria-label"?: string;

  /**
   * If `true`, the tooltip will not show
   */
  disabled?: boolean;

  /**
   * If `true`, the tooltip will show an arrow tip
   */
  hasArrow?: boolean;

  /**
   * Size of the arrow.
   */
  arrowSize?: number;

  /**
   * The padding between the arrow and the edges of the tooltip.
   */
  arrowPadding?: number;

  /**
   * Delay (in ms) before showing the tooltip
   * @default 0ms
   */
  openDelay?: number;

  /**
   * Delay (in ms) before hiding the tooltip
   * @default 0ms
   */
  closeDelay?: number;

  /**
   * If `true`, the tooltip will hide on click
   */
  closeOnClick?: boolean;

  /**
   * If `true`, the tooltip will hide while the mouse
   * is down
   */
  closeOnMouseDown?: boolean;

  /**
   * Callback to run when the tooltip shows
   */
  onOpen?(): void;

  /**
   * Callback to run when the tooltip hides
   */
  onClose?(): void;
}

export type TooltipProps<C extends ElementType = "div"> = HopeComponentProps<C, TooltipOptions>;

const hopeTooltipClass = "hope-tooltip";
const hopeTooltipArrowClass = "hope-tooltip__arrow";

export function Tooltip<C extends ElementType = "div">(props: TooltipProps<C>) {
  const defaultId = `hope-tooltip-${createUniqueId()}`;

  const defaultProps: TooltipProps<"div"> = {
    as: "div",
    id: defaultId,
    placement: "bottom",
    offset: 8,
    arrowPadding: 8,
    openDelay: 0,
    closeDelay: 0,
    closeOnClick: true,
  };

  const propsWithDefault: TooltipProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "class",
    "children",
    "id",
    "label",
    "isOpen",
    "defaultIsOpen",
    "isInline",
    "disabled",
    "placement",
    "offset",
    "hasArrow",
    "arrowSize",
    "arrowPadding",
    "openDelay",
    "closeDelay",
    "closeOnClick",
    "closeOnMouseDown",
    "onOpen",
    "onClose",
  ]);

  // Internal state for uncontrolled tooltip.
  // eslint-disable-next-line solid/reactivity
  const [isOpenState, setIsOpenState] = createSignal(!!local.defaultIsOpen);

  const [isPortalMounted, setIsPortalMounted] = createSignal(false);

  let tooltipElement: HTMLDivElement | undefined;
  let arrowElement: HTMLDivElement | undefined;

  let enterTimeout: number | undefined;
  let exitTimeout: number | undefined;

  const isControlled = () => local.isOpen !== undefined;
  const isOpen = () => (isControlled() ? local.isOpen : isOpenState());

  const tooltipClasses = () => classNames(local.class, hopeTooltipClass, tooltipStyles());
  const arrowClasses = () => classNames(hopeTooltipArrowClass, tooltipArrowStyles());

  const resolvedChildren = children(() => local.children);

  const trigger = () => {
    let el = resolvedChildren() as Element;

    // recursively resolve element
    while (isFunction(el)) {
      el = el();
    }

    return el;
  };

  const triggerScrollParents = () => {
    return getScrollParents(trigger());
  };

  async function updateTooltipPosition() {
    const triggerElement = trigger();

    if (!triggerElement || !tooltipElement) {
      return;
    }

    const middleware = [offset(local.offset)];

    if (local.isInline) {
      middleware.push(inline());
    }

    middleware.push(flip());
    middleware.push(shift());

    if (local.hasArrow && arrowElement) {
      middleware.push(arrow({ element: arrowElement, padding: local.arrowPadding }));
    }

    const { x, y, placement, middlewareData } = await computePosition(
      triggerElement,
      tooltipElement,
      {
        placement: local.placement,
        middleware,
      }
    );

    if (!tooltipElement) {
      return;
    }

    Object.assign(tooltipElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    if (!arrowElement) {
      return;
    }

    const arrowX = middlewareData.arrow?.x;
    const arrowY = middlewareData.arrow?.y;

    const staticSide = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[placement.split("-")[0]] as string;

    // Used to put half of the arrow outside of the tooltip.
    const arrowOffset = `${local.arrowSize ? Math.round(local.arrowSize / 2) * -1 : -4}px`;

    Object.assign(arrowElement.style, {
      left: arrowX != null ? `${Math.round(arrowX)}px` : "",
      top: arrowY != null ? `${Math.round(arrowY)}px` : "",
      right: "",
      bottom: "",
      [staticSide]: arrowOffset,
    });
  }

  const onOpen = () => {
    if (!isControlled()) {
      setIsOpenState(true);
    }

    local.onOpen?.();
    updateTooltipPosition();
  };

  const onClose = () => {
    if (!isControlled()) {
      setIsOpenState(false);
    }

    local.onClose?.();
  };

  const openWithDelay = () => {
    if (!local.disabled) {
      enterTimeout = window.setTimeout(onOpen, local.openDelay);
    }
  };

  const closeWithDelay = () => {
    if (enterTimeout) {
      window.clearTimeout(enterTimeout);
    }

    exitTimeout = window.setTimeout(onClose, local.closeDelay);
  };

  const onClick = () => {
    if (local.closeOnClick) {
      closeWithDelay();
    }
  };

  const onMouseDown = () => {
    if (local.closeOnMouseDown) {
      closeWithDelay();
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (isOpen() && event.key === "Escape") {
      closeWithDelay();
    }
  };

  const addTriggerListeners = () => {
    const triggerElement = trigger();

    triggerElement.addEventListener("mouseenter", openWithDelay);
    triggerElement.addEventListener("focus", openWithDelay);

    triggerElement.addEventListener("click", onClick);
    triggerElement.addEventListener("mousedown", onMouseDown);
    triggerElement.addEventListener("mouseleave", closeWithDelay);
    triggerElement.addEventListener("blur", closeWithDelay);
  };

  const removeTriggerListeners = () => {
    const triggerElement = trigger();

    triggerElement.removeEventListener("mouseenter", openWithDelay);
    triggerElement.removeEventListener("focus", openWithDelay);

    triggerElement.removeEventListener("click", onClick);
    triggerElement.removeEventListener("mousedown", onMouseDown);
    triggerElement.removeEventListener("mouseleave", closeWithDelay);
    triggerElement.removeEventListener("blur", closeWithDelay);
  };

  const beforeToolipEnterTransition = () => {
    if (isControlled()) {
      // schedule a micro task so the tooltip appear with the right position.
      Promise.resolve().then(updateTooltipPosition);
    }
  };

  const afterToolipEnterTransition = () => {
    if (isServer) {
      return;
    }

    document.addEventListener("keydown", onKeyDown);

    triggerScrollParents().forEach(el => {
      el.addEventListener("scroll", updateTooltipPosition);
      el.addEventListener("resize", updateTooltipPosition);
    });
  };

  const afterToolipExitTransition = () => {
    document.removeEventListener("keydown", onKeyDown);

    triggerScrollParents().forEach(el => {
      el.removeEventListener("scroll", updateTooltipPosition);
      el.removeEventListener("resize", updateTooltipPosition);
    });

    // For smooth transition, unmount portal only after tooltip exit transition is done.
    setIsPortalMounted(false);
  };

  onMount(() => {
    addTriggerListeners();
  });

  onCleanup(() => {
    removeTriggerListeners();

    window.clearTimeout(enterTimeout);
    window.clearTimeout(exitTimeout);
  });

  createEffect(() => {
    if (isOpen()) {
      // mount portal only when `isTooltipVisible` is true.
      setIsPortalMounted(true);

      if (local.id) {
        trigger().setAttribute("aria-describedby", local.id);
      }
    } else {
      trigger().removeAttribute("aria-describedby");
    }
  });

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
            onBeforeEnter={beforeToolipEnterTransition}
            onAfterEnter={afterToolipEnterTransition}
            onAfterExit={afterToolipExitTransition}
          >
            <Show when={isOpen()}>
              <Box
                ref={tooltipElement}
                role="tooltip"
                id={local.id}
                class={tooltipClasses()}
                {...others}
              >
                {local.label}
                <Show when={local.hasArrow}>
                  <Box ref={arrowElement} class={arrowClasses()} boxSize={local.arrowSize} />
                </Show>
              </Box>
            </Show>
          </Transition>
        </Portal>
      </Show>
    </>
  );
}

Tooltip.toString = () => createClassSelector(hopeTooltipClass);
