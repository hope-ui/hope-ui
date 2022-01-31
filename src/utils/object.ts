import { ClassProps } from "@/components/types";

import { noop } from "./function";

/**
 * SSR: Graceful fallback for the `body` element
 */
export const mockBody = {
  classList: { add: noop, remove: noop },
};

/**
 * Array of css class props that are commonly splited with SolidJS `splitProps` method.
 */
export const classPropsKeys: Array<keyof ClassProps> = ["class", "className", "classList"];
