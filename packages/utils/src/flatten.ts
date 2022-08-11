import { isArray, isObject } from "./assertion";
import { Dict } from "./types";

export function flatten<Value = any>(
  target: Record<string, Value> | undefined | null,
  separator: string,
  maxDepth = Infinity
) {
  if ((!isObject(target) && !Array.isArray(target)) || !maxDepth) {
    return target;
  }

  return Object.entries(target).reduce((result, [key, value]) => {
    if (isObject(value) || isArray(value)) {
      Object.entries(flatten(value, separator, maxDepth - 1)).forEach(([childKey, childValue]) => {
        // e.g. gray.500
        result[`${key}${separator}${childKey}`] = childValue;
      });
    } else {
      // e.g. transparent
      result[key] = value;
    }

    return result;
  }, {} as any);
}

export function unflatten<T extends Dict>(flatObject: T, separator: string) {
  return Object.keys(flatObject).reduce((res, k) => {
    k.split(separator).reduce((acc, e, i, keys) => {
      if (acc[e] != null) {
        return acc[e];
      }

      // @ts-ignore
      acc[e] = keys.length - 1 === i ? flatObject[k] : {};

      return acc[e];
    }, res);

    return res;
  }, {} as T);
}
