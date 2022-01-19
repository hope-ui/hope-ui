import { Property } from "csstype";

import { ShadowTokens } from "../types";

/**
 * Utility props for setting component box shadow
 */
export type ShadowProps = Partial<{
  /**
   * The CSS `box-shadow` property
   */
  boxShadow: Property.BoxShadow | ShadowTokens;
}>;
