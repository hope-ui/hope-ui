import type { I18nCatalog } from "../messages";

/**
 * Built-in **French** defaults — available with zero configuration; selected when the active locale
 * starts with `fr`. French treats `count <= 1` as singular (so 0 and 1 stay singular). Must mirror
 * every key in `en.ts` (enforced by the `I18nCatalog` type + the parity test). Contract: `../messages.ts`.
 */
export const MESSAGES_FR: I18nCatalog = {
  dialog: {
    close: "Fermer",
  },
  calendar: {
    label: "Calendrier",
    previousLabel: "Précédent",
    nextLabel: "Suivant",
    today: "Aujourd'hui",
    selected: "sélectionné",
    rangeStart: "Début de plage",
    rangeEnd: "Fin de plage",
    unavailable: "Indisponible",
    monthView: "Vue par mois",
    yearView: "Vue par année",
    decadeView: "Vue par décennie",
    selectedDate: "Sélectionné le {{date}}",
    selectedRange: "Sélectionné du {{start}} au {{end}}",
    datesSelected: ({ count }) =>
      `${count} date${count <= 1 ? "" : "s"} sélectionnée${count <= 1 ? "" : "s"}`,
  },
};
