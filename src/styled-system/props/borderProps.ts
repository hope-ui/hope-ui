import { Property } from "csstype";

import { ColorTokens, RadiiTokens } from "../types";

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
  borderColor: Property.BorderColor | ColorTokens;

  /**
   * The CSS `border-radius` property
   */
  borderRadius: Property.BorderRadius<RadiiTokens> | number;
}>;
