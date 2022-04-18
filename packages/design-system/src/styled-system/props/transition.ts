import { Property } from "csstype";

import { KeysOf } from "../types";

/**
 * Types for transition CSS properties
 */
export type TransitionProps = Partial<{
  /**
   * The CSS `transition` property
   */
  transition: Property.Transition;

  /**
   * The CSS `transition-property` property
   */
  transitionProperty: Property.TransitionProperty;

  /**
   * The CSS `transition-timing-function` property
   */
  transitionTimingFunction: Property.TransitionTimingFunction;

  /**
   * The CSS `transition-duration` property
   */
  transitionDuration: Property.TransitionDuration;

  /**
   * The CSS `transition-delay` property
   */
  transitionDelay: Property.TransitionDelay;

  /**
   * The CSS `animation` property
   */
  animation: Property.Animation;

  /**
   * The CSS `will-change` property
   */
  willChange: Property.WillChange;
}>;

/**
 * Style prop names for transition CSS related properties
 */
export const transitionPropNames: KeysOf<TransitionProps> = {
  transition: true,
  transitionProperty: true,
  transitionTimingFunction: true,
  transitionDuration: true,
  transitionDelay: true,
  animation: true,
  willChange: true,
};
