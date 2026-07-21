import { readFileSync } from "node:fs";
import { isPreset } from "@hope-ui/theming";
import {
  assertOpacityTokenConformance,
  assertSemanticTokenConformance,
} from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { hope } from "..";

// hope authors its token values in CSS (`../theme.css`), so its completeness is asserted against
// that file: `checkSemanticTokenConformance` proves a `--hope-<token>:` declaration exists for every
// semantic color token, and `checkOpacityTokenConformance` proves the same for the opacity axis. A
// missing token would compile every referencing utility to an unresolved `var(--hope-…)`. The file
// is read straight off disk (this is the node `unit` project) rather than imported — Vitest mocks
// `.css` imports to an empty string, `?raw` and all.
const themeCss = readFileSync(new URL("../theme.css", import.meta.url), "utf8");

describe("@hope-ui/presets/hope", () => {
  it("declares every semantic color token in theme.css", () => {
    assertSemanticTokenConformance(themeCss);
  });

  it("declares every semantic opacity token in theme.css", () => {
    assertOpacityTokenConformance(themeCss);
  });

  it("is a valid, zero-DOM preset (token values live in CSS)", () => {
    expect(isPreset(hope)).toBe(true);
  });
});
