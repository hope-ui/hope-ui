/**
 * The message resolver — how a component looks up a user-facing string for the current locale.
 *
 * The built-in catalogs (`./locales/`, selected by {@link resolveCatalog}) are the guaranteed floor;
 * an app's own pipeline ({@link I18nTranslateOverride}) is an overlay consulted first, falling through
 * to the built-in whenever it has no entry for a key.
 *
 * The returned {@link TranslateFn} reads the `locale` accessor on every call, so it is reactive inside
 * JSX *and* returns the current value to an imperative caller such as a live-region announcer. It is
 * deliberately a plain function rather than a `createMemo`: memos take part in Solid's hydration
 * bookkeeping, so making this one would tie message resolution to hydration keys. See
 * `__internal__/solid-primitives-eval.md`.
 */
import type { Accessor } from "solid-js";
import { resolveCatalog } from "./catalogs";
import { MESSAGES_EN } from "./locales/en";
import { type I18nCatalog, type I18nMessageKey, interpolate, type ParamsFor } from "./messages";

/**
 * Delegate a single message to the app's own translation pipeline. Return a resolved string to use it,
 * or `null`/`undefined` on a miss to fall through to hope-ui's built-in default. Receives the active
 * `locale` so the app can resolve against the right language.
 */
export type I18nTranslateOverride = (
  key: I18nMessageKey,
  params: Record<string, unknown> | undefined,
  locale: string,
) => string | null | undefined;

/** The message configuration an `I18nProvider` forwards to the resolver. Every field is optional. */
export interface I18nMessagesConfig {
  /** Delegate to the app pipeline. Return `null`/`undefined` on a miss to use the built-in default. */
  translate?: I18nTranslateOverride;
  /**
   * Coarse per-locale, per-key override without a pipeline: `{ fr: { "common.close": "Fermer" } }`.
   * Values use `{{param}}` placeholders. Consulted after {@link I18nMessagesConfig.translate}, before
   * the built-in catalog.
   */
  messages?: Partial<Record<string, Partial<Record<I18nMessageKey, string>>>>;
}

/**
 * Resolve a message key to a string. Params are **required and typed** for param-bearing keys and
 * **forbidden** for the rest (the conditional variadic tuple).
 */
export type TranslateFn = <K extends I18nMessageKey>(
  key: K,
  ...params: ParamsFor<K> extends undefined ? [] : [ParamsFor<K>]
) => string;

/**
 * Build a {@link TranslateFn} bound to a reactive `locale` and an optional message `config`. Resolution
 * order, first non-null winning: app `translate` fn → per-key `messages` override → built-in catalog
 * for the locale, falling back to English → the key itself, warned once in dev.
 *
 * The warn-dedup `Set` is per instance rather than module scope, so two installed copies of this
 * package never end up sharing it.
 */
export function createTranslate(
  locale: Accessor<string>,
  config: () => I18nMessagesConfig | undefined,
): TranslateFn {
  const warned = new Set<string>();

  const t = <K extends I18nMessageKey>(
    key: K,
    ...params: ParamsFor<K> extends undefined ? [] : [ParamsFor<K>]
  ): string => {
    const loc = locale();
    const p = params[0] as Record<string, unknown> | undefined;
    const cfg = config();

    const viaFn = cfg?.translate?.(key, p, loc);
    if (viaFn != null) {
      return viaFn;
    }

    const override = cfg?.messages?.[loc]?.[key];
    if (override != null) {
      return interpolate(override, p);
    }

    const dict: I18nCatalog = resolveCatalog(loc);
    const entry = lookupEntry(dict, key) ?? lookupEntry(MESSAGES_EN, key);
    if (entry == null) {
      return warnMissing(key, warned);
    }
    return typeof entry === "function"
      ? (entry as (params: unknown) => string)(p)
      : interpolate(entry, p);
  };

  return t;
}

/** Resolve a dotted `group.name` key against the nested catalog (keys are exactly two segments). */
function lookupEntry(
  catalog: I18nCatalog,
  key: I18nMessageKey,
): string | ((params: never) => string) | undefined {
  const dot = key.indexOf(".");
  const group = key.slice(0, dot) as keyof I18nCatalog;
  const name = key.slice(dot + 1);
  const groupCatalog = catalog[group] as
    | Record<string, string | ((params: never) => string)>
    | undefined;
  return groupCatalog?.[name];
}

function warnMissing(key: string, warned: Set<string>): string {
  // `import.meta.env.DEV` comes from the consumer's Vite (and from vitest). Cast locally rather than
  // adding `vite/client` to this package's `compilerOptions.types`, which would also pull in its
  // asset-module declarations.
  const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
  if (isDev && !warned.has(key)) {
    warned.add(key);
    console.warn(`[hope-ui i18n] no default for message key "${key}" — returning the key.`);
  }
  return key;
}
