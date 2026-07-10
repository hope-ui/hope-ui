import { describe, expect, it } from "vitest";
import { mount } from "../mount/mount";
import { expectNoA11yViolations } from "./axe";

const TRANSPARENT_GIF =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7";

/**
 * Markup axe runs a rule against but cannot decide: text over a background image has no
 * resolvable background colour, so `color-contrast` comes back `incomplete` rather than as
 * a pass or a violation. Verified against the installed axe-core, not assumed — a visibly
 * focusable element inside an `aria-hidden` subtree, the other obvious candidate, is
 * reported as a full violation.
 */
function unresolvableContrast(): HTMLElement {
  const element = document.createElement("div");
  element.style.backgroundImage = `url(${TRANSPARENT_GIF})`;
  element.style.color = "#777777";
  element.textContent = "contrast cannot be computed";
  return element;
}

function missingAltImage(): HTMLElement {
  const img = document.createElement("img");
  img.src = TRANSPARENT_GIF;
  // Intentionally missing `alt` to trigger an axe-core violation.
  return img;
}

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
    const { container, dispose } = mount(missingAltImage);

    await expect(expectNoA11yViolations(container)).rejects.toThrow(/violation/i);
    dispose();
  });

  it("throws on an incomplete result, which axe reports but cannot decide", async () => {
    const { container, dispose } = mount(unresolvableContrast);

    await expect(expectNoA11yViolations(container)).rejects.toThrow(/incomplete check/i);
    dispose();
  });

  it("names the undecided rule in the error, so the reader knows what to look at", async () => {
    const { container, dispose } = mount(unresolvableContrast);

    await expect(expectNoA11yViolations(container)).rejects.toThrow(/color-contrast/);
    dispose();
  });

  it("accepts an incomplete result the caller has explicitly reviewed", async () => {
    const { container, dispose } = mount(unresolvableContrast);

    await expect(
      expectNoA11yViolations(container, { allowIncomplete: ["color-contrast"] }),
    ).resolves.toBeUndefined();
    dispose();
  });

  it("still fails on a violation even when an unrelated incomplete rule is allowed", async () => {
    const { container, dispose } = mount(missingAltImage);

    await expect(
      expectNoA11yViolations(container, { allowIncomplete: ["color-contrast"] }),
    ).rejects.toThrow(/violation/i);
    dispose();
  });
});
