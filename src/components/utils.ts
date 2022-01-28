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
