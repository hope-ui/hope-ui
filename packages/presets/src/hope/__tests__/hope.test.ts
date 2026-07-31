import { readFileSync } from "node:fs";
import { isPreset } from "@hope-ui/theming";
import {
  assertOpacityTokenConformance,
  assertSemanticTokenConformance,
  DIRECTION_SCOPED,
  MEASURED_SIDE_SCOPED,
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

  // The RTL rule is enforced on two halves that can only diverge silently: the kit runs against a
  // *resolved* recipe (reaching third-party presets and compound variants), the script scans source
  // (reaching component class literals, stories and CSSOM writes). Same "read the other artifact as
  // a string" move as the token checks above. The guard lives here, not in `@hope-ui/theming`'s own
  // tests, because reading the rule off disk is a repo-layout dependency and the contract layer
  // stays agnostic of where it is checked out.
  //
  // Points at `scripts/lib/rtl-safety.mjs`, not the `check-rtl-safety.mjs` executable: the tables
  // moved there when the rule was extracted to be unit-testable. Read as text on purpose — the
  // point is to diff two independently-authored copies of the rule set, so importing it would
  // defeat the check by making both halves the same object.
  const rtlSafetyRule = () =>
    readFileSync(new URL("../../../../../scripts/lib/rtl-safety.mjs", import.meta.url), "utf8");

  it("keeps the RTL rule table in sync between the conformance kit and lib/rtl-safety.mjs", () => {
    // Asserted per field rather than as one literal so a reformat can't fail this for a reason that
    // has nothing to do with the rule set.
    const script = rtlSafetyRule();
    for (const { test, physical, logical } of PHYSICAL_UTILITIES) {
      expect(script, `lib/rtl-safety.mjs is missing the ${physical} pattern`).toContain(
        test.source,
      );
      expect(script, `lib/rtl-safety.mjs is missing the ${physical} rule`).toContain(
        `physical: "${physical}"`,
      );
      expect(script, `lib/rtl-safety.mjs is missing the ${logical} replacement`).toContain(
        `logical: "${logical}"`,
      );
    }
  });

  it("keeps the RTL EXEMPTIONS in sync between the two halves, not just the rule table", () => {
    // What is exempt is as load-bearing as what is forbidden, and splits the same way: a half that
    // exempts `data-side-*` while the other does not turns one gate green and leaves the other red
    // on identical source — or worse, lets a genuine physical class through on the axis nobody
    // rechecked. The rule table has been compared since day one; these two had not been, which is
    // how `MEASURED_SIDE_SCOPED` could have landed in one half only.
    const script = rtlSafetyRule();
    expect(script, "lib/rtl-safety.mjs is missing the rtl:/ltr: exemption").toContain(
      DIRECTION_SCOPED.source,
    );
    expect(script, "lib/rtl-safety.mjs is missing the data-side-* exemption").toContain(
      MEASURED_SIDE_SCOPED.source,
    );
  });
});
