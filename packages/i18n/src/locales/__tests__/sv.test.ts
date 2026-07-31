import { describe, expect, it } from "vitest";
import { MESSAGES_SV } from "../sv";

describe("MESSAGES_SV", () => {
  it("carries the Swedish translations", () => {
    expect(MESSAGES_SV.common.close).toBe("Stäng");
    expect(MESSAGES_SV.calendar.label).toBe("Kalender");
    expect(MESSAGES_SV.calendar.today).toBe("Idag");
  });

  it("pluralizes datesSelected (neuter 'datum' is invariant; participle agrees)", () => {
    const fn = MESSAGES_SV.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 datum valt");
    expect(fn({ count: 2 })).toBe("2 datum valda");
  });

  it("carries the Swedish combobox strings", () => {
    expect(MESSAGES_SV.combobox.triggerLabel).toBe("Visa förslag");
    expect(MESSAGES_SV.combobox.clearLabel).toBe("Rensa");
  });

  it("pluralizes countAnnouncement (neuter 'alternativ' is invariant; adjective agrees)", () => {
    const fn = MESSAGES_SV.combobox.countAnnouncement as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 alternativ tillgängligt");
    expect(fn({ count: 2 })).toBe("2 alternativ tillgängliga");
  });
});
