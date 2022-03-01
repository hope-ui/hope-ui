import { Property } from "csstype";

import { KeysOf } from "../types";

/**
 * Types for layout related CSS properties
 */
export type LayoutProps = Partial<{
  /**
   * The CSS `display` property
   */
  display: Property.Display;

  /**
   * The CSS `display` property
   */
  d: Property.Display;

  /**
   * The CSS `vertical-align` property
   */
  verticalAlign: Property.VerticalAlign;

  /**
   * The CSS `overflow` property
   */
  overflow: Property.Overflow;

  /**
   * The CSS `overflow-x` property
   */
  overflowX: Property.OverflowX;

  /**
   * The CSS `overflow-y` property
   */
  overflowY: Property.OverflowY;

  /**
   * The CSS `object-fit` property
   */
  objectFit?: Property.ObjectFit;
}>;

/**
 * Style prop names for layout related properties
 */
export const layoutPropNames: KeysOf<LayoutProps> = {
  display: true,
  d: true,
  verticalAlign: true,
  overflow: true,
  overflowX: true,
  overflowY: true,
  objectFit: true,
};
