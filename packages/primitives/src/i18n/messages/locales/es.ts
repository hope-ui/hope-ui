import type { I18nCatalog } from "../messages";

/** Built-in **Spanish** (`es`) catalog. Contract + shape: `../messages.ts`; registered in `catalogs.ts`. */
export const MESSAGES_ES: I18nCatalog = {
  dialog: {
    close: "Cerrar",
  },
  calendar: {
    label: "Calendario",
    previousLabel: "Anterior",
    nextLabel: "Siguiente",
    today: "Hoy",
    selected: "seleccionado",
    rangeStart: "Inicio del intervalo",
    rangeEnd: "Fin del intervalo",
    unavailable: "No disponible",
    monthView: "Vista de mes",
    yearView: "Vista de año",
    decadeView: "Vista de década",
    selectedDate: "Seleccionado {{date}}",
    selectedRange: "Seleccionado del {{start}} al {{end}}",
    datesSelected: ({ count }) =>
      `${count} ${count === 1 ? "fecha seleccionada" : "fechas seleccionadas"}`,
  },
};
