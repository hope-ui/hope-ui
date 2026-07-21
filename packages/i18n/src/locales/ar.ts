import type { I18nCatalog } from "../messages";

/**
 * Built-in **Arabic** (`ar`) catalog — Modern Standard Arabic. Contract + shape: `../messages.ts`;
 * registered in `catalogs.ts`. Arabic is right-to-left (`getReadingDirection("ar") === "rtl"`), and its
 * cardinal plural has the full six CLDR categories (zero/one/two/few/many/other); `datesSelected`
 * implements that rule (see `ar.md`).
 */
export const MESSAGES_AR: I18nCatalog = {
  common: {
    close: "إغلاق",
  },
  calendar: {
    label: "التقويم",
    previousLabel: "السابق",
    nextLabel: "التالي",
    today: "اليوم",
    selected: "محدد",
    rangeStart: "بداية النطاق",
    rangeEnd: "نهاية النطاق",
    unavailable: "غير متاح",
    monthView: "عرض الشهر",
    yearView: "عرض السنة",
    decadeView: "عرض العقد",
    selectedDate: "تم تحديد {{date}}",
    selectedRange: "تم تحديد {{start}} إلى {{end}}",
    // Arabic CLDR cardinal plural: zero (0), one (1), two (2), few (n%100 = 3–10),
    // many (n%100 = 11–99), other (everything else, e.g. 100/101/102/200…).
    datesSelected: ({ count }) => {
      if (count === 0) {
        return "لم يتم تحديد أي تاريخ";
      }
      if (count === 1) {
        return "تم تحديد تاريخ واحد";
      }
      if (count === 2) {
        return "تم تحديد تاريخين";
      }
      const mod100 = count % 100;
      if (mod100 >= 3 && mod100 <= 10) {
        return `تم تحديد ${count} تواريخ`;
      }
      if (mod100 >= 11 && mod100 <= 99) {
        return `تم تحديد ${count} تاريخًا`;
      }
      return `تم تحديد ${count} تاريخ`;
    },
  },
};
