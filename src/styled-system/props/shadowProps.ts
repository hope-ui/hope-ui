import { Property } from "csstype";

import { ShadowTokens } from "../types";

/**
 * Types for shadow CSS properties
 */
export type ShadowProps = Partial<{
  /**
   * The CSS `box-shadow` property
   */
  boxShadow: Property.BoxShadow | ShadowTokens;
}>;
