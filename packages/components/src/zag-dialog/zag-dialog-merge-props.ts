import { mergeProps } from "@hope-ui/primitives/zag-solid";
import { untrack } from "solid-js";

type MaybeAccessor<T> = T | (() => T);

/**
 * The reactivity seam between a Zag part's `getXProps()` and `renderElement`, used by every
 * ZagDialog part that has a Zag counterpart.
 *
 * `connect()` returns a **plain object computed eagerly at call time**, so it cannot be spread
 * into an element directly — the values would freeze at whatever the machine's state was during
 * render. The vendored adapter's `mergeProps` is the bridge: it takes accessors and defines lazy
 * per-key getters over them, composing `class`/`style`/`on*` across sources (in source order) and
 * resolving everything else last-defined-wins.
 *
 * It does that by calling each source **once at construction** to enumerate the key set — which,
 * in a Solid 2.0 render body, is a reactive read outside a tracking scope and earns a
 * `[STRICT_READ_UNTRACKED]` per part. The read is genuinely one-off (only the getters built from
 * those keys need to stay live, and they do), so it is spelled `untrack` exactly once, here,
 * rather than seven times across the parts.
 *
 * **Source order is `(zag, consumer, overrides)`, and it is a real decision.** For a plain key the
 * last defined source wins, so the consumer's props outrank the machine's — which is what keeps
 * hope's "an internal value never silently discards the consumer's" contract (a consumer
 * `aria-labelledby` on `Content` still wins over Zag's Title id). For an `on*` key the composition
 * runs the **other way**: `@zag-js/core`'s `mergeProps` folds a newly-seen handler in *ahead* of
 * the accumulated one (`callAll(props[key], result[key])`), so this same order runs the consumer's
 * handler first and Zag's second — and Zag's handlers all open with `if (event.defaultPrevented)
 * return`, which is what makes `event.preventDefault()` the consumer's cancel channel, exactly as
 * `composeEventHandlers` makes it for the handmade Dialog.
 *
 * The one key this order cannot serve is `id`: every Zag part id is machine-derived and the machine
 * finds its own elements with `getElementById`, so a consumer `id` winning would break the dismiss
 * layer, the focus trap and the aria-hiding at once. Each part strips `id` out of the consumer's
 * props instead. See `__internal__/spikes/zag-dialog-findings.md`.
 */
export function mergePartProps<Zag, Consumer>(
  zag: MaybeAccessor<Zag>,
  consumer: MaybeAccessor<Consumer>,
): Zag & Consumer;
export function mergePartProps<Zag, Consumer, Overrides>(
  zag: MaybeAccessor<Zag>,
  consumer: MaybeAccessor<Consumer>,
  overrides: MaybeAccessor<Overrides>,
): Zag & Consumer & Overrides;
export function mergePartProps(...sources: MaybeAccessor<object>[]): object {
  return untrack(() => (mergeProps as (...args: MaybeAccessor<object>[]) => object)(...sources));
}
