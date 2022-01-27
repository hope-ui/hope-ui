import { UtilityVariants } from "@/theme/utilityStyles";

import { AsProp, ClassProps } from "./types";

export interface ClassConfig extends ClassProps {
  /**
   * Semantic human readable css class used to override styles by end user.
   */
  hopeClass: string;

  /**
   * Base style class of the component.
   */
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
 * Array of utilityStyles props that are commonly splited with SolidJS `splitProps` method.
 */
export const utilityStyleProps: Array<keyof UtilityVariants> = [
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "w",
  "minW",
  "maxW",
  "h",
  "minH",
  "maxH",
  "boxSize",
];

/**
 * Generate a classList based on diverse css classes and stitches styles.
 */
export function generateClassList(config: ClassConfig) {
  //const themeBaseClass = config.themeBaseStyle ? css(config.themeBaseStyle)() : "";

  return {
    [config.hopeClass]: true,
    [config.baseClass]: true,
    //[themeBaseClass]: true,
    [config.class ?? ""]: true,
    [config.className ?? ""]: true,
    ...config.classList,
  };
}

/**
 * Return a CSS selector based on the provided class.
 */
export function createCssSelector(hopeClass: string) {
  return `.${hopeClass}`;
}
