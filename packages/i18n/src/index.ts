// Locale + reading-direction context (derived from React Spectrum's `@react-aria/i18n`), plus
// the in-house message catalog + resolver (`t`) — hope-ui's headless port of the Angular predecessor's
// `I18nService`. No external i18n runtime dependency.

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
export * from "./locales";
export {
  type I18nCatalog,
  type I18nMessageEntry,
  type I18nMessageKey,
  interpolate,
  type ParamsFor,
} from "./messages";
export {
  createTranslate,
  type I18nMessagesConfig,
  type I18nTranslateOverride,
  type TranslateFn,
} from "./translate";
