/*
 * Reading-direction detection. Derived from React Spectrum (`@react-aria/i18n`, Apache-2.0,
 * © 2020 Adobe). This replaces the Angular calendar's `@angular/cdk` `Directionality`.
 */

/** The writing direction for a locale. */
export type Direction = "rtl" | "ltr";

/** ISO 15924 script codes that are written right-to-left. */
const RTL_SCRIPTS = new Set([
  "Avst",
  "Arab",
  "Armi",
  "Syrc",
  "Samr",
  "Mand",
  "Thaa",
  "Mend",
  "Nkoo",
  "Adlm",
  "Rohg",
  "Hebr",
]);

/** BCP-47 primary language subtags that are written right-to-left (the `Intl.Locale`-less fallback). */
export const RTL_LANGS = new Set([
  "ae",
  "ar",
  "arc",
  "bcc",
  "bqi",
  "ckb",
  "dv",
  "fa",
  "glk",
  "he",
  "ku",
  "mzn",
  "nqo",
  "pnb",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
]);

/**
 * Whether a BCP-47 locale is written right-to-left. Prefers `Intl.Locale(...).maximize().script`
 * (accurate script detection), falling back to a language-subtag lookup where `Intl.Locale` is absent.
 */
export function isRTL(locale: string): boolean {
  if (Intl.Locale) {
    const script = new Intl.Locale(locale).maximize().script ?? "";
    return RTL_SCRIPTS.has(script);
  }

  const lang = locale.split("-")[0] ?? "";
  return RTL_LANGS.has(lang);
}

/** The reading {@link Direction} for a BCP-47 locale. */
export function getReadingDirection(locale: string): Direction {
  return isRTL(locale) ? "rtl" : "ltr";
}
