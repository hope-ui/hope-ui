/**
 * Resolve a value-or-factory: call it if it's a function, otherwise return it as-is.
 *
 * The shared way to normalize a `T | (() => T)` prop into a `T`. A component that themes some piece
 * of *chrome content* (e.g. Button's `loader`/`loadingText`) accepts both forms: a bare per-instance
 * value, and a **factory** a preset supplies so one shared default renders a fresh subtree per
 * instance (mirroring {@link RenderProp} in `render/render` — a preset value is one object shared by
 * every instance, and a Solid `JSX.Element` is an already-built node that would *move* if reused).
 *
 * Call it inside the instance's own reactive JSX computation, not once in the component body, so each
 * consumer gets its own result.
 *
 * **Soundness caveat:** this is only unambiguous when `T` itself is not callable, so a `typeof
 * value === "function"` test can only mean "this is the factory." That holds for the intended
 * `T = JSX.Element`, whose `@solidjs/web` `type Element` excludes function values. Do not use it for a
 * `T` that can itself be a function.
 */
export function runIfFunction<T>(valueOrFn: T | (() => T)): T {
  return typeof valueOrFn === "function" ? (valueOrFn as () => T)() : valueOrFn;
}
