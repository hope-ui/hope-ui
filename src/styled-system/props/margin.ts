import { Property } from "csstype";

import { KeysOf, SpaceScaleValue } from "../types";

/**
 * Types for margin CSS properties
 */
export type MarginProps = Partial<{
  /**
   * The CSS `margin` property
   */
  margin: Property.Margin<SpaceScaleValue> | number;

  /**
   * The CSS `margin` property
   */
  m: Property.Margin<SpaceScaleValue> | number;

  /**
   * The CSS `margin-top` property
   */
  marginTop: Property.MarginTop<SpaceScaleValue> | number;

  /**
   * The CSS `margin-top` property
   */
  mt: Property.MarginTop<SpaceScaleValue> | number;

  /**
   * The CSS `margin-right` property
   */
  marginRight: Property.MarginRight<SpaceScaleValue> | number;

  /**
   * The CSS `margin-right` property
   */
  mr: Property.MarginRight<SpaceScaleValue> | number;

  /**
   * The CSS `margin-bottom` property
   */
  marginBottom: Property.MarginBottom<SpaceScaleValue> | number;

  /**
   * The CSS `margin-bottom` property
   */
  mb: Property.MarginBottom<SpaceScaleValue> | number;

  /**
   * The CSS `margin-left`  property
   */
  marginLeft: Property.MarginLeft<SpaceScaleValue> | number;

  /**
   * The CSS `margin-left`  property
   */
  ml: Property.MarginLeft<SpaceScaleValue> | number;

  /**
   * The CSS `margin-inline-start` and `margin-inline-end` property
   */
  mx: Property.MarginInlineStart<SpaceScaleValue> | number;

  /**
   * The CSS `margin-top` and `margin-bottom` property
   */
  my: Property.MarginTop<SpaceScaleValue> | number;
}>;

/**
 * Style prop names for margin properties
 */
export const marginPropNames: KeysOf<MarginProps> = {
  margin: true,
  m: true,
  marginTop: true,
  mt: true,
  marginRight: true,
  mr: true,
  marginBottom: true,
  mb: true,
  marginLeft: true,
  ml: true,
  mx: true,
  my: true,
};
