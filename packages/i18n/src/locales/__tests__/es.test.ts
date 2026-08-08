import { describe, expect, it } from "vitest";
import { MESSAGES_ES } from "../es";

describe("MESSAGES_ES", () => {
  it("carries the Spanish translations", () => {
    expect(MESSAGES_ES.common.close).toBe("Cerrar");
    expect(MESSAGES_ES.calendar.label).toBe("Calendario");
    expect(MESSAGES_ES.calendar.today).toBe("Hoy");
  });

  it("pluralizes datesSelected (singular only at 1, feminine agreement)", () => {
    const fn = MESSAGES_ES.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 fecha seleccionada");
    expect(fn({ count: 2 })).toBe("2 fechas seleccionadas");
  });

  it("carries the Spanish combobox strings", () => {
    expect(MESSAGES_ES.combobox.triggerLabel).toBe("Mostrar sugerencias");
    expect(MESSAGES_ES.combobox.clearLabel).toBe("Borrar");
  });

  it("pluralizes countAnnouncement (singular only at 1, feminine agreement)", () => {
    const fn = MESSAGES_ES.combobox.countAnnouncement as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 opción disponible");
    expect(fn({ count: 2 })).toBe("2 opciones disponibles");
  });

  it("carries the Spanish tagsInput strings", () => {
    expect(MESSAGES_ES.tagsInput.removeLabel).toBe("Eliminar");
    expect(MESSAGES_ES.tagsInput.removeDescription).toBe("Pulsa Supr para eliminar la etiqueta");
    expect(MESSAGES_ES.tagsInput.clearLabel).toBe("Borrar todas las etiquetas");
  });
});
