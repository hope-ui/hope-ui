/*
 * Browser/system default locale. Ported from the maintainer's Kobalte i18n work
 * (`@kobalte/core/i18n`), derived from React Spectrum (`@react-aria/i18n`, Apache-2.0,
 * © 2020 Adobe). Two hope-ui improvements over the source are called out inline:
 *   1. SSR-safe seeding — the client signal starts at the SSR default (`en-US`/`ltr`) and only
 *      adopts the detected locale in `onSettled` (post-hydration), so the first client paint
 *      matches the server and locale-derived visible text (month names, …) never mismatches on
 *      hydrate. Kobalte seeds the signal with the *real* locale at module load, which can.
 *   2. Dual-copy safety — the shared `languagechange` subscription lives in a `Symbol.for(...)`
 *      global registry (hope-ui's `createScrollLock`/`createHideOutside` convention) instead of a
 *      bare module-scope `let`/`Set`, so two installed copies of this package observe one registry.
 */

import { isServer } from "@solidjs/web";
import { createMemo, createSignal, onSettled } from "solid-js";
import { type Direction, getReadingDirection } from "./direction";

export interface Locale {
  /** The [BCP-47](https://www.ietf.org/rfc/bcp/bcp47.txt) language code for the locale. */
  locale: string;
  /** The writing direction for the locale. */
  direction: Direction;
}

/** What the server (and the pre-hydration client paint) renders — deterministic, navigator-free. */
const SSR_LOCALE: Locale = { locale: "en-US", direction: "ltr" };

/** Reads the browser/system language (or `en-US` off-browser), validated against `Intl`. */
export function getDefaultLocale(): Locale {
  let locale =
    (typeof navigator !== "undefined" &&
      // @ts-expect-error — `userLanguage` is a legacy IE fallback not in the DOM lib types.
      (navigator.language || navigator.userLanguage)) ||
    "en-US";

  try {
    Intl.DateTimeFormat.supportedLocalesOf([locale]);
  } catch {
    locale = "en-US";
  }

  return { locale, direction: getReadingDirection(locale) };
}

/**
 * Process-wide locale registry, keyed through the cross-realm global symbol registry so two
 * installed copies of `@hope-ui/primitives` share one `languagechange` subscription and one
 * `current` snapshot — the same reasoning as `createScrollLock`'s `document.body` symbol slot.
 */
interface LocaleRegistry {
  current: Locale;
  listeners: Set<(locale: Locale) => void>;
  subscribed: boolean;
}

const REGISTRY_KEY = Symbol.for("@hope-ui/primitives/i18n:locale-registry");

function getRegistry(): LocaleRegistry {
  const globalScope = globalThis as typeof globalThis & {
    [REGISTRY_KEY]?: LocaleRegistry;
  };
  let registry = globalScope[REGISTRY_KEY];
  if (!registry) {
    registry = { current: getDefaultLocale(), listeners: new Set(), subscribed: false };
    globalScope[REGISTRY_KEY] = registry;
  }
  return registry;
}

/** Re-read the browser locale and notify every mounted `createDefaultLocale` consumer. */
function updateLocale(): void {
  const registry = getRegistry();
  registry.current = getDefaultLocale();
  for (const listener of registry.listeners) listener(registry.current);
}

/**
 * An accessor for the current browser/system locale + direction that updates on `languagechange`.
 *
 * SSR: the signal is seeded to {@link SSR_LOCALE} and `createMemo` returns it on the server; the
 * detected locale is adopted only in `onSettled` (client, post-hydration), so the hydrating render
 * agrees with the server. Call inside a reactive owner (a component body / `createRoot`).
 */
export function createDefaultLocale(): {
  locale: () => string;
  direction: () => Direction;
} {
  // Seed to the SSR default (improvement #1) — NOT the detected locale — so the first client paint
  // matches the server. `onSettled` swaps in the real locale after hydration.
  const [clientLocale, setClientLocale] = createSignal<Locale>(SSR_LOCALE);
  const value = createMemo<Locale>(() => (isServer ? SSR_LOCALE : clientLocale()));

  onSettled(() => {
    const registry = getRegistry();
    setClientLocale(registry.current);
    registry.listeners.add(setClientLocale);
    if (!registry.subscribed && typeof window !== "undefined") {
      registry.subscribed = true;
      window.addEventListener("languagechange", updateLocale);
    }

    return () => {
      registry.listeners.delete(setClientLocale);
      if (registry.listeners.size === 0 && registry.subscribed && typeof window !== "undefined") {
        registry.subscribed = false;
        window.removeEventListener("languagechange", updateLocale);
      }
    };
  });

  return {
    locale: () => value().locale,
    direction: () => value().direction,
  };
}
