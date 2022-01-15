import { Property } from "csstype";

import { RadiiTokens } from "../tokens/radii";

export type BorderRadiusProps = Partial<{
  borderRadius: Property.BorderRadius<RadiiTokens>;
  borderTopLeftRadius: Property.BorderTopLeftRadius<RadiiTokens>;
  borderTopRightRadius: Property.BorderTopRightRadius<RadiiTokens>;
  borderBottomRightRadius: Property.BorderBottomRightRadius<RadiiTokens>;
  borderBottomLeftRadius: Property.BorderBottomLeftRadius<RadiiTokens>;
  borderTopRadius: Property.BorderTopLeftRadius<RadiiTokens>;
  borderRightRadius: Property.BorderTopRightRadius<RadiiTokens>;
  borderBottomRadius: Property.BorderBottomLeftRadius<RadiiTokens>;
  borderLeftRadius: Property.BorderTopLeftRadius<RadiiTokens>;
}>;

export type BorderRadiusPropsKeys = keyof BorderRadiusProps;

/**
 * Array based on the `BorderRadiusProps`.
 * Used to splitProps in SolidJS components
 */
export const borderRadiusPropsKeys: BorderRadiusPropsKeys[] = [
  "borderRadius",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius",
  "borderTopRadius",
  "borderRightRadius",
  "borderBottomRadius",
  "borderLeftRadius",
];
