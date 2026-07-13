import { describe, expect, it, vi } from "vitest";
import { createTranslate, type I18nMessagesConfig } from "../translate";

const en = () => "en-US";
const fr = () => "fr-FR";

describe("createTranslate — resolution order", () => {
  it("falls back to the built-in English catalog with no config", () => {
    const t = createTranslate(en, () => undefined);
    expect(t("dialog.close")).toBe("Close");
    expect(t("calendar.today")).toBe("Today");
  });

  it("selects the French catalog for a locale starting with 'fr'", () => {
    const t = createTranslate(fr, () => undefined);
    expect(t("dialog.close")).toBe("Fermer");
    expect(t("calendar.today")).toBe("Aujourd'hui");
  });

  it("interpolates params through the built-in catalog", () => {
    const t = createTranslate(en, () => undefined);
    expect(t("calendar.selectedDate", { date: "Jan 1" })).toBe("Selected Jan 1");
    expect(t("calendar.datesSelected", { count: 1 })).toBe("1 date selected");
  });

  it("lets a per-key `messages` override win over the built-in catalog", () => {
    const config: I18nMessagesConfig = { messages: { "en-US": { "dialog.close": "Dismiss" } } };
    const t = createTranslate(en, () => config);
    expect(t("dialog.close")).toBe("Dismiss");
    // A key without an override still falls through to the built-in.
    expect(t("calendar.today")).toBe("Today");
  });

  it("interpolates params in a `messages` override", () => {
    const config: I18nMessagesConfig = {
      messages: { "en-US": { "calendar.selectedDate": "Picked {{date}}" } },
    };
    const t = createTranslate(en, () => config);
    expect(t("calendar.selectedDate", { date: "Jan 1" })).toBe("Picked Jan 1");
  });

  it("lets the `translate` overlay win over everything, and falls through on null", () => {
    const translate = vi.fn((key: string) => (key === "dialog.close" ? "X" : null));
    const t = createTranslate(en, () => ({ translate }));
    expect(t("dialog.close")).toBe("X"); // overlay hit
    expect(t("calendar.today")).toBe("Today"); // overlay returned null → built-in
    expect(translate).toHaveBeenCalledWith("calendar.today", undefined, "en-US");
  });

  it("reads the locale accessor on every call (reactive by construction)", () => {
    let locale = "en-US";
    const t = createTranslate(
      () => locale,
      () => undefined,
    );
    expect(t("dialog.close")).toBe("Close");
    locale = "fr-FR";
    expect(t("dialog.close")).toBe("Fermer");
  });
});
