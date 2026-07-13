/*
 * Locale + reading-direction context. Ported from the maintainer's Kobalte i18n work
 * (`@kobalte/core/i18n`), derived from React Spectrum (`@react-aria/i18n`, Apache-2.0,
 * © 2020 Adobe). Replaces the Angular calendar's `I18nService` (locale) + `Directionality`.
 */

import type { JSX } from "@solidjs/web";
import { type Accessor, createContext, useContext } from "solid-js";
import { createDefaultLocale, getDefaultLocale } from "./default-locale";
import { type Direction, getReadingDirection } from "./direction";

export interface I18nContextValue {
  /** The [BCP-47](https://www.ietf.org/rfc/bcp/bcp47.txt) language code for the current locale. */
  locale: Accessor<string>;
  /** The reading direction for the current locale. */
  direction: Accessor<Direction>;
}

export interface I18nProviderProps {
  /** The locale to apply to descendants. Defaults to the detected browser/system locale. */
  locale?: string;
  children?: JSX.Element;
}

/**
 * Context default (no `I18nProvider` mounted): reads the detected browser locale per-access. This is
 * eager — for the SSR/hydration-safe path (first client paint = server's `en-US`), wrap the tree in
 * `<I18nProvider>` (which defers detection to `onSettled`) or pass an explicit `locale`.
 */
const I18nContext = createContext<I18nContextValue>({
  locale: () => getDefaultLocale().locale,
  direction: () => getDefaultLocale().direction,
});

/**
 * Provides the locale + reading direction to descendant components (calendar, and any future
 * locale-aware component). With no `locale` prop it tracks the browser locale via
 * `createDefaultLocale` (SSR-safe: `en-US`/`ltr` until hydration settles); with a `locale` prop it
 * derives direction from it. In SolidJS 2.0 `createContext` returns the Provider directly.
 */
export function I18nProvider(props: I18nProviderProps): JSX.Element {
  const defaultLocale = createDefaultLocale();

  const value: I18nContextValue = {
    locale: () => props.locale ?? defaultLocale.locale(),
    direction: () => (props.locale ? getReadingDirection(props.locale) : defaultLocale.direction()),
  };

  return <I18nContext value={value}>{props.children}</I18nContext>;
}

/** The current locale + reading direction. Returns the browser default when no `I18nProvider` is mounted. */
export function useLocale(): I18nContextValue {
  return useContext(I18nContext);
}
