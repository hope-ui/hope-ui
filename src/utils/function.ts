import { ClassConfig } from "@/components/types";

export const noop = () => {
  return;
};

/**
 * Generate a classList based on diverse css classes and stitches styles.
 */
export function generateClassList(config: ClassConfig) {
  //const themeBaseClass = config.themeBaseStyle ? css(config.themeBaseStyle)() : "";

  return {
    [config.hopeClass]: true,
    [config.baseClass]: true,
    //[themeBaseClass]: true,
    [config.classProps.class ?? ""]: true,
    [config.classProps.className ?? ""]: true,
    ...config.classProps.classList,
  };
}

/**
 * Return a CSS selector based on the provided class.
 */
export function createCssSelector(hopeClass: string) {
  return `.${hopeClass}`;
}

// /**
//  * Get the used props keys from a props object and a reference string array.
//  * @param obj The props object to check if it contains some keys of the reference array.
//  * @param reference The reference array to look for.
//  * @returns An array of the common keys.
//  */
// export function getUsedPropsKeys<T>(props: T, reference: string[]) {
//   return Object.keys(props).filter(key => reference.includes(key)) as Array<keyof T>;
// }

export function getInitials(name: string) {
  return (
    name
      .match(/\b(\w)/g)
      ?.slice(0, 2)
      .join("") ?? ""
  );
}
