import { mergeProps as composeProps } from "@zag-js/core";
import { $PROXY, createMemo, untrack } from "solid-js";

export type MaybeAccessor<T> = T | (() => T);

/**
 * Keys Zag *composes* across every source instead of letting one win: handlers chain, classes
 * concatenate, styles merge. Everything else resolves last-defined-wins.
 *
 * `data-ownedby` is listed because `@zag-js/core` is expected to give it a union branch; in the
 * pinned `1.42.0` it has none, so routing it here still yields last-wins. `merge-props.test.ts`
 * pins the installed behavior and turns red the day a core bump changes it.
 */
const COMPOSED_KEYS = new Set(["style", "class", "className", "data-ownedby"]);

function isComposedKey(key: string): boolean {
  return key.startsWith("on") || COMPOSED_KEYS.has(key);
}

function resolveSource(source: unknown): Record<string, any> {
  const resolved = typeof source === "function" ? source() : source;
  return (resolved as Record<string, any>) ?? {};
}

function composeAcrossSources(sources: unknown[], key: string): unknown {
  let composed: Record<string, any> = {};
  for (const source of sources) {
    composed = composeProps(composed, { [key]: resolveSource(source)[key] });
  }
  return composed[key];
}

function lastDefinedValue(sources: unknown[], key: string): unknown {
  for (let index = sources.length - 1; index >= 0; index--) {
    const value = resolveSource(sources[index])[key];
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
}

function readKey(sources: unknown[], key: string): unknown {
  return isComposedKey(key) ? composeAcrossSources(sources, key) : lastDefinedValue(sources, key);
}

/**
 * The union of every source's own enumerable keys, in source order.
 *
 * **Untracked, and that is load-bearing.** Answering "which keys exist" has to resolve every
 * accessor source, which reads whatever signal it is derived from (a Zag part's props come off
 * `api()`). A *value* read is meant to subscribe its reader; a **structural** query must not,
 * because Solid asks structural questions from scopes that decide DOM shape rather than DOM
 * content: `Dynamic` resolves `props.component` to pick the element to create, and `spread`'s
 * `insert(node, () => props.children)` re-reads `children` — a getter that rebuilds the child JSX
 * on every read. Let those subscribe to `api()` and one machine transition tears the whole subtree
 * down and rebuilds it, taking focus and every event binding with it (measured: after this became
 * reactive, arrow keys did nothing because the focused element had been replaced).
 *
 * Per-key *values* stay fully tracked — `get` below is untouched — so the spread effect still
 * re-runs on every state change, and re-enumerates the key set when it does. What is given up is
 * only the case where a key appears while no existing key's value changed.
 */
function unionOfKeys(sources: unknown[]): string[] {
  return untrack(() => {
    const keys = new Set<string>();
    for (const source of sources) {
      for (const key of Object.keys(resolveSource(source))) {
        keys.add(key);
      }
    }
    return [...keys];
  });
}

function hasKey(sources: unknown[], key: string | symbol): boolean {
  return untrack(() => sources.some((source) => key in resolveSource(source)));
}

const alwaysTrue = () => true;

export function mergeProps<T>(source: MaybeAccessor<T>): T;
export function mergeProps<T, U>(source: MaybeAccessor<T>, source1: MaybeAccessor<U>): T & U;
export function mergeProps<T, U, V>(
  source: MaybeAccessor<T>,
  source1: MaybeAccessor<U>,
  source2: MaybeAccessor<V>,
): T & U & V;
export function mergeProps<T, U, V, W>(
  source: MaybeAccessor<T>,
  source1: MaybeAccessor<U>,
  source2: MaybeAccessor<V>,
  source3: MaybeAccessor<W>,
): T & U & V & W;
/**
 * Composes several prop objects — or accessors returning them — into one **lazy proxy**: nothing is
 * read until a consumer asks for a key, and every value read goes back to the live sources.
 *
 * This is the shape SolidJS's own `merge` uses (`propTraps` + `$PROXY`), and adopting it is what
 * makes the function reactively inert to *create*. Upstream's version eagerly called each accessor
 * to enumerate a fixed key set and defined a getter per key — a reactive read in a component render
 * body (2.0 warns `[STRICT_READ_UNTRACKED]` there, and `mount()` fails on it) and a key set frozen
 * at construction. A proxy has neither problem, and the untracked-read workaround this file used to
 * carry is gone rather than silenced.
 *
 * Reporting `$PROXY` matters: it is how `merge`/`omit` recognise a lazy props source and stay lazy
 * themselves instead of falling back to copying descriptors once.
 */
export function mergeProps(...rawSources: unknown[]) {
  // Each accessor source becomes a memo, exactly as SolidJS's own `merge` does. Without it every
  // trap re-invokes the accessor — and Solid's `merge` asks `key in source` before `source[key]`,
  // so a single prop read resolved a Zag part twice, and one spread pass resolved it once per key.
  // Measured on the 200-item listbox: 16.4k collection lookups per arrow key, against 4 with this.
  const sources = rawSources.map((source) =>
    typeof source === "function" ? createMemo(source as () => unknown) : source,
  );

  return new Proxy(
    {},
    {
      get(_, key, receiver) {
        if (key === $PROXY) {
          return receiver;
        }
        return typeof key === "string" ? readKey(sources, key) : undefined;
      },
      has(_, key) {
        return key === $PROXY || hasKey(sources, key);
      },
      ownKeys() {
        return unionOfKeys(sources);
      },
      getOwnPropertyDescriptor(_, key) {
        return {
          configurable: true,
          enumerable: true,
          get: () => (typeof key === "string" ? readKey(sources, key) : undefined),
          set: alwaysTrue,
        };
      },
      set: alwaysTrue,
      deleteProperty: alwaysTrue,
    },
  );
}
