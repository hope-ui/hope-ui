import { AsProp, ClassProps, CSSProp, ElementType } from "./types";

/**
 * Array of common props that are splited into `local props` with SolidJS `splitProps` method.
 */
export const commonProps: Array<keyof (AsProp<ElementType> & ClassProps & CSSProp)> = [
  "as",
  "class",
  "className",
  "classList",
  "css",
];
