import type { Placement as FloatingPlacement } from "@floating-ui/dom";
import { TransitionOptions, TransitionResult } from "@hope-ui/primitives";
import { ComponentTheme, HopeProps, SystemStyleObject } from "@hope-ui/styles";
import { Accessor, JSX, Setter } from "solid-js";

import { PopoverParts, PopoverStyleConfigProps } from "./popover.styles";

export type BasePlacement = "top" | "bottom" | "left" | "right";

type PopoverTriggerMode = "hover" | "click";

export type AnchorRect = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type PopoverChildrenRenderProp = (props: {
  /** Whether the popover should be shown. */
  isOpen: Accessor<boolean>;

  /** A function to close the popover. */
  close: () => void;
}) => JSX.Element;

export interface PopoverProps extends Omit<PopoverStyleConfigProps, keyof HopeProps> {
  /** Whether the popover should be shown (in controlled mode). */
  isOpen?: boolean;

  /** Whether the popover should be initially shown (in uncontrolled mode). */
  defaultIsOpen?: boolean;

  /** A function that will be called when the `isOpen` state of the popover changes. */
  onOpenChange?: (isOpen: boolean) => void;

  /** Children of the popover. */
  children?: JSX.Element | PopoverChildrenRenderProp;

  /** The id of the popover content. */
  id?: string;

  /** Options passed to the popover transition. */
  transitionOptions?: TransitionOptions;

  /**
   * Function that returns the anchor element's DOMRect. If this is explicitly
   * passed, it will override the anchor `getBoundingClientRect` method.
   */
  getAnchorRect?: (anchor?: HTMLElement) => AnchorRect | undefined;

  /**
   * The interaction that triggers the popover.
   *
   * `hover` - means the popover will open when you hover with mouse or
   * focus with keyboard on the popover trigger
   *
   * `click` - means the popover will open on click or
   * press `Enter` to `Space` on keyboard
   */
  triggerMode?: PopoverTriggerMode;

  /** Whether the popover should display an arrow inside it. */
  withArrow?: boolean;

  /** The size of the arrow (in px). */
  arrowSize?: number;

  /** Placement of the popover. */
  placement?: FloatingPlacement;

  /** Whether the popover should have the same width as the anchor element. */
  hasSameWidth?: boolean;

  /** Offset between the popover and the anchor element (in px). */
  offset?: number;

  /** The minimum padding between the arrow and the popover corner (in px). */
  arrowPadding?: number;

  /** The minimum padding between the popover and the viewport edge (in px). */
  overflowPadding?: number;

  /** Delay before showing the popover on hover (in ms). */
  openDelay?: number;

  /** Delay before hiding the popover on mouse leave (in ms). */
  closeDelay?: number;

  /** Whether the popover should close when the user blur out it by clicking outside or tabbing out. */
  closeOnBlur?: boolean;

  /** Whether the popover should close when the user hit the `Esc` key. */
  closeOnEsc?: boolean;

  /** Whether the focus will be locked into the popover. */
  trapFocus?: boolean;

  /** A query selector to retrieve the element that should receive focus once the popover opens. */
  initialFocusSelector?: string;

  /** A query selector to retrieve the element that should receive focus once the popover closes. */
  restoreFocusSelector?: string;
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
  /** The style config base class names. */
  baseClasses: Accessor<Record<PopoverParts, string>>;

  /** The style config style overrides. */
  styleOverrides: Accessor<Record<PopoverParts, SystemStyleObject>>;

  /** Whether the popover should be shown. */
  isOpen: Accessor<boolean>;

  /** The interaction that triggers the popover. */
  triggerMode: Accessor<PopoverTriggerMode>;

  /** Whether the popover should display an arrow inside it. */
  withArrow: Accessor<boolean>;

  /** The size of the arrow (in px). */
  arrowSize: Accessor<number>;

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
  trapFocus: Accessor<boolean>;

  /** A query selector to retrieve the element that should receive focus once the popover opens. */
  initialFocusSelector: Accessor<string | undefined>;

  /** A query selector to retrieve the element that should receive focus once the popover closes. */
  restoreFocusSelector: Accessor<string | undefined>;

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

  /** A function that will be called when a key is pressed while the popover content has focus in. */
  onContentKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent>;

  /** A function that will be called when the popover content loses focus. */
  onContentFocusOut: JSX.EventHandlerUnion<HTMLElement, FocusEvent>;

  /** A function that will be called when the mouse enters the popover content. */
  onContentMouseEnter: () => void;

  /** A function that will be called when the mouse leaves the popover content. */
  onContentMouseLeave: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;

  /** A function that will be called when the popover close button is clicked. */
  onCloseButtonClick: () => void;
}
