import { TransitionOptionsOverride, TransitionResult } from "@hope-ui/primitives";
import { ComponentTheme } from "@hope-ui/styles";
import { Accessor, JSX, ParentProps, Setter } from "solid-js";

import { DrawerStyleConfigProps } from "./drawer.styles";

export interface DrawerProps extends DrawerStyleConfigProps, ParentProps {
  /** Whether the drawer should be shown. */
  isOpen: boolean;

  /** A function that will be called to close the drawer. */
  onClose: () => void;

  /** The id of the drawer content. */
  id?: string;

  /** Options passed to the drawer transition. */
  drawerTransitionOptions?: TransitionOptionsOverride;

  /** Options passed to the overlay transition. */
  overlayTransitionOptions?: TransitionOptionsOverride;

  /** Whether the drawer should close when the overlay is clicked. */
  closeOnOverlayClick?: boolean;

  /** Whether the drawer should close when the user hit the `Esc` key. */
  closeOnEsc?: boolean;

  /** Whether the scroll should be disabled on the `body` when the drawer opens. */
  preventScroll?: boolean;

  /** Whether the focus will be locked into the drawer. */
  trapFocus?: boolean;

  /** A query selector to retrieve the element that should receive focus once the drawer opens. */
  initialFocusSelector?: string;

  /** A query selector to retrieve the element that should receive focus once the drawer closes. */
  restoreFocusSelector?: string;

  /** A function that will be called when the overlay is clicked. */
  onOverlayClick?: () => void;

  /** A function that will be called when the `Esc` key is pressed and focus is within the drawer. */
  onEscKeyDown?: () => void;
}

export type DrawerTheme = ComponentTheme<
  DrawerProps,
  | "drawerTransitionOptions"
  | "overlayTransitionOptions"
  | "closeOnOverlayClick"
  | "closeOnEsc"
  | "preventScroll"
  | "trapFocus"
  | "initialFocusSelector"
  | "restoreFocusSelector"
>;

export interface DrawerContextValue {
  /** Whether the drawer should be shown. */
  isOpen: Accessor<boolean>;

  /** The drawer content enter/exit transition. */
  drawerTransition: TransitionResult;

  /** The overlay enter/exit transition. */
  overlayTransition: TransitionResult;

  /**
   * The `id` of the drawer content element.
   * Also act as a prefix for others drawer elements `id`.
   */
  drawerId: Accessor<string>;

  /** The `id` of the drawer heading element. */
  headingId: Accessor<string | undefined>;

  /** Setter for the `id` of the drawer heading element. */
  setHeadingId: Setter<string | undefined>;

  /** The `id` of the drawer description element. */
  descriptionId: Accessor<string | undefined>;

  /** Setter for the `id` of the drawer description element. */
  setDescriptionId: Setter<string | undefined>;

  /** Whether the focus will be locked into the drawer. */
  trapFocus: Accessor<boolean>;

  /** A query selector to retrieve the element that should receive focus once the drawer opens. */
  initialFocusSelector: Accessor<string | undefined>;

  /** A query selector to retrieve the element that should receive focus once the drawer closes. */
  restoreFocusSelector: Accessor<string | undefined>;

  /** A function that will be called when a mouse button is pressed while the drawer container has focus in. */
  onContainerMouseDown: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;

  /** A function that will be called when a key is pressed while the drawer container has focus in. */
  onContainerKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent>;

  /** A function that will be called when the drawer container is clicked. */
  onContainerClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent>;

  /** A function that will be called when the drawer close button is clicked. */
  onCloseButtonClick: () => void;
}
