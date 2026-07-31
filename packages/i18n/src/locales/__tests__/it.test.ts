import { describe, expect, it } from "vitest";
import { MESSAGES_IT } from "../it";

describe("MESSAGES_IT", () => {
  it("carries the Italian translations", () => {
    expect(MESSAGES_IT.common.close).toBe("Chiudi");
    expect(MESSAGES_IT.calendar.label).toBe("Calendario");
    expect(MESSAGES_IT.calendar.today).toBe("Oggi");
  });

  it("pluralizes datesSelected (singular only at 1, feminine agreement)", () => {
    const fn = MESSAGES_IT.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 data selezionata");
    expect(fn({ count: 2 })).toBe("2 date selezionate");
  });

  it("carries the Italian combobox strings", () => {
    expect(MESSAGES_IT.combobox.triggerLabel).toBe("Mostra suggerimenti");
    expect(MESSAGES_IT.combobox.clearLabel).toBe("Cancella");
  });

  it("pluralizes countAnnouncement (singular only at 1, feminine agreement)", () => {
    const fn = MESSAGES_IT.combobox.countAnnouncement as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 opzione disponibile");
    expect(fn({ count: 2 })).toBe("2 opzioni disponibili");
  });
});
