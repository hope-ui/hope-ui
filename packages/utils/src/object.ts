/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/utils/src/object.ts
 */

import { Dict, FilterFn } from "./types";

export function pick<T extends Dict, K extends keyof T>(object: T, keys: K[]) {
  const result = {} as { [P in K]: T[P] };

  keys.forEach(key => {
    if (key in object) {
      result[key] = object[key];
    }
  });

  return result;
}

export const objectKeys = <T extends Dict>(obj: T) => {
  return Object.keys(obj) as unknown as (keyof T)[];
};

/**
 * Returns the items of an object that meet the condition specified in a callback function.
 *
 * @param object the object to loop through
 * @param fn The filter function
 */
export function objectFilter<T extends Dict>(object: T, fn: FilterFn<T>) {
  const result: Dict = {};

  Object.keys(object).forEach(key => {
    const value = object[key];
    const shouldPass = fn(value, key, object);

    if (shouldPass) {
      result[key] = value;
    }
  });

  return result;
}

export function filterUndefined<T = Dict>(object: T) {
  return objectFilter(object, val => val !== null && val !== undefined);
}
