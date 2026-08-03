/**
 * Resolve a value-or-factory: call it if it's a function, otherwise return it as-is.
 *
 * The shared way to normalize a `T | (() => T)` prop into a `T`. A component that themes a piece of
 * chrome content (Button's `loader`/`loadingText`) accepts both forms, because a preset's default is
 * one object shared by every instance and a Solid `JSX.Element` is an already-built DOM node that
 * would *move* if reused — the factory form is what gives each instance a fresh subtree, the same
 * reason {@link RenderProp} in `render/render` requires a function. So call this inside the
 * instance's own reactive JSX computation, not once in the component body.
 *
 * **Soundness caveat:** only unambiguous when `T` is not itself callable, so a `typeof value ===
 * "function"` test can only mean "this is the factory". That holds for the intended
 * `T = JSX.Element`, whose `@solidjs/web` type excludes functions. Never use it for a callable `T`.
 */
export function runIfFunction<T>(valueOrFn: T | (() => T)): T {
  return typeof valueOrFn === "function" ? (valueOrFn as () => T)() : valueOrFn;
}
