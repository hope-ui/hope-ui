/*!
 * Portions of this file are based on code from ariakit.
 * MIT Licensed, Copyright (c) Diego Haz.
 *
 * Credits to the Ariakit team:
 * https://github.com/ariakit/ariakit/blob/232bc79018ec20967fec1e097a9474aba3bb5be7/packages/ariakit/src/popover/popover-state.ts
 *
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/d945b9a7da3056017cda0cdd552af40fa1426070/packages/components/popover/src/use-popover.ts
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
      openDelay: 200,
      closeDelay: 200,
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

  let openTimeoutId: number | undefined;
  let closeTimeoutId: number | undefined;

  const onTriggerClick = () => {
    disclosureState.toggle();
  };

  const onTriggerKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = event => {
    if (event.key === "Escape") {
      disclosureState.close();
    }
  };

  const onTriggerFocus = () => {
    // If openTimeoutId does not exist, the user is using keyboard focus (not mouse hover/click)
    if (openTimeoutId == null) {
      disclosureState.open();
    }
  };

  const onTriggerBlur: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = event => {
    const relatedTarget = getRelatedTarget(event);
    const isValidBlur = !contains(contentRef(), relatedTarget);

    if (disclosureState.isOpen() && props.closeOnBlur && isValidBlur) {
      disclosureState.close();
    }
  };

  const onTriggerMouseEnter = () => {
    setIsHovered(true);

    openTimeoutId = window.setTimeout(() => {
      disclosureState.open();
      void updatePosition();
    }, props.openDelay);
  };

  const onTriggerMouseLeave = () => {
    setIsHovered(false);

    if (openTimeoutId) {
      clearTimeout(openTimeoutId);
      openTimeoutId = undefined;
    }

    closeTimeoutId = window.setTimeout(() => {
      if (!isHovered()) {
        disclosureState.close();
      }
    }, props.closeDelay);
  };

  const onContentKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = event => {
    if (props.closeOnEsc && event.key === "Escape") {
      disclosureState.close();
    }
  };

  const onContentFocusOut: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = event => {
    const relatedTarget = getRelatedTarget(event);

    const targetIsPopover = contains(contentRef(), relatedTarget);
    const targetIsTrigger = contains(triggerRef(), relatedTarget);
    const isValidBlur = !targetIsPopover && !targetIsTrigger;

    if (disclosureState.isOpen() && props.closeOnBlur && isValidBlur) {
      disclosureState.close();
    }
  };

  const onContentMouseEnter = () => {
    setIsHovered(true);
  };

  const onContentMouseLeave: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = event => {
    // https://stackoverflow.com/questions/46831247/select-triggers-mouseleave-event-on-parent-element-in-mozilla-firefox
    if (event.relatedTarget === null) {
      return;
    }

    setIsHovered(false);

    closeTimeoutId = window.setTimeout(disclosureState.close, props.closeDelay);
  };

  const onCloseButtonClick = () => {
    disclosureState.close();
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

    window.clearTimeout(openTimeoutId);
    window.clearTimeout(closeTimeoutId);
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
    trapFocus: () => props.trapFocus!,
    initialFocusSelector: () => props.initialFocusSelector,
    restoreFocusSelector: () => props.restoreFocusSelector,
    onTriggerClick,
    onTriggerKeyDown,
    onTriggerFocus,
    onTriggerBlur,
    onTriggerMouseEnter,
    onTriggerMouseLeave,
    onContentKeyDown,
    onContentFocusOut,
    onContentMouseEnter,
    onContentMouseLeave,
    onCloseButtonClick,
  };

  return (
    <StyleConfigProvider value={styleConfigResult}>
      <PopoverContext.Provider value={context}>
        {runIfFn(props.children, disclosureState)}
      </PopoverContext.Provider>
    </StyleConfigProvider>
  );
}
