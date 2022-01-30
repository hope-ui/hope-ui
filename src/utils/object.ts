import { AsProp, ClassProps } from "@/components/types";

import { noop } from "./function";

/**
 * SSR: Graceful fallback for the `body` element
 */
export const mockBody = {
  classList: { add: noop, remove: noop },
};

/**
 * Array of common props that are commonly splited with SolidJS `splitProps` method.
 */
export const commonProps: Array<keyof (AsProp<any> & ClassProps)> = [
  "as",
  "class",
  "className",
  "classList",
];
