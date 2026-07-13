import { describe, expect, it } from "vitest";
import { MESSAGES_EN } from "../en";
import { MESSAGES_FR } from "../fr";

/** Flatten a nested catalog to dotted keys, for a concise parity comparison. */
function flatKeys(catalog: Record<string, Record<string, unknown>>): string[] {
  return Object.entries(catalog)
    .flatMap(([group, entries]) => Object.keys(entries).map((name) => `${group}.${name}`))
    .sort();
}

describe("MESSAGES_FR", () => {
  it("defines exactly the keys MESSAGES_EN does (parity — no missing/extra translation)", () => {
    expect(flatKeys(MESSAGES_FR)).toEqual(flatKeys(MESSAGES_EN));
  });

  it("carries the French translations", () => {
    expect(MESSAGES_FR.dialog.close).toBe("Fermer");
    expect(MESSAGES_FR.calendar.label).toBe("Calendrier");
    expect(MESSAGES_FR.calendar.today).toBe("Aujourd'hui");
    expect(MESSAGES_FR.calendar.previousLabel).toBe("Précédent");
    expect(MESSAGES_FR.calendar.nextLabel).toBe("Suivant");
  });

  it("pluralizes datesSelected with the French rule (singular at count <= 1)", () => {
    const fn = MESSAGES_FR.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 0 })).toBe("0 date sélectionnée");
    expect(fn({ count: 1 })).toBe("1 date sélectionnée");
    expect(fn({ count: 2 })).toBe("2 dates sélectionnées");
  });
});
