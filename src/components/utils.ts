import { css } from "@/stitches/stitches.config";
import { SystemStyleObject } from "@/stitches/types";

import { AsProp, ClassProps } from "./types";

export interface ClassConfig extends ClassProps {
  baseClass: string;
  //themeBaseStyle?: SystemStyleObject;
}

/**
 * Array of common props that are commonly splited with SolidJS `splitProps` method.
 */
export const commonProps: Array<keyof (AsProp<any> & ClassProps)> = [
  "as",
  "class",
  "className",
  "classList",
];

/**
 * Generate a classList based on diverse css classes and stitches styles.
 */
export function generateClassList(config: ClassConfig) {
  //const themeBaseClass = config.themeBaseStyle ? css(config.themeBaseStyle)() : "";

  return {
    [config.baseClass ?? ""]: true,
    //[themeBaseClass]: true,
    [config.class ?? ""]: true,
    [config.className ?? ""]: true,
    ...config.classList,
  };
}
