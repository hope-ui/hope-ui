import { isObject } from "./assertion";

/**
 * Do nothing
 */
export function noop() {
  return;
}

/**
 * Return a new object with mapper function applied to all keys of the initial object.
 */
export function mapKeys(prop: any, mapper: (val: any) => any) {
  if (isObject(prop)) {
    return Object.keys(prop).reduce((result, key) => {
      result[key] = mapper(prop[key]);
      return result;
    }, {} as Record<string, any>);
  }

  if (prop !== null && prop !== undefined) {
    return mapper(prop);
  }

  return null;
}
