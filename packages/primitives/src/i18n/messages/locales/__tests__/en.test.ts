import { describe, expect, it } from "vitest";
import { MESSAGES_EN } from "../en";

describe("MESSAGES_EN", () => {
  it("keeps hope-ui's current English calendar/dialog string values", () => {
    // These feed the committed calendar SSR fixture (pinned to en-US) — they must not drift.
    expect(MESSAGES_EN.dialog.close).toBe("Close");
    expect(MESSAGES_EN.calendar.label).toBe("Calendar");
    expect(MESSAGES_EN.calendar.previousLabel).toBe("Previous");
    expect(MESSAGES_EN.calendar.nextLabel).toBe("Next");
    expect(MESSAGES_EN.calendar.today).toBe("Today");
    expect(MESSAGES_EN.calendar.selected).toBe("selected");
    expect(MESSAGES_EN.calendar.unavailable).toBe("Unavailable");
  });

  it("pluralizes datesSelected with the English rule (singular only at 1)", () => {
    const fn = MESSAGES_EN.calendar.datesSelected as (p: { count: number }) => string;
    expect(fn({ count: 0 })).toBe("0 dates selected");
    expect(fn({ count: 1 })).toBe("1 date selected");
    expect(fn({ count: 2 })).toBe("2 dates selected");
  });
});
