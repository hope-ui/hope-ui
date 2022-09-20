/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/2283faae3e361a8978a93b0ef7fd43b637153555/packages/utilities/breakpoint-utils/src/responsive.ts
 */

import { Dict, getLastItem, isArray, isObject, objectKeys } from "@hope-ui/utils";

/** Map a responsive value to a new one. */
export function mapResponsive(prop: any, mapper: (val: any) => any) {
  if (isArray(prop)) {
    return prop.map(item => {
      if (item === null) {
        return null;
      }
      return mapper(item);
    });
  }

  if (isObject(prop)) {
    return objectKeys(prop).reduce((result: Dict, key) => {
      result[key] = mapper(prop[key]);
      return result;
    }, {});
  }

  if (prop != null) {
    return mapper(prop);
  }

  return null;
}

/**
 * Converts the object responsive syntax to array syntax.
 *
 * @example
 * objectToArrayNotation({ base: 1, sm: 2, md: 3 }) // => [1, 2, 3]
 */
export function objectToArrayNotation(obj: Dict, breakpoints: string[]) {
  const result = breakpoints.map(bp => obj[bp] ?? null);

  while (getLastItem(result) === null) {
    result.pop();
  }

  return result;
}

/**
 * Converts the array responsive syntax to object syntax.
 *
 * @example
 * arrayToObjectNotation([1, 2, 3]) // => { base: 1, sm: 2, md: 3 }
 */
export function arrayToObjectNotation(values: any[], breakpoints: string[]) {
  const result = {} as Dict;

  values.forEach((value, index) => {
    const key = breakpoints[index];

    if (value == null) {
      return;
    }

    result[key] = value;
  });

  return result;
}

/** Return whether an object is a valid responsive object according to the breakpoints. */
export function isResponsiveObjectLike(obj: Dict, breakpoints: string[]) {
  const keys = Object.keys(obj);
  return keys.length > 0 && keys.every(key => breakpoints.includes(key));
}
