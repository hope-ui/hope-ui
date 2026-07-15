import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { isPreset, renderPresetStyle } from "@hope-ui/theming";
import { assertSemanticTokenConformance } from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { hope } from "..";

// The preset is CSS, so its completeness can't be checked by `satisfies`; assert it at the CSS level
// (the analogue of a slot recipe's conformance test). An undefined token would compile every
// referencing utility to an unresolved `var(--hope-…)`. The token *values* live in `tokens.css` (the
// swap layer) — `tailwind.css` is just the orchestrator that imports it and the shared `_base/*` — so
// this reads the tokens file directly.
const tokensCss = readFileSync(fileURLToPath(new URL("../tokens.css", import.meta.url)), "utf8");

describe("@hope-ui/presets/hope", () => {
  it("defines every semantic color token as a --hope-* variable", () => {
    assertSemanticTokenConformance(tokensCss);
  });

  // `hope` is a real preset (branded), but a zero-DOM one: its token *values* live in `tokens.css`,
  // so it carries no JS token overrides. That is what keeps the provider on its zero-DOM branch and
  // every existing component hydration fixture byte-identical — renderPresetStyle produces "".
  it("is a valid, zero-DOM preset (empty token overrides → no injected <style>)", () => {
    expect(isPreset(hope)).toBe(true);
    expect(hope.tokens).toEqual({});
    expect(renderPresetStyle(hope.tokens, hope.darkMode)).toBe("");
  });
});
