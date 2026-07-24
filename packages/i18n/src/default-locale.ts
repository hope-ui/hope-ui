/*
 * Browser/system default locale. Derived from React Spectrum (`@react-aria/i18n`, Apache-2.0,
 * © 2020 Adobe). Two hope-ui improvements over the source are called out inline:
 *   1. Hydration-gated detection — the detected locale is reported immediately *except* while a
 *      hydration pass is in flight, where `en-US`/`ltr` (what the server rendered) is reported
 *      until the pass ends. The original source reads the real locale at module load, which a
 *      server-rendered page then contradicts. Scoping the gate to the hydration pass — rather
 *      than always seeding `en-US` — is what keeps a client-only app flash-free.
 *   2. Dual-copy safety — the shared locale signal and `languagechange` subscription live in a
 *      `Symbol.for(...)` global registry (hope-ui's `createScrollLock`/`createHideOutside`
 *      convention) instead of bare module-scope `let`s, so two installed copies of this package
 *      observe one registry and agree on one value.
 */

import { isServer } from "@solidjs/web";
// `sharedConfig` is re-exported by `@solidjs/web`'s types but not by its runtime bundle; `solid-js` is
// the only import that resolves in both builds.
import { type Accessor, createSignal, sharedConfig } from "solid-js";
import { type Direction, getReadingDirection } from "./direction";

export interface Locale {
  /** The [BCP-47](https://www.ietf.org/rfc/bcp/bcp47.txt) language code for the locale. */
  locale: string;
  /** The writing direction for the locale. */
  direction: Direction;
}

/** What the server (and a hydrating client) renders — deterministic, navigator-free. */
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
 * Process-wide locale state, keyed through the cross-realm global symbol registry so two installed
 * copies of `@hope-ui/i18n` share one `languagechange` subscription, one locale signal and one
 * hydration gate — the same reasoning as `createScrollLock`'s `document.body` symbol slot.
 *
 * Both members are **signals** rather than plain values: every consumer reads them directly, so a
 * `languagechange` (or the end of the hydration pass) propagates by writing one signal. That is what
 * removes the per-consumer signal + `onSettled` + listener-set fan-out this file used to carry.
 */
interface LocaleRegistry {
  locale: Accessor<Locale>;
  setLocale: (next: Locale) => void;
  /** `false` only while a hydration pass is in flight. See {@link readDetectedLocale}. */
  hydrationOver: Accessor<boolean>;
  endHydration: () => void;
  subscribed: boolean;
}

const REGISTRY_KEY = Symbol.for("@hope-ui/i18n:locale-registry");

function getRegistry(): LocaleRegistry {
  const globalScope = globalThis as typeof globalThis & {
    [REGISTRY_KEY]?: LocaleRegistry;
  };
  let registry = globalScope[REGISTRY_KEY];
  if (!registry) {
    const [locale, setLocale] = createSignal<Locale>(getDefaultLocale());
    // Seeded from the live hydration flag: a client-only app is created with the gate already open,
    // so it never renders the `en-US` placeholder at all.
    const [hydrationOver, setHydrationOver] = createSignal(!sharedConfig.hydrating);
    registry = {
      locale,
      setLocale,
      hydrationOver,
      endHydration: () => setHydrationOver(true),
      subscribed: false,
    };
    globalScope[REGISTRY_KEY] = registry;
  }
  return registry;
}

/** Re-read the browser locale. One signal write; every consumer reads that signal. */
function updateLocale(): void {
  getRegistry().setLocale(getDefaultLocale());
}

/**
 * `sharedConfig.hydrating` is cleared synchronously when the hydration pass ends, but nothing
 * *notifies* — so the gate is opened from a microtask that re-queues while the flag is still set.
 * `hydrate()` runs synchronously, so in practice this settles on the first tick after it returns.
 */
let openingScheduled = false;

function openGateAfterHydration(registry: LocaleRegistry): void {
  if (openingScheduled) {
    return;
  }
  openingScheduled = true;
  const check = (): void => {
    if (sharedConfig.hydrating) {
      queueMicrotask(check);
      return;
    }
    openingScheduled = false;
    registry.endHydration();
  };
  queueMicrotask(check);
}

/**
 * The current browser/system locale — reactive, and **hydration-gated**: while a hydration pass is in
 * flight it reports {@link SSR_LOCALE}, matching the markup the server produced, and flips to the
 * detected locale the moment the pass ends.
 *
 * That gate is the whole SSR story. Hydration reuses the server's DOM rather than re-deriving it, so
 * a client that renders a *different* locale during the pass leaves markup that silently contradicts
 * its own state — no warning, no replaced node (see `__internal__/i18n/default-locale.md`).
 */
export function readDetectedLocale(): Locale {
  if (isServer) {
    return SSR_LOCALE;
  }
  const registry = getRegistry();
  if (!registry.hydrationOver()) {
    openGateAfterHydration(registry);
    return SSR_LOCALE;
  }
  subscribeToLanguageChange(registry);
  return registry.locale();
}

function subscribeToLanguageChange(registry: LocaleRegistry): void {
  if (registry.subscribed || typeof window === "undefined") {
    return;
  }
  registry.subscribed = true;
  // Never removed: the registry is process-wide, so there is no last consumer to unsubscribe on, and
  // one listener that outlives a component is cheaper than reference-counting every reader.
  window.addEventListener("languagechange", updateLocale);
}

/**
 * An accessor for the current browser/system locale + direction that updates on `languagechange`.
 *
 * Reads {@link readDetectedLocale}, so it is SSR-safe by construction: `en-US`/`ltr` on the server
 * and through the hydration pass, the detected locale immediately in a client-only app. Needs no
 * reactive owner — the state it reads lives in the shared registry, not in the caller.
 */
export function createDefaultLocale(): {
  locale: () => string;
  direction: () => Direction;
} {
  return {
    locale: () => readDetectedLocale().locale,
    direction: () => readDetectedLocale().direction,
  };
}
