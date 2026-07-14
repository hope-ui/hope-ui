/**
 * The i18n message contract — the user-facing strings hope-ui's components emit (screen-reader
 * labels, live-region announcements) that the consuming app does NOT author.
 *
 * The nested {@link I18nMessageMap} is the **single source of truth**: it groups keys by component and
 * gives each leaf its params type (`undefined` = takes no params). The dotted {@link I18nMessageKey}
 * union that `t()` accepts, {@link ParamsFor}, and the nested {@link I18nCatalog} are all **derived**
 * from it — so renaming a key, dropping a default, or drifting a param type is a compile error in one
 * place.
 *
 * Count-bearing keys (a singular/plural rule) are authored as functions of their params, so each locale
 * encodes its own rule; every other key is a plain string, optionally with `{{param}}` placeholders
 * (interpolated by {@link interpolate}).
 *
 * Dates/months/weekdays are already locale-formatted upstream by `@internationalized/date` + `Intl`
 * (keyed off the calendar's `locale`); the interpolated calendar keys receive those **already-formatted
 * strings** as params — i18n never formats a date itself.
 *
 * Ported from the maintainer's Angular predecessor (`__origins__`), scoped to the components hope-ui
 * ships today. Adding a component's strings = add a group/key to the map + every locale catalog in
 * `./locales/`. This file is the **contract only** — the built-in catalogs live one per locale in
 * `./locales/` (`en.ts`, `fr.ts`, …).
 */
interface I18nMessageMap {
  dialog: {
    /** Close-button `aria-label`. */
    close: undefined;
  };
  calendar: {
    /** `role=group` accessible name. */
    label: undefined;
    /** Previous-period button `aria-label`. */
    previousLabel: undefined;
    /** Next-period button `aria-label`. */
    nextLabel: undefined;
    /** Cell `aria-label` suffix: today. */
    today: undefined;
    /** Cell `aria-label` suffix: a selected date. */
    selected: undefined;
    /** Cell `aria-label` suffix: a range start. */
    rangeStart: undefined;
    /** Cell `aria-label` suffix: a range end. */
    rangeEnd: undefined;
    /** Cell `aria-label` suffix: an unavailable (focusable-not-selectable) date. */
    unavailable: undefined;
    /** Announced view name (month view). */
    monthView: undefined;
    /** Announced view name (year view). */
    yearView: undefined;
    /** Announced view name (decade view). */
    decadeView: undefined;
    /** Announced committed single date. */
    selectedDate: { date: string };
    /** Announced committed range. */
    selectedRange: { start: string; end: string };
    /** Announced committed multiple selection. */
    datesSelected: { count: number };
  };
}

/** Dotted, component-namespaced message keys — `"calendar.today"`, `"dialog.close"`, … (derived). */
export type I18nMessageKey = {
  [G in keyof I18nMessageMap]: {
    [N in keyof I18nMessageMap[G]]: `${G & string}.${N & string}`;
  }[keyof I18nMessageMap[G]];
}[keyof I18nMessageMap];

/** Params object required for a key, or `undefined` for keys that take none (derived from the map). */
export type ParamsFor<K extends I18nMessageKey> = K extends `${infer G}.${infer N}`
  ? G extends keyof I18nMessageMap
    ? N extends keyof I18nMessageMap[G]
      ? I18nMessageMap[G][N]
      : never
    : never
  : never;

/**
 * A catalog entry: a `{{param}}`-placeholder string (JSON-seedable, interpolated by {@link interpolate})
 * OR a function of the key's params (used where a locale needs singular/plural logic).
 */
export type I18nMessageEntry<K extends I18nMessageKey> =
  ParamsFor<K> extends undefined ? string : string | ((params: ParamsFor<K>) => string);

/**
 * The full **nested** catalog — every group + key mapped to an entry. Derived from
 * {@link I18nMessageMap}, so a catalog missing a key (or with a mistyped plural function) fails to
 * compile.
 */
export type I18nCatalog = {
  [G in keyof I18nMessageMap]: {
    [N in keyof I18nMessageMap[G]]: I18nMessageMap[G][N] extends undefined
      ? string
      : string | ((params: I18nMessageMap[G][N]) => string);
  };
};

/**
 * Replace `{{name}}` placeholders in a template with the matching param, coercing each to a string. A
 * missing param leaves the placeholder untouched (surfaced by the dev-mode warning in the resolver).
 */
export function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
