/**
 * @license
 * Portions of this file are derived from Adobe React Spectrum (`@react-aria/i18n`,
 * `src/i18n/context.tsx`).
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
 * Locale + reading-direction context, re-expressed over Solid's context and accessors.
 * Replaces the Angular calendar's `I18nService` (locale) + `Directionality`.
 */

import type { JSX } from "@solidjs/web";
import { type Accessor, createContext, useContext } from "solid-js";
import { createDefaultLocale, readDetectedLocale } from "./default-locale";
import { type Direction, getReadingDirection } from "./direction";
import { createTranslate, type I18nMessagesConfig, type TranslateFn } from "./translate";

export interface I18nContextValue {
  /** The [BCP-47](https://www.ietf.org/rfc/bcp/bcp47.txt) language code for the current locale. */
  locale: Accessor<string>;
  /** The reading direction for the current locale. */
  direction: Accessor<Direction>;
  /**
   * Resolve a component message for the current locale (reactive — reads `locale` on every call).
   * Built-in en/fr defaults, with the app's `translate`/`messages` config as an overlay. See
   * `translate.ts`.
   */
  t: TranslateFn;
}

export interface I18nProviderProps extends I18nMessagesConfig {
  /** The locale to apply to descendants. Defaults to the detected browser/system locale. */
  locale?: string;
  children?: JSX.Element;
}

/**
 * Context default (no `I18nProvider` mounted): the detected browser locale, resolving messages against
 * the built-in catalog for it. Safe to server-render — `readDetectedLocale` reports the server's
 * `en-US`/`ltr` for as long as a hydration pass is in flight, then flips — so zero-config works under
 * SSR as well as on the client. Mount a provider to *choose* the locale, not to make it correct.
 */
const I18nContext = createContext<I18nContextValue>({
  locale: () => readDetectedLocale().locale,
  direction: () => readDetectedLocale().direction,
  t: createTranslate(
    () => readDetectedLocale().locale,
    () => undefined,
  ),
});

/**
 * Provides the locale + reading direction + message resolver (`t`) to descendant components (calendar,
 * dialog, and any future locale-aware component). With no `locale` prop it tracks the browser locale
 * via `createDefaultLocale` — the same hydration-gated accessor the context default reads, so mounting
 * a provider without a `locale` changes nothing about correctness; with a `locale` prop it derives
 * direction from it and detection is bypassed entirely (the fully deterministic form under SSR).
 * `translate`/`messages` overlay the built-in catalog (see `translate.ts`). In SolidJS 2.0
 * `createContext` returns the Provider directly.
 */
export function I18nProvider(props: I18nProviderProps): JSX.Element {
  const defaultLocale = createDefaultLocale();
  const locale = () => props.locale ?? defaultLocale.locale();

  const value: I18nContextValue = {
    locale,
    direction: () => (props.locale ? getReadingDirection(props.locale) : defaultLocale.direction()),
    t: createTranslate(locale, () => ({ translate: props.translate, messages: props.messages })),
  };

  return <I18nContext value={value}>{props.children}</I18nContext>;
}

/**
 * The current locale + reading direction + message resolver (`t`). Returns the browser default (and
 * built-in-catalog `t`) when no `I18nProvider` is mounted.
 */
export function useLocale(): I18nContextValue {
  return useContext(I18nContext);
}
