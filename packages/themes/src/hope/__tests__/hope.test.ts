import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertSemanticTokenConformance } from "@hope-ui/theming/conformance";
import { describe, it } from "vitest";

// The theme is CSS, so its completeness can't be checked by `satisfies`; assert it at the CSS level
// (the analogue of a slot recipe's conformance test). An undefined token would compile every
// referencing utility to an unresolved `var(--hope-…)`. The token *values* live in `tokens.css` (the
// swap layer) — `theme.css` is just the orchestrator that imports it and the shared `_base/*` — so
// this reads the tokens file directly.
const tokensCss = readFileSync(fileURLToPath(new URL("../tokens.css", import.meta.url)), "utf8");

describe("@hope-ui/themes/hope", () => {
  it("defines every semantic color token as a --hope-* variable", () => {
    assertSemanticTokenConformance(tokensCss);
  });
});
