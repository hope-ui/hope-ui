import { createRoot } from "solid-js";
import { describe, expect, it } from "vitest";
import { useRecipe } from "./theme-context";

// Unit (node, client build): the pure-logic half — calling `useRecipe` with no `<ThemeProvider>`
// above it must throw the friendly, provider-naming error. The happy path (context actually
// delivering a recipe) needs a rendered provider, so it lives in the `.ssr.test` (server build)
// and `.browser.test` (client DOM) files.
describe("useRecipe without a ThemeProvider", () => {
  it("throws a friendly error naming ThemeProvider", () => {
    createRoot((dispose) => {
      // The registry is empty by design (no components registered), so the key is synthetic.
      expect(() => useRecipe("anything" as never)).toThrow(/ThemeProvider/);
      dispose();
    });
  });
});
