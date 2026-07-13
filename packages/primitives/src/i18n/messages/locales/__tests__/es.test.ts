import { describe, expect, it } from "vitest";
import { MESSAGES_ES } from "../es";

describe("MESSAGES_ES", () => {
  it("carries the Spanish translations", () => {
    expect(MESSAGES_ES.dialog.close).toBe("Cerrar");
    expect(MESSAGES_ES.calendar.label).toBe("Calendario");
    expect(MESSAGES_ES.calendar.today).toBe("Hoy");
  });

  it("pluralizes datesSelected (singular only at 1, feminine agreement)", () => {
    const fn = MESSAGES_ES.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 fecha seleccionada");
    expect(fn({ count: 2 })).toBe("2 fechas seleccionadas");
  });
});
