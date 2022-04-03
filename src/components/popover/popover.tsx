import type { Placement } from "@floating-ui/dom";
import { arrow, autoUpdate, computePosition, flip, hide, inline, offset, shift } from "@floating-ui/dom";
import { createFocusTrap, FocusTrap } from "focus-trap";
import { Accessor, createContext, createUniqueId, JSX, onCleanup, Show, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { isServer } from "solid-js/web";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { contains, getRelatedTarget } from "@/utils/dom";
import { isChildrenFunction } from "@/utils/solid";
import { isFocusable } from "@/utils/tabbable";

import { ThemeableCloseButtonOptions } from "../close-button/close-button";

interface PopoverChildrenRenderPropParams {
  opened: Accessor<boolean>;
  onClose: () => void;
}

type PopoverChildrenRenderProp = (props: PopoverChildrenRenderPropParams) => JSX.Element;

type PopoverMotionPreset = "scale" | "none";

export interface PopoverProps {
  /**
   * Placement of the popover
   */
  placement?: Placement;

  /**
   * Offset between the popover and the reference (trigger) element.
   */
  offset?: number;

  /**
   * The amount of padding to apply when the popover might go off screen.
   * @see https://floating-ui.com/docs/shift
   */
  shiftPadding?: number;

  /**
   * The id of the popover content.
   */
  id?: string;

  /**
   * If `true`, the popover will be shown.
   * (in controlled mode)
   */
  opened?: boolean;

  /**
   * If `true`, the popover will be initially shown
   * (in uncontrolled mode)
   */
  defaultOpened?: boolean;

  /**
   * The interaction that triggers the popover.
   *
   * `hover` - means the popover will open when you hover with mouse or
   * focus with keyboard on the popover trigger
   *
   * `click` - means the popover will open on click or
   * press `Enter` to `Space` on keyboard
   */
  triggerMode?: "hover" | "click";

  /**
   * If `true`, apply floating-ui `inline` middleware.
   * Useful for inline reference elements that span over multiple lines, such as hyperlinks or range selections.
   */
  inline?: boolean;

  /**
   * The padding between the arrow and the edges of the popover.
   */
  arrowPadding?: number;

  /**
   * Delay (in ms) before showing the popover
   */
  openDelay?: number;

  /**
   * Delay (in ms) before hiding the popover
   */
  closeDelay?: number;

  /**
   * If `true`, the popover will close when the user blur out it by clicking outside or tabbing out
   */
  closeOnBlur?: boolean;

  /**
   * If `true`, the popover will close when the user hit the `Esc` key.
   */
  closeOnEsc?: boolean;

  /**
   * If `true`, the focus will be locked into the popover.
   */
  trapFocus?: boolean;

  /**
   * A query selector string targeting the element to receive focus when the popover opens.
   */
  initialFocus?: string;

  /**
   * Popover opening/closing transition.
   */
  motionPreset?: PopoverMotionPreset;

  /**
   * Children of the popover.
   */
  children?: JSX.Element | PopoverChildrenRenderProp;

  /**
   * Callback fired when the popover opens.
   */
  onOpen?: () => void;

  /**
   * Callback fired when the popover closes.
   */
  onClose?: () => void;
}

type ThemeablePopoverOptions = Pick<
  PopoverProps,
  | "placement"
  | "offset"
  | "arrowPadding"
  | "openDelay"
  | "closeDelay"
  | "motionPreset"
  | "closeOnEsc"
  | "closeOnBlur"
  | "trapFocus"
>;

interface PopoverState
  extends Required<
      Pick<
        PopoverProps,
        | "triggerMode"
        | "offset"
        | "inline"
        | "arrowPadding"
        | "openDelay"
        | "closeDelay"
        | "opened"
        | "motionPreset"
        | "closeOnBlur"
        | "closeOnEsc"
        | "trapFocus"
      >
    >,
    Pick<PopoverProps, "initialFocus"> {
  /**
   * If `true`, the popover will be shown.
   * (in uncontrolled mode)
   */
  _opened: boolean;

  /**
   * If `true`, the popover is in controlled mode.
   * (have opened, onOpen and onClose prop)
   */
  isControlled: boolean;

  /**
   * If `true`, the popover trigger or content is hovered.
   */
  isHovering: boolean;

  /**
   * If `true`, the trigger mode is `click`.
   */
  triggerOnClick: boolean;

  /**
   * If `true`, the trigger mode is `hover`.
   */
  triggerOnHover: boolean;

  /**
   * The inital popover placement that you requested.
   */
  initialPlacement: Placement;

  /**
   * The final popover placement after all floating-ui middleware has been applied.
   */
  finalPlacement: Placement;

  /**
   * The `id` of the popover trigger.
   */
  triggerId: string;

  /**
   * The `id` of the popover content.
   */
  contentId: string;

  /**
   * The `id` of the popover content header.
   */
  headerId: string;

  /**
   * The `id` of the popover content body.
   */
  bodyId: string;

  /**
   * If `true`, notify that the popover header component is rendered.
   */
  headerMounted: boolean;

  /**
   * If `true`, notify that the popover body component is rendered.
   */
  bodyMounted: boolean;
}

/**
 * Popover provides context, theming, and accessibility properties
 * to all other popover components.
 *
 * It doesn't render any DOM node.
 */
export function Popover(props: PopoverProps) {
  const defaultContentId = `hope-popover-${createUniqueId()}`;

  const theme = useComponentStyleConfigs().Popover;

  const [state, setState] = createStore<PopoverState>({
    // eslint-disable-next-line solid/reactivity
    _opened: !!props.defaultOpened,
    isHovering: false,
    headerMounted: false,
    bodyMounted: false,
    finalPlacement: "bottom",
    get isControlled() {
      return props.opened !== undefined;
    },
    get opened() {
      return this.isControlled ? !!props.opened : this._opened;
    },
    get contentId() {
      return props.id ?? defaultContentId;
    },
    get triggerId() {
      return `${this.contentId}--trigger`;
    },
    get headerId() {
      return `${this.contentId}--header`;
    },
    get bodyId() {
      return `${this.contentId}--body`;
    },
    get triggerMode() {
      return props.triggerMode ?? "click";
    },
    get triggerOnClick() {
      return this.triggerMode === "click";
    },
    get triggerOnHover() {
      return this.triggerMode === "hover";
    },
    get initialFocus() {
      return props.initialFocus;
    },
    get inline() {
      return props.inline ?? false;
    },
    get initialPlacement() {
      return props.placement ?? theme?.defaultProps?.root?.placement ?? "bottom";
    },
    get offset() {
      return props.offset ?? theme?.defaultProps?.root?.offset ?? 8;
    },
    get arrowPadding() {
      return props.arrowPadding ?? theme?.defaultProps?.root?.arrowPadding ?? 8;
    },
    get openDelay() {
      return props.openDelay ?? theme?.defaultProps?.root?.openDelay ?? 0;
    },
    get closeDelay() {
      return props.closeDelay ?? theme?.defaultProps?.root?.closeDelay ?? 100;
    },
    get motionPreset() {
      return props.motionPreset ?? theme?.defaultProps?.root?.motionPreset ?? "scale";
    },
    get closeOnBlur() {
      return props.closeOnBlur ?? theme?.defaultProps?.root?.closeOnBlur ?? true;
    },
    get closeOnEsc() {
      return props.closeOnEsc ?? theme?.defaultProps?.root?.closeOnEsc ?? true;
    },
    get trapFocus() {
      return props.trapFocus ?? theme?.defaultProps?.root?.trapFocus ?? false;
    },
  });

  let anchorRef: HTMLElement | undefined;
  let triggerRef: HTMLElement | undefined;
  let popoverRef: HTMLElement | undefined;
  let arrowRef: HTMLElement | undefined;

  let focusTrap: FocusTrap | undefined;

  let enterTimeoutId: number | undefined;
  let exitTimeoutId: number | undefined;

  let cleanupPopoverAutoUpdate: (() => void) | undefined;

  const popoverSelector = () => `[id='${state.contentId}']`;

  const assignAnchorRef = (el: HTMLElement) => {
    anchorRef = el;
  };

  const assignTriggerRef = (el: HTMLElement) => {
    triggerRef = el;
  };

  const assignPopoverRef = (el: HTMLElement) => {
    popoverRef = el;
  };

  const assignArrowRef = (el: HTMLElement) => {
    arrowRef = el;
  };

  async function updatePopoverPosition() {
    const referenceElement = anchorRef ?? triggerRef;

    if (!referenceElement || !popoverRef) {
      return;
    }

    const middleware = [offset(state.offset)];

    if (state.inline) {
      middleware.push(inline());
    }

    middleware.push(flip());
    middleware.push(shift({ padding: props.shiftPadding }));

    if (arrowRef) {
      middleware.push(arrow({ element: arrowRef, padding: state.arrowPadding }));
    }

    middleware.push(hide());

    const { x, y, placement, middlewareData } = await computePosition(referenceElement, popoverRef, {
      placement: state.initialPlacement,
      middleware,
    });

    if (placement !== state.finalPlacement) {
      setState("finalPlacement", placement);
    }

    if (!popoverRef) {
      return;
    }

    const referenceHidden = middlewareData.hide?.referenceHidden;

    Object.assign(popoverRef.style, {
      left: `${Math.round(x)}px`,
      top: `${Math.round(y)}px`,
      visibility: referenceHidden ? "hidden" : "visible",
    });

    if (!arrowRef) {
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

    // Used to put half of the arrow outside of the popover.
    const arrowOffset = `${(Math.round(arrowRef.clientWidth / 2) + 1) * -1}px`;

    Object.assign(arrowRef.style, {
      left: arrowX != null ? `${Math.round(arrowX)}px` : "",
      top: arrowY != null ? `${Math.round(arrowY)}px` : "",
      right: "",
      bottom: "",
      [staticSide]: arrowOffset,
    });
  }

  const onOpen = () => {
    if (!state.isControlled) {
      setState("_opened", true);
    }

    props.onOpen?.();
    updatePopoverPosition();
  };

  const onClose = () => {
    if (!state.isControlled) {
      setState("_opened", false);
    }

    props.onClose?.();
  };

  const closeIfNotHover = () => {
    !state.isHovering && onClose();
  };

  const openWithDelay = () => {
    enterTimeoutId = window.setTimeout(onOpen, state.openDelay);
  };

  const closeWithDelay = () => {
    if (enterTimeoutId) {
      window.clearTimeout(enterTimeoutId);
    }

    exitTimeoutId = window.setTimeout(onClose, state.closeDelay);
  };

  const setupPopoverAutoUpdate = () => {
    if (isServer) {
      return;
    }

    const referenceElement = anchorRef ?? triggerRef;

    if (!referenceElement || !popoverRef) {
      return;
    }

    // schedule auto update of the popover position
    cleanupPopoverAutoUpdate = autoUpdate(referenceElement, popoverRef, updatePopoverPosition);
  };

  const focusInitialElement = () => {
    if (!state.initialFocus) {
      popoverRef?.focus();
      return;
    }

    const initialFocusRef = document.querySelector(state.initialFocus) as HTMLElement | null;
    initialFocusRef && isFocusable(initialFocusRef) && initialFocusRef?.focus();
  };

  const onTriggerBlur: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = event => {
    const relatedTarget = getRelatedTarget(event);
    const isValidBlur = !contains(popoverRef, relatedTarget);

    if (state.opened && state.closeOnBlur && isValidBlur) {
      closeWithDelay();
    }
  };

  const onTriggerMouseLeave = () => {
    setIsHovering(false);

    if (enterTimeoutId) {
      window.clearTimeout(enterTimeoutId);
    }

    exitTimeoutId = window.setTimeout(closeIfNotHover, state.closeDelay);
  };

  const onPopoverFocusOut: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = event => {
    const relatedTarget = getRelatedTarget(event);
    const targetIsPopover = contains(popoverRef, relatedTarget);
    const targetIsTrigger = contains(triggerRef, relatedTarget);
    const isValidBlur = !targetIsPopover && !targetIsTrigger;

    if (state.opened && state.closeOnBlur && isValidBlur) {
      closeWithDelay();
    }
  };

  // For now it's the same code but might change in the future.
  const onPopoverMouseLeave = onTriggerMouseLeave;

  const afterPopoverOpen = () => {
    // schedule auto update of the tooltip position
    setupPopoverAutoUpdate();

    if (state.trapFocus && popoverRef) {
      focusTrap = createFocusTrap(popoverRef, {
        initialFocus: state.initialFocus,
        fallbackFocus: popoverSelector(),
        allowOutsideClick: false,
      });

      focusTrap.activate();
    } else {
      focusInitialElement();
    }
  };

  const afterPopoverClose = () => {
    focusTrap?.deactivate();
    cleanupPopoverAutoUpdate?.();
  };

  const setIsHovering = (value: boolean) => setState("isHovering", value);
  const setHeaderMounted = (value: boolean) => setState("headerMounted", value);
  const setBodyMounted = (value: boolean) => setState("bodyMounted", value);

  const openedAccessor = () => state.opened;

  onCleanup(() => {
    window.clearTimeout(enterTimeoutId);
    window.clearTimeout(exitTimeoutId);
  });

  const context: PopoverContextValue = {
    state: state as PopoverState,
    assignAnchorRef,
    assignTriggerRef,
    assignPopoverRef,
    assignArrowRef,
    openWithDelay,
    closeWithDelay,
    onTriggerBlur,
    onTriggerMouseLeave,
    onPopoverFocusOut,
    onPopoverMouseLeave,
    updatePopoverPosition,
    afterPopoverOpen,
    afterPopoverClose,
    setIsHovering,
    setHeaderMounted,
    setBodyMounted,
  };

  return (
    <PopoverContext.Provider value={context}>
      <Show when={isChildrenFunction(props)} fallback={props.children as JSX.Element}>
        {(props.children as PopoverChildrenRenderProp)?.({
          opened: openedAccessor,
          onClose: closeWithDelay,
        })}
      </Show>
    </PopoverContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface PopoverContextValue {
  state: PopoverState;

  /**
   * Callback to assign the popover anchor ref.
   */
  assignAnchorRef: (el: HTMLElement) => void;

  /**
   * Callback to assign the popover trigger ref.
   */
  assignTriggerRef: (el: HTMLElement) => void;

  /**
   * Callback to assign the popover content ref.
   */
  assignPopoverRef: (el: HTMLElement) => void;

  /**
   * Callback to assign the popover arrow ref.
   */
  assignArrowRef: (el: HTMLElement) => void;

  /**
   * Callback function to open the popover.
   */
  openWithDelay: () => void;

  /**
   * Callback function to close the popover.
   */
  closeWithDelay: () => void;

  /**
   * Callback function to set if the popover trigger or content is hovered.
   */
  setIsHovering: (value: boolean) => void;

  /**
   * Callback function to set if the popover header is mounted.
   */
  setHeaderMounted: (value: boolean) => void;

  /**
   * Callback function to set if the popover body is mounted.
   */
  setBodyMounted: (value: boolean) => void;

  /**
   * Callback function to update the popover position.
   */
  updatePopoverPosition: () => void;

  /**
   * Callback invoked after the popover content appears.
   */
  afterPopoverOpen: () => void;

  /**
   * Callback invoked after the popover content disappears.
   */
  afterPopoverClose: () => void;

  /**
   * Callback invoked when the mouse leaves the popover trigger.
   */
  onTriggerMouseLeave: () => void;

  /**
   * Callback invoked when the mouse leaves the popover content.
   */
  onPopoverMouseLeave: () => void;

  /**
   * Callback invoked when the popover trigger loses focus.
   */
  onTriggerBlur: JSX.EventHandlerUnion<HTMLElement, FocusEvent>;

  /**
   * Callback invoked when the focus moves out of the popover content.
   */
  onPopoverFocusOut: JSX.EventHandlerUnion<HTMLElement, FocusEvent>;
}

const PopoverContext = createContext<PopoverContextValue>();

export function usePopoverContext() {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error("[Hope UI]: usePopoverContext must be used within a `<Popover />` component");
  }

  return context;
}

/* -------------------------------------------------------------------------------------------------
 * StyleConfig
 * -----------------------------------------------------------------------------------------------*/

export interface PopoverStyleConfig {
  baseStyle?: {
    content?: SystemStyleObject;
    arrow?: SystemStyleObject;
    closeButton?: SystemStyleObject;
    header?: SystemStyleObject;
    body?: SystemStyleObject;
    footer?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeablePopoverOptions;
    closeButton?: ThemeableCloseButtonOptions;
  };
}
