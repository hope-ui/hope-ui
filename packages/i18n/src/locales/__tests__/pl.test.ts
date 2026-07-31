import { describe, expect, it } from "vitest";
import { MESSAGES_PL } from "../pl";

describe("MESSAGES_PL", () => {
  it("carries the Polish translations", () => {
    expect(MESSAGES_PL.common.close).toBe("Zamknij");
    expect(MESSAGES_PL.calendar.label).toBe("Kalendarz");
    expect(MESSAGES_PL.calendar.today).toBe("Dziś");
  });

  it("pluralizes datesSelected with the three Polish forms", () => {
    const fn = MESSAGES_PL.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("Wybrano 1 datę"); // singular
    expect(fn({ count: 2 })).toBe("Wybrano 2 daty"); // paucal (2–4)
    expect(fn({ count: 5 })).toBe("Wybrano 5 dat"); // genitive plural
    expect(fn({ count: 12 })).toBe("Wybrano 12 dat"); // 12–14 stay genitive plural
    expect(fn({ count: 22 })).toBe("Wybrano 22 daty"); // 22 → paucal again
    expect(fn({ count: 0 })).toBe("Wybrano 0 dat");
  });

  it("carries the Polish combobox strings", () => {
    expect(MESSAGES_PL.combobox.triggerLabel).toBe("Pokaż sugestie");
    expect(MESSAGES_PL.combobox.clearLabel).toBe("Wyczyść");
  });

  it("pluralizes countAnnouncement with the three Polish forms", () => {
    const fn = MESSAGES_PL.combobox.countAnnouncement as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 opcja dostępna"); // singular
    expect(fn({ count: 2 })).toBe("2 opcje dostępne"); // paucal (2–4)
    expect(fn({ count: 5 })).toBe("5 opcji dostępnych"); // genitive plural
    expect(fn({ count: 12 })).toBe("12 opcji dostępnych"); // 12–14 stay genitive plural
    expect(fn({ count: 22 })).toBe("22 opcje dostępne"); // 22 → paucal again
    expect(fn({ count: 0 })).toBe("0 opcji dostępnych");
  });
});
