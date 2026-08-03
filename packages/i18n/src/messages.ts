/**
 * The i18n message contract — the user-facing strings hope-ui's components emit (screen-reader
 * labels, live-region announcements) that the consuming app does NOT author.
 *
 * The nested {@link I18nMessageMap} below is the **single source of truth**: it groups keys by
 * component and gives each leaf its params type (`undefined` meaning "takes none"). The dotted
 * {@link I18nMessageKey} union `t()` accepts, {@link ParamsFor} and {@link I18nCatalog} are all derived
 * from it, so renaming a key or drifting a param type is a compile error in one place.
 *
 * A count-bearing key is authored as a function of its params, letting each locale encode its own
 * plural rule; every other key is a plain string, optionally with `{{param}}` placeholders.
 *
 * i18n never formats a date itself: dates, months and weekdays are formatted upstream by
 * `@internationalized/date` + `Intl`, and the calendar keys receive those finished strings as params.
 *
 * This file is the contract only — the built-in catalogs live one per locale in `./locales/`. Adding a
 * component's strings means adding a group here *and* an entry to every catalog there.
 */
interface I18nMessageMap {
  common: {
    /** Generic close-affordance `aria-label` (CloseButton; Dialog/Popover/Sheet/Alert close parts). */
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
  combobox: {
    /** The chevron button's `aria-label`. It sits outside the tab order, but pointer + AT users reach it. */
    triggerLabel: undefined;
    /** The clear-value button's `aria-label`. */
    clearLabel: undefined;
    /** Live-region announcement of how many options the current filter left. */
    countAnnouncement: { count: number };
  };
}

/** Dotted, component-namespaced message keys — `"calendar.today"`, `"common.close"`, … (derived). */
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
