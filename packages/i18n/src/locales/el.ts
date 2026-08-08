import type { I18nCatalog } from "../messages";

/** Built-in **Greek** (`el`) catalog. Contract + shape: `../messages.ts`; registered in `catalogs.ts`. */
export const MESSAGES_EL: I18nCatalog = {
  common: {
    close: "Κλείσιμο",
  },
  calendar: {
    label: "Ημερολόγιο",
    previousLabel: "Προηγούμενο",
    nextLabel: "Επόμενο",
    today: "Σήμερα",
    selected: "επιλεγμένη",
    rangeStart: "Αρχή εύρους",
    rangeEnd: "Τέλος εύρους",
    unavailable: "Μη διαθέσιμη",
    monthView: "Προβολή μήνα",
    yearView: "Προβολή έτους",
    decadeView: "Προβολή δεκαετίας",
    selectedDate: "Επιλέχθηκε {{date}}",
    selectedRange: "Επιλέχθηκε από {{start}} έως {{end}}",
    datesSelected: ({ count }) =>
      `${count} ${count === 1 ? "επιλεγμένη ημερομηνία" : "επιλεγμένες ημερομηνίες"}`,
  },
  combobox: {
    triggerLabel: "Εμφάνιση προτάσεων",
    clearLabel: "Εκκαθάριση",
    countAnnouncement: ({ count }) =>
      `${count} ${count === 1 ? "διαθέσιμη επιλογή" : "διαθέσιμες επιλογές"}`,
  },
  tagsInput: {
    removeLabel: "Αφαίρεση",
    removeDescription: "Πατήστε Delete για αφαίρεση της ετικέτας",
    clearLabel: "Εκκαθάριση όλων των ετικετών",
  },
};
