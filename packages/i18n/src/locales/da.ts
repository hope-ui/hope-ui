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
  combobox: {
    triggerLabel: "Vis forslag",
    clearLabel: "Ryd",
    countAnnouncement: ({ count }) =>
      `${count} ${count === 1 ? "mulighed tilgængelig" : "muligheder tilgængelige"}`,
  },
  tagsInput: {
    removeLabel: "Fjern",
    removeDescription: "Tryk på Delete for at fjerne tagget",
    clearLabel: "Ryd alle tags",
  },
};
