/**
 * The message resolver — hope-ui's headless equivalent of the Angular predecessor's `I18nService.t()`.
 *
 * The built-in catalogs (`./locales/`, selected by {@link resolveCatalog}) are the guaranteed
 * floor; the app's own pipeline (via {@link I18nTranslateOverride}) is an **overlay** consulted first,
 * falling through to the built-in when it has no entry for a key. The returned {@link TranslateFn} reads
 * the `locale`
 * accessor on every call, so it is reactive inside JSX **and** returns the current value for imperative
 * callers (e.g. the live-region announcer). It is a plain function — never a `createMemo` — so it never
 * participates in a hydration key (see `__internal__/solid-primitives-eval.md`).
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
 * order (first non-null wins): app `translate` fn → per-key `messages` override → built-in catalog
 * (by locale, via {@link resolveCatalog}, with `MESSAGES_EN` fallback) → the key itself (dev-warned
 * once). The warn-dedup `Set` is per-instance (not module scope), so it never becomes cross-realm
 * shared state.
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
  // `import.meta.env.DEV` is defined by the consumer's Vite (and vitest); cast locally so this package
  // needn't pull `vite/client` — and the whole asset-module surface — into `compilerOptions.types`.
  const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
  if (isDev && !warned.has(key)) {
    warned.add(key);
    console.warn(`[hope-ui i18n] no default for message key "${key}" — returning the key.`);
  }
  return key;
}
