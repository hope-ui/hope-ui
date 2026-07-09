import { describe, expect, it } from "vitest";
import { expectNoA11yViolations } from "./axe";
import { mount } from "./mount";

describe("expectNoA11yViolations", () => {
  it("resolves without throwing for accessible markup", async () => {
    const { container, dispose } = mount(() => {
      const button = document.createElement("button");
      button.textContent = "Click me";
      return button;
    });

    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined();
    dispose();
  });

  it("throws with a violation summary for inaccessible markup", async () => {
    const { container, dispose } = mount(() => {
      const img = document.createElement("img");
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7";
      // Intentionally missing `alt` to trigger an axe-core violation.
      return img;
    });

    await expect(expectNoA11yViolations(container)).rejects.toThrow(/violation/i);
    dispose();
  });
});
