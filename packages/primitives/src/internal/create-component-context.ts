import { type Context, createContext, useContext } from "solid-js";

/**
 * Thin wrapper around SolidJS 2.0's `createContext`/`useContext`, which already returns the Provider
 * directly and already throws when no Provider is mounted. The one thing this adds is an error
 * naming the component family, in place of Solid's generic "Context must either be created with a
 * default value…".
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
