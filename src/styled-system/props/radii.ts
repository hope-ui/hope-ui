import { Property } from "csstype";

import { KeysOf, RadiiScaleValue } from "../types";

/**
 * Types for radii related CSS properties
 */
export type RadiiProps = Partial<{
  /**
   * The CSS `border-radius` property
   */
  borderRadius: Property.BorderRadius<RadiiScaleValue> | number;

  /**
   * The CSS `border-top-left-radius` property
   */
  borderTopLeftRadius: Property.BorderTopLeftRadius<RadiiScaleValue> | number;

  /**
   * The CSS `border-top-right-radius` property
   */
  borderTopRightRadius: Property.BorderTopRightRadius<RadiiScaleValue> | number;

  /**
   * The CSS `border-bottom-right-radius`  property
   */
  borderBottomRightRadius: Property.BorderBottomRightRadius<RadiiScaleValue> | number;

  /**
   * The CSS  `border-bottom-left-radius` property
   */
  borderBottomLeftRadius: Property.BorderBottomLeftRadius<RadiiScaleValue> | number;

  /**
   * The CSS `border-top-left-radius` and `border-top-right-radius` property
   */
  borderTopRadius: Property.BorderTopLeftRadius<RadiiScaleValue> | number;

  /**
   * The CSS `border-top-right-radius` and `border-bottom-right-radius` property
   */
  borderRightRadius: Property.BorderTopRightRadius<RadiiScaleValue> | number;

  /**
   * The CSS `border-bottom-right-radius` and `border-bottom-left-radius` property
   */
  borderBottomRadius: Property.BorderBottomLeftRadius<RadiiScaleValue> | number;

  /**
   * The CSS `border-top-left-radius` and `border-bottom-left-radius` property
   */
  borderLeftRadius: Property.BorderTopLeftRadius<RadiiScaleValue> | number;

  /**
   * The CSS `border-radius` property
   */
  rounded: Property.BorderRadius<RadiiScaleValue> | number;

  /**
   * The CSS `border-top-left-radius` and `border-top-right-radius` property
   */
  roundedTop: Property.BorderTopLeftRadius<RadiiScaleValue> | number;

  /**
   * The CSS `border-top-right-radius` and `border-bottom-right-radius` property
   */
  roundedRight: Property.BorderTopRightRadius<RadiiScaleValue> | number;

  /**
   * The CSS `border-bottom-right-radius` and `border-bottom-left-radius` property
   */
  roundedBottom: Property.BorderBottomLeftRadius<RadiiScaleValue> | number;

  /**
   * The CSS `border-top-left-radius` and `border-bottom-left-radius` property
   */
  roundedLeft: Property.BorderTopLeftRadius<RadiiScaleValue> | number;
}>;

/**
 * Style prop names for radii related CSS properties
 */
export const radiiPropNames: KeysOf<RadiiProps> = {
  borderRadius: true,
  borderTopRightRadius: true,
  borderTopLeftRadius: true,
  borderBottomRightRadius: true,
  borderBottomLeftRadius: true,
  borderTopRadius: true,
  borderRightRadius: true,
  borderBottomRadius: true,
  borderLeftRadius: true,
  rounded: true,
  roundedTop: true,
  roundedRight: true,
  roundedBottom: true,
  roundedLeft: true,
};
