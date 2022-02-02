import { ClassProps } from "./types";

/**
 * Array of css class props that are commonly splited with SolidJS `splitProps` method.
 */
export const classPropNames: Array<keyof ClassProps> = ["class", "className", "classList"];

/**
 * Return a CSS selector based on the provided class name.
 */
export function createCssSelector(className: string) {
  return `.${className}`;
}

/**
 * Return a single classList object from different class, className and classList values.
 */
export function toClassList(classProps: ClassProps, ...classNames: string[]) {
  const validClassNames = [...classNames, classProps.class, classProps.className]
    .filter(Boolean)
    .join(" ");

  return {
    [validClassNames]: true,
    ...classProps.classList,
  };
}
