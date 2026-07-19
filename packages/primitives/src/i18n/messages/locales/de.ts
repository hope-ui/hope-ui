import type { I18nCatalog } from "../messages";

/** Built-in **German** (`de`) catalog. Contract + shape: `../messages.ts`; registered in `catalogs.ts`. */
export const MESSAGES_DE: I18nCatalog = {
  common: {
    close: "Schließen",
  },
  calendar: {
    label: "Kalender",
    previousLabel: "Zurück",
    nextLabel: "Weiter",
    today: "Heute",
    selected: "ausgewählt",
    rangeStart: "Anfang des Zeitraums",
    rangeEnd: "Ende des Zeitraums",
    unavailable: "Nicht verfügbar",
    monthView: "Monatsansicht",
    yearView: "Jahresansicht",
    decadeView: "Jahrzehntansicht",
    selectedDate: "{{date}} ausgewählt",
    selectedRange: "{{start}} bis {{end}} ausgewählt",
    datesSelected: ({ count }) => `${count} ${count === 1 ? "Datum" : "Daten"} ausgewählt`,
  },
};
