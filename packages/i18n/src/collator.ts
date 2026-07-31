/*
 * Localized string collation for the current locale — the comparator `createListTypeahead` (and,
 * later, Combobox's filter) uses so a query matches an accented item regardless of case or
 * diacritics. Modeled on react-aria's `useCollator` (`i18n/useCollator.ts`): same cache-key shape,
 * re-expressed as a Solid accessor instead of a React hook.
 */

import { type Accessor, createMemo } from "solid-js";
import { useLocale } from "./i18n-provider";

/**
 * A plain module-level cache, not the `Symbol.for` dual-copy registry `default-locale.ts` uses for
 * the shared locale signal. That registry exists to keep two installed copies of this package from
 * disagreeing about a *shared mutable resource* (one `languagechange` subscription, one signal). An
 * `Intl.Collator` is immutable and purely a function of (locale, options) — two copies each keeping
 * their own cache costs one duplicate `Intl.Collator` construction, not a correctness divergence.
 * React Aria's `useCollator` caches the same way, module-scope, no registry.
 */
const cache = new Map<string, Intl.Collator>();

function cacheKeyFor(locale: string, options: Intl.CollatorOptions | undefined): string {
  const optionsKey = options
    ? Object.entries(options)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .join()
    : "";
  return `${locale}|${optionsKey}`;
}

/**
 * A memoized `Intl.Collator` for the current locale (`useLocale()`), rebuilt only when the locale
 * changes and reused across every caller asking for the same locale + options — construction is
 * measurably not free, and every typeahead/filter site asks with the same options
 * (`{ usage: "search", sensitivity: "base" }`).
 *
 * Needs a reactive owner: it reads `useLocale()` and the returned accessor tracks `locale()`, so a
 * collator built once against the initial locale would silently go stale the moment an
 * `I18nProvider` changes locale.
 */
export function createCollator(options?: Intl.CollatorOptions): Accessor<Intl.Collator> {
  const { locale } = useLocale();
  return createMemo(() => {
    const key = cacheKeyFor(locale(), options);
    let collator = cache.get(key);
    if (!collator) {
      collator = new Intl.Collator(locale(), options);
      cache.set(key, collator);
    }
    return collator;
  });
}
