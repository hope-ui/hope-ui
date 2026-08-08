import { describe, expect, it } from "vitest";
import { MESSAGES_DE } from "../de";

describe("MESSAGES_DE", () => {
  it("carries the German translations", () => {
    expect(MESSAGES_DE.common.close).toBe("Schließen");
    expect(MESSAGES_DE.calendar.label).toBe("Kalender");
    expect(MESSAGES_DE.calendar.today).toBe("Heute");
  });

  it("pluralizes datesSelected (singular only at 1)", () => {
    const fn = MESSAGES_DE.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 Datum ausgewählt");
    expect(fn({ count: 2 })).toBe("2 Daten ausgewählt");
  });

  it("carries the German combobox strings", () => {
    expect(MESSAGES_DE.combobox.triggerLabel).toBe("Vorschläge anzeigen");
    expect(MESSAGES_DE.combobox.clearLabel).toBe("Löschen");
  });

  it("pluralizes countAnnouncement (singular only at 1)", () => {
    const fn = MESSAGES_DE.combobox.countAnnouncement as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 Option verfügbar");
    expect(fn({ count: 2 })).toBe("2 Optionen verfügbar");
  });

  it("carries the German tagsInput strings", () => {
    expect(MESSAGES_DE.tagsInput.removeLabel).toBe("Entfernen");
    expect(MESSAGES_DE.tagsInput.removeDescription).toBe("Entf drücken, um das Tag zu entfernen");
    expect(MESSAGES_DE.tagsInput.clearLabel).toBe("Alle Tags löschen");
  });
});
