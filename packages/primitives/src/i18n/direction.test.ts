import { describe, expect, it } from "vitest";
import { getReadingDirection, isRTL } from "./direction";

describe("getReadingDirection", () => {
  it("returns 'ltr' for Latin/CJK-script locales", () => {
    expect(getReadingDirection("en-US")).toBe("ltr");
    expect(getReadingDirection("fr-FR")).toBe("ltr");
    expect(getReadingDirection("de")).toBe("ltr");
    expect(getReadingDirection("ja-JP")).toBe("ltr");
    expect(getReadingDirection("zh-Hans")).toBe("ltr");
  });

  it("returns 'rtl' for right-to-left-script locales", () => {
    expect(getReadingDirection("ar")).toBe("rtl");
    expect(getReadingDirection("ar-EG")).toBe("rtl");
    expect(getReadingDirection("he-IL")).toBe("rtl");
    expect(getReadingDirection("fa")).toBe("rtl");
    expect(getReadingDirection("ur-PK")).toBe("rtl");
  });
});

describe("isRTL", () => {
  it("agrees with getReadingDirection", () => {
    expect(isRTL("ar")).toBe(true);
    expect(isRTL("he")).toBe(true);
    expect(isRTL("en")).toBe(false);
    expect(isRTL("fr-FR")).toBe(false);
  });
});
