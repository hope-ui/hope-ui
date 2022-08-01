import { Dict } from "./types";

// Number assertions
export function isNumber(value: any): value is number {
  return typeof value === "number";
}

// Array assertions
export function isArray<T>(value: any): value is Array<T> {
  return Array.isArray(value);
}

// Object assertions
export function isObject(value: any): value is Dict {
  const type = typeof value;
  return value != null && (type === "object" || type === "function") && !isArray(value);
}

// Function assertions
export function isFunction<T extends Function = Function>(value: any): value is T {
  return typeof value === "function";
}
