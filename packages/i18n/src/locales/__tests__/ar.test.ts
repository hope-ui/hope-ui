import { describe, expect, it } from "vitest";
import { MESSAGES_AR } from "../ar";

describe("MESSAGES_AR", () => {
  it("carries the Arabic translations", () => {
    expect(MESSAGES_AR.common.close).toBe("إغلاق");
    expect(MESSAGES_AR.calendar.label).toBe("التقويم");
    expect(MESSAGES_AR.calendar.today).toBe("اليوم");
    expect(MESSAGES_AR.calendar.previousLabel).toBe("السابق");
    expect(MESSAGES_AR.calendar.nextLabel).toBe("التالي");
  });

  it("pluralizes datesSelected with the six Arabic CLDR categories", () => {
    const fn = MESSAGES_AR.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 0 })).toBe("لم يتم تحديد أي تاريخ"); // zero
    expect(fn({ count: 1 })).toBe("تم تحديد تاريخ واحد"); // one
    expect(fn({ count: 2 })).toBe("تم تحديد تاريخين"); // two
    expect(fn({ count: 3 })).toBe("تم تحديد 3 تواريخ"); // few (n%100 = 3–10)
    expect(fn({ count: 11 })).toBe("تم تحديد 11 تاريخًا"); // many (n%100 = 11–99)
    expect(fn({ count: 100 })).toBe("تم تحديد 100 تاريخ"); // other (n%100 = 0/1/2 for n ≥ 100)
  });

  it("carries the Arabic combobox strings", () => {
    expect(MESSAGES_AR.combobox.triggerLabel).toBe("عرض الاقتراحات");
    expect(MESSAGES_AR.combobox.clearLabel).toBe("مسح");
  });

  it("pluralizes countAnnouncement with the six Arabic CLDR categories", () => {
    const fn = MESSAGES_AR.combobox.countAnnouncement as (p: { count: number }) => string;
    expect(fn({ count: 0 })).toBe("لا توجد خيارات متاحة"); // zero
    expect(fn({ count: 1 })).toBe("خيار واحد متاح"); // one
    expect(fn({ count: 2 })).toBe("خياران متاحان"); // two
    expect(fn({ count: 3 })).toBe("3 خيارات متاحة"); // few (n%100 = 3–10)
    expect(fn({ count: 11 })).toBe("11 خيارًا متاحًا"); // many (n%100 = 11–99)
    expect(fn({ count: 100 })).toBe("100 خيار متاح"); // other (n%100 = 0/1/2 for n ≥ 100)
  });

  it("carries the Arabic tagsInput strings", () => {
    expect(MESSAGES_AR.tagsInput.removeLabel).toBe("إزالة");
    expect(MESSAGES_AR.tagsInput.removeDescription).toBe("اضغط مفتاح الحذف لإزالة الوسم");
    expect(MESSAGES_AR.tagsInput.clearLabel).toBe("مسح كل الوسوم");
  });

  it("names the Delete key in Arabic rather than embedding a Latin key name", () => {
    // A Latin "Delete" inside an RTL string reorders unpredictably when announced.
    expect(MESSAGES_AR.tagsInput.removeDescription).not.toMatch(/[A-Za-z]/);
  });
});
