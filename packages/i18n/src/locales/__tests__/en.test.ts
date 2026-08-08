import { describe, expect, it } from "vitest";
import { MESSAGES_EN } from "../en";

describe("MESSAGES_EN", () => {
  it("keeps hope-ui's current English calendar/common string values", () => {
    // These feed the committed calendar SSR fixture (pinned to en-US) — they must not drift.
    expect(MESSAGES_EN.common.close).toBe("Close");
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

  it("carries the English combobox strings", () => {
    expect(MESSAGES_EN.combobox.triggerLabel).toBe("Show suggestions");
    expect(MESSAGES_EN.combobox.clearLabel).toBe("Clear");
  });

  it("pluralizes countAnnouncement with the English rule (singular only at 1)", () => {
    const fn = MESSAGES_EN.combobox.countAnnouncement as (p: { count: number }) => string;
    expect(fn({ count: 0 })).toBe("0 options available");
    expect(fn({ count: 1 })).toBe("1 option available");
    expect(fn({ count: 2 })).toBe("2 options available");
  });

  it("carries the English tagsInput strings", () => {
    // `removeLabel` is composed with the chip's own text through `aria-labelledby` ("Remove Apple"),
    // so it must stay a bare verb with no object and no trailing punctuation.
    expect(MESSAGES_EN.tagsInput.removeLabel).toBe("Remove");
    expect(MESSAGES_EN.tagsInput.removeDescription).toBe("Press Delete to remove tag");
    expect(MESSAGES_EN.tagsInput.clearLabel).toBe("Clear all tags");
  });

  it("keeps tagsInput.clearLabel distinct from combobox.clearLabel", () => {
    // The two are separate keys precisely so each stays retranslatable in place; a byte-identical
    // pair across every catalog is the trigger to reconsider promoting one to `common`.
    expect(MESSAGES_EN.tagsInput.clearLabel).not.toBe(MESSAGES_EN.combobox.clearLabel);
  });
});
