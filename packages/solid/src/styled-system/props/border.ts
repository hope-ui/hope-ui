import { Property } from "csstype";

import { ColorScaleValue, KeysOf } from "../types";

/**
 * Types for border CSS properties
 */
export type BorderProps = Partial<{
  /**
   * The CSS `border` property
   */
  border: Property.Border;

  /**
   * The CSS `border-width` property
   */
  borderWidth: Property.BorderWidth | number;

  /**
   * The CSS `border-style` property
   */
  borderStyle: Property.BorderStyle;

  /**
   * The CSS `border-color` property
   */
  borderColor: Property.BorderColor | ColorScaleValue;

  /**
   * The CSS `border-top` property
   */
  borderTop: Property.BorderTop;

  /**
   * The CSS `border-top-width` property
   */
  borderTopWidth: Property.BorderTopWidth | number;

  /**
   * The CSS `border-top-style` property
   */
  borderTopStyle: Property.BorderTopStyle;

  /**
   * The CSS `border-top-color` property
   */
  borderTopColor: Property.BorderTopColor | ColorScaleValue;

  /**
   * The CSS `border-right` property
   */
  borderRight: Property.BorderRight;

  /**
   * The CSS `border-right-width` property
   */
  borderRightWidth: Property.BorderRightWidth | number;

  /**
   * The CSS `border-right-style` property
   */
  borderRightStyle: Property.BorderRightStyle;

  /**
   * The CSS `border-right-color` property
   */
  borderRightColor: Property.BorderRightColor | ColorScaleValue;

  /**
   * The CSS `border-bottom` property
   */
  borderBottom: Property.BorderBottom;

  /**
   * The CSS `border-bottom-width` property
   */
  borderBottomWidth: Property.BorderBottomWidth | number;

  /**
   * The CSS `border-bottom-style` property
   */
  borderBottomStyle: Property.BorderBottomStyle;

  /**
   * The CSS `border-bottom-color` property
   */
  borderBottomColor: Property.BorderBottomColor | ColorScaleValue;

  /**
   * The CSS `border-left` property
   */
  borderLeft: Property.BorderLeft;

  /**
   * The CSS `border-left-width` property
   */
  borderLeftWidth: Property.BorderLeftWidth | number;

  /**
   * The CSS `border-left-style` property
   */
  borderLeftStyle: Property.BorderLeftStyle;

  /**
   * The CSS `border-left-color` property
   */
  borderLeftColor: Property.BorderLeftColor | ColorScaleValue;

  /**
   * The CSS `border-right` and `border-left` property
   */
  borderX: Property.BorderLeft;

  /**
   * The CSS `border-top` and `border-bottom` property
   */
  borderY: Property.BorderTop;
}>;

/**
 * Style prop names for border properties
 */
export const borderPropNames: KeysOf<BorderProps> = {
  border: true,
  borderWidth: true,
  borderStyle: true,
  borderColor: true,
  borderTop: true,
  borderTopWidth: true,
  borderTopStyle: true,
  borderTopColor: true,
  borderRight: true,
  borderRightWidth: true,
  borderRightStyle: true,
  borderRightColor: true,
  borderBottom: true,
  borderBottomWidth: true,
  borderBottomStyle: true,
  borderBottomColor: true,
  borderLeft: true,
  borderLeftWidth: true,
  borderLeftStyle: true,
  borderLeftColor: true,
  borderX: true,
  borderY: true,
};
