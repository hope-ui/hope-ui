import { Property } from "csstype";

import { KeysOf, ThemeRadii } from "../../types";
import { ResponsiveProps } from "./responsive-value";

export type RadiiProps = ResponsiveProps<{
  /** The CSS `border-radius` property. */
  borderRadius: Property.BorderRadius<ThemeRadii> | number;

  /** The CSS `border-top-left-radius` property. */
  borderTopLeftRadius: Property.BorderTopLeftRadius<ThemeRadii> | number;

  /** The CSS `border-top-right-radius` property. */
  borderTopRightRadius: Property.BorderTopRightRadius<ThemeRadii> | number;

  /** The CSS `border-bottom-right-radius`  property. */
  borderBottomRightRadius: Property.BorderBottomRightRadius<ThemeRadii> | number;

  /** The CSS  `border-bottom-left-radius` property. */
  borderBottomLeftRadius: Property.BorderBottomLeftRadius<ThemeRadii> | number;

  /** The CSS `border-top-left-radius` and `border-top-right-radius` property. */
  borderTopRadius: Property.BorderTopLeftRadius<ThemeRadii> | number;

  /** The CSS `border-top-right-radius` and `border-bottom-right-radius` property. */
  borderRightRadius: Property.BorderTopRightRadius<ThemeRadii> | number;

  /** The CSS `border-bottom-right-radius` and `border-bottom-left-radius` property. */
  borderBottomRadius: Property.BorderBottomLeftRadius<ThemeRadii> | number;

  /** The CSS `border-top-left-radius` and `border-bottom-left-radius` property. */
  borderLeftRadius: Property.BorderTopLeftRadius<ThemeRadii> | number;

  /** The CSS `border-radius` property. */
  rounded: Property.BorderRadius<ThemeRadii> | number;

  /** The CSS `border-top-left-radius` and `border-top-right-radius` property. */
  roundedTop: Property.BorderTopLeftRadius<ThemeRadii> | number;

  /** The CSS `border-top-right-radius` and `border-bottom-right-radius` property. */
  roundedRight: Property.BorderTopRightRadius<ThemeRadii> | number;

  /** The CSS `border-bottom-right-radius` and `border-bottom-left-radius` property. */
  roundedBottom: Property.BorderBottomLeftRadius<ThemeRadii> | number;

  /** The CSS `border-top-left-radius` and `border-bottom-left-radius` property. */
  roundedLeft: Property.BorderTopLeftRadius<ThemeRadii> | number;
}>;

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
