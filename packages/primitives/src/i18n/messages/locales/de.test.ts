import { describe, expect, it } from "vitest";
import { MESSAGES_DE } from "./de";

describe("MESSAGES_DE", () => {
  it("carries the German translations", () => {
    expect(MESSAGES_DE.dialog.close).toBe("Schließen");
    expect(MESSAGES_DE.calendar.label).toBe("Kalender");
    expect(MESSAGES_DE.calendar.today).toBe("Heute");
  });

  it("pluralizes datesSelected (singular only at 1)", () => {
    const fn = MESSAGES_DE.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 Datum ausgewählt");
    expect(fn({ count: 2 })).toBe("2 Daten ausgewählt");
  });
});
