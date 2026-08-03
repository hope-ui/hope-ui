/**
 * @license
 * Portions of this file are derived from Adobe React Spectrum (`@react-aria/i18n`,
 * `src/i18n/useDefaultLocale.ts`).
 * Copyright 2020 Adobe. All rights reserved.
 * https://github.com/adobe/react-spectrum
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. A copy of the License is distributed with this
 * package as LICENSE-APACHE-2.0.txt, and is available at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 *
 * This file has been modified from the original.
 */

/*
 * Browser/system default locale. Two deliberate deviations from the source it was derived from:
 *   1. Hydration-gated detection. The detected locale is reported immediately, *except* while a
 *      hydration pass is in flight, when `en-US`/`ltr` — what the server rendered — is reported
 *      until that pass ends. The original reads the real locale at module load, which a
 *      server-rendered page then contradicts. Gating on the hydration pass alone, rather than always
 *      seeding `en-US`, is what keeps a client-only app free of a visible flash.
 *   2. Dual-copy safety. The shared locale signal and the `languagechange` subscription live in a
 *      `Symbol.for(...)` registry on `globalThis` instead of module-scope `let`s, so two installed
 *      copies of this package still observe one registry and agree on one value.
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
 * Process-wide locale state, reached through a global symbol so two installed copies of
 * `@hope-ui/i18n` share one `languagechange` subscription, one locale signal, and one hydration gate.
 *
 * `locale` and `hydrationOver` are **signals** rather than plain values because every consumer reads
 * them directly: a `languagechange`, or the end of the hydration pass, then propagates everywhere by
 * writing a single signal, with no fan-out list to maintain.
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
 * Solid clears `sharedConfig.hydrating` synchronously when the hydration pass ends, but emits no
 * notification — so the gate opens from a microtask that re-queues itself while the flag is still
 * set. `hydrate()` runs synchronously, so in practice this settles on the first tick after it returns.
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
 * That gate is the whole SSR story. Hydration reuses the server's DOM instead of re-deriving it, so a
 * client that resolves a *different* locale during the pass ends up with markup contradicting its own
 * state — silently: no warning, no node replaced. See `__internal__/i18n/default-locale.md`.
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
  // Never removed: the registry is process-wide, so there is no "last consumer" to unsubscribe on,
  // and one listener outliving a component is cheaper than reference-counting every reader.
  window.addEventListener("languagechange", updateLocale);
}

/**
 * An accessor for the current browser/system locale + direction that updates on `languagechange`.
 *
 * Reads {@link readDetectedLocale}, so it is SSR-safe by construction: `en-US`/`ltr` on the server and
 * through the hydration pass, the detected locale immediately in a client-only app. Needs no reactive
 * owner, since the state it reads lives in the shared registry rather than in the caller.
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
