import type { I18nCatalog } from "../messages";

/** Built-in **Danish** (`da`) catalog. Contract + shape: `../messages.ts`; registered in `catalogs.ts`. */
export const MESSAGES_DA: I18nCatalog = {
  common: {
    close: "Luk",
  },
  calendar: {
    label: "Kalender",
    previousLabel: "Forrige",
    nextLabel: "Næste",
    today: "I dag",
    selected: "valgt",
    rangeStart: "Intervalstart",
    rangeEnd: "Intervalslut",
    unavailable: "Ikke tilgængelig",
    monthView: "Månedsvisning",
    yearView: "Årsvisning",
    decadeView: "Årtivisning",
    selectedDate: "Valgt {{date}}",
    selectedRange: "Valgt {{start}} til {{end}}",
    datesSelected: ({ count }) => `${count} ${count === 1 ? "dato" : "datoer"} valgt`,
  },
};
