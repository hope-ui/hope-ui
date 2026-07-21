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
});
