import type { Placement as FloatingPlacement } from "@floating-ui/dom";
import { TransitionOptions, TransitionResult } from "@hope-ui/primitives";
import { ComponentTheme } from "@hope-ui/styles";
import { Accessor, JSX, Setter } from "solid-js";

import { PopoverStyleConfigProps } from "./popover.styles";

export type BasePlacement = "top" | "bottom" | "left" | "right";

interface BasePopoverState {
  /** Whether the popover should be shown. */
  isOpen: boolean;

  /** Options passed to the popover transition. */
  transitionOptions?: Partial<Omit<TransitionOptions, "shouldMount">>;

  /**
   * The interaction that triggers the popover.
   *
   * `hover` - means the popover will open when you hover with mouse or
   * focus with keyboard on the popover trigger
   *
   * `click` - means the popover will open on click or
   * press `Enter` to `Space` on keyboard
   */
  triggerMode: "hover" | "click";

  /** Whether the popover should display an arrow inside it. */
  withArrow: boolean;

  /** The size of the arrow (in px). */
  arrowSize: number;

  /** Placement of the popover. */
  placement: FloatingPlacement;

  /** Whether the popover should have the same width as the anchor element. */
  hasSameWidth: boolean;

  /** Offset between the popover and the anchor element (in px). */
  offset: number;

  /** The minimum padding between the arrow and the popover corner (in px). */
  arrowPadding: number;

  /** The minimum padding between the popover and the viewport edge (in px). */
  overflowPadding: number;

  /** Delay before showing the popover on hover (in ms). */
  openDelay: number;

  /** Delay before hiding the popover on mouse leave (in ms). */
  closeDelay: number;

  /** Whether the popover should close when the user blur out it by clicking outside or tabbing out. */
  closeOnBlur: boolean;

  /**  Whether the popover should close when the user hit the `Esc` key. */
  closeOnEsc: boolean;

  /** Whether the focus will be locked into the popover. */
  trapFocus: boolean;

  /** A query selector to retrieve the element that should receive focus once `Popover` opens. */
  initialFocusSelector?: string;

  /** A query selector to retrieve the element that should receive focus once `Popover` closes. */
  restoreFocusSelector?: string;
}

export type PopoverChildrenRenderProp = (props: {
  /** Whether the popover should be shown. */
  isOpen: Accessor<boolean>;

  /** A function to close the popover. */
  close: () => void;
}) => JSX.Element;

export interface PopoverProps extends PopoverStyleConfigProps, Partial<BasePopoverState> {
  /** The id of the popover content. */
  id?: string;

  /** Whether the popover should be shown (in controlled mode). */
  isOpen?: boolean;

  /** Whether the popover should be initially shown (in uncontrolled mode). */
  defaultIsOpen?: boolean;

  /** A function that will be called when the `isOpen` state of the popover changes. */
  onOpenChange?: (isOpen: boolean) => void;

  /** Children of the popover. */
  children?: JSX.Element | PopoverChildrenRenderProp;
}

export type PopoverTheme = ComponentTheme<
  PopoverProps,
  | "transitionOptions"
  | "triggerMode"
  | "placement"
  | "offset"
  | "arrowPadding"
  | "overflowPadding"
  | "openDelay"
  | "closeDelay"
  | "closeOnBlur"
  | "closeOnEsc"
  | "trapFocus"
  | "initialFocusSelector"
  | "restoreFocusSelector"
>;

export interface PopoverContextValue {
  /** Whether the popover should be shown. */
  isOpen: Accessor<BasePopoverState["isOpen"]>;

  /** The interaction that triggers the popover. */
  triggerMode: Accessor<BasePopoverState["triggerMode"]>;

  /** Whether the popover should display an arrow inside it. */
  withArrow: Accessor<BasePopoverState["withArrow"]>;

  /** The size of the arrow (in px). */
  arrowSize: Accessor<BasePopoverState["arrowSize"]>;

  /**
   * The current placement of the popover content. This may be different
   * from the initial `placement` prop if the popover has needed to update its
   * position on the fly.
   */
  currentPlacement: Accessor<FloatingPlacement>;

  /** The popover content enter/exit transition. */
  popoverTransition: TransitionResult;

  /**
   * The `id` of the popover content element.
   * Also act as a prefix for others popover elements `id`.
   */
  popoverId: Accessor<string>;

  /** The `id` of the popover heading element. */
  headingId: Accessor<string | undefined>;

  /** Setter for the `id` of the popover heading element. */
  setHeadingId: Setter<string | undefined>;

  /** The `id` of the popover description element. */
  descriptionId: Accessor<string | undefined>;

  /** Setter for the `id` of the popover description element. */
  setDescriptionId: Setter<string | undefined>;

  /** The popover content element. */
  contentRef: Accessor<HTMLElement | undefined>;

  /** A function to assign the popover content ref. */
  setContentRef: (el: HTMLElement) => void;

  /** A function to assign the popover arrow ref. */
  setArrowRef: (el: HTMLElement) => void;

  /** A function to assign the popover anchor ref. */
  setAnchorRef: (el: HTMLElement) => void;

  /** A function to assign the popover trigger ref. */
  setTriggerRef: (el: HTMLElement) => void;

  /** Whether the focus will be locked into the popover. */
  trapFocus: Accessor<BasePopoverState["trapFocus"]>;

  /** A query selector to retrieve the element that should receive focus once `Popover` opens. */
  initialFocusSelector: Accessor<BasePopoverState["initialFocusSelector"]>;

  /** A query selector to retrieve the element that should receive focus once `Popover` closes. */
  restoreFocusSelector: Accessor<BasePopoverState["restoreFocusSelector"]>;

  /** A function that will be called when the popover trigger is clicked. */
  onTriggerClick: () => void;

  /** A function that will be called when a key is pressed while the popover trigger has focus. */
  onTriggerKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent>;

  /** A function that will be called when the popover trigger receive focus. */
  onTriggerFocus: () => void;

  /** A function that will be called when the popover trigger loses focus. */
  onTriggerBlur: JSX.EventHandlerUnion<HTMLElement, FocusEvent>;

  /** A function that will be called when the mouse enters the popover trigger. */
  onTriggerMouseEnter: () => void;

  /** A function that will be called when the mouse leaves the popover trigger. */
  onTriggerMouseLeave: () => void;

  /** A function that will be called when a key is pressed while the popover content has focus. */
  onContentKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent>;

  /** A function that will be called when the popover content loses focus. */
  onContentFocusOut: JSX.EventHandlerUnion<HTMLElement, FocusEvent>;

  /** A function that will be called when the mouse enters the popover content. */
  onContentMouseEnter: () => void;

  /** A function that will be called when the mouse leaves the popover content. */
  onContentMouseLeave: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;
}
