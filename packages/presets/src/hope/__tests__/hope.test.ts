import { readFileSync } from "node:fs";
import { isPreset } from "@hope-ui/theming";
import {
  assertOpacityTokenConformance,
  assertSemanticTokenConformance,
  PHYSICAL_UTILITIES,
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

  it("keeps the RTL rule table in sync between the conformance kit and check-rtl-safety.mjs", () => {
    // The RTL rule is enforced on two halves that can only diverge silently: the kit runs against a
    // *resolved* recipe (reaching third-party presets and compound variants), the script scans
    // source (reaching component class literals, stories and CSSOM writes). Same "read the other
    // artifact as a string" move as the token checks above.
    //
    // Asserted per field rather than as one literal so a reformat can't fail this for a reason that
    // has nothing to do with the rule set.
    const script = readFileSync(
      new URL("../../../../../scripts/check-rtl-safety.mjs", import.meta.url),
      "utf8",
    );
    for (const { test, physical, logical } of PHYSICAL_UTILITIES) {
      expect(script, `check-rtl-safety.mjs is missing the ${physical} pattern`).toContain(
        test.source,
      );
      expect(script, `check-rtl-safety.mjs is missing the ${physical} rule`).toContain(
        `physical: "${physical}"`,
      );
      expect(script, `check-rtl-safety.mjs is missing the ${logical} replacement`).toContain(
        `logical: "${logical}"`,
      );
    }
  });
});
