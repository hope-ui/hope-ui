/*
 * Localized string collation for the current locale — the comparator list typeahead and filtering use
 * so that a query matches an accented item regardless of case or diacritics. Modeled on react-aria's
 * `useCollator`: same cache-key shape, re-expressed as a Solid accessor rather than a React hook.
 */

import { type Accessor, createMemo } from "solid-js";
import { useLocale } from "./i18n-provider";

/**
 * A plain module-level cache, deliberately not the global-symbol registry `default-locale.ts` uses.
 * That registry exists so two installed copies of this package cannot disagree about a shared *mutable*
 * resource (one subscription, one signal). An `Intl.Collator` is immutable and purely a function of
 * (locale, options), so a second copy with its own cache costs one duplicate construction — never a
 * correctness divergence. React Aria caches the same way.
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
 * A memoized `Intl.Collator` for the current locale, rebuilt only when that locale changes and shared
 * by every caller asking for the same locale and options. Construction is measurably not free, and
 * every typeahead or filter asks with the same options.
 *
 * Must be called under a reactive owner: it reads `useLocale()`, and the accessor it returns tracks
 * the locale — a collator built once against the initial locale would silently go stale as soon as an
 * `I18nProvider` changed it.
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
