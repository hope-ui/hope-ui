import type { I18nCatalog } from "../messages";

/**
 * Built-in **Finnish** (`fi`) catalog. Contract + shape: `../messages.ts`; registered in `catalogs.ts`.
 * A count other than 1 takes the partitive singular (`päivämäärää`); see `fi.md`.
 */
export const MESSAGES_FI: I18nCatalog = {
  dialog: {
    close: "Sulje",
  },
  calendar: {
    label: "Kalenteri",
    previousLabel: "Edellinen",
    nextLabel: "Seuraava",
    today: "Tänään",
    selected: "valittu",
    rangeStart: "Jakson alku",
    rangeEnd: "Jakson loppu",
    unavailable: "Ei käytettävissä",
    monthView: "Kuukausinäkymä",
    yearView: "Vuosinäkymä",
    decadeView: "Vuosikymmennäkymä",
    selectedDate: "Valittu {{date}}",
    selectedRange: "Valittu {{start}}–{{end}}",
    datesSelected: ({ count }) => `${count} ${count === 1 ? "päivämäärä" : "päivämäärää"} valittu`,
  },
};
