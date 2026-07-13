import type { I18nCatalog } from "../messages";

/** Built-in **Portuguese** (`pt`) catalog. Contract + shape: `../messages.ts`; registered in `catalogs.ts`. */
export const MESSAGES_PT: I18nCatalog = {
  dialog: {
    close: "Fechar",
  },
  calendar: {
    label: "Calendário",
    previousLabel: "Anterior",
    nextLabel: "Seguinte",
    today: "Hoje",
    selected: "selecionado",
    rangeStart: "Início do intervalo",
    rangeEnd: "Fim do intervalo",
    unavailable: "Indisponível",
    monthView: "Vista de mês",
    yearView: "Vista de ano",
    decadeView: "Vista de década",
    selectedDate: "Selecionado {{date}}",
    selectedRange: "Selecionado de {{start}} a {{end}}",
    datesSelected: ({ count }) =>
      `${count} ${count === 1 ? "data selecionada" : "datas selecionadas"}`,
  },
};
