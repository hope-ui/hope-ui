import { describe, expect, it } from "vitest";
import { MESSAGES_FI } from "./fi";

describe("MESSAGES_FI", () => {
  it("carries the Finnish translations", () => {
    expect(MESSAGES_FI.dialog.close).toBe("Sulje");
    expect(MESSAGES_FI.calendar.label).toBe("Kalenteri");
    expect(MESSAGES_FI.calendar.today).toBe("Tänään");
  });

  it("pluralizes datesSelected (count != 1 takes the partitive singular)", () => {
    const fn = MESSAGES_FI.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 päivämäärä valittu");
    expect(fn({ count: 2 })).toBe("2 päivämäärää valittu");
  });
});
