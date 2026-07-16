import { readFileSync } from "node:fs";
import { isPreset } from "@hope-ui/theming";
import { assertSemanticTokenConformance } from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { hope } from "..";

// hope authors its token values in CSS (`../tokens.css`), so its completeness is asserted against
// that file: `checkSemanticTokenConformance` proves a `--hope-<token>:` declaration exists for every
// semantic token. A missing token would compile every referencing utility to an unresolved
// `var(--hope-…)`. The file is read straight off disk (this is the node `unit` project) rather than
// imported — Vitest mocks `.css` imports to an empty string, `?raw` and all.
const tokensCss = readFileSync(new URL("../tokens.css", import.meta.url), "utf8");

describe("@hope-ui/presets/hope", () => {
  it("declares every semantic color token in tokens.css", () => {
    assertSemanticTokenConformance(tokensCss);
  });

  it("is a valid, zero-DOM preset (token values live in CSS)", () => {
    expect(isPreset(hope)).toBe(true);
  });
});
