/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/utils/src/function.ts
 */

import { JSX } from "solid-js";

import { isArray, isFunction, isObject } from "./assertion";
import { Dict } from "./types";

export { chain } from "@solid-primitives/utils";

/** A function that does nothing. */
export function noop() {
  return;
}

/** Call a JSX.EventHandlerUnion with the event. */
export function callHandler<T, E extends Event>(
  handler: JSX.EventHandlerUnion<T, E> | undefined,
  event: E & {
    currentTarget: T;
    target: Element;
  }
) {
  if (handler) {
    if (isFunction(handler)) {
      handler(event);
    } else {
      handler[0](handler[1], event);
    }
  }

  return event?.defaultPrevented;
}

/** Run the value with the given args if it's a function, otherwise return the value as is. */
export function runIfFn<T, U>(valueOrFn: T | ((...fnArgs: U[]) => T), ...args: U[]): T {
  return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn;
}

/** Create a function that only run once. */
export function once<T extends (...args: any[]) => void>(callback: T) {
  let hasRun = false;

  return function (...args: any[]) {
    if (!hasRun) {
      hasRun = true;
      callback(...args);
    }
  } as T;
}

/** Flatten an object. */
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

/** Unflatten an object. */
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
