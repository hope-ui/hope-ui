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
export { MESSAGES_DA } from "./locales/da";
export { MESSAGES_DE } from "./locales/de";
export { MESSAGES_EL } from "./locales/el";
export { MESSAGES_EN } from "./locales/en";
export { MESSAGES_ES } from "./locales/es";
export { MESSAGES_FI } from "./locales/fi";
export { MESSAGES_FR } from "./locales/fr";
export { MESSAGES_IT } from "./locales/it";
export { MESSAGES_PL } from "./locales/pl";
export { MESSAGES_PT } from "./locales/pt";
export { MESSAGES_SV } from "./locales/sv";
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
