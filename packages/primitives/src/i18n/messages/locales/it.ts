import type { I18nCatalog } from "../messages";

/** Built-in **Italian** (`it`) catalog. Contract + shape: `../messages.ts`; registered in `catalogs.ts`. */
export const MESSAGES_IT: I18nCatalog = {
  dialog: {
    close: "Chiudi",
  },
  calendar: {
    label: "Calendario",
    previousLabel: "Precedente",
    nextLabel: "Successivo",
    today: "Oggi",
    selected: "selezionato",
    rangeStart: "Inizio intervallo",
    rangeEnd: "Fine intervallo",
    unavailable: "Non disponibile",
    monthView: "Vista mese",
    yearView: "Vista anno",
    decadeView: "Vista decennio",
    selectedDate: "Selezionato {{date}}",
    selectedRange: "Selezionato da {{start}} a {{end}}",
    datesSelected: ({ count }) =>
      `${count} ${count === 1 ? "data selezionata" : "date selezionate"}`,
  },
};
