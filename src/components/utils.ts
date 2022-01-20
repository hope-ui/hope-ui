import { CSSProp } from "@/styled-system/props/cssProp";

import { AsProp, ClassProps } from "./types";

/**
 * Array of always splited prop names to local props with SolidJS `spliProps()` method.
 */
export const commonPropNames: Array<keyof (AsProp<any> & ClassProps & CSSProp)> = [
  "as",
  "className",
  "css",
];
