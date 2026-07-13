// Locale + reading-direction context (derived from React Spectrum's `@react-aria/i18n`), plus
// the in-house message catalog + resolver (`t`) — hope-ui's headless port of the Angular predecessor's
// `I18nService`. No external i18n runtime dependency.

export {
  createDefaultLocale,
  getDefaultLocale,
  type Locale,
} from "./default-locale/default-locale";
export { type Direction, getReadingDirection, isRTL, RTL_LANGS } from "./direction/direction";
export {
  type I18nContextValue,
  I18nProvider,
  type I18nProviderProps,
  useLocale,
} from "./i18n-provider/i18n-provider";
export { MESSAGES_DA } from "./messages/locales/da";
export { MESSAGES_DE } from "./messages/locales/de";
export { MESSAGES_EL } from "./messages/locales/el";
export { MESSAGES_EN } from "./messages/locales/en";
export { MESSAGES_ES } from "./messages/locales/es";
export { MESSAGES_FI } from "./messages/locales/fi";
export { MESSAGES_FR } from "./messages/locales/fr";
export { MESSAGES_IT } from "./messages/locales/it";
export { MESSAGES_PL } from "./messages/locales/pl";
export { MESSAGES_PT } from "./messages/locales/pt";
export { MESSAGES_SV } from "./messages/locales/sv";
export {
  type I18nCatalog,
  type I18nMessageEntry,
  type I18nMessageKey,
  interpolate,
  type ParamsFor,
} from "./messages/messages";
export {
  createTranslate,
  type I18nMessagesConfig,
  type I18nTranslateOverride,
  type TranslateFn,
} from "./translate/translate";
