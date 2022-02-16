import { JSX } from "solid-js";

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

/**
 * Call all provided event handlers.
 * The call sequence will stop when an handler call `event.preventDefault` (following handlers will not be called).
 */
export function callAllHandlers<T, E extends Event>(
  ...fns: Array<JSX.EventHandlerUnion<T, E> | undefined>
) {
  return function (
    event: E & {
      currentTarget: T;
      target: Element;
    }
  ) {
    fns.some(fn => {
      if (fn) {
        if (typeof fn === "function") {
          fn(event);
        } else {
          fn[0](fn[1], event);
        }
      }

      return event?.defaultPrevented;
    });
  };
}
