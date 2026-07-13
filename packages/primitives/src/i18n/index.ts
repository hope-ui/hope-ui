// Locale + reading-direction context (ported/improved from the maintainer's Kobalte i18n work),
// plus the `@solid-primitives/i18n` translator seam re-exported so consumers author localized
// dictionaries from one import — the same shape as Kobalte's `@kobalte/core/i18n`.

// The translator primitives (dictionary flattening, template resolution, scoped/chained
// translators). No name overlaps with the locale/direction exports above.
export * from "@solid-primitives/i18n";
export {
  createDefaultLocale,
  getDefaultLocale,
  type Locale,
} from "./default-locale";
export { type Direction, getReadingDirection, isRTL, RTL_LANGS } from "./direction";
export {
  type I18nContextValue,
  I18nProvider,
  type I18nProviderProps,
  useLocale,
} from "./i18n-provider";
