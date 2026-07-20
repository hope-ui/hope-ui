import { type Context, createContext, useContext } from "solid-js";

/**
 * Thin wrapper around SolidJS 2.0's `createContext`/`useContext`. 2.0 already returns
 * the Provider component directly and throws by default when no Provider is mounted, so
 * this only adds one thing on top: a `useXContext` that rethrows with a message naming
 * the component family, instead of `createContext`'s generic
 * "Context must either be created with a default value..." error.
 */
export function createComponentContext<T>(name: string): readonly [Context<T>, () => T] {
  const context = createContext<T>(undefined, { name });

  function useComponentContext(): T {
    try {
      return useContext(context);
    } catch {
      throw new Error(`${name} sub-components must be rendered inside a ${name} root component.`);
    }
  }

  return [context, useComponentContext] as const;
}
