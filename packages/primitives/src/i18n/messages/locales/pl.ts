import type { I18nCatalog } from "../messages";

/**
 * Built-in **Polish** (`pl`) catalog. Contract + shape: `../messages.ts`; registered in `catalogs.ts`.
 * Polish has three plural forms; `datesSelected` implements the standard rule (see `pl.md`).
 */
export const MESSAGES_PL: I18nCatalog = {
  common: {
    close: "Zamknij",
  },
  calendar: {
    label: "Kalendarz",
    previousLabel: "Poprzedni",
    nextLabel: "Następny",
    today: "Dziś",
    selected: "wybrany",
    rangeStart: "Początek zakresu",
    rangeEnd: "Koniec zakresu",
    unavailable: "Niedostępny",
    monthView: "Widok miesiąca",
    yearView: "Widok roku",
    decadeView: "Widok dekady",
    selectedDate: "Wybrano {{date}}",
    selectedRange: "Wybrano od {{start}} do {{end}}",
    datesSelected: ({ count }) => {
      const n10 = count % 10;
      const n100 = count % 100;
      let noun = "dat";
      if (count === 1) {
        noun = "datę";
      } else if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) {
        noun = "daty";
      }
      return `Wybrano ${count} ${noun}`;
    },
  },
};
