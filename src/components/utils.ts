import { CSSProp } from "@/stitches/props/cssProp";

import { AsProp, ClassProps } from ".";

/**
 * Array of always splited prop names to local props with SolidJS `spliProps()` method.
 */
export const commonPropNames: Array<keyof (AsProp<any> & ClassProps & CSSProp)> = [
  "as",
  "class",
  "className",
  "classList",
  "css",
];
