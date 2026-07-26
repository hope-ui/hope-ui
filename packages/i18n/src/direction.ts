/**
 * @license
 * Portions of this file are derived from Adobe React Spectrum (`@react-aria/i18n`,
 * `src/i18n/utils.ts` — the RTL script/language tables and direction resolution).
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
 * Reading-direction detection, re-expressed for SolidJS. The RTL script set adds `Avst` and
 * `Armi` to the upstream list. This replaces the Angular calendar's `@angular/cdk`
 * `Directionality`.
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
