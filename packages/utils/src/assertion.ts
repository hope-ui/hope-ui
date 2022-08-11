/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/utils/src/assertion.ts
 */

import { Dict } from "./types";

// Number assertions
export function isNumber(value: any): value is number {
  return typeof value === "number";
}

// Array assertions
export function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value);
}

export function isEmptyArray(value: any) {
  return isArray(value) && value.length === 0;
}

// Function assertions
export function isFunction<T extends Function = Function>(value: any): value is T {
  return typeof value === "function";
}

// Object assertions
export function isObject(value: any): value is Dict {
  const type = typeof value;
  return value != null && (type === "object" || type === "function") && !isArray(value);
}

export function isEmptyObject(value: any) {
  return isObject(value) && Object.keys(value).length === 0;
}

export function isNull(value: any): value is null {
  return value == null;
}

// String assertions
export function isString(value: any): value is string {
  return Object.prototype.toString.call(value) === "[object String]";
}

// Empty assertions
export function isEmpty(value: any): boolean {
  if (isArray(value)) {
    return isEmptyArray(value);
  }

  if (isObject(value)) {
    return isEmptyObject(value);
  }

  return value == null || value === "";
}
