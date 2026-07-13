import { describe, expect, it } from "vitest";
import { MESSAGES_EL } from "../el";

describe("MESSAGES_EL", () => {
  it("carries the Greek translations", () => {
    expect(MESSAGES_EL.dialog.close).toBe("Κλείσιμο");
    expect(MESSAGES_EL.calendar.label).toBe("Ημερολόγιο");
    expect(MESSAGES_EL.calendar.today).toBe("Σήμερα");
  });

  it("pluralizes datesSelected (singular only at 1, feminine agreement)", () => {
    const fn = MESSAGES_EL.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 επιλεγμένη ημερομηνία");
    expect(fn({ count: 2 })).toBe("2 επιλεγμένες ημερομηνίες");
  });
});
