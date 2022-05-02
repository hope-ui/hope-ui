import { JSX } from "solid-js";

import { isFunction, isObject } from "./assertion";

/**
 * Do nothing.
 */
export function noop() {
  return;
}

/**
 * Cast a given value to another.
 */
export function cast<T>(value: any): T {
  return value as T;
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
 * Call the handler with the event.
 * Simpler way to call a JSX.EventHandlerUnion programmatically.
 */
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

/**
 * Return a function that will call all handlers in the order they were chained with the same arguments.
 * Stop at the first `event.preventDefault()` call.
 */
export function chainHandlers<T, E extends Event>(
  ...fns: Array<JSX.EventHandlerUnion<T, E> | undefined>
) {
  return function (
    event: E & {
      currentTarget: T;
      target: Element;
    }
  ) {
    fns.some(fn => {
      return callHandler(fn, event);
    });
  };
}

/**
 * Return an array with the size of the provided range.
 */
export function range(count: number) {
  return Array(count)
    .fill(1)
    .map((_, index) => index + 1);
}
