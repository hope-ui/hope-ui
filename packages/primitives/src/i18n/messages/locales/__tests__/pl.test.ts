import { describe, expect, it } from "vitest";
import { MESSAGES_PL } from "../pl";

describe("MESSAGES_PL", () => {
  it("carries the Polish translations", () => {
    expect(MESSAGES_PL.dialog.close).toBe("Zamknij");
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
});
