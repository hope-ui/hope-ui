import { withBemModifier, withBemModifiers } from "../src";

describe("css", () => {
  describe("withBemModifier", () => {
    it("should return the class with modifier following BEM naming convention", () => {
      expect(withBemModifier("hope-button", "outline")).toBe("hope-button--outline");
    });

    it("should not return a class when modifier is undefined", () => {
      expect(withBemModifier("hope-button", undefined)).not.toBeDefined();
    });

    it("should not return a class when modifier is null", () => {
      expect(withBemModifier("hope-button", null)).not.toBeDefined();
    });
  });

  describe("withBemModifiers", () => {
    it("should return an array of classes with modifiers following BEM naming convention", () => {
      expect(withBemModifiers("hope-button", ["outline", "primary", "xs"])).toEqual([
        "hope-button--outline",
        "hope-button--primary",
        "hope-button--xs",
      ]);
    });
  });
});
