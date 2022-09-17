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
import { createDisclosure } from "@hope-ui/primitives";
import { mergeThemeProps, STYLE_CONFIG_PROP_NAMES, StyleConfigProvider } from "@hope-ui/styles";
import { contains, getRelatedTarget, isChildrenFunction } from "@hope-ui/utils";
import {
  createEffect,
  createSignal,
  createUniqueId,
  JSX,
  onCleanup,
  Show,
  splitProps,
} from "solid-js";

import { usePopoverStyleConfig } from "./popover.styles";
import { PopoverContext } from "./popover-context";
import {
  BasePlacement,
  PopoverChildrenRenderProp,
  PopoverContextValue,
  PopoverProps,
} from "./types";

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
      placement: "bottom",
      offset: 8,
      arrowPadding: 8,
      openDelay: 0,
      closeDelay: 100,
      closeOnBlur: true,
      closeOnEsc: true,
      trapFocus: false,
      autoFocus: true,
      restoreFocus: true,
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

  const getPopoverElements = () => {
    const referenceEl = anchorRef() ?? triggerRef();
    const arrowEl = arrowRef();
    const popoverEl = contentRef();

    return { referenceEl, arrowEl, popoverEl };
  };

  async function updatePosition() {
    const { referenceEl, arrowEl, popoverEl } = getPopoverElements();

    if (!referenceEl || !popoverEl) {
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
            popoverEl.style.width = `${referenceWidth}px`;
          }
        },
      }),
    ];

    if (arrowEl) {
      middleware.push(arrow({ element: arrowEl, padding: props.arrowPadding }));
    }

    middleware.push(hide());

    const pos = await computePosition(referenceEl, popoverEl, {
      placement: props.placement,
      middleware,
    });

    if (pos.placement !== currentPlacement()) {
      setCurrentPlacement(pos.placement);
    }

    if (!popoverEl) {
      return;
    }

    const x = Math.round(pos.x);
    const y = Math.round(pos.y);

    // https://floating-ui.com/docs/misc#subpixel-and-accelerated-positioning
    Object.assign(popoverEl.style, {
      top: "0",
      left: "0",
      transform: `translate3d(${x}px, ${y}px, 0)`,
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

  const disclosureState = createDisclosure({
    isOpen: () => props.isOpen,
    defaultIsOpen: () => !!props.defaultIsOpen,
    onOpenChange: value => props.onOpenChange?.(value),
  });

  let enterTimeoutId: number | undefined;
  let exitTimeoutId: number | undefined;

  const openWithDelay = () => {
    enterTimeoutId = window.setTimeout(() => {
      disclosureState.open();
      void updatePosition();
    }, props.openDelay);
  };

  const closeWithDelay = () => {
    if (enterTimeoutId) {
      window.clearTimeout(enterTimeoutId);
    }

    exitTimeoutId = window.setTimeout(disclosureState.close, props.closeDelay);
  };

  const onContentKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = event => {
    if (props.closeOnEsc && event.key === "Escape") {
      closeWithDelay();
    }
  };

  const onContentMouseEnter = () => {
    setIsHovered(true);
  };

  const onContentMouseLeave = () => {
    setIsHovered(false);

    if (enterTimeoutId) {
      window.clearTimeout(enterTimeoutId);
    }

    exitTimeoutId = window.setTimeout(() => {
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
    openWithDelay();
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

  onCleanup(() => {
    window.clearTimeout(enterTimeoutId);
    window.clearTimeout(exitTimeoutId);
  });

  createEffect(() => {
    const { referenceEl, popoverEl } = getPopoverElements();

    if (!referenceEl || !popoverEl) {
      return;
    }

    const cleanupAutoUpdate = autoUpdate(referenceEl, popoverEl, updatePosition, {
      // JSDOM doesn't support ResizeObserver
      elementResize: typeof ResizeObserver === "function",
    });

    onCleanup(cleanupAutoUpdate);
  });

  const context: PopoverContextValue = {
    isOpen: disclosureState.isOpen,
    triggerMode: () => props.triggerMode!,
    currentPlacement,
    popoverId: () => props.id!,
    headingId,
    setHeadingId,
    descriptionId,
    setDescriptionId,
    setContentRef,
    setArrowRef,
    setAnchorRef,
    setTriggerRef,
    closeOnEsc: () => props.closeOnEsc!,
    trapFocus: () => props.trapFocus!,
    initialFocusSelector: () => props.initialFocusSelector,
    finalFocusSelector: () => props.finalFocusSelector,
    autoFocus: () => props.autoFocus!,
    restoreFocus: () => props.restoreFocus!,
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
        <Show when={isChildrenFunction(props)} fallback={props.children as JSX.Element}>
          {(props.children as PopoverChildrenRenderProp)?.({
            isOpen: disclosureState.isOpen,
            close: closeWithDelay,
          })}
        </Show>
      </PopoverContext.Provider>
    </StyleConfigProvider>
  );
}
