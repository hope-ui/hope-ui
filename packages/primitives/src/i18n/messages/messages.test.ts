import { describe, expect, it } from "vitest";
import { interpolate } from "./messages";

// The built-in catalogs (and their key parity + plural rules) are tested per locale in
// `./locales/en.test.ts` and `./locales/fr.test.ts`; this file covers the shared `interpolate`.

describe("interpolate", () => {
  it("substitutes {{name}} placeholders and coerces to string", () => {
    expect(interpolate("Selected {{date}}", { date: "Jan 1" })).toBe("Selected Jan 1");
    expect(interpolate("Page {{page}}", { page: 3 })).toBe("Page 3");
  });

  it("tolerates surrounding whitespace in the placeholder", () => {
    expect(interpolate("{{ label }}", { label: "x" })).toBe("x");
  });

  it("leaves a missing param's placeholder untouched", () => {
    expect(interpolate("Selected {{date}}", { other: "x" })).toBe("Selected {{date}}");
  });

  it("returns the template verbatim when no params are given", () => {
    expect(interpolate("Close")).toBe("Close");
  });
});
