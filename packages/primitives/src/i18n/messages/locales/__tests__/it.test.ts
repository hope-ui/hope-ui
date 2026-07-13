import { describe, expect, it } from "vitest";
import { MESSAGES_IT } from "../it";

describe("MESSAGES_IT", () => {
  it("carries the Italian translations", () => {
    expect(MESSAGES_IT.dialog.close).toBe("Chiudi");
    expect(MESSAGES_IT.calendar.label).toBe("Calendario");
    expect(MESSAGES_IT.calendar.today).toBe("Oggi");
  });

  it("pluralizes datesSelected (singular only at 1, feminine agreement)", () => {
    const fn = MESSAGES_IT.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 data selezionata");
    expect(fn({ count: 2 })).toBe("2 date selezionate");
  });
});
