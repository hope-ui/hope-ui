import { isFunction } from "./assertion";

type SolidRef<T = any> = T | ((value: T) => void) | undefined;

/**
 * Assigns a value to a ref function or object
 *
 * @param ref the ref to assign to
 * @param value the value
 */
export function assignRef<T = any>(ref: SolidRef<T>, value: T) {
  if (ref === null) {
    return;
  }

  if (isFunction(ref)) {
    ref(value);
    return;
  }

  try {
    ref = value;
  } catch (error) {
    throw new Error(`Cannot assign value '${value}' to ref '${ref}'`);
  }
}

/**
 * Combine multiple SolidJS refs into a single ref function.
 * This is used mostly when you need to allow consumers forward refs to
 * internal components
 *
 * @param refs refs to assign to value to
 */
export function mergeRefs<T>(...refs: SolidRef<T>[]) {
  return (value: T) => {
    refs.forEach(ref => assignRef(ref, value));
  };
}
