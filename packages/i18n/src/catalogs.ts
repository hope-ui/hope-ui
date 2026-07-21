import * as locales from "./locales";
import type { I18nCatalog } from "./messages";

/**
 * Every built-in catalog, keyed by its BCP-47 **primary language subtag**. This is the one place that
 * lists the shipped locales; the resolver selects from it and `t()` falls back to `MESSAGES_EN`. Add a
 * locale by creating `<code>.ts` (a full {@link I18nCatalog}) and registering it here.
 */
export const CATALOGS: Record<string, I18nCatalog> = {
  en: locales.MESSAGES_EN,
  fr: locales.MESSAGES_FR,
  de: locales.MESSAGES_DE,
  it: locales.MESSAGES_IT,
  es: locales.MESSAGES_ES,
  pt: locales.MESSAGES_PT,
  pl: locales.MESSAGES_PL,
  sv: locales.MESSAGES_SV,
  fi: locales.MESSAGES_FI,
  da: locales.MESSAGES_DA,
  el: locales.MESSAGES_EL,
  ar: locales.MESSAGES_AR,
};

/**
 * Resolve a BCP-47 locale (`"de"`, `"de-AT"`, `"pt-BR"`, …) to its built-in catalog by primary language
 * subtag, case-insensitively, falling back to {@link MESSAGES_EN} for any unshipped locale.
 */
export function resolveCatalog(locale: string): I18nCatalog {
  const primary = locale.toLowerCase().split(/[-_]/)[0] ?? "";
  return CATALOGS[primary] ?? locales.MESSAGES_EN;
}
