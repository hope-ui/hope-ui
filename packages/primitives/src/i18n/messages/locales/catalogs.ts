import type { I18nCatalog } from "../messages";
import { MESSAGES_DA } from "./da";
import { MESSAGES_DE } from "./de";
import { MESSAGES_EL } from "./el";
import { MESSAGES_EN } from "./en";
import { MESSAGES_ES } from "./es";
import { MESSAGES_FI } from "./fi";
import { MESSAGES_FR } from "./fr";
import { MESSAGES_IT } from "./it";
import { MESSAGES_PL } from "./pl";
import { MESSAGES_PT } from "./pt";
import { MESSAGES_SV } from "./sv";

/**
 * Every built-in catalog, keyed by its BCP-47 **primary language subtag**. This is the one place that
 * lists the shipped locales; the resolver selects from it and `t()` falls back to `MESSAGES_EN`. Add a
 * locale by creating `<code>.ts` (a full {@link I18nCatalog}) and registering it here.
 */
export const CATALOGS: Record<string, I18nCatalog> = {
  en: MESSAGES_EN,
  fr: MESSAGES_FR,
  de: MESSAGES_DE,
  it: MESSAGES_IT,
  es: MESSAGES_ES,
  pt: MESSAGES_PT,
  pl: MESSAGES_PL,
  sv: MESSAGES_SV,
  fi: MESSAGES_FI,
  da: MESSAGES_DA,
  el: MESSAGES_EL,
};

/**
 * Resolve a BCP-47 locale (`"de"`, `"de-AT"`, `"pt-BR"`, …) to its built-in catalog by primary language
 * subtag, case-insensitively, falling back to {@link MESSAGES_EN} for any unshipped locale.
 */
export function resolveCatalog(locale: string): I18nCatalog {
  const primary = locale.toLowerCase().split(/[-_]/)[0] ?? "";
  return CATALOGS[primary] ?? MESSAGES_EN;
}
