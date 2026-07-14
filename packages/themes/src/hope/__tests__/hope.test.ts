import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertSemanticTokenConformance } from "@hope-ui/theming/conformance";
import { describe, it } from "vitest";

// The theme is CSS, so its completeness can't be checked by `satisfies`; assert it at the CSS level
// (the analogue of a slot recipe's conformance test). An undefined token would compile every
// referencing utility to an unresolved `var(--hope-…)`.
const themeCss = readFileSync(fileURLToPath(new URL("../theme.css", import.meta.url)), "utf8");

describe("@hope-ui/themes/hope", () => {
  it("defines every semantic color token as a --hope-* variable", () => {
    assertSemanticTokenConformance(themeCss);
  });
});
