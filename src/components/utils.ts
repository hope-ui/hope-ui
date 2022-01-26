import { css } from "@/stitches/stitches.config";
import { SystemStyleObject } from "@/stitches/types";

import { ClassProps } from "./types";

export interface ClassConfig extends ClassProps {
  baseClass: string;
  themeBaseStyle?: SystemStyleObject;
}

/**
 * Array of css class props that are commonly splited with SolidJS `splitProps` method.
 */
export const classPropNames: Array<keyof ClassProps> = ["class", "className", "classList"];

/**
 * Generate a classList based on diverse css classes and stitches styles.
 */
export function generateClassList(config: ClassConfig) {
  const themeBaseClass = config.themeBaseStyle ? css(config.themeBaseStyle)() : "";

  return {
    [config.baseClass]: true,
    [themeBaseClass]: true,
    [config.class ?? ""]: true,
    [config.className ?? ""]: true,
    ...config.classList,
  };
}
