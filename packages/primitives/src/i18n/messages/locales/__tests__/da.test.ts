import { describe, expect, it } from "vitest";
import { MESSAGES_DA } from "../da";

describe("MESSAGES_DA", () => {
  it("carries the Danish translations", () => {
    expect(MESSAGES_DA.dialog.close).toBe("Luk");
    expect(MESSAGES_DA.calendar.label).toBe("Kalender");
    expect(MESSAGES_DA.calendar.today).toBe("I dag");
  });

  it("pluralizes datesSelected (singular only at 1)", () => {
    const fn = MESSAGES_DA.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 dato valgt");
    expect(fn({ count: 2 })).toBe("2 datoer valgt");
  });
});
