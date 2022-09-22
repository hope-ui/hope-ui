/*!
 * Portions of this file are based on code from ariakit.
 * MIT Licensed, Copyright (c) Diego Haz.
 *
 * Credits to the Ariakit team:
 * https://github.com/ariakit/ariakit/blob/232bc79018ec20967fec1e097a9474aba3bb5be7/packages/ariakit/src/popover/popover-state.ts
 */

import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  hide,
  offset,
  shift,
  size,
} from "@floating-ui/dom";
import { createDisclosure, createTransition } from "@hope-ui/primitives";
import { mergeThemeProps, STYLE_CONFIG_PROP_NAMES, StyleConfigProvider } from "@hope-ui/styles";
import { contains, getRelatedTarget, runIfFn } from "@hope-ui/utils";
import { createEffect, createSignal, createUniqueId, JSX, onCleanup, splitProps } from "solid-js";
import { isServer } from "solid-js/web";

import { usePopoverStyleConfig } from "./popover.styles";
import { PopoverContext } from "./popover-context";
import { BasePlacement, PopoverContextValue, PopoverProps } from "./types";

/**
 * Popover provides context, theming, and accessibility properties
 * to all other popover components.
 *
 * It doesn't render any DOM node.
 */
export function Popover(props: PopoverProps) {
  props = mergeThemeProps(
    "Popover",
    {
      id: `hope-popover-${createUniqueId()}`,
      triggerMode: "click",
      withArrow: true,
      arrowSize: 24,
      placement: "bottom",
      offset: 12,
      arrowPadding: 12,
      openDelay: 0,
      closeDelay: 100,
      closeOnBlur: true,
      closeOnEsc: true,
      trapFocus: false,
    },
    props
  );

  const [styleConfigProps] = splitProps(props, [...STYLE_CONFIG_PROP_NAMES]);

  const styleConfigResult = usePopoverStyleConfig("Popover", styleConfigProps);

  const [anchorRef, setAnchorRef] = createSignal<HTMLElement>();
  const [triggerRef, setTriggerRef] = createSignal<HTMLElement>();
  const [contentRef, setContentRef] = createSignal<HTMLElement>();
  const [arrowRef, setArrowRef] = createSignal<HTMLElement>();

  const [isHovered, setIsHovered] = createSignal(false);
  const [currentPlacement, setCurrentPlacement] = createSignal(props.placement!);
  const [headingId, setHeadingId] = createSignal<string>();
  const [descriptionId, setDescriptionId] = createSignal<string>();

  const disclosureState = createDisclosure({
    isOpen: () => props.isOpen,
    defaultIsOpen: () => !!props.defaultIsOpen,
    onOpenChange: value => props.onOpenChange?.(value),
  });

  const popoverTransition = createTransition({
    get shouldMount() {
      return disclosureState.isOpen();
    },
    get transition() {
      return props.transitionOptions?.transition ?? "pop";
    },
    get duration() {
      return props.transitionOptions?.duration;
    },
    get exitDuration() {
      return props.transitionOptions?.exitDuration;
    },
    get delay() {
      return props.transitionOptions?.delay;
    },
    get exitDelay() {
      return props.transitionOptions?.exitDelay;
    },
    get easing() {
      return props.transitionOptions?.easing;
    },
    get exitEasing() {
      return props.transitionOptions?.exitEasing;
    },
    get onBeforeEnter() {
      return props.transitionOptions?.onBeforeEnter;
    },
    get onAfterEnter() {
      return props.transitionOptions?.onAfterEnter;
    },
    get onBeforeExit() {
      return props.transitionOptions?.onBeforeExit;
    },
    get onAfterExit() {
      return props.transitionOptions?.onAfterExit;
    },
  });

  const getPopoverElements = () => {
    const referenceEl = anchorRef() ?? triggerRef();
    const arrowEl = arrowRef();
    const floatingEl = contentRef();

    return { referenceEl, arrowEl, floatingEl };
  };

  async function updatePosition() {
    const { referenceEl, arrowEl, floatingEl } = getPopoverElements();

    if (!referenceEl || !floatingEl) {
      return;
    }

    const middleware = [
      offset(props.offset),
      flip({ padding: props.overflowPadding }),
      shift({ padding: props.overflowPadding }),
      size({
        padding: props.overflowPadding,
        apply({ rects }) {
          const referenceWidth = Math.round(rects.reference.width);

          if (props.hasSameWidth) {
            floatingEl.style.width = `${referenceWidth}px`;
          }
        },
      }),
    ];

    if (arrowEl) {
      middleware.push(arrow({ element: arrowEl, padding: props.arrowPadding }));
    }

    middleware.push(hide());

    const pos = await computePosition(referenceEl, floatingEl, {
      placement: props.placement,
      middleware,
    });

    if (pos.placement !== currentPlacement()) {
      setCurrentPlacement(pos.placement);
    }

    if (!floatingEl) {
      return;
    }

    // https://floating-ui.com/docs/computePosition#usage
    Object.assign(floatingEl.style, {
      left: `${Math.round(pos.x)}px`,
      top: `${Math.round(pos.y)}px`,
      visibility: pos.middlewareData.hide?.referenceHidden ? "hidden" : "visible",
    });

    if (arrowEl && pos.middlewareData.arrow) {
      const { x: arrowX, y: arrowY } = pos.middlewareData.arrow;

      const dir = pos.placement.split("-")[0] as BasePlacement;

      Object.assign(arrowEl.style, {
        left: arrowX != null ? `${arrowX}px` : "",
        top: arrowY != null ? `${arrowY}px` : "",
        [dir]: "100%",
      });
    }
  }

  let enterTimeoutId: number | undefined;
  let exitTimeoutId: number | undefined;

  const openWithDelay = () => {
    window.clearTimeout(enterTimeoutId);

    enterTimeoutId = window.setTimeout(() => {
      disclosureState.open();
      void updatePosition();
    }, props.openDelay);
  };

  const closeWithDelay = () => {
    window.clearTimeout(exitTimeoutId);

    exitTimeoutId = window.setTimeout(disclosureState.close, props.closeDelay);
  };

  const onContentKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = event => {
    if (props.closeOnEsc && event.key === "Escape") {
      closeWithDelay();
    }
  };

  const onContentMouseEnter = () => {
    setIsHovered(true);
    window.clearTimeout(exitTimeoutId);
  };

  const onContentMouseLeave = () => {
    setIsHovered(false);

    window.clearTimeout(exitTimeoutId);

    exitTimeoutId = window.setTimeout(() => {
      console.log(isHovered());
      // close if trigger or content is not hovered
      !isHovered() && disclosureState.close();
    }, props.closeDelay);
  };

  const onContentFocusOut: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = event => {
    const relatedTarget = getRelatedTarget(event);

    const targetIsPopover = contains(contentRef(), relatedTarget);
    const targetIsTrigger = contains(triggerRef(), relatedTarget);
    const isValidBlur = !targetIsPopover && !targetIsTrigger;

    if (disclosureState.isOpen() && props.closeOnBlur && isValidBlur) {
      closeWithDelay();
    }
  };

  const onTriggerClick = () => {
    disclosureState.isOpen() ? closeWithDelay() : openWithDelay();
  };

  // For now, it's the same code but might change in the future.
  const onTriggerKeyDown = onContentKeyDown;

  const onTriggerMouseEnter = () => {
    setIsHovered(true);

    if (disclosureState.isOpen()) {
      window.clearTimeout(exitTimeoutId);
    } else {
      openWithDelay();
    }
  };

  // For now, it's the same code but might change in the future.
  const onTriggerMouseLeave = onContentMouseLeave;

  const onTriggerFocus = () => {
    openWithDelay();
  };

  const onTriggerBlur: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = event => {
    const relatedTarget = getRelatedTarget(event);
    const isValidBlur = !contains(contentRef(), relatedTarget);

    if (disclosureState.isOpen() && props.closeOnBlur && isValidBlur) {
      closeWithDelay();
    }
  };

  createEffect(() => {
    const { referenceEl, floatingEl } = getPopoverElements();

    if (!referenceEl || !floatingEl) {
      return;
    }

    const cleanupAutoUpdate = autoUpdate(referenceEl, floatingEl, updatePosition, {
      // JSDOM doesn't support ResizeObserver
      elementResize: typeof ResizeObserver === "function",
    });

    onCleanup(cleanupAutoUpdate);
  });

  onCleanup(() => {
    if (isServer) {
      return;
    }

    window.clearTimeout(enterTimeoutId);
    window.clearTimeout(exitTimeoutId);
  });

  const context: PopoverContextValue = {
    isOpen: disclosureState.isOpen,
    popoverTransition,
    triggerMode: () => props.triggerMode!,
    withArrow: () => props.withArrow!,
    arrowSize: () => props.arrowSize!,
    currentPlacement,
    popoverId: () => props.id!,
    headingId,
    setHeadingId,
    descriptionId,
    setDescriptionId,
    contentRef,
    setContentRef,
    setArrowRef,
    setAnchorRef,
    setTriggerRef,
    closeOnEsc: () => props.closeOnEsc!,
    trapFocus: () => props.trapFocus!,
    initialFocusSelector: () => props.initialFocusSelector,
    finalFocusSelector: () => props.finalFocusSelector,
    closeWithDelay,
    onContentKeyDown,
    onContentMouseEnter,
    onContentMouseLeave,
    onContentFocusOut,
    onTriggerClick,
    onTriggerKeyDown,
    onTriggerMouseEnter,
    onTriggerMouseLeave,
    onTriggerFocus,
    onTriggerBlur,
  };

  return (
    <StyleConfigProvider value={styleConfigResult}>
      <PopoverContext.Provider value={context}>
        {runIfFn(props.children, {
          isOpen: disclosureState.isOpen,
          close: closeWithDelay,
        })}
      </PopoverContext.Provider>
    </StyleConfigProvider>
  );
}
