import { Property } from "csstype";

import { ColorTokens, RadiiTokens } from "../types";

/**
 * Utility props for setting component border
 */
export type BorderProps = Partial<{
  /**
   * The CSS `border` property
   */
  border: Property.Border | ColorTokens;

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
  borderColor: Property.BorderColor | ColorTokens;

  /**
   * The CSS `border-radius` property
   */
  borderRadius: Property.BorderRadius<RadiiTokens> | number;
}>;
