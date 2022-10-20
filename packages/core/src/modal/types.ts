import { TransitionOptionsOverride, TransitionResult } from "@hope-ui/primitives";
import { ComponentTheme, HopeProps, SystemStyleObject } from "@hope-ui/styles";
import { Accessor, JSX, ParentProps, Setter } from "solid-js";

import { ModalParts, ModalStyleConfigProps } from "./modal.styles";

export interface BaseModalProps {
  /** Whether the modal should be shown. */
  isOpen: boolean;

  /** A function that will be called to close the modal. */
  onClose: () => void;

  /** The id of the modal content. */
  id?: string;

  /** Options passed to the modal content transition. */
  contentTransitionOptions?: TransitionOptionsOverride;

  /** Options passed to the overlay transition. */
  overlayTransitionOptions?: TransitionOptionsOverride;

  /** Whether the modal should close when the overlay is clicked. */
  closeOnOverlayClick?: boolean;

  /** Whether the modal should close when the user hit the `Esc` key. */
  closeOnEsc?: boolean;

  /** Whether the scroll should be disabled on the `body` when the modal opens. */
  preventScroll?: boolean;

  /** Whether the focus will be locked into the modal. */
  trapFocus?: boolean;

  /** A query selector to retrieve the element that should receive focus once the modal opens. */
  initialFocusSelector?: string;

  /** A query selector to retrieve the element that should receive focus once the modal closes. */
  restoreFocusSelector?: string;

  /** A function that will be called when the overlay is clicked. */
  onOverlayClick?: () => void;

  /** A function that will be called when the `Esc` key is pressed and focus is within the modal. */
  onEscKeyDown?: () => void;
}

export interface ModalProps
  extends BaseModalProps,
    Omit<ModalStyleConfigProps, keyof HopeProps>,
    ParentProps {}

export type ModalThemeProps =
  | "contentTransitionOptions"
  | "overlayTransitionOptions"
  | "closeOnOverlayClick"
  | "closeOnEsc"
  | "preventScroll"
  | "trapFocus"
  | "initialFocusSelector"
  | "restoreFocusSelector";

export type ModalTheme = ComponentTheme<ModalProps, ModalThemeProps>;

export interface ModalContextValue {
  /** The style config base class names. */
  baseClasses: Accessor<Record<ModalParts, string>>;

  /** The style config style overrides. */
  styleOverrides: Accessor<Record<ModalParts, SystemStyleObject>>;

  /** Whether the modal should be shown. */
  isOpen: Accessor<boolean>;

  /** The modal content enter/exit transition. */
  contentTransition: TransitionResult;

  /** The overlay enter/exit transition. */
  overlayTransition: TransitionResult;

  /**
   * The `id` of the modal content element.
   * Also act as a prefix for others modal elements `id`.
   */
  contentId: Accessor<string>;

  /** The `id` of the modal heading element. */
  headingId: Accessor<string | undefined>;

  /** Setter for the `id` of the modal heading element. */
  setHeadingId: Setter<string | undefined>;

  /** The `id` of the modal description element. */
  descriptionId: Accessor<string | undefined>;

  /** Setter for the `id` of the modal description element. */
  setDescriptionId: Setter<string | undefined>;

  /** Whether the focus will be locked into the modal. */
  trapFocus: Accessor<boolean>;

  /** A query selector to retrieve the element that should receive focus once the modal opens. */
  initialFocusSelector: Accessor<string | undefined>;

  /** A query selector to retrieve the element that should receive focus once the modal closes. */
  restoreFocusSelector: Accessor<string | undefined>;

  /** A function that will be called when a mouse button is pressed while the modal container has focus in. */
  onContainerMouseDown: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;

  /** A function that will be called when a key is pressed while the modal container has focus in. */
  onContainerKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent>;

  /** A function that will be called when the modal container is clicked. */
  onContainerClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;

  /** A function that will be called when the modal close button is clicked. */
  onCloseButtonClick: () => void;
}
