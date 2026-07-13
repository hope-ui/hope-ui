import type { I18nCatalog } from "../messages";

/** Built-in **Swedish** (`sv`) catalog. Contract + shape: `../messages.ts`; registered in `catalogs.ts`. */
export const MESSAGES_SV: I18nCatalog = {
  dialog: {
    close: "Stäng",
  },
  calendar: {
    label: "Kalender",
    previousLabel: "Föregående",
    nextLabel: "Nästa",
    today: "Idag",
    selected: "valt",
    rangeStart: "Intervallets början",
    rangeEnd: "Intervallets slut",
    unavailable: "Otillgänglig",
    monthView: "Månadsvy",
    yearView: "Årsvy",
    decadeView: "Decennievy",
    selectedDate: "Valt {{date}}",
    selectedRange: "Valt {{start}} till {{end}}",
    datesSelected: ({ count }) => `${count} datum ${count === 1 ? "valt" : "valda"}`,
  },
};
