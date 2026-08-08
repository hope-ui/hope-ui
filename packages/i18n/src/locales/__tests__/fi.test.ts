import { describe, expect, it } from "vitest";
import { MESSAGES_FI } from "../fi";

describe("MESSAGES_FI", () => {
  it("carries the Finnish translations", () => {
    expect(MESSAGES_FI.common.close).toBe("Sulje");
    expect(MESSAGES_FI.calendar.label).toBe("Kalenteri");
    expect(MESSAGES_FI.calendar.today).toBe("Tänään");
  });

  it("pluralizes datesSelected (count != 1 takes the partitive singular)", () => {
    const fn = MESSAGES_FI.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 päivämäärä valittu");
    expect(fn({ count: 2 })).toBe("2 päivämäärää valittu");
  });

  it("carries the Finnish combobox strings", () => {
    expect(MESSAGES_FI.combobox.triggerLabel).toBe("Näytä ehdotukset");
    expect(MESSAGES_FI.combobox.clearLabel).toBe("Tyhjennä");
  });

  it("pluralizes countAnnouncement (count != 1 takes the partitive singular)", () => {
    const fn = MESSAGES_FI.combobox.countAnnouncement as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 vaihtoehto saatavilla");
    expect(fn({ count: 2 })).toBe("2 vaihtoehtoa saatavilla");
  });

  it("carries the Finnish tagsInput strings", () => {
    expect(MESSAGES_FI.tagsInput.removeLabel).toBe("Poista");
    expect(MESSAGES_FI.tagsInput.removeDescription).toBe(
      "Poista tunniste painamalla Delete-näppäintä",
    );
    expect(MESSAGES_FI.tagsInput.clearLabel).toBe("Tyhjennä kaikki tunnisteet");
  });
});
