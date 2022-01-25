import { AsProp, ClassProps, ElementType } from "./types";

/**
 * Array of common props that are splited into `local props` with SolidJS `splitProps` method.
 */
export const commonProps: Array<keyof (AsProp<ElementType> & ClassProps)> = [
  "as",
  "class",
  "className",
  "classList",
];
