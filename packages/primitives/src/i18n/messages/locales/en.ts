import type { I18nCatalog } from "../messages";

/**
 * Built-in **English** defaults — the guaranteed floor used with zero configuration, and the fallback
 * any other locale's catalog defers to for a key it omits. Exported so an app can spread the static
 * strings into its own translation pipeline's catalog. Contract + shape: `../messages.ts`.
 */
export const MESSAGES_EN: I18nCatalog = {
  dialog: {
    close: "Close",
  },
  calendar: {
    label: "Calendar",
    previousLabel: "Previous",
    nextLabel: "Next",
    today: "Today",
    selected: "selected",
    rangeStart: "Range start",
    rangeEnd: "Range end",
    unavailable: "Unavailable",
    monthView: "Month view",
    yearView: "Year view",
    decadeView: "Decade view",
    selectedDate: "Selected {{date}}",
    selectedRange: "Selected {{start}} to {{end}}",
    datesSelected: ({ count }) => `${count} date${count === 1 ? "" : "s"} selected`,
  },
};
