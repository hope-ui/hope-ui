import { describe, expect, it } from "vitest";
import { MESSAGES_PT } from "../pt";

describe("MESSAGES_PT", () => {
  it("carries the Portuguese translations", () => {
    expect(MESSAGES_PT.common.close).toBe("Fechar");
    expect(MESSAGES_PT.calendar.label).toBe("Calendário");
    expect(MESSAGES_PT.calendar.today).toBe("Hoje");
  });

  it("pluralizes datesSelected (singular only at 1, feminine agreement)", () => {
    const fn = MESSAGES_PT.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 1 })).toBe("1 data selecionada");
    expect(fn({ count: 2 })).toBe("2 datas selecionadas");
  });
});
