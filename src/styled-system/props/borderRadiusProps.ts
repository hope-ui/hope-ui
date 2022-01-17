import { Property } from "csstype";

import { RadiiTokens } from "../types";

export type BorderRadiusProps = Partial<{
  borderRadius: Property.BorderRadius<RadiiTokens> | number;
  borderTopLeftRadius: Property.BorderTopLeftRadius<RadiiTokens> | number;
  borderTopRightRadius: Property.BorderTopRightRadius<RadiiTokens> | number;
  borderBottomRightRadius: Property.BorderBottomRightRadius<RadiiTokens> | number;
  borderBottomLeftRadius: Property.BorderBottomLeftRadius<RadiiTokens> | number;
  borderTopRadius: Property.BorderTopLeftRadius<RadiiTokens> | number;
  borderRightRadius: Property.BorderTopRightRadius<RadiiTokens> | number;
  borderBottomRadius: Property.BorderBottomLeftRadius<RadiiTokens> | number;
  borderLeftRadius: Property.BorderTopLeftRadius<RadiiTokens> | number;
}>;
